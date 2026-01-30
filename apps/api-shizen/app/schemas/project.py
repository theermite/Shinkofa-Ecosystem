"""
Project schemas
Shinkofa Platform - Planner
"""
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime


class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    color: str = Field(default="#6366f1", pattern="^#[0-9A-Fa-f]{6}$")  # Hex color
    icon: Optional[str] = None
    status: str = Field(default="active", pattern="^(active|completed|archived)$")


class ProjectCreate(ProjectBase):
    id: Optional[str] = None  # Allow client to provide ID for sync


class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = None
    status: Optional[str] = Field(None, pattern="^(active|completed|archived)$")


class Project(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Sync schemas
class ProjectSyncItem(BaseModel):
    """Project item for sync request"""
    id: str
    name: str
    description: Optional[str] = None
    color: str = "#6366f1"
    icon: Optional[str] = None
    status: str = "active"
    created_at: datetime
    updated_at: datetime
    deleted: bool = False


class ProjectSyncRequest(BaseModel):
    """Request body for project sync"""
    projects: List[ProjectSyncItem]
    last_sync_at: Optional[datetime] = None


class ProjectSyncResponse(BaseModel):
    """Response for project sync"""
    updated_on_server: List[str]  # IDs of projects updated on server from client
    server_changes: List[Project]  # Projects changed on server
    deleted_ids: List[str]  # IDs of projects deleted on server
    sync_timestamp: datetime
