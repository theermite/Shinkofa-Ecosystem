"""
ConversationSession model
Shinkofa Platform - Shizen AI Chatbot

Manages conversation sessions with SHIZEN agent
"""
from sqlalchemy import Column, String, DateTime, JSON, Enum as SQLEnum, Text
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from enum import Enum
from app.core.database import Base


class ConversationStatus(str, Enum):
    """Conversation session status"""
    ACTIVE = "active"
    ARCHIVED = "archived"
    DELETED = "deleted"


class ConversationSession(Base):
    """
    SHIZEN conversation session

    Manages multi-turn conversations with context persistence
    Stores conversation metadata, context, and relationship to messages
    """
    __tablename__ = "conversation_sessions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, nullable=False, index=True)  # No FK - user is in auth service

    # Conversation info
    title = Column(String, nullable=True)  # Auto-generated or user-defined
    status = Column(
        SQLEnum(ConversationStatus),
        default=ConversationStatus.ACTIVE,
        nullable=False,
        index=True
    )

    # Context & memory (persisted across messages)
    context = Column(JSON, nullable=True)
    # context structure:
    # {
    #     "user_profile_summary": {...},  # Cached holistic profile summary
    #     "current_topic": "energy_management",
    #     "user_preferences": {
    #         "language": "fr",
    #         "communication_style": "empathique"
    #     },
    #     "recent_actions": [...]  # Last 5 actions taken
    # }

    # Metadata (renamed to 'meta' to avoid SQLAlchemy reserved keyword)
    meta = Column(JSON, nullable=True)
    # meta structure:
    # {
    #     "tags": ["coaching", "tdah", "energie"],
    #     "sentiment": "positive",  # Overall conversation sentiment
    #     "topics_discussed": ["design_humain", "routines"],
    #     "goals_identified": ["better_energy_management"],
    #     "total_messages": 42
    # }

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    last_message_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )
    archived_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    messages = relationship(
        "Message",
        back_populates="conversation",
        cascade="all, delete-orphan",
        order_by="Message.created_at"
    )
