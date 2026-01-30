"""
Ritual model
Shinkofa Platform - Planner
Daily rituals and habits tracking
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, JSON
from datetime import datetime, timezone
from app.core.database import Base


class Ritual(Base):
    __tablename__ = "rituals"

    id = Column(String, primary_key=True, index=True)
    label = Column(String, nullable=False)
    icon = Column(String, default="✅", nullable=False)
    completed_today = Column(Boolean, default=False, nullable=False)
    category = Column(String, default="custom", nullable=False)  # morning, evening, daily, custom
    order = Column(Integer, default=0, nullable=False)  # Display order
    tasks = Column(JSON, default=list, nullable=True)  # List of subtasks for this ritual

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relations
    user_id = Column(String, nullable=False, index=True)  # No FK - user is in auth service
