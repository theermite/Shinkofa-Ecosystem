"""
Pydantic schemas for recruitment applications
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

from app.models.recruitment_application import ApplicationStatus


class RecruitmentApplicationCreate(BaseModel):
    """Schema for creating a new recruitment application (public form)"""
    first_name: str = Field(..., min_length=2, max_length=100)
    last_name: str = Field(..., min_length=2, max_length=100)
    pseudo: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    age: str = Field(..., min_length=1, max_length=10)
    country: str = Field(..., min_length=2, max_length=100)
    languages: str = Field(..., min_length=2, max_length=255)
    motivation: str = Field(..., min_length=10, max_length=2000)
    availability: str = Field(..., min_length=2, max_length=255)
    current_status: str = Field(..., min_length=2, max_length=100)
    interview_availability: str = Field(..., min_length=5, max_length=500)
    source: Optional[str] = "website"


class RecruitmentApplicationUpdate(BaseModel):
    """Schema for updating a recruitment application (admin only)"""
    status: Optional[ApplicationStatus] = None
    admin_notes: Optional[str] = None


class RecruitmentApplicationResponse(BaseModel):
    """Schema for recruitment application response"""
    id: int
    first_name: str
    last_name: str
    pseudo: str
    email: str
    age: str
    country: str
    languages: str
    motivation: str
    availability: str
    current_status: str
    interview_availability: str
    status: ApplicationStatus
    source: Optional[str]
    submitted_at: datetime
    reviewed_at: Optional[datetime]
    reviewed_by_id: Optional[int]
    admin_notes: Optional[str]

    class Config:
        from_attributes = True


class RecruitmentApplicationListResponse(BaseModel):
    """Schema for paginated list of recruitment applications"""
    total: int
    applications: List[RecruitmentApplicationResponse]
