"""
Session schemas - Pydantic validation for sessions
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field, validator, model_validator
from app.models.session import SessionType, SessionStatus


# ========== Session Participant Schemas ==========

class SessionParticipantBase(BaseModel):
    """Base session participant schema"""
    user_id: int
    attendance_status: str = "pending"
    notes: Optional[str] = None


class SessionParticipantCreate(SessionParticipantBase):
    """Schema for creating a session participant"""
    pass


class SessionParticipantUpdate(BaseModel):
    """Schema for updating a session participant"""
    attendance_status: Optional[str] = None
    notes: Optional[str] = None


class SessionParticipantResponse(SessionParticipantBase):
    """Schema for session participant response"""
    id: int
    session_id: int
    response_status: str = "pending"  # pending, confirmed, maybe, declined
    invitation_sent_at: Optional[datetime] = None
    response_at: Optional[datetime] = None
    decline_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # User info (populated from relationship)
    username: Optional[str] = None
    full_name: Optional[str] = None
    game_username: Optional[str] = None

    @model_validator(mode='before')
    @classmethod
    def populate_user_info(cls, data):
        """Populate user info from the relationship if available"""
        if hasattr(data, 'user') and data.user:
            # Convert SQLAlchemy model to dict and enrich with user data
            if isinstance(data, dict):
                return data
            else:
                # data is a SQLAlchemy model
                participant_dict = {
                    'id': data.id,
                    'session_id': data.session_id,
                    'user_id': data.user_id,
                    'attendance_status': data.attendance_status,
                    'notes': data.notes,
                    'response_status': data.response_status,
                    'invitation_sent_at': data.invitation_sent_at,
                    'response_at': data.response_at,
                    'decline_reason': data.decline_reason,
                    'created_at': data.created_at,
                    'updated_at': data.updated_at,
                    'username': data.user.username,
                    'full_name': data.user.full_name,
                    'game_username': data.user.game_username,
                }
                return participant_dict
        return data

    class Config:
        from_attributes = True


# ========== Session Schemas ==========

class SessionBase(BaseModel):
    """Base session schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    session_type: SessionType
    start_time: datetime
    end_time: datetime
    coach_id: Optional[int] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None

    @validator('end_time')
    def validate_end_time(cls, v, values):
        """Ensure end_time is after start_time"""
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class SessionCreate(SessionBase):
    """Schema for creating a session"""
    participant_ids: Optional[List[int]] = Field(default_factory=list)


class SessionUpdate(BaseModel):
    """Schema for updating a session"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    session_type: Optional[SessionType] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    status: Optional[SessionStatus] = None
    coach_id: Optional[int] = None
    meeting_url: Optional[str] = None
    notes: Optional[str] = None


class SessionResponse(SessionBase):
    """Schema for session response"""
    id: int
    status: SessionStatus
    duration_minutes: Optional[int]
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    participants: List[SessionParticipantResponse] = []

    class Config:
        from_attributes = True


class SessionListResponse(BaseModel):
    """Schema for session list with pagination"""
    total: int
    sessions: List[SessionResponse]
    page: int
    page_size: int


# ========== Session Stats ==========

class SessionStats(BaseModel):
    """Session statistics for a user"""
    total_sessions: int
    completed_sessions: int
    upcoming_sessions: int
    cancelled_sessions: int
    attendance_rate: float  # % of sessions attended
    total_hours: float  # Total training hours
