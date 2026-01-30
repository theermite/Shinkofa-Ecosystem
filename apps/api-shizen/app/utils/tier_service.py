"""
Tier Verification Service
Shinkofa Platform - Planner Service

Provides tier-based access control by calling auth service
Enforces limits for Musha (free) tier users
"""
import httpx
import uuid
from datetime import datetime, timezone
from fastapi import HTTPException, status, Depends
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from dataclasses import dataclass

from app.core.database import get_db, get_async_db
from app.core.config import settings
from app.models.project import Project
from app.models.task import Task
from app.models.shizen_message_usage import ShizenMessageUsage
from app.utils.auth import get_current_user_id

# Auth service URL (internal Docker network)
AUTH_SERVICE_URL = settings.AUTH_SERVICE_URL
INTERNAL_API_KEY = settings.INTERNAL_API_KEY


@dataclass
class UserTier:
    """User tier information"""
    user_id: str
    tier: str
    status: str
    is_active: bool
    project_limit: Optional[int]
    task_limit: Optional[int]
    shizen_message_limit: Optional[int]
    has_family_access: bool
    has_sensei_features: bool


async def get_user_tier(user_id: str) -> UserTier:
    """
    Fetch user tier info from auth service

    Args:
        user_id: User ID to look up

    Returns:
        UserTier object with limits and features

    Raises:
        HTTPException: If auth service unreachable or user not found
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.get(
                f"{AUTH_SERVICE_URL}/internal/user-tier/{user_id}",
                headers={"X-Internal-Key": INTERNAL_API_KEY}
            )

            if response.status_code == 404:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )

            if response.status_code != 200:
                # Log error but don't block user (fail open for MVP)
                # In production, consider fail closed
                print(f"[TIER] Auth service error: {response.status_code}")
                # Return default Musha limits as fallback
                return UserTier(
                    user_id=user_id,
                    tier="musha",
                    status="active",
                    is_active=True,
                    project_limit=2,
                    task_limit=10,
                    shizen_message_limit=50,
                    has_family_access=False,
                    has_sensei_features=False,
                )

            data = response.json()
            # Normalize tier and status to lowercase for consistent comparison
            return UserTier(
                user_id=data["user_id"],
                tier=data["tier"].lower() if data.get("tier") else "musha",
                status=data["status"].lower() if data.get("status") else "active",
                is_active=data["is_active"],
                project_limit=data["project_limit"],
                task_limit=data["task_limit"],
                shizen_message_limit=data["shizen_message_limit"],
                has_family_access=data["has_family_access"],
                has_sensei_features=data["has_sensei_features"],
            )

    except httpx.RequestError as e:
        # Auth service unreachable - fail open for MVP
        print(f"[TIER] Auth service unreachable: {e}")
        return UserTier(
            user_id=user_id,
            tier="musha",
            status="active",
            is_active=True,
            project_limit=2,
            task_limit=10,
            shizen_message_limit=50,
            has_family_access=False,
            has_sensei_features=False,
        )


def get_user_project_count(user_id: str, db: Session) -> int:
    """Count user's active projects"""
    return db.query(Project).filter(
        Project.user_id == user_id,
        Project.status != "archived"
    ).count()


def get_user_task_count(user_id: str, db: Session) -> int:
    """Count user's active (incomplete) tasks"""
    return db.query(Task).filter(
        Task.user_id == user_id,
        Task.completed == False
    ).count()


async def verify_project_limit(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> str:
    """
    Dependency that verifies user can create more projects

    Raises:
        HTTPException 403: If user at project limit

    Returns:
        user_id: Pass through for route
    """
    tier = await get_user_tier(user_id)

    # No limit for paid tiers (project_limit is None)
    if tier.project_limit is None:
        return user_id

    # Check current count against limit
    current_count = get_user_project_count(user_id, db)

    if current_count >= tier.project_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "project_limit_reached",
                "message": f"Limite de projets atteinte ({tier.project_limit} projets max pour le plan {tier.tier.upper()}). Passez au niveau superieur pour en creer plus.",
                "current": current_count,
                "limit": tier.project_limit,
                "tier": tier.tier,
                "upgrade_url": "/pricing"
            }
        )

    return user_id


