"""
Task schemas
Shinkofa Platform - Planner
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=500)
    description: Optional[str] = None
    completed: bool = False
    priority: str = Field(default="p3", pattern="^p[0-5]$")  # p0-p5
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None
    is_daily_task: bool = False
    difficulty_level: Optional[str] = Field(None, pattern="^(quick|medium|complex|long)$")
    order: int = 0


class TaskCreate(TaskBase):
    id: Optional[str] = None  # Allow client to provide ID for sync


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=500)
    description: Optional[str] = None
    completed: Optional[bool] = None
    priority: Optional[str] = Field(None, pattern="^p[0-5]$")
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None
    is_daily_task: Optional[bool] = None
    difficulty_level: Optional[str] = Field(None, pattern="^(quick|medium|complex|long)$")
    order: Optional[int] = None


class Task(TaskBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
