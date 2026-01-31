"""
Pydantic schemas for Exercise models
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.exercise import ExerciseCategory, ExerciseType


class ExerciseBase(BaseModel):
    """Base exercise schema"""
    name: str = Field(..., min_length=3, max_length=200)
    description: Optional[str] = None
    category: ExerciseCategory
    exercise_type: ExerciseType = ExerciseType.EXTERNAL
    external_url: Optional[str] = Field(None, max_length=500)
    instructions: Optional[str] = None
    score_unit: Optional[str] = Field(None, max_length=50)
    lower_is_better: bool = False
    order: int = 0
    is_active: bool = True


class ExerciseCreate(ExerciseBase):
    """Schema for creating exercise"""
    pass


class ExerciseUpdate(BaseModel):
    """Schema for updating exercise"""
    name: Optional[str] = Field(None, min_length=3, max_length=200)
    description: Optional[str] = None
    category: Optional[ExerciseCategory] = None
    exercise_type: Optional[ExerciseType] = None
    external_url: Optional[str] = Field(None, max_length=500)
    instructions: Optional[str] = None
    score_unit: Optional[str] = Field(None, max_length=50)
    lower_is_better: Optional[bool] = None
    order: Optional[int] = None
    is_active: Optional[bool] = None


class ExerciseResponse(ExerciseBase):
    """Schema for exercise response"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ExerciseScoreBase(BaseModel):
    """Base exercise score schema"""
    exercise_id: int
    score_value: float
    score_unit: Optional[str] = Field(None, max_length=50)
    screenshot_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class ExerciseScoreCreate(ExerciseScoreBase):
    """Schema for creating exercise score"""
    pass


class ExerciseScoreUpdate(BaseModel):
    """Schema for updating exercise score"""
    score_value: Optional[float] = None
    score_unit: Optional[str] = Field(None, max_length=50)
    screenshot_url: Optional[str] = Field(None, max_length=500)
    notes: Optional[str] = None


class ExerciseScoreResponse(BaseModel):
    """Schema for exercise score response"""
    id: int
    user_id: int
    exercise_id: int
    score_value: float
    score_unit: Optional[str]
    screenshot_url: Optional[str]
    notes: Optional[str]
    created_at: datetime
    updated_at: datetime

    # Include exercise info
    exercise: Optional[ExerciseResponse] = None

    class Config:
        from_attributes = True


class ExerciseScoreWithExercise(ExerciseScoreResponse):
    """Score response with full exercise details"""
    exercise: ExerciseResponse

    class Config:
        from_attributes = True


class ExerciseStats(BaseModel):
    """Exercise statistics for a user"""
    exercise_id: int
    exercise_name: str
    category: ExerciseCategory
    total_attempts: int
    best_score: float
    average_score: float
    latest_score: Optional[float]
    score_unit: Optional[str]
    lower_is_better: bool
    progression: Optional[float] = None  # % improvement
