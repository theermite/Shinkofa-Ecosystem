"""
Exercise routes - CRUD operations for cognitive exercises and scores
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.exercise import ExerciseCategory
from app.schemas.exercise import (
    ExerciseResponse,
    ExerciseCreate,
    ExerciseUpdate,
    ExerciseScoreResponse,
    ExerciseScoreCreate,
    ExerciseScoreUpdate,
    ExerciseScoreWithExercise,
    ExerciseStats
)
from app.services.exercise_service import ExerciseService
from app.utils.dependencies import get_current_active_user, require_role
from app.models.user import User, UserRole

router = APIRouter()


# Exercise endpoints

@router.get("/", response_model=List[ExerciseResponse])
async def get_exercises(
    category: Optional[ExerciseCategory] = Query(None, description="Filter by category"),
    is_active: Optional[bool] = Query(True, description="Filter by active status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get all cognitive exercises (requires authentication)

    Args:
        category: Optional filter by exercise category
        is_active: Filter by active status (default: True)
        skip: Number of records to skip
        limit: Maximum number of records
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of exercises
    """
    exercises = ExerciseService.get_all_exercises(
        db,
        category=category,
        is_active=is_active,
        skip=skip,
        limit=limit
    )
    return exercises


@router.get("/{exercise_id}", response_model=ExerciseResponse)
async def get_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get exercise by ID (requires authentication)

    Args:
        exercise_id: Exercise ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Exercise details
    """
    exercise = ExerciseService.get_exercise_by_id(db, exercise_id)

    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )

    return exercise


@router.post("/", response_model=ExerciseResponse, status_code=status.HTTP_201_CREATED)
async def create_exercise(
    exercise_data: ExerciseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER))
):
    """
    Create a new exercise (Coach/Manager only)

    Args:
        exercise_data: Exercise creation data
        db: Database session
        current_user: Current authenticated coach or manager

    Returns:
        Created exercise
    """
    exercise = ExerciseService.create_exercise(db, exercise_data)
    return exercise


@router.put("/{exercise_id}", response_model=ExerciseResponse)
async def update_exercise(
    exercise_id: int,
    exercise_data: ExerciseUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER))
):
    """
    Update exercise (Coach/Manager only)

    Args:
        exercise_id: Exercise ID
        exercise_data: Exercise update data
        db: Database session
        current_user: Current authenticated coach or manager

    Returns:
        Updated exercise
    """
    exercise = ExerciseService.update_exercise(db, exercise_id, exercise_data)
    return exercise


@router.delete("/{exercise_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_exercise(
    exercise_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.MANAGER))
):
    """
    Delete exercise (Manager only)

    Args:
        exercise_id: Exercise ID
        db: Database session
        current_user: Current authenticated manager

    Returns:
        No content
    """
    ExerciseService.delete_exercise(db, exercise_id)
    return None


# Score endpoints

@router.post("/scores", response_model=ExerciseScoreResponse, status_code=status.HTTP_201_CREATED)
async def create_score(
    score_data: ExerciseScoreCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Submit a new exercise score

    Args:
        score_data: Score data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created score
    """
    score = ExerciseService.create_score(db, current_user.id, score_data)
    return score


@router.get("/scores/me", response_model=List[ExerciseScoreWithExercise])
async def get_my_scores(
    exercise_id: Optional[int] = Query(None, description="Filter by exercise ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's exercise scores

    Args:
        exercise_id: Optional filter by exercise
        skip: Number of records to skip
        limit: Maximum number of records
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of user's scores with exercise details
    """
    scores = ExerciseService.get_user_scores(
        db,
        current_user.id,
        exercise_id=exercise_id,
        skip=skip,
        limit=limit
    )
    return scores


@router.get("/scores/{score_id}", response_model=ExerciseScoreResponse)
async def get_score(
    score_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get score by ID

    Args:
        score_id: Score ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Score details
    """
    score = ExerciseService.get_score_by_id(db, score_id)

    if not score:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Score not found"
        )

    # Only owner, coach, or manager can view
    if score.user_id != current_user.id and current_user.role not in [UserRole.COACH, UserRole.MANAGER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this score"
        )

    return score


@router.put("/scores/{score_id}", response_model=ExerciseScoreResponse)
async def update_score(
    score_id: int,
    score_data: ExerciseScoreUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update own exercise score

    Args:
        score_id: Score ID
        score_data: Score update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated score
    """
    score = ExerciseService.update_score(db, score_id, current_user.id, score_data)
    return score


@router.delete("/scores/{score_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_score(
    score_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete own exercise score

    Args:
        score_id: Score ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        No content
    """
    ExerciseService.delete_score(db, score_id, current_user.id)
    return None


# Statistics endpoints

@router.get("/stats/me", response_model=List[ExerciseStats])
async def get_my_stats(
    category: Optional[ExerciseCategory] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's exercise statistics

    Args:
        category: Optional filter by category
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of exercise statistics with progression
    """
    stats = ExerciseService.get_user_stats(db, current_user.id, category=category)
    return stats


@router.get("/stats/user/{user_id}", response_model=List[ExerciseStats])
async def get_user_stats(
    user_id: int,
    category: Optional[ExerciseCategory] = Query(None, description="Filter by category"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER))
):
    """
    Get user's exercise statistics (Coach/Manager only)

    Args:
        user_id: User ID
        category: Optional filter by category
        db: Database session
        current_user: Current authenticated coach or manager

    Returns:
        List of user's exercise statistics
    """
    stats = ExerciseService.get_user_stats(db, user_id, category=category)
    return stats


@router.post("/assign", status_code=status.HTTP_201_CREATED)
async def assign_exercise_to_players(
    exercise_id: int,
    player_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER))
):
    """Assign an exercise to one or more players (Coach/Manager only)"""
    from app.services.notification_service import NotificationService
    from app.schemas.notification import NotificationCreate
    
    # Verify exercise exists
    exercise = ExerciseService.get_exercise_by_id(db, exercise_id)
    if not exercise:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Exercise not found"
        )
    
    # Verify all players exist
    players = db.query(User).filter(
        User.id.in_(player_ids),
        User.role == UserRole.JOUEUR
    ).all()
    
    if len(players) != len(player_ids):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="One or more player IDs are invalid"
        )
    
    # Create notifications for all players
    NotificationService.create_bulk_notifications(
        db=db,
        user_ids=player_ids,
        type="exercise_assigned",
        title="Nouvel exercice assigné",
        message=f"{current_user.prenom} {current_user.nom} t'a assigné l'exercice: {exercise.titre}",
        link=f"/exercises/{exercise_id}",
        action_text="Commencer l'exercice"
    )
    
    return {
        "success": True,
        "exercise_id": exercise_id,
        "exercise_title": exercise.titre,
        "assigned_to": len(player_ids),
        "players": [f"{p.prenom} {p.nom}" for p in players]
    }
