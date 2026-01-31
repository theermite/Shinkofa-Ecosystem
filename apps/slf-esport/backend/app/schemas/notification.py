"""
Notification schemas for API validation
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class NotificationBase(BaseModel):
    """Base notification schema"""
    type: str = Field(..., max_length=50)
    title: str = Field(..., min_length=1, max_length=255)
    message: str = Field(..., min_length=1)
    link: Optional[str] = Field(None, max_length=500)
    action_text: Optional[str] = Field(None, max_length=100)


class NotificationCreate(NotificationBase):
    """Schema for creating a notification"""
    user_id: int


class NotificationResponse(NotificationBase):
    """Schema for notification response"""
    id: int
    user_id: int
    read: bool
    created_at: datetime
    read_at: Optional[datetime]

    class Config:
        from_attributes = True


class NotificationMarkRead(BaseModel):
    """Schema for marking notification as read"""
    read: bool = True


class NotificationListResponse(BaseModel):
    """Schema for notification list with counts"""
    total: int
    unread_count: int
    notifications: list[NotificationResponse]


# Notification Preferences Schemas

class NotificationPreferencesBase(BaseModel):
    """Base notification preferences schema"""
    session_created: Optional[bool] = True
    session_invitation: Optional[bool] = True
    session_reminder: Optional[bool] = True
    exercise_assigned: Optional[bool] = True
    performance_recorded: Optional[bool] = True
    coach_message: Optional[bool] = True
    account_updates: Optional[bool] = True


class NotificationPreferencesCreate(NotificationPreferencesBase):
    """Schema for creating notification preferences"""
    user_id: int


class NotificationPreferencesUpdate(NotificationPreferencesBase):
    """Schema for updating notification preferences (all fields optional)"""
    pass


class NotificationPreferencesResponse(NotificationPreferencesBase):
    """Schema for notification preferences response"""
    id: int
    user_id: int

    class Config:
        from_attributes = True
