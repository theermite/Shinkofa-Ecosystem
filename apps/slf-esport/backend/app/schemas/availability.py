"""
Availability schemas - Pydantic validation for player availabilities
"""

from datetime import datetime, time, date
from typing import Optional
from pydantic import BaseModel, Field, validator


# ========== Player Availability Schemas ==========

class PlayerAvailabilityBase(BaseModel):
    """Base player availability schema - supports both recurring and specific dates"""
    day_of_week: Optional[int] = Field(None, ge=0, le=6, description="Day of week (0=Monday, 6=Sunday) - for recurring")
    specific_date: Optional[date] = Field(None, description="Specific date - for one-time availability")
    start_time: time
    end_time: time
    is_active: bool = True
    notes: Optional[str] = None

    @validator('end_time')
    def validate_end_time(cls, v, values):
        """Ensure end_time is after start_time"""
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v

    @validator('specific_date')
    def validate_availability_type(cls, v, values):
        """Ensure EITHER day_of_week OR specific_date is set (not both, not neither)"""
        day_of_week = values.get('day_of_week')

        # Both set
        if day_of_week is not None and v is not None:
            raise ValueError('Cannot set both day_of_week and specific_date - choose one')

        # Neither set
        if day_of_week is None and v is None:
            raise ValueError('Must set either day_of_week (recurring) or specific_date (one-time)')

        return v


class PlayerAvailabilityCreate(PlayerAvailabilityBase):
    """Schema for creating a player availability"""
    pass


class PlayerAvailabilityUpdate(BaseModel):
    """Schema for updating a player availability"""
    day_of_week: Optional[int] = Field(None, ge=0, le=6)
    specific_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_active: Optional[bool] = None
    notes: Optional[str] = None


class PlayerAvailabilityResponse(PlayerAvailabilityBase):
    """Schema for player availability response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TeamMemberAvailabilityResponse(BaseModel):
    """Schema for team member availability with user info (coaches only)"""
    id: int
    user_id: int
    username: str
    email: str
    day_of_week: Optional[int] = None
    specific_date: Optional[date] = None
    start_time: time
    end_time: time
    is_active: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== Availability Exception Schemas ==========

class PlayerAvailabilityExceptionBase(BaseModel):
    """Base availability exception schema"""
    exception_date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_unavailable: bool = True  # True=unavailable, False=extra availability
    reason: Optional[str] = None


class PlayerAvailabilityExceptionCreate(PlayerAvailabilityExceptionBase):
    """Schema for creating an availability exception"""
    pass


class PlayerAvailabilityExceptionUpdate(BaseModel):
    """Schema for updating an availability exception"""
    exception_date: Optional[date] = None
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    is_unavailable: Optional[bool] = None
    reason: Optional[str] = None


class PlayerAvailabilityExceptionResponse(PlayerAvailabilityExceptionBase):
    """Schema for availability exception response"""
    id: int
    user_id: int
    username: Optional[str] = None  # Optional for team exceptions (includes user info)
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== Session Invitation Schemas ==========

class SessionInvitationRequest(BaseModel):
    """Schema for inviting players to a session"""
    user_ids: list[int] = Field(..., min_items=1, description="List of user IDs to invite")


class SessionResponseRequest(BaseModel):
    """Schema for responding to a session invitation"""
    response_status: str = Field(..., pattern="^(confirmed|maybe|declined)$")
    decline_reason: Optional[str] = None


class AvailablePlayersQuery(BaseModel):
    """Schema for querying available players"""
    start_time: datetime
    end_time: datetime


class AvailablePlayerResponse(BaseModel):
    """Schema for available player response"""
    user_id: int
    username: str
    email: str
    is_available: bool
    availability_type: str  # "recurring", "exception", "unavailable"
    reason: Optional[str] = None

    class Config:
        from_attributes = True
