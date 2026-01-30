"""
Admin Holistic Profiles endpoints
Shinkofa Platform - Shizen Planner Service
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import httpx
import logging

from app.core.database import get_db
from app.models.holistic_profile import HolisticProfile
from app.models.questionnaire_session import QuestionnaireSession
from app.core.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin/profiles", tags=["admin-profiles"])


# ============= SCHEMAS =============

class ProfileUserInfo(BaseModel):
    user_id: str
    username: Optional[str] = None
    email: Optional[str] = None

class ProfileSummary(BaseModel):
    id: str
    user_id: str
    session_id: str
    version: int
    is_active: bool
    has_psychological: bool
    has_neurodivergence: bool
    has_shinkofa: bool
    has_design_human: bool
    has_astrology: bool
    has_numerology: bool
    has_synthesis: bool
    generated_at: Optional[datetime]
    updated_at: Optional[datetime]
    # User info (fetched from auth service)
    username: Optional[str] = None
    email: Optional[str] = None

    class Config:
        from_attributes = True

class ProfileStats(BaseModel):
    total_profiles: int
    total_users_with_profile: int
    profiles_last_7_days: int
    profiles_last_30_days: int
    complete_profiles: int
    incomplete_profiles: int
    average_version: float

class ProfileListResponse(BaseModel):
    profiles: List[ProfileSummary]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============= AUTH HELPER =============

async def verify_super_admin(authorization: str) -> bool:
    """Verify the request is from a super admin via auth service"""
    if not authorization or not authorization.startswith("Bearer "):
        return False

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.AUTH_SERVICE_URL}/auth/me",
                headers={"Authorization": authorization}
            )
            if response.status_code == 200:
                user = response.json()
                return user.get("is_super_admin", False)
    except Exception:
        pass
    return False


async def get_user_info(user_ids: List[str], authorization: str) -> dict:
    """Fetch user info from auth service"""
    user_map = {}
    try:
        async with httpx.AsyncClient() as client:
            for user_id in user_ids:
                response = await client.get(
                    f"{settings.AUTH_SERVICE_URL}/auth/super-admin/admin/users/{user_id}",
                    headers={"Authorization": authorization}
                )
                if response.status_code == 200:
                    user = response.json()
                    user_map[user_id] = {
                        "username": user.get("username"),
                        "email": user.get("email")
                    }
    except Exception:
        pass
    return user_map


# ============= ENDPOINTS =============

@router.get("/stats", response_model=ProfileStats)
async def get_profile_stats(
    authorization: str = Query(..., alias="authorization"),
    db: Session = Depends(get_db)
):
    """
    Get holistic profiles statistics (super admin only)
    """
    if not await verify_super_admin(f"Bearer {authorization}"):
        raise HTTPException(status_code=403, detail="Super admin access required")

    from datetime import timedelta

    now = datetime.utcnow()
    seven_days_ago = now - timedelta(days=7)
    thirty_days_ago = now - timedelta(days=30)

    total_profiles = db.query(HolisticProfile).count()
    total_users = db.query(func.count(func.distinct(HolisticProfile.user_id))).scalar()
    profiles_7d = db.query(HolisticProfile).filter(
        HolisticProfile.generated_at >= seven_days_ago
    ).count()
    profiles_30d = db.query(HolisticProfile).filter(
        HolisticProfile.generated_at >= thirty_days_ago
    ).count()

    # Complete = has synthesis
    complete = db.query(HolisticProfile).filter(
        HolisticProfile.synthesis.isnot(None)
    ).count()

    avg_version = db.query(func.avg(HolisticProfile.version)).scalar() or 1.0

    return ProfileStats(
        total_profiles=total_profiles,
        total_users_with_profile=total_users or 0,
        profiles_last_7_days=profiles_7d,
        profiles_last_30_days=profiles_30d,
        complete_profiles=complete,
        incomplete_profiles=total_profiles - complete,
        average_version=round(avg_version, 2)
    )


@router.get("/", response_model=ProfileListResponse)
async def list_profiles(
    authorization: str = Query(..., alias="authorization"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    user_id: Optional[str] = None,
    status: Optional[str] = None,  # complete, incomplete, all
    db: Session = Depends(get_db)
):
    """
    List all holistic profiles with pagination (super admin only)
    """
    if not await verify_super_admin(f"Bearer {authorization}"):
        raise HTTPException(status_code=403, detail="Super admin access required")

    query = db.query(HolisticProfile)

    # Filters
    if user_id:
        query = query.filter(HolisticProfile.user_id == user_id)

    if status == "complete":
        query = query.filter(HolisticProfile.synthesis.isnot(None))
    elif status == "incomplete":
        query = query.filter(HolisticProfile.synthesis.is_(None))

    # Order by most recent first
    query = query.order_by(desc(HolisticProfile.generated_at))

    # Count total
    total = query.count()
    total_pages = (total + page_size - 1) // page_size

    # Paginate
    profiles = query.offset((page - 1) * page_size).limit(page_size).all()

    # Fetch user info
    user_ids = list(set(p.user_id for p in profiles))
    user_map = await get_user_info(user_ids, f"Bearer {authorization}")

    # Build response
    profile_summaries = []
    for p in profiles:
        user_info = user_map.get(p.user_id, {})
        profile_summaries.append(ProfileSummary(
            id=p.id,
            user_id=p.user_id,
            session_id=p.session_id,
            version=p.version,
            is_active=p.is_active,
            has_psychological=p.psychological_analysis is not None,
            has_neurodivergence=p.neurodivergence_analysis is not None,
            has_shinkofa=p.shinkofa_analysis is not None,
            has_design_human=p.design_human is not None,
            has_astrology=p.astrology_western is not None or p.astrology_chinese is not None,
            has_numerology=p.numerology is not None,
            has_synthesis=p.synthesis is not None,
            generated_at=p.generated_at,
            updated_at=p.updated_at,
            username=user_info.get("username"),
            email=user_info.get("email")
        ))

    return ProfileListResponse(
        profiles=profile_summaries,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.post("/{profile_id}/regenerate")
async def regenerate_profile(
    profile_id: str,
    authorization: str = Query(..., alias="authorization"),
    db: Session = Depends(get_db)
):
    """
    Trigger regeneration of a holistic profile (super admin only)
    Sends email notification to user after regeneration
    """
    if not await verify_super_admin(f"Bearer {authorization}"):
        raise HTTPException(status_code=403, detail="Super admin access required")

    profile = db.query(HolisticProfile).filter(HolisticProfile.id == profile_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Get the session
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == profile.session_id
    ).first()

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Get user info from auth service for notification
    user_info = None
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{settings.AUTH_SERVICE_URL}/auth/super-admin/admin/users/{profile.user_id}",
                headers={"Authorization": f"Bearer {authorization}"}
            )
            if response.status_code == 200:
                user_info = response.json()
    except Exception as e:
        logger.warning(f"Could not fetch user info: {e}")

    # Delete existing profile to allow regeneration
    db.delete(profile)
    db.commit()

    # Trigger regeneration via the profile service
    try:
        from app.services.holistic_profile_service import get_holistic_profile_service
        from app.core.database import get_async_db

        # Get async db session
        from sqlalchemy.ext.asyncio import AsyncSession
        from app.core.database import async_engine

        async with AsyncSession(async_engine) as async_db:
            profile_service = get_holistic_profile_service()
            new_profile = await profile_service.generate_profile(
                session_id=session.id,
                user_id=session.user_id,
                db=async_db,
            )

        # Send notification email if we have user info
        if user_info and user_info.get("email"):
            from app.utils.email import send_profile_regeneration_email
            email_sent = send_profile_regeneration_email(
                to_email=user_info["email"],
                username=user_info.get("username", "Utilisateur")
            )
        else:
            email_sent = False

        return {
            "status": "regeneration_complete",
            "profile_id": new_profile.id if new_profile else None,
            "session_id": session.id,
            "email_sent": email_sent,
            "message": "Le profil a ete regenere avec succes."
        }

    except Exception as e:
        logger.error(f"Profile regeneration failed: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Echec de la regeneration: {str(e)}"
        )
