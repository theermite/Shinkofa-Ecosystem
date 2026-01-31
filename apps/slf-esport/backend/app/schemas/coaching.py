"""
Coaching schemas - Pydantic validation for coaching module
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field, validator
from app.models.coaching import QuestionnaireType, JournalMood


# ========== Questionnaire Schemas ==========

class QuestionSchema(BaseModel):
    """Schema for a single question"""
    question: str
    type: str  # "text", "number", "choice", "scale"
    choices: Optional[List[str]] = None
    required: bool = False


class QuestionnaireBase(BaseModel):
    """Base questionnaire schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    questionnaire_type: QuestionnaireType
    is_active: bool = True
    is_required: bool = False
    questions: List[Dict[str, Any]]
    order: int = 0


class QuestionnaireCreate(QuestionnaireBase):
    """Schema for creating a questionnaire"""
    pass


class QuestionnaireUpdate(BaseModel):
    """Schema for updating a questionnaire"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    is_active: Optional[bool] = None
    is_required: Optional[bool] = None
    questions: Optional[List[Dict[str, Any]]] = None
    order: Optional[int] = None


class QuestionnaireResponse(QuestionnaireBase):
    """Schema for questionnaire response"""
    id: int
    created_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== Questionnaire Response Schemas ==========

class AnswerSchema(BaseModel):
    """Schema for a single answer"""
    question_index: int
    answer: Any  # Can be string, number, list, etc.


class QuestionnaireResponseCreate(BaseModel):
    """Schema for creating a questionnaire response"""
    questionnaire_id: int
    answers: List[Dict[str, Any]]
    notes: Optional[str] = None


class QuestionnaireResponseUpdate(BaseModel):
    """Schema for updating a questionnaire response"""
    answers: Optional[List[Dict[str, Any]]] = None
    notes: Optional[str] = None


class QuestionnaireResponseResponse(BaseModel):
    """Schema for questionnaire response response"""
    id: int
    questionnaire_id: int
    user_id: int
    answers: List[Dict[str, Any]]
    notes: Optional[str]
    completed_at: datetime
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ========== Journal Entry Schemas ==========

class JournalEntryBase(BaseModel):
    """Base journal entry schema"""
    title: Optional[str] = Field(None, max_length=200)
    content: str = Field(..., min_length=1)
    mood: Optional[JournalMood] = None
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    training_quality: Optional[int] = Field(None, ge=1, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    tags: Optional[List[str]] = None
    entry_date: Optional[datetime] = None
    is_private: bool = True


class JournalEntryCreate(JournalEntryBase):
    """Schema for creating a journal entry"""
    pass


class JournalEntryUpdate(BaseModel):
    """Schema for updating a journal entry"""
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    mood: Optional[JournalMood] = None
    energy_level: Optional[int] = Field(None, ge=1, le=10)
    training_quality: Optional[int] = Field(None, ge=1, le=10)
    sleep_hours: Optional[float] = Field(None, ge=0, le=24)
    tags: Optional[List[str]] = None
    is_private: Optional[bool] = None


class JournalEntryResponse(JournalEntryBase):
    """Schema for journal entry response"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class JournalStats(BaseModel):
    """Journal statistics"""
    total_entries: int
    avg_energy_level: Optional[float]
    avg_training_quality: Optional[float]
    avg_sleep_hours: Optional[float]
    mood_distribution: Dict[str, int]


# ========== Goal Schemas ==========

class MilestoneSchema(BaseModel):
    """Schema for a goal milestone"""
    title: str
    completed: bool = False
    date: Optional[str] = None


class GoalBase(BaseModel):
    """Base goal schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[datetime] = None
    progress_percentage: int = Field(default=0, ge=0, le=100)
    is_completed: bool = False
    milestones: Optional[List[Dict[str, Any]]] = None
    is_public: bool = False


class GoalCreate(GoalBase):
    """Schema for creating a goal"""
    pass


class GoalUpdate(BaseModel):
    """Schema for updating a goal"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[str] = None
    target_date: Optional[datetime] = None
    progress_percentage: Optional[int] = Field(None, ge=0, le=100)
    is_completed: Optional[bool] = None
    completed_at: Optional[datetime] = None
    milestones: Optional[List[Dict[str, Any]]] = None
    is_public: Optional[bool] = None


class GoalResponse(GoalBase):
    """Schema for goal response"""
    id: int
    user_id: int
    created_by_id: Optional[int]
    completed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class GoalStats(BaseModel):
    """Goal statistics"""
    total_goals: int
    completed_goals: int
    in_progress_goals: int
    completion_rate: float
