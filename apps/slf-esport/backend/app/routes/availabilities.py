"""
Availability routes - API endpoints for player availability management
"""

from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.utils.dependencies import get_current_user, require_role
from app.schemas.availability import (
    PlayerAvailabilityCreate,
    PlayerAvailabilityUpdate,
    PlayerAvailabilityResponse,
    PlayerAvailabilityExceptionCreate,
    PlayerAvailabilityExceptionResponse,
    AvailablePlayerResponse,
    TeamMemberAvailabilityResponse,
)
from app.services import availability_service


router = APIRouter(tags=["availabilities"])


# ========== Player Availabilities ==========

@router.get("/my", response_model=List[PlayerAvailabilityResponse])
def get_my_availabilities(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's availabilities"""
    return availability_service.get_user_availabilities(db, current_user.id)


@router.get("/team", response_model=List[TeamMemberAvailabilityResponse])
def get_team_availabilities(
    team_only: bool = Query(True, description="Only show team members (IDs: 4, 5, 6, 7, 9)"),
    current_user: User = Depends(require_role(["COACH", "MANAGER"])),
    db: Session = Depends(get_db)
):
    """
    Get all team members' availabilities (coaches/managers only)
    Returns availabilities with user info, sorted by username
    """
    # Team member IDs
    team_member_ids = [4, 5, 6, 7, 9] if team_only else None

    return availability_service.get_team_availabilities(db, team_member_ids)


@router.post("", response_model=PlayerAvailabilityResponse, status_code=status.HTTP_201_CREATED)
def create_availability(
    availability_data: PlayerAvailabilityCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new availability for current user"""
    return availability_service.create_availability(db, current_user.id, availability_data)


@router.put("/{availability_id}", response_model=PlayerAvailabilityResponse)
def update_availability(
    availability_id: int,
    availability_data: PlayerAvailabilityUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an availability"""
    availability = availability_service.update_availability(db, availability_id, current_user.id, availability_data)
    if not availability:
        raise HTTPException(status_code=404, detail="Availability not found")
    return availability


@router.delete("/{availability_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_availability(
    availability_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an availability"""
    success = availability_service.delete_availability(db, availability_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Availability not found")


# ========== Availability Exceptions ==========

@router.get("/exceptions/my", response_model=List[PlayerAvailabilityExceptionResponse])
def get_my_exceptions(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's availability exceptions"""
    return availability_service.get_user_exceptions(db, current_user.id, start_date, end_date)


@router.post("/exceptions", response_model=PlayerAvailabilityExceptionResponse, status_code=status.HTTP_201_CREATED)
def create_exception(
    exception_data: PlayerAvailabilityExceptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new availability exception for current user"""
    return availability_service.create_exception(db, current_user.id, exception_data)


@router.delete("/exceptions/{exception_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_exception(
    exception_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an availability exception"""
    success = availability_service.delete_exception(db, exception_id, current_user.id)
    if not success:
        raise HTTPException(status_code=404, detail="Exception not found")


@router.get("/exceptions/team", response_model=List[PlayerAvailabilityExceptionResponse])
def get_team_exceptions(
    start_date: Optional[date] = Query(None, description="Filter exceptions starting from this date"),
    end_date: Optional[date] = Query(None, description="Filter exceptions up to this date"),
    team_only: bool = Query(True, description="Only show team members (IDs: 4, 5, 6, 7, 9)"),
    current_user: User = Depends(require_role(["COACH", "MANAGER"])),
    db: Session = Depends(get_db)
):
    """
    Get all team members' availability exceptions (coaches/managers only)
    Returns upcoming exceptions with user info, sorted by date
    """
    # Team member IDs
    team_member_ids = [4, 5, 6, 7, 9] if team_only else None

    return availability_service.get_team_exceptions(db, team_member_ids, start_date, end_date)


# ========== Available Players Query ==========

@router.get("/available-players", response_model=List[AvailablePlayerResponse])
def get_available_players(
    start_time: datetime = Query(..., description="Session start time (ISO format, local time)"),
    end_time: datetime = Query(..., description="Session end time (ISO format, local time)"),
    team_only: bool = Query(True, description="Only check team members (IDs: 4, 5, 6, 7, 9)"),
    current_user: User = Depends(require_role(["COACH", "MANAGER"])),
    db: Session = Depends(get_db)
):
    """
    Get available players for a given time slot (coaches/managers only)
    Returns sorted list: available players first, then unavailable

    IMPORTANT: Times should be in local timezone (Europe/Paris) without 'Z' suffix
    Example: 2026-01-10T18:00:00 (not 2026-01-10T18:00:00Z)
    """
    # Convert to naive datetime (remove timezone info if present)
    # This ensures we compare local times with local availability ranges
    if start_time.tzinfo is not None:
        start_time = start_time.replace(tzinfo=None)
    if end_time.tzinfo is not None:
        end_time = end_time.replace(tzinfo=None)

    # Team member IDs
    team_player_ids = [4, 5, 6, 7, 9] if team_only else None

    return availability_service.get_available_players(db, start_time, end_time, team_player_ids)
