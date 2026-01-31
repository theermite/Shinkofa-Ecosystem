"""
Exercise models - Cognitive exercises and scoring system
"""

from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, Float, Text, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from .base import BaseModel


class ExerciseCategory(str, PyEnum):
    """
    Exercise categories for cognitive training
    """
    REFLEXES = "reflexes"
    VISION = "vision"
    MEMOIRE = "memoire"
    ATTENTION = "attention"
    COORDINATION = "coordination"


class ExerciseType(str, PyEnum):
    """
    Exercise types
    """
    EXTERNAL = "external"  # Link to external website
    CUSTOM = "custom"      # Custom mini-game developed in-app


class Exercise(BaseModel):
    """
    Cognitive exercise model
    """

    __tablename__ = "exercises"

    # Basic info
    name = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(
        Enum(ExerciseCategory, name="exercise_category_enum"),
        nullable=False,
        index=True
    )
    exercise_type = Column(
        Enum(ExerciseType, name="exercise_type_enum"),
        default=ExerciseType.EXTERNAL,
        nullable=False
    )

    # External exercise info
    external_url = Column(String(500), nullable=True)
    instructions = Column(Text, nullable=True)

    # Scoring info
    score_unit = Column(String(50), nullable=True)  # "ms", "%", "points", etc.
    lower_is_better = Column(Boolean, default=False)  # True for reaction time (lower ms = better)

    # Ordering
    order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)

    # Relationships
    scores = relationship("ExerciseScore", back_populates="exercise", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Exercise(id={self.id}, name={self.name}, category={self.category})>"


class ExerciseScore(BaseModel):
    """
    User scores for exercises
    """

    __tablename__ = "exercise_scores"

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False, index=True)

    # Score data
    score_value = Column(Float, nullable=False)
    score_unit = Column(String(50), nullable=True)

    # Optional screenshot proof
    screenshot_url = Column(String(500), nullable=True)

    # Notes
    notes = Column(Text, nullable=True)

    # Relationships
    exercise = relationship("Exercise", back_populates="scores")

    def __repr__(self) -> str:
        return f"<ExerciseScore(id={self.id}, user_id={self.user_id}, exercise={self.exercise.name if self.exercise else 'N/A'}, score={self.score_value})>"
