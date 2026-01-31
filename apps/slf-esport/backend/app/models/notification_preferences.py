"""
Notification Preferences model - User email notification settings
"""

from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.models.base import Base


class NotificationPreferences(Base):
    """Model for user notification preferences"""

    __tablename__ = "notification_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)

    # Session notifications
    session_created = Column(Boolean, default=True, nullable=False,
                            comment="Notify when new training session is created")
    session_invitation = Column(Boolean, default=True, nullable=False,
                               comment="Notify when invited to a session")
    session_reminder = Column(Boolean, default=True, nullable=False,
                            comment="Send reminder before session starts")

    # Exercise notifications
    exercise_assigned = Column(Boolean, default=True, nullable=False,
                              comment="Notify when new exercise is assigned")
    performance_recorded = Column(Boolean, default=True, nullable=False,
                                 comment="Notify when performance is recorded")

    # Communication notifications
    coach_message = Column(Boolean, default=True, nullable=False,
                          comment="Notify when coach sends a message")

    # System notifications
    account_updates = Column(Boolean, default=True, nullable=False,
                           comment="Notify about account/security updates")

    # Relationship
    user = relationship("User", back_populates="notification_preferences")

    def __repr__(self):
        return f"<NotificationPreferences(user_id={self.user_id})>"
