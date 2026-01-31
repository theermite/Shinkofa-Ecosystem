"""
Session models - Training session booking and scheduling
"""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text
from sqlalchemy.orm import relationship
from .base import BaseModel


class SessionType(str, PyEnum):
    """Types of training sessions"""
    SOLO = "solo"
    DUO = "duo"
    TRIO = "trio"
    TEAM = "team"
    GROUP = "group"  # For group coaching sessions


class SessionStatus(str, PyEnum):
    """Session booking status"""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    CANCELLED = "cancelled"
    COMPLETED = "completed"


class Session(BaseModel):
    """Training session model"""
    __tablename__ = "sessions"

    # Basic info
    title = Column(String(200), nullable=False)
    description = Column(Text)
    session_type = Column(Enum(SessionType), nullable=False)
    status = Column(Enum(SessionStatus), default=SessionStatus.PENDING, nullable=False)

    # Scheduling
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    duration_minutes = Column(Integer)  # Auto-calculated

    # Participants
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # Optional coach
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who created the session

    # Meeting details
    meeting_url = Column(String(500))  # Discord, Zoom, etc.
    notes = Column(Text)  # Coach notes after session

    # Relationships
    coach = relationship("User", foreign_keys=[coach_id], backref="coached_sessions")
    created_by = relationship("User", foreign_keys=[created_by_id], backref="created_sessions")
    participants = relationship("SessionParticipant", back_populates="session", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Session(id={self.id}, title='{self.title}', type={self.session_type}, start={self.start_time})>"


class SessionParticipant(BaseModel):
    """Many-to-many relationship between sessions and participants"""
    __tablename__ = "session_participants"

    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Response status: "pending", "confirmed", "maybe", "declined"
    response_status = Column(String(50), default="pending", nullable=False)

    # Legacy field (kept for backwards compatibility)
    attendance_status = Column(String(50), default="pending")  # present, absent, excused (after session)

    # Invitation tracking
    invitation_sent_at = Column(DateTime)  # When invitation was sent
    response_at = Column(DateTime)  # When user responded
    decline_reason = Column(Text)  # Optional reason for declining

    # General notes
    notes = Column(Text)  # Participant-specific notes

    # Relationships
    session = relationship("Session", back_populates="participants")
    user = relationship("User", backref="session_participations")

    def __repr__(self):
        return f"<SessionParticipant(session_id={self.session_id}, user_id={self.user_id}, status={self.response_status})>"
