"""
Notification model - In-app notifications for users
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


class NotificationType(str, enum.Enum):
    INFO = "info"
    SUCCESS = "success"
    WARNING = "warning"
    ERROR = "error"
    EXERCISE_ASSIGNED = "exercise_assigned"
    SESSION_REMINDER = "session_reminder"
    REPORT_READY = "report_ready"
    CONTACT_FORM = "contact_form"


class Notification(Base):
    """In-app notification for a user"""
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    
    # Target user
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    
    # Notification content
    type = Column(SQLEnum(NotificationType), default=NotificationType.INFO, nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    
    # Optional link/action
    link = Column(String(500), nullable=True)  # URL to navigate to
    action_text = Column(String(100), nullable=True)  # Button text (e.g., "Voir l'exercice")
    
    # Status
    read = Column(Boolean, default=False, nullable=False, index=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    read_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="notifications")

    def __repr__(self):
        return f"<Notification {self.id}: {self.title} for user {self.user_id}>"
