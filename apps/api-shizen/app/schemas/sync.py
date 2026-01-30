"""
Sync schemas
"""
from pydantic import BaseModel
from typing import List, Optional


class TaskSync(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    completed: bool = False
    priority: str = "p3"
    dueDate: Optional[str] = None
    projectId: Optional[str] = None
    isDailyTask: Optional[bool] = False
    difficultyLevel: Optional[str] = None  # quick, medium, complex, long
    order: Optional[int] = 0
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class RitualSync(BaseModel):
    id: str
    label: str
    icon: str = "✅"
    completed: bool = False
    category: str = "custom"
    order: int = 0


class DailyJournalSync(BaseModel):
    date: str
    energyMorning: int = 5
    energyEvening: int = 5
    intentions: str = ""
    gratitudes: List[str] = ["", "", ""]
    successes: List[str] = ["", "", ""]
    learning: str = ""
    adjustments: str = ""


class AlarmSync(BaseModel):
    id: str
    taskId: str
    datetime: str
    label: str
    enabled: bool = True


class ProjectSync(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    color: str = "#000000"
    icon: Optional[str] = None
    status: str = "active"  # active, completed, archived
    createdAt: Optional[str] = None
    updatedAt: Optional[str] = None


class SyncRequest(BaseModel):
    tasks: List[TaskSync] = []
    projects: List[ProjectSync] = []
    rituals: List[RitualSync] = []
    dailyJournal: Optional[DailyJournalSync] = None
    alarms: List[AlarmSync] = []
    lastUpdated: str


class SyncResponse(BaseModel):
    success: bool
    data: Optional[dict] = None
    error: Optional[str] = None
