"""
Tasks CRUD endpoints
Shinkofa Platform - Planner

Tier limits enforced:
- MUSHA (free): 10 active tasks max
- SAMURAI+: Unlimited tasks
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.task import Task
from app.schemas.task import Task as TaskSchema, TaskCreate, TaskUpdate
from app.utils.auth import get_current_user_id
from app.utils.tier_service import verify_task_limit

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("", response_model=List[TaskSchema])
def get_tasks(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    completed: bool = None,
    project_id: str = None,
):
    """
    Get all tasks for current user

    Query params:
    - completed: Filter by completion status
    - project_id: Filter by project
    """
    query = db.query(Task).filter(Task.user_id == user_id)

    if completed is not None:
        query = query.filter(Task.completed == completed)

    if project_id:
        query = query.filter(Task.project_id == project_id)

    return query.order_by(Task.order, Task.created_at.desc()).all()


@router.get("/{task_id}", response_model=TaskSchema)
def get_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a single task by ID"""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )

    return task


@router.post("", response_model=TaskSchema, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    user_id: str = Depends(verify_task_limit),  # Verifies tier limit
    db: Session = Depends(get_db),
):
    """
    Create a new task

    Tier limits enforced:
    - MUSHA (free): 10 active (incomplete) tasks max
    - SAMURAI+: Unlimited

    Raises 403 if limit reached for MUSHA users
    """
    # Extract data and use client-provided ID if present
    task_dict = task_data.model_dump()
    task_id = task_dict.pop('id', None) or f"task-{uuid.uuid4()}"

    new_task = Task(
        id=task_id,
        user_id=user_id,
        **task_dict,
    )

    db.add(new_task)
    db.commit()
    db.refresh(new_task)

    return new_task


@router.put("/{task_id}", response_model=TaskSchema)
def update_task(
    task_id: str,
    task_update: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update an existing task"""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )

    # Update only provided fields
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    db.commit()
    db.refresh(task)

    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a task"""
    task = db.query(Task).filter(Task.id == task_id, Task.user_id == user_id).first()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Task {task_id} not found",
        )

    db.delete(task)
    db.commit()

    return None
