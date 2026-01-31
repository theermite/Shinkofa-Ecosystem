"""
Exercise assignment schemas
"""

from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, Field
from app.models.assignment import AssignmentStatus


# ========== Exercise Assignment Schemas ==========

class ExerciseAssignmentBase(BaseModel):
    """Base exercise assignment schema"""
    title: Optional[str] = None
    description: Optional[str] = None
    target_score: Optional[str] = None
    due_date: Optional[date] = None
    priority: int = Field(default=0, ge=0, le=10)
    is_mandatory: bool = False


class ExerciseAssignmentCreate(ExerciseAssignmentBase):
    """Create exercise assignment"""
    exercise_id: int
    player_id: int  # Who to assign to


class ExerciseAssignmentUpdate(BaseModel):
    """Update exercise assignment"""
    title: Optional[str] = None
    description: Optional[str] = None
    target_score: Optional[str] = None
    due_date: Optional[date] = None
    status: Optional[AssignmentStatus] = None
    priority: Optional[int] = Field(None, ge=0, le=10)
    is_mandatory: Optional[bool] = None
    player_notes: Optional[str] = None
    coach_feedback: Optional[str] = None
    best_score: Optional[str] = None


class ExerciseAssignmentResponse(ExerciseAssignmentBase):
    """Exercise assignment response"""
    id: int
    player_id: int
    exercise_id: int
    coach_id: int
    assigned_date: datetime
    status: AssignmentStatus
    completed_date: Optional[datetime] = None
    attempts_count: int
    best_score: Optional[str] = None
    player_notes: Optional[str] = None
    coach_feedback: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    # Related data (optional, populated by service)
    exercise_name: Optional[str] = None
    player_username: Optional[str] = None
    coach_username: Optional[str] = None

    class Config:
        from_attributes = True


class AssignmentStats(BaseModel):
    """Assignment statistics for a player"""
    total_assignments: int
    pending: int
    in_progress: int
    completed: int
    completion_rate: float  # Percentage
    overdue: int  # Assignments past due date