async def verify_task_limit(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
) -> str:
    """
    Dependency that verifies user can create more tasks

    Raises:
        HTTPException 403: If user at task limit

    Returns:
        user_id: Pass through for route
    """
    tier = await get_user_tier(user_id)

    # No limit for paid tiers (task_limit is None)
    if tier.task_limit is None:
        return user_id

    # Check current count against limit
    current_count = get_user_task_count(user_id, db)

    if current_count >= tier.task_limit:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "task_limit_reached",
                "message": f"Limite de taches atteinte ({tier.task_limit} taches actives max pour le plan {tier.tier.upper()}). Completez des taches ou passez au niveau superieur.",
                "current": current_count,
                "limit": tier.task_limit,
                "tier": tier.tier,
                "upgrade_url": "/pricing"
            }
        )

    return user_id


async def get_tier_info(
    user_id: str = Depends(get_current_user_id),
) -> UserTier:
    """
    Dependency that provides full tier info to route

    Use this when you need tier info for feature gating
    """
    return await get_user_tier(user_id)


def get_current_year_month() -> str:
    """Get current year-month string (format: 2026-01)"""
    return datetime.now(timezone.utc).strftime("%Y-%m")


async def get_user_shizen_message_count(user_id: str, db: AsyncSession) -> int:
    """
    Get user's Shizen message count for current month

    Args:
        user_id: User ID
        db: Async database session

    Returns:
        Current month's message count (0 if no record)
    """
    year_month = get_current_year_month()

    result = await db.execute(
        select(ShizenMessageUsage).where(
            ShizenMessageUsage.user_id == user_id,
            ShizenMessageUsage.year_month == year_month
        )
    )
    usage = result.scalar_one_or_none()

    return usage.message_count if usage else 0


async def increment_shizen_message_count(user_id: str, db: AsyncSession) -> int:
    """
    Increment user's Shizen message count for current month

    Creates record if it doesn't exist.

    Args:
        user_id: User ID
        db: Async database session

    Returns:
        New message count after increment
    """
    year_month = get_current_year_month()

    result = await db.execute(
        select(ShizenMessageUsage).where(
            ShizenMessageUsage.user_id == user_id,
            ShizenMessageUsage.year_month == year_month
        )
    )
    usage = result.scalar_one_or_none()

    if usage:
        usage.message_count += 1
        usage.updated_at = datetime.now(timezone.utc)
        new_count = usage.message_count
    else:
        # Create new record for this month
        usage = ShizenMessageUsage(
            id=str(uuid.uuid4()),
            user_id=user_id,
            year_month=year_month,
            message_count=1,
        )
        db.add(usage)
        new_count = 1

    await db.commit()
    return new_count


async def verify_shizen_message_limit(
    user_id: str,
    db: AsyncSession,
) -> tuple[bool, int, Optional[int]]:
    """
    Verify user can send more Shizen messages this month

    Args:
        user_id: User ID
        db: Async database session

    Returns:
        Tuple of (can_send, current_count, limit)
        - can_send: True if user can send more messages
        - current_count: Current message count this month
        - limit: Monthly limit (None = unlimited)

    Note: Does NOT raise exception - returns status for flexible handling
    """
    tier = await get_user_tier(user_id)

    # No limit for paid tiers (shizen_message_limit is None)
    if tier.shizen_message_limit is None:
        return (True, 0, None)

    # Check current count
    current_count = await get_user_shizen_message_count(user_id, db)

    if current_count >= tier.shizen_message_limit:
        return (False, current_count, tier.shizen_message_limit)

    return (True, current_count, tier.shizen_message_limit)


def raise_shizen_limit_error(current_count: int, limit: int, tier_name: str):
    """
    Raise HTTPException for Shizen message limit reached

    Args:
        current_count: Current message count
        limit: Monthly limit
        tier_name: User's tier name
    """
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail={
            "error": "message_limit_reached",
            "message": f"Limite de messages Shizen atteinte ({limit} messages/mois pour le plan {tier_name.upper()}). Passez au niveau superieur pour continuer.",
            "current": current_count,
            "limit": limit,
            "tier": tier_name,
            "upgrade_url": "/pricing"
        }
    )
