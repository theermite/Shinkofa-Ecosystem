"""
Coaching models - Holistic coaching module (Shinkofa philosophy)
"""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, Float, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class QuestionnaireType(str, PyEnum):
    """Types of questionnaires"""
    ONBOARDING = "onboarding"  # Initial profiling
    ENERGY = "energy"  # Daily energy check
    GOAL = "goal"  # Goal setting
    PROGRESS = "progress"  # Progress evaluation
    WELLBEING = "wellbeing"  # Mental/physical wellbeing
    CUSTOM = "custom"  # Custom questionnaire


class JournalMood(str, PyEnum):
    """Mood tracking options"""
    EXCELLENT = "excellent"
    GOOD = "good"
    NEUTRAL = "neutral"
    LOW = "low"
    BAD = "bad"


class Questionnaire(BaseModel):
    """Questionnaire template model"""
    __tablename__ = "questionnaires"

    # Basic info
    title = Column(String(200), nullable=False)
    description = Column(Text)
    questionnaire_type = Column(Enum(QuestionnaireType), nullable=False)
    is_active = Column(Boolean, default=True)
    is_required = Column(Boolean, default=False)  # Required for onboarding

    # Questions stored as JSON
    # Format: [{"question": "...", "type": "text|number|choice", "choices": [...], "required": true}]
    questions = Column(JSON, nullable=False)

    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))
    order = Column(Integer, default=0)  # Display order

    # Relationships
    created_by = relationship("User", backref="created_questionnaires")
    responses = relationship("QuestionnaireResponse", back_populates="questionnaire", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Questionnaire(id={self.id}, title='{self.title}', type={self.questionnaire_type})>"


class QuestionnaireResponse(BaseModel):
    """User responses to questionnaires"""
    __tablename__ = "questionnaire_responses"

    questionnaire_id = Column(Integer, ForeignKey("questionnaires.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Answers stored as JSON
    # Format: [{"question_index": 0, "answer": "..."}]
    answers = Column(JSON, nullable=False)

    # Metadata
    completed_at = Column(DateTime, default=datetime.utcnow)
    notes = Column(Text)  # Coach notes

    # Relationships
    questionnaire = relationship("Questionnaire", back_populates="responses")
    user = relationship("User", backref="questionnaire_responses")

    def __repr__(self):
        return f"<QuestionnaireResponse(id={self.id}, user_id={self.user_id}, questionnaire_id={self.questionnaire_id})>"


class JournalEntry(BaseModel):
    """Daily progress journal entries"""
    __tablename__ = "journal_entries"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Entry content
    title = Column(String(200))
    content = Column(Text, nullable=False)
    mood = Column(Enum(JournalMood))

    # Training-specific
    energy_level = Column(Integer)  # 1-10 scale
    training_quality = Column(Integer)  # 1-10 scale
    sleep_hours = Column(Float)
    tags = Column(JSON)  # ["mental", "gameplay", "teamwork", etc.]

    # Metadata
    entry_date = Column(DateTime, default=datetime.utcnow, index=True)
    is_private = Column(Boolean, default=True)  # Private by default

    # Relationships
    user = relationship("User", backref="journal_entries")

    def __repr__(self):
        return f"<JournalEntry(id={self.id}, user_id={self.user_id}, date={self.entry_date})>"


class Goal(BaseModel):
    """User goals and objectives"""
    __tablename__ = "goals"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Goal details
    title = Column(String(200), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # "gameplay", "mental", "physical", "teamwork"
    target_date = Column(DateTime)

    # Progress tracking
    is_completed = Column(Boolean, default=False)
    completed_at = Column(DateTime)
    progress_percentage = Column(Integer, default=0)  # 0-100

    # Milestones stored as JSON
    # Format: [{"title": "...", "completed": false, "date": "..."}]
    milestones = Column(JSON)

    # Metadata
    created_by_id = Column(Integer, ForeignKey("users.id"))  # Coach who set the goal (if applicable)
    is_public = Column(Boolean, default=False)  # Visible to team

    # Relationships
    user = relationship("User", foreign_keys=[user_id], backref="goals")
    created_by = relationship("User", foreign_keys=[created_by_id], backref="created_goals")

    def __repr__(self):
        return f"<Goal(id={self.id}, title='{self.title}', user_id={self.user_id})>"
