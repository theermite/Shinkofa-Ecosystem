"""
Widget Data schemas
Shinkofa Platform - Planner
"""
from pydantic import BaseModel, Field
from typing import Any, Dict
from datetime import datetime


class WidgetDataBase(BaseModel):
    widget_slug: str = Field(..., min_length=1, max_length=100)
    data: Dict[str, Any] = Field(..., description="Widget state data (tasks, projects, journals, etc.)")


class WidgetDataUpdate(BaseModel):
    data: Dict[str, Any] = Field(..., description="Widget state data to update")


class WidgetData(WidgetDataBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
