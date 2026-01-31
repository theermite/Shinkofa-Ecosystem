"""
Contact Submission schemas for API validation
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, EmailStr

from app.models.contact_submission import SubmissionStatus


class ContactSubmissionBase(BaseModel):
    """Base contact submission schema"""
    nom: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    sujet: str = Field(..., max_length=100)
    message: str = Field(..., min_length=10)


class ContactSubmissionCreate(ContactSubmissionBase):
    """Schema for creating a contact submission (from website)"""
    source: Optional[str] = "website"
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None


class ContactSubmissionUpdate(BaseModel):
    """Schema for updating a contact submission (admin)"""
    status: Optional[SubmissionStatus] = None
    admin_notes: Optional[str] = None
    resolved_user_id: Optional[int] = None


class ContactSubmissionResponse(ContactSubmissionBase):
    """Schema for contact submission response"""
    id: int
    status: SubmissionStatus
    source: str
    submitted_at: datetime
    read_at: Optional[datetime]
    replied_at: Optional[datetime]
    resolved_user_id: Optional[int]
    admin_notes: Optional[str]

    class Config:
        from_attributes = True


class ContactSubmissionListResponse(BaseModel):
    """Schema for listing contact submissions"""
    total: int
    submissions: list[ContactSubmissionResponse]
