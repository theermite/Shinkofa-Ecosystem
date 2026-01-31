"""
Notification preferences routes - Manage user email notification settings
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.notification_preferences import NotificationPreferences
from app.schemas.notification import (
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
    NotificationPreferencesCreate
)
from app.utils.dependencies import get_current_active_user

router = APIRouter()


@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's notification preferences

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        User's notification preferences
    """
    # Check if preferences exist
    preferences = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()

    # Create default preferences if not exist
    if not preferences:
        preferences = NotificationPreferences(user_id=current_user.id)
        db.add(preferences)
        db.commit()
        db.refresh(preferences)

    return preferences


@router.put("/preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    preferences_data: NotificationPreferencesUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's notification preferences

    Args:
        preferences_data: Updated notification preferences
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated notification preferences
    """
    # Get or create preferences
    preferences = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()

    if not preferences:
        # Create new preferences with updated values
        preferences = NotificationPreferences(
            user_id=current_user.id,
            **preferences_data.model_dump(exclude_unset=True)
        )
        db.add(preferences)
    else:
        # Update existing preferences
        update_data = preferences_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)

    return preferences


@router.post("/preferences/reset", response_model=NotificationPreferencesResponse)
async def reset_notification_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Reset notification preferences to defaults (all enabled)

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Reset notification preferences
    """
    # Get or create preferences
    preferences = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()

    if not preferences:
        preferences = NotificationPreferences(user_id=current_user.id)
        db.add(preferences)
    else:
        # Reset all to True
        preferences.session_created = True
        preferences.session_invitation = True
        preferences.session_reminder = True
        preferences.exercise_assigned = True
        preferences.performance_recorded = True
        preferences.coach_message = True
        preferences.account_updates = True

    db.commit()
    db.refresh(preferences)

    return preferences
