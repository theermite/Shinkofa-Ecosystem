"""
Widget Data model - Stores widget state for multi-device sync
Shinkofa Platform - Planner
"""
from sqlalchemy import Column, String, DateTime, JSON
from datetime import datetime, timezone
from app.core.database import Base


class WidgetData(Base):
    __tablename__ = "widget_data"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # No FK - user is in auth service
    widget_slug = Column(String, nullable=False, index=True)  # e.g., "task-manager", "daily-journal"
    data = Column(JSON, nullable=False)  # Widget state (tasks, projects, journals, etc.)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    def __repr__(self):
        return f"<WidgetData(user_id={self.user_id}, widget_slug={self.widget_slug})>"
