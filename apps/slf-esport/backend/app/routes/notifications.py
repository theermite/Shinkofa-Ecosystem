"""
Notification routes - In-app notifications + preferences
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.notification import Notification
from app.models.notification_preferences import NotificationPreferences
from app.schemas.notification import (
    NotificationResponse,
    NotificationListResponse,
    NotificationCreate,
    NotificationMarkRead,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate
)
from app.services.notification_service import NotificationService
from app.utils.dependencies import get_current_active_user, require_role

router = APIRouter()


# In-app Notifications

@router.get("/", response_model=NotificationListResponse)
async def get_my_notifications(
    unread_only: bool = Query(False, description="Show only unread notifications"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's notifications"""
    notifications, total, unread_count = NotificationService.get_user_notifications(
        db, current_user.id, unread_only, skip, limit
    )
    return NotificationListResponse(
        total=total,
        unread_count=unread_count,
        notifications=notifications
    )


@router.get("/unread-count", response_model=dict)
async def get_unread_count(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get count of unread notifications (for badge)"""
    count = NotificationService.get_unread_count(db, current_user.id)
    return {"unread_count": count}


@router.put("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_as_read(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    success = NotificationService.mark_as_read(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )


@router.put("/mark-all-read", response_model=dict)
async def mark_all_as_read(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Mark all user notifications as read"""
    count = NotificationService.mark_all_as_read(db, current_user.id)
    return {"marked_count": count}


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a notification"""
    success = NotificationService.delete_notification(db, notification_id, current_user.id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )


@router.post("/send", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def send_notification(
    notification_data: NotificationCreate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """Send a notification to a user (Coach/Manager only)"""
    notification = NotificationService.create_notification(db, notification_data)
    return notification


# Notification Preferences (Email notifications)

@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current user's notification preferences"""
    preferences = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()

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
    """Update current user's notification preferences"""
    preferences = db.query(NotificationPreferences).filter(
        NotificationPreferences.user_id == current_user.id
    ).first()

    if not preferences:
        preferences = NotificationPreferences(
            user_id=current_user.id,
            **preferences_data.model_dump(exclude_unset=True)
        )
        db.add(preferences)
    else:
        for field, value in preferences_data.model_dump(exclude_unset=True).items():
            setattr(preferences, field, value)

    db.commit()
    db.refresh(preferences)
    return preferences
