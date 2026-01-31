"""
Exercise assignment routes
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.assignment import AssignmentStatus
from app.schemas.assignment import (
    ExerciseAssignmentCreate,
    ExerciseAssignmentUpdate,
    ExerciseAssignmentResponse,
    AssignmentStats,
)
from app.services.assignment_service import AssignmentService
from app.utils.dependencies import get_current_user, require_role


router = APIRouter(tags=["assignments"])


# ========== Assignment Management ==========

@router.post("", response_model=ExerciseAssignmentResponse, status_code=201)
async def create_assignment(
    assignment_data: ExerciseAssignmentCreate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """
    Create a new exercise assignment (coaches/managers only)

    - **exercise_id**: Exercise to assign
    - **player_id**: Player to assign to
    - **title**: Optional custom title
    - **description**: Coach instructions
    - **target_score**: Expected target
    - **due_date**: Optional deadline
    - **priority**: 0-10 (higher = more urgent)
    - **is_mandatory**: Required or optional
    """
    assignment = AssignmentService.create_assignment(db, assignment_data, current_user.id)

    # Populate related data
    response = ExerciseAssignmentResponse.model_validate(assignment)
    if assignment.exercise:
        response.exercise_name = assignment.exercise.name
    if assignment.player:
        response.player_username = assignment.player.username
    if assignment.coach:
        response.coach_username = assignment.coach.username

    return response


@router.get("/my-assignments", response_model=List[ExerciseAssignmentResponse])
async def get_my_assignments(
    status: Optional[AssignmentStatus] = Query(None),
    include_completed: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's exercise assignments"""
    skip = (page - 1) * page_size

    assignments, total = AssignmentService.get_player_assignments(
        db,
        current_user.id,
        status=status,
        include_completed=include_completed,
        skip=skip,
        limit=page_size,
    )

    # Populate related data
    results = []
    for assignment in assignments:
        response = ExerciseAssignmentResponse.model_validate(assignment)
        if assignment.exercise:
            response.exercise_name = assignment.exercise.name
        if assignment.player:
            response.player_username = assignment.player.username
        if assignment.coach:
            response.coach_username = assignment.coach.username
        results.append(response)

    return results


