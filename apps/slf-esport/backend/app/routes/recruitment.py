"""
Recruitment routes - API endpoints for player recruitment system
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.recruitment_application import RecruitmentApplication, ApplicationStatus
from app.models.notification import Notification, NotificationType
from app.utils.dependencies import get_current_user, require_role
from app.schemas.recruitment_application import (
    RecruitmentApplicationCreate,
    RecruitmentApplicationUpdate,
    RecruitmentApplicationResponse,
    RecruitmentApplicationListResponse
)
from app.services.email_service import email_service
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["recruitment"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/submit", response_model=RecruitmentApplicationResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("3/hour")
async def submit_application(
    request: Request,
    data: RecruitmentApplicationCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a recruitment application (PUBLIC endpoint - no auth required)
    Called from the website recruitment form
    Rate limited to 3 submissions per hour per IP
    """
    try:
        # Get client IP and user agent
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")[:500]

        # Check for duplicate application (same email in last 24h)
        existing = db.query(RecruitmentApplication).filter(
            RecruitmentApplication.email == data.email,
            RecruitmentApplication.submitted_at > datetime.utcnow().replace(hour=0, minute=0, second=0)
        ).first()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Une candidature avec cet email a déjà été soumise aujourd'hui."
            )

        # Create application
        application = RecruitmentApplication(
            first_name=data.first_name,
            last_name=data.last_name,
            pseudo=data.pseudo,
            email=data.email,
            age=data.age,
            country=data.country,
            languages=data.languages,
            motivation=data.motivation,
            availability=data.availability,
            current_status=data.current_status,
            interview_availability=data.interview_availability,
            source=data.source or "website",
            ip_address=ip_address,
            user_agent=user_agent,
            status=ApplicationStatus.NEW,
            submitted_at=datetime.utcnow()
        )

        db.add(application)
        db.commit()
        db.refresh(application)

        # Create in-app notifications for managers and coaches
        try:
            # Find all managers and coaches
            managers_coaches = db.query(User).filter(
                User.is_active == True,
                User.role.in_([UserRole.MANAGER, UserRole.COACH])
            ).all()

            # Create notification for each manager/coach
            for user in managers_coaches:
                notification = Notification(
                    user_id=user.id,
                    type=NotificationType.RECRUITMENT_APPLICATION,
                    title=f"🎮 Nouvelle candidature : {data.pseudo}",
                    message=f"{data.first_name} {data.last_name} ({data.pseudo}) a soumis une candidature de recrutement. Pays: {data.country}, Âge: {data.age} ans.",
                    link="/recruitment",
                    action_text="Voir la candidature"
                )
                db.add(notification)

            db.commit()
            logger.info(f"Created {len(managers_coaches)} notifications for recruitment application #{application.id}")
        except Exception as e:
            logger.error(f"Failed to create in-app notifications: {e}")
            # Don't fail the submission

        # Send notification email to managers
        try:
            email_service.send_recruitment_notification_email(
                application_id=application.id,
                pseudo=data.pseudo,
                email=data.email,
                motivation=data.motivation[:200] + "..." if len(data.motivation) > 200 else data.motivation,
                to_email="contact@lslf.shinkofa.com"
            )
        except Exception as e:
            # Log error but don't fail the submission
            logger.error(f"Failed to send recruitment notification email: {e}")

        return application

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de la soumission: {str(e)}"
        )


@router.get("/applications", response_model=RecruitmentApplicationListResponse)
def get_all_applications(
    status_filter: Optional[ApplicationStatus] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Get all recruitment applications (coaches and managers only)
    """
    query = db.query(RecruitmentApplication)

    if status_filter:
        query = query.filter(RecruitmentApplication.status == status_filter)

    total = query.count()
    applications = query.order_by(desc(RecruitmentApplication.submitted_at)).offset(skip).limit(limit).all()

    return RecruitmentApplicationListResponse(total=total, applications=applications)


@router.get("/applications/{application_id}", response_model=RecruitmentApplicationResponse)
def get_application(
    application_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Get a specific recruitment application
    """
    application = db.query(RecruitmentApplication).filter(
        RecruitmentApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature non trouvée"
        )

    # Mark as reviewed if first time viewing
    if application.status == ApplicationStatus.NEW:
        application.status = ApplicationStatus.REVIEWED
        application.reviewed_at = datetime.utcnow()
        application.reviewed_by_id = current_user.id
        db.commit()
        db.refresh(application)

    return application


@router.put("/applications/{application_id}", response_model=RecruitmentApplicationResponse)
def update_application(
    application_id: int,
    data: RecruitmentApplicationUpdate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Update a recruitment application (change status, add notes)
    """
    application = db.query(RecruitmentApplication).filter(
        RecruitmentApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature non trouvée"
        )

    # Update fields
    if data.status is not None:
        application.status = data.status
        if not application.reviewed_at:
            application.reviewed_at = datetime.utcnow()
            application.reviewed_by_id = current_user.id

    if data.admin_notes is not None:
        application.admin_notes = data.admin_notes

    db.commit()
    db.refresh(application)

    return application


@router.delete("/applications/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(
    application_id: int,
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Delete a recruitment application (managers only)
    """
    application = db.query(RecruitmentApplication).filter(
        RecruitmentApplication.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Candidature non trouvée"
        )

    db.delete(application)
    db.commit()

    return None


@router.get("/stats")
def get_recruitment_stats(
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Get recruitment statistics
    """
    total = db.query(RecruitmentApplication).count()
    new = db.query(RecruitmentApplication).filter(
        RecruitmentApplication.status == ApplicationStatus.NEW
    ).count()
    reviewed = db.query(RecruitmentApplication).filter(
        RecruitmentApplication.status == ApplicationStatus.REVIEWED
    ).count()
    accepted = db.query(RecruitmentApplication).filter(
        RecruitmentApplication.status == ApplicationStatus.ACCEPTED
    ).count()
    rejected = db.query(RecruitmentApplication).filter(
        RecruitmentApplication.status == ApplicationStatus.REJECTED
    ).count()

    return {
        "total": total,
        "new": new,
        "reviewed": reviewed,
        "accepted": accepted,
        "rejected": rejected
    }
