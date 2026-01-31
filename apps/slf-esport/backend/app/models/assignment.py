"""
Exercise assignment models - Coach assigns exercises to players
"""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, Date
from sqlalchemy.orm import relationship
from .base import BaseModel


class AssignmentStatus(str, PyEnum):
    """Assignment status"""
    PENDING = "pending"      # Not started yet
    IN_PROGRESS = "in_progress"  # Started but not completed
    COMPLETED = "completed"  # Successfully completed
    SKIPPED = "skipped"      # Player skipped this assignment


class ExerciseAssignment(BaseModel):
    """
    Exercise assignment from coach to player
    Coaches can assign specific exercises to players with deadlines
    """
    __tablename__ = "exercise_assignments"

    # Who and what
    player_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False, index=True)
    coach_id = Column(Integer, ForeignKey("users.id"), nullable=False)  # Who assigned it

    # Assignment details
    title = Column(String(200))  # Optional custom title
    description = Column(Text)  # Coach instructions/notes
    target_score = Column(String(100))  # Expected target (e.g., "< 300ms", "> 80%")

    # Scheduling
    assigned_date = Column(DateTime, default=datetime.utcnow, nullable=False)
    due_date = Column(Date)  # Optional deadline

    # Status tracking
    status = Column(
        Enum(AssignmentStatus, name="assignment_status_enum"),
        default=AssignmentStatus.PENDING,
        nullable=False,
        index=True
    )
    completed_date = Column(DateTime)

    # Completion tracking
    attempts_count = Column(Integer, default=0)  # How many times player tried
    best_score = Column(String(100))  # Best score achieved (if completed)

    # Notes
    player_notes = Column(Text)  # Player can add notes
    coach_feedback = Column(Text)  # Coach feedback after completion

    # Priority and visibility
    priority = Column(Integer, default=0)  # Higher = more urgent
    is_mandatory = Column(Boolean, default=False)  # Required or optional

    # Relationships
    player = relationship("User", foreign_keys=[player_id], backref="assigned_exercises")
    exercise = relationship("Exercise", backref="assignments")
    coach = relationship("User", foreign_keys=[coach_id], backref="created_assignments")

    def __repr__(self):
        return f"<ExerciseAssignment(id={self.id}, player_id={self.player_id}, exercise_id={self.exercise_id}, status={self.status})>"
