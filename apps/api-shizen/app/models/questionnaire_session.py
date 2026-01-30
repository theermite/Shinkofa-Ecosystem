"""
QuestionnaireSession model
Shinkofa Platform - Holistic Questionnaire
"""
from sqlalchemy import Column, String, DateTime, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from enum import Enum
from app.core.database import Base


class SessionStatus(str, Enum):
    """Questionnaire session status"""
    STARTED = "started"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    ANALYZED = "analyzed"
    ABANDONED = "abandoned"


class QuestionnaireSession(Base):
    """
    Questionnaire session tracking

    Tracks user's progress through the 144-question holistic questionnaire
    Stores birth data for Design Human, Astrology, Numerology calculations
    """
    __tablename__ = "questionnaire_sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # No FK - user is in auth service

    # Session status
    status = Column(
        SQLEnum(SessionStatus),
        default=SessionStatus.STARTED,
        nullable=False,
        index=True
    )

    # Progress tracking
    current_bloc = Column(String, nullable=True)  # A, B, C... I
    completion_percentage = Column(String, default="0", nullable=False)  # 0-100

    # Birth data for DH/Astro/Numerology calculations (CRITICAL PRECISION)
    birth_data = Column(JSON, nullable=True)
    # birth_data structure:
    # {
    #     "date": "1990-06-15",  # YYYY-MM-DD
    #     "time": "14:30:00",    # HH:MM:SS (seconds optional but recommended)
    #     "city": "Paris",
    #     "country": "France",
    #     "latitude": 48.8566,   # GPS coordinates (PRECISE)
    #     "longitude": 2.3522,
    #     "timezone": "Europe/Paris",
    #     "utc_offset": "+01:00"
    # }

    # Full name for Numerology
    full_name = Column(String, nullable=True)  # "Prénom Nom"

    # Timestamps (ALL timezone-aware for consistency)
    started_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    last_activity_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    completed_at = Column(DateTime(timezone=True), nullable=True)
    analyzed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    responses = relationship(
        "QuestionnaireResponse",
        back_populates="session",
        cascade="all, delete-orphan"
    )
    profile = relationship(
        "HolisticProfile",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan"
    )
    uploaded_charts = relationship(
        "UploadedChart",
        back_populates="session",
        cascade="all, delete-orphan"
    )
