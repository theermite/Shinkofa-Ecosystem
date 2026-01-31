"""
Contact Submissions routes - API endpoints for contact form
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc
from datetime import datetime

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.contact_submission import ContactSubmission, SubmissionStatus
from app.utils.dependencies import get_current_user, require_role
from app.schemas.contact_submission import (
    ContactSubmissionCreate,
    ContactSubmissionUpdate,
    ContactSubmissionResponse,
    ContactSubmissionListResponse
)
from app.services.email_service import email_service

router = APIRouter(tags=["contact-submissions"])


@router.post("/submit", response_model=ContactSubmissionResponse, status_code=status.HTTP_201_CREATED)
async def submit_contact_form(
    request: Request,
    data: ContactSubmissionCreate,
    db: Session = Depends(get_db)
):
    """
    Submit a contact form (PUBLIC endpoint - no auth required)
    Called from the website contact form
    """
    try:
        # Get client IP and user agent
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get("user-agent", "")[:500]
        
        # Create submission
        submission = ContactSubmission(
            nom=data.nom,
            email=data.email,
            sujet=data.sujet,
            message=data.message,
            source=data.source or "website",
            ip_address=ip_address,
            user_agent=user_agent,
            status=SubmissionStatus.NEW,
            submitted_at=datetime.utcnow()
        )
        
        db.add(submission)
        db.commit()
        db.refresh(submission)
        
        # Send notification email to contact@lslf.shinkofa.com
        try:
            email_service.send_contact_notification_email(
                submission_id=submission.id,
                nom=data.nom,
                email=data.email,
                sujet=data.sujet,
                message=data.message,
                to_email="contact@lslf.shinkofa.com"
            )
        except Exception as e:
            # Log error but don't fail the submission
            print(f"Failed to send notification email: {e}")
        
        return submission
        
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to submit contact form: {str(e)}"
        )


@router.get("/all", response_model=ContactSubmissionListResponse)
def get_all_submissions(
    status_filter: Optional[SubmissionStatus] = Query(None, description="Filter by status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Get all contact submissions (coaches and managers only)
    """
    query = db.query(ContactSubmission)
    
    if status_filter:
        query = query.filter(ContactSubmission.status == status_filter)
    
    total = query.count()
    submissions = query.order_by(desc(ContactSubmission.submitted_at)).offset(skip).limit(limit).all()
    
    return ContactSubmissionListResponse(total=total, submissions=submissions)


@router.get("/{submission_id}", response_model=ContactSubmissionResponse)
def get_submission(
    submission_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Get a specific contact submission
    """
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    
    # Mark as read if not already
    if not submission.read_at:
        submission.read_at = datetime.utcnow()
        if submission.status == SubmissionStatus.NEW:
            submission.status = SubmissionStatus.READ
        db.commit()
        db.refresh(submission)
    
    return submission


@router.put("/{submission_id}", response_model=ContactSubmissionResponse)
def update_submission(
    submission_id: int,
    data: ContactSubmissionUpdate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Update a contact submission (mark as replied, add notes, etc.)
    """
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    
    # Update fields
    if data.status is not None:
        submission.status = data.status
        if data.status == SubmissionStatus.REPLIED and not submission.replied_at:
            submission.replied_at = datetime.utcnow()
    
    if data.admin_notes is not None:
        submission.admin_notes = data.admin_notes
    
    if data.resolved_user_id is not None:
        submission.resolved_user_id = data.resolved_user_id
    
    db.commit()
    db.refresh(submission)
    
    return submission


@router.delete("/{submission_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_submission(
    submission_id: int,
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Delete a contact submission (managers only)
    """
    submission = db.query(ContactSubmission).filter(ContactSubmission.id == submission_id).first()
    
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Contact submission not found"
        )
    
    db.delete(submission)
    db.commit()
    
    return None
