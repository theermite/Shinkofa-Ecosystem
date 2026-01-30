"""
Task model
Shinkofa Platform - Planner
"""
from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    completed = Column(Boolean, default=False, nullable=False)
    priority = Column(String, default="p3", nullable=False)  # p0 (highest) - p5 (lowest)
    due_date = Column(DateTime(timezone=True), nullable=True)

    # Relations
    project_id = Column(String, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True)
    user_id = Column(String, nullable=False, index=True)  # No FK - user is in auth service

    # Task organization (KAIDA AI features)
    is_daily_task = Column(Boolean, default=False, nullable=False)  # Daily priority task
    difficulty_level = Column(String, nullable=True)  # quick, medium, complex, long
    order = Column(Integer, default=0, nullable=False)  # Display order

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Relationships
    project = relationship("Project", back_populates="tasks")
