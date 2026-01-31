"""
Recruitment Application model for player recruitment system
"""

from datetime import datetime
from enum import Enum
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship

from app.models.base import Base


class ApplicationStatus(str, Enum):
    """Status of a recruitment application"""
    NEW = "NEW"
    REVIEWED = "REVIEWED"
    INTERVIEW_SCHEDULED = "INTERVIEW_SCHEDULED"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"
    WITHDRAWN = "WITHDRAWN"


class RecruitmentApplication(Base):
    """
    Model for storing recruitment applications from the website form
    """
    __tablename__ = "recruitment_applications"

    id = Column(Integer, primary_key=True, index=True)

    # Applicant personal info
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    pseudo = Column(String(100), nullable=False)
    email = Column(String(255), nullable=False, index=True)
    age = Column(String(10), nullable=False)
    country = Column(String(100), nullable=False)
    languages = Column(String(255), nullable=False)

    # Gaming/availability info
    motivation = Column(Text, nullable=False)
    availability = Column(String(255), nullable=False)
    current_status = Column(String(100), nullable=False)  # Student, Working, etc.
    interview_availability = Column(Text, nullable=False)

    # Application metadata
    status = Column(SQLEnum(ApplicationStatus), nullable=False, default=ApplicationStatus.NEW, index=True)
    source = Column(String(50), default="website")
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(500), nullable=True)

    # Timestamps
    submitted_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    reviewed_at = Column(DateTime, nullable=True)

    # Admin fields
    reviewed_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    admin_notes = Column(Text, nullable=True)

    # Relationships
    reviewed_by = relationship("User", foreign_keys=[reviewed_by_id])

    def __repr__(self):
        return f"<RecruitmentApplication {self.id}: {self.pseudo} ({self.status})>"
