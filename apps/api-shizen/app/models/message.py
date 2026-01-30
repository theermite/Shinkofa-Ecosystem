"""
Message model
Shinkofa Platform - Shizen AI Chatbot

Stores individual messages within conversation sessions
"""
from sqlalchemy import Column, String, DateTime, JSON, Enum as SQLEnum, Text, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from enum import Enum
from app.core.database import Base


class MessageRole(str, Enum):
    """Message role (who sent the message)"""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"


class Message(Base):
    """
    Individual message in conversation

    Stores message content, role, metadata, and links to conversation session
    """
    __tablename__ = "messages"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(
        String,
        ForeignKey("conversation_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Message content
    role = Column(
        SQLEnum(MessageRole),
        nullable=False,
        index=True
    )
    content = Column(Text, nullable=False)

    # Metadata (renamed to 'meta' to avoid SQLAlchemy reserved keyword)
    meta = Column(JSON, nullable=True)
    # meta structure:
    # {
    #     "sentiment": "positive",  # Message sentiment (positive, neutral, negative)
    #     "intent": "ask_advice",  # User intent (ask_advice, provide_info, express_emotion, etc.)
    #     "topics": ["energie", "routines"],  # Topics in this message
    #     "actions_performed": [  # Actions taken by assistant (if role=assistant)
    #         {"type": "recommendation", "target": "task_id_123"},
    #         {"type": "analysis", "domain": "energy_patterns"}
    #     ],
    #     "entities": {  # Extracted entities (dates, tasks, emotions, etc.)
    #         "date": "2026-01-15",
    #         "emotion": "frustration",
    #         "energy_level": 7
    #     },
    #     "tools_used": ["get_user_profile", "recommend_tasks"],  # LangChain tools called
    #     "model": "qwen2.5:14b-instruct-q4_K_M",  # Model used for generation
    #     "tokens": {
    #         "prompt": 450,
    #         "completion": 180,
    #         "total": 630
    #     }
    # }

    # Timestamps
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True
    )

    # Relationships
    conversation = relationship(
        "ConversationSession",
        back_populates="messages"
    )
