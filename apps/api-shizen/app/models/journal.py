"""
Daily Journal model
Shinkofa Platform - Planner
"""
from sqlalchemy import Column, String, Integer, Date, JSON, DateTime, UniqueConstraint
from datetime import datetime, timezone
from app.core.database import Base


class DailyJournal(Base):
    __tablename__ = "daily_journals"
    __table_args__ = (
        UniqueConstraint('user_id', 'date', name='uq_daily_journals_user_date'),
    )

    id = Column(String, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)  # One journal per day per user

    # Energy tracking
    energy_morning = Column(Integer, default=5, nullable=False)  # 0-10 scale
    energy_evening = Column(Integer, default=5, nullable=False)  # 0-10 scale

    # Daily reflections
    intentions = Column(String, default="", nullable=False)
    gratitudes = Column(JSON, default=list, nullable=False)  # Array of 3 strings
    successes = Column(JSON, default=list, nullable=False)  # Array of 3 strings
    learning = Column(String, default="", nullable=False)
    adjustments = Column(String, default="", nullable=False)

    # Mood check-ins (multiple per day)
    mood_check_ins = Column(JSON, default=list, nullable=False)  # Array of MoodCheckIn

    # Relations
    user_id = Column(String, nullable=False, index=True)  # No FK - user is in auth service

    # Timestamps
    created_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
