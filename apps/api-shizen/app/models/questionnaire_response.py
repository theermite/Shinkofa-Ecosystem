"""
QuestionnaireResponse model
Shinkofa Platform - Holistic Questionnaire
"""
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from app.core.database import Base


class QuestionnaireResponse(Base):
    """
    Individual question responses

    Stores all 168 answers from the holistic questionnaire
    Organized by bloc (A-I) and question ID
    """
    __tablename__ = "questionnaire_responses"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(
        String,
        ForeignKey("questionnaire_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Question organization
    bloc = Column(String, nullable=False, index=True)  # A, B, C... I
    question_id = Column(String, nullable=False, index=True)  # Unique identifier per question
    question_text = Column(String, nullable=True)  # Store question text for reference

    # Answer data (flexible JSON for different question types)
    answer = Column(JSON, nullable=False)
    # answer structure examples:
    # Radio: {"value": "option_1", "label": "Je suis très énergique le matin"}
    # Checkbox: {"values": ["option_1", "option_3"], "labels": ["...", "..."]}
    # Likert: {"value": 7, "scale": 10}
    # Text: {"value": "Mon commentaire libre..."}
    # Comment: {"comment": "Précision supplémentaire..."}

    # Question metadata
    question_type = Column(String, nullable=False)  # radio, checkbox, likert, text, comment
    is_required = Column(String, default="false", nullable=False)  # true/false as string

    # Timestamps
    answered_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    updated_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False
    )

    # Relationships
    session = relationship("QuestionnaireSession", back_populates="responses")
