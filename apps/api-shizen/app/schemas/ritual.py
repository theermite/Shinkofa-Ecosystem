"""
Ritual schemas
Shinkofa Platform - Planner
"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class RitualTask(BaseModel):
    """Individual task within a ritual"""
    label: str
    completed: bool = False


class RitualBase(BaseModel):
    label: str = Field(..., min_length=1, max_length=200)
    icon: str = "✅"
    completed_today: bool = False
    category: str = Field(default="custom", pattern="^(morning|evening|daily|custom)$")
    order: int = 0
    tasks: Optional[List[RitualTask]] = Field(default_factory=list)  # List of subtasks with completion state


class RitualCreate(RitualBase):
    pass


class RitualUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=1, max_length=200)
    icon: Optional[str] = None
    completed_today: Optional[bool] = None
    category: Optional[str] = Field(None, pattern="^(morning|evening|daily|custom)$")
    order: Optional[int] = None
    tasks: Optional[List[RitualTask]] = None


class Ritual(RitualBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