@router.get("/player/{player_id}", response_model=List[ExerciseAssignmentResponse])
async def get_player_assignments(
    player_id: int,
    status: Optional[AssignmentStatus] = Query(None),
    include_completed: bool = Query(True),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get assignments for a specific player (coaches/managers only)"""
    skip = (page - 1) * page_size

    assignments, total = AssignmentService.get_player_assignments(
        db,
        player_id,
        status=status,
        include_completed=include_completed,
        skip=skip,
        limit=page_size,
    )

    # Populate related data
    results = []
    for assignment in assignments:
        response = ExerciseAssignmentResponse.model_validate(assignment)
        if assignment.exercise:
            response.exercise_name = assignment.exercise.name
        if assignment.player:
            response.player_username = assignment.player.username
        if assignment.coach:
            response.coach_username = assignment.coach.username
        results.append(response)

    return results


@router.get("/my-created", response_model=List[ExerciseAssignmentResponse])
async def get_my_created_assignments(
    player_id: Optional[int] = Query(None),
    status: Optional[AssignmentStatus] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get assignments created by current coach"""
    skip = (page - 1) * page_size

    assignments, total = AssignmentService.get_coach_assignments(
        db,
        current_user.id,
        player_id=player_id,
        status=status,
        skip=skip,
        limit=page_size,
    )

    # Populate related data
    results = []
    for assignment in assignments:
        response = ExerciseAssignmentResponse.model_validate(assignment)
        if assignment.exercise:
            response.exercise_name = assignment.exercise.name
        if assignment.player:
            response.player_username = assignment.player.username
        if assignment.coach:
            response.coach_username = assignment.coach.username
        results.append(response)

    return results


@router.get("/{assignment_id}", response_model=ExerciseAssignmentResponse)
async def get_assignment(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get assignment by ID"""
    assignment = AssignmentService.get_assignment_by_id(db, assignment_id)

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check permissions (player, coach who created it, or manager)
    is_player = assignment.player_id == current_user.id
    is_coach = assignment.coach_id == current_user.id
    is_manager = current_user.role == UserRole.MANAGER

    if not (is_player or is_coach or is_manager):
        raise HTTPException(status_code=403, detail="Access denied")

    # Populate related data
    response = ExerciseAssignmentResponse.model_validate(assignment)
    if assignment.exercise:
        response.exercise_name = assignment.exercise.name
    if assignment.player:
        response.player_username = assignment.player.username
    if assignment.coach:
        response.coach_username = assignment.coach.username

    return response


@router.put("/{assignment_id}", response_model=ExerciseAssignmentResponse)
async def update_assignment(
    assignment_id: int,
    assignment_data: ExerciseAssignmentUpdate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Update an assignment

    - Players can update: status, player_notes, best_score
    - Coaches can update: all fields
    """
    assignment = AssignmentService.get_assignment_by_id(db, assignment_id)

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check permissions
    is_player = assignment.player_id == current_user.id
    is_coach = assignment.coach_id == current_user.id
    is_manager = current_user.role == UserRole.MANAGER

    if not (is_player or is_coach or is_manager):
        raise HTTPException(status_code=403, detail="Access denied")

    # Players can only update certain fields
    if is_player and not (is_coach or is_manager):
        allowed_fields = {"status", "player_notes", "best_score"}
        update_fields = set(assignment_data.model_dump(exclude_unset=True).keys())
        if not update_fields.issubset(allowed_fields):
            raise HTTPException(
                status_code=403,
                detail=f"Players can only update: {', '.join(allowed_fields)}"
            )

    updated_assignment = AssignmentService.update_assignment(db, assignment_id, assignment_data)

    # Populate related data
    response = ExerciseAssignmentResponse.model_validate(updated_assignment)
    if updated_assignment.exercise:
        response.exercise_name = updated_assignment.exercise.name
    if updated_assignment.player:
        response.player_username = updated_assignment.player.username
    if updated_assignment.coach:
        response.coach_username = updated_assignment.coach.username

    return response


@router.delete("/{assignment_id}", status_code=204)
async def delete_assignment(
    assignment_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Delete an assignment (coaches/managers only)"""
    assignment = AssignmentService.get_assignment_by_id(db, assignment_id)

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check permissions (coach who created it or manager)
    is_coach = assignment.coach_id == current_user.id
    is_manager = current_user.role == UserRole.MANAGER

    if not (is_coach or is_manager):
        raise HTTPException(status_code=403, detail="Access denied")

    success = AssignmentService.delete_assignment(db, assignment_id)

    if not success:
        raise HTTPException(status_code=404, detail="Assignment not found")

    return None


@router.post("/{assignment_id}/attempt", response_model=ExerciseAssignmentResponse)
async def record_attempt(
    assignment_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Record an attempt on an assignment (increments attempt counter)"""
    assignment = AssignmentService.get_assignment_by_id(db, assignment_id)

    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    # Check permissions (must be the player)
    if assignment.player_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    updated_assignment = AssignmentService.increment_attempts(db, assignment_id)

    # Populate related data
    response = ExerciseAssignmentResponse.model_validate(updated_assignment)
    if updated_assignment.exercise:
        response.exercise_name = updated_assignment.exercise.name
    if updated_assignment.player:
        response.player_username = updated_assignment.player.username
    if updated_assignment.coach:
        response.coach_username = updated_assignment.coach.username

    return response


@router.get("/stats/me", response_model=AssignmentStats)
async def get_my_assignment_stats(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's assignment statistics"""
    stats = AssignmentService.get_assignment_stats(db, current_user.id)
    return stats


@router.get("/stats/player/{player_id}", response_model=AssignmentStats)
async def get_player_assignment_stats(
    player_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get player's assignment statistics (coaches/managers only)"""
    stats = AssignmentService.get_assignment_stats(db, player_id)
    return stats
