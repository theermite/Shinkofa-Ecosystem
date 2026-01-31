"""
Memory Exercise routes - API endpoints for visual memory exercises
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.memory_exercise import MemoryExerciseType, DifficultyLevel
from app.schemas.memory_exercise import (
    MemoryExerciseSessionCreate,
    MemoryExerciseSessionUpdate,
    MemoryExerciseResult,
    MemoryExerciseLeaderboard,
    MemoryExerciseStats,
    MemoryExerciseConfig
)
from app.services.memory_exercise_service import MemoryExerciseService
from app.utils.dependencies import get_current_active_user, require_role
from app.models.user import User, UserRole

router = APIRouter()


# Session endpoints

@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(
    session_data: MemoryExerciseSessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new memory exercise session

    Args:
        session_data: Session creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created session
    """
    session = MemoryExerciseService.create_session(db, current_user.id, session_data)
    return {
        "id": session.id,
        "exercise_id": session.exercise_id,
        "exercise_type": session.exercise_type,
        "difficulty": session.difficulty,
        "config": session.config,
        "created_at": session.created_at
    }


@router.put("/sessions/{session_id}")
async def update_session(
    session_id: int,
    update_data: MemoryExerciseSessionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a memory exercise session with performance data

    Args:
        session_id: Session ID
        update_data: Update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated session
    """
    session = MemoryExerciseService.update_session(db, session_id, current_user.id, update_data)
    return {
        "id": session.id,
        "exercise_id": session.exercise_id,
        "exercise_type": session.exercise_type,
        "difficulty": session.difficulty,
        "is_completed": session.is_completed,
        "total_moves": session.total_moves,
        "correct_moves": session.correct_moves,
        "incorrect_moves": session.incorrect_moves,
        "time_elapsed_ms": session.time_elapsed_ms,
        "max_sequence_reached": session.max_sequence_reached,
        "final_score": session.final_score,
        "score_breakdown": session.score_breakdown,
        "accuracy": session.get_accuracy(),
        "created_at": session.created_at,
        "updated_at": session.updated_at
    }


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a memory exercise session

    Args:
        session_id: Session ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Session details
    """
    session = MemoryExerciseService.get_session(db, session_id, current_user.id)
    return {
        "id": session.id,
        "exercise_id": session.exercise_id,
        "exercise_type": session.exercise_type,
        "difficulty": session.difficulty,
        "config": session.config,
        "is_completed": session.is_completed,
        "total_moves": session.total_moves,
        "correct_moves": session.correct_moves,
        "incorrect_moves": session.incorrect_moves,
        "time_elapsed_ms": session.time_elapsed_ms,
        "max_sequence_reached": session.max_sequence_reached,
        "final_score": session.final_score,
        "score_breakdown": session.score_breakdown,
        "accuracy": session.get_accuracy(),
        "created_at": session.created_at,
        "updated_at": session.updated_at
    }


@router.get("/sessions/me/history")
async def get_my_sessions(
    exercise_id: Optional[int] = Query(None, description="Filter by exercise"),
    exercise_type: Optional[MemoryExerciseType] = Query(None, description="Filter by type"),
    completed_only: bool = Query(False, description="Only completed sessions"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's memory exercise sessions

    Args:
        exercise_id: Optional exercise filter
        exercise_type: Optional type filter
        completed_only: Only show completed
        skip: Skip records
        limit: Max records
        db: Database session
        current_user: Current authenticated user

    Returns:
        List of sessions
    """
    sessions = MemoryExerciseService.get_user_sessions(
        db,
        current_user.id,
        exercise_id=exercise_id,
        exercise_type=exercise_type,
        completed_only=completed_only,
        skip=skip,
        limit=limit
    )

    return [
        {
            "id": s.id,
            "exercise_id": s.exercise_id,
            "exercise_type": s.exercise_type,
            "difficulty": s.difficulty,
            "is_completed": s.is_completed,
            "final_score": s.final_score,
            "accuracy": s.get_accuracy(),
            "time_elapsed_ms": s.time_elapsed_ms,
            "created_at": s.created_at
        }
        for s in sessions
    ]


# Leaderboard endpoints

@router.get("/leaderboard/{exercise_id}", response_model=List[MemoryExerciseLeaderboard])
async def get_leaderboard(
    exercise_id: int,
    difficulty: Optional[DifficultyLevel] = Query(None, description="Filter by difficulty"),
    exercise_type: Optional[MemoryExerciseType] = Query(None, description="Filter by type"),
    limit: int = Query(10, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get leaderboard for a memory exercise

    Args:
        exercise_id: Exercise ID
        difficulty: Optional difficulty filter
        exercise_type: Optional type filter
        limit: Max entries
        db: Database session
        current_user: Current authenticated user

    Returns:
        Leaderboard entries
    """
    leaderboard = MemoryExerciseService.get_leaderboard(
        db,
        exercise_id,
        difficulty=difficulty,
        exercise_type=exercise_type,
        limit=limit,
        current_user_id=current_user.id
    )
    return leaderboard


# Statistics endpoints

@router.get("/stats/me", response_model=List[MemoryExerciseStats])
async def get_my_stats(
    exercise_id: Optional[int] = Query(None, description="Filter by exercise"),
    exercise_type: Optional[MemoryExerciseType] = Query(None, description="Filter by type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's memory exercise statistics

    Args:
        exercise_id: Optional exercise filter
        exercise_type: Optional type filter
        db: Database session
        current_user: Current authenticated user

    Returns:
        Statistics per exercise
    """
    stats = MemoryExerciseService.get_user_stats(
        db,
        current_user.id,
        exercise_id=exercise_id,
        exercise_type=exercise_type
    )
    return stats


@router.get("/stats/user/{user_id}", response_model=List[MemoryExerciseStats])
async def get_user_stats(
    user_id: int,
    exercise_id: Optional[int] = Query(None, description="Filter by exercise"),
    exercise_type: Optional[MemoryExerciseType] = Query(None, description="Filter by type"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER))
):
    """
    Get user's memory exercise statistics (Coach/Manager only)

    Args:
        user_id: User ID
        exercise_id: Optional exercise filter
        exercise_type: Optional type filter
        db: Database session
        current_user: Current authenticated coach or manager

    Returns:
        User's statistics
    """
    stats = MemoryExerciseService.get_user_stats(
        db,
        user_id,
        exercise_id=exercise_id,
        exercise_type=exercise_type
    )
    return stats


# Config presets for quick start

@router.get("/presets/{exercise_type}")
async def get_config_presets(
    exercise_type: MemoryExerciseType,
    current_user: User = Depends(get_current_active_user)
):
    """
    Get preset configurations for a memory exercise type

    Args:
        exercise_type: Type of memory exercise
        current_user: Current authenticated user

    Returns:
        List of preset configs
    """
    presets = {
        MemoryExerciseType.MEMORY_CARDS: [
            {
                "name": "Facile - 4x4",
                "difficulty": DifficultyLevel.EASY,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.MEMORY_CARDS,
                    difficulty=DifficultyLevel.EASY,
                    grid_rows=4,
                    grid_cols=4,
                    time_limit_ms=120000,  # 2 min
                    time_weight=0.3,
                    accuracy_weight=0.7
                ).model_dump()
            },
            {
                "name": "Moyen - 6x6",
                "difficulty": DifficultyLevel.MEDIUM,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.MEMORY_CARDS,
                    difficulty=DifficultyLevel.MEDIUM,
                    grid_rows=6,
                    grid_cols=6,
                    time_limit_ms=180000,  # 3 min
                    time_weight=0.4,
                    accuracy_weight=0.6
                ).model_dump()
            },
            {
                "name": "Difficile - 8x8",
                "difficulty": DifficultyLevel.HARD,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.MEMORY_CARDS,
                    difficulty=DifficultyLevel.HARD,
                    grid_rows=8,
                    grid_cols=8,
                    time_limit_ms=300000,  # 5 min
                    time_weight=0.5,
                    accuracy_weight=0.5
                ).model_dump()
            }
        ],
        MemoryExerciseType.PATTERN_RECALL: [
            {
                "name": "Facile - 3x3",
                "difficulty": DifficultyLevel.EASY,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.PATTERN_RECALL,
                    difficulty=DifficultyLevel.EASY,
                    grid_rows=3,
                    grid_cols=3,
                    preview_duration_ms=3000,
                    time_limit_ms=30000,
                    colors=["#3B82F6", "#EF4444", "#10B981", "#F59E0B"],
                    time_weight=0.4,
                    accuracy_weight=0.6
                ).model_dump()
            },
            {
                "name": "Moyen - 4x4",
                "difficulty": DifficultyLevel.MEDIUM,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.PATTERN_RECALL,
                    difficulty=DifficultyLevel.MEDIUM,
                    grid_rows=4,
                    grid_cols=4,
                    preview_duration_ms=4000,
                    time_limit_ms=45000,
                    colors=["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899"],
                    time_weight=0.4,
                    accuracy_weight=0.6
                ).model_dump()
            },
            {
                "name": "Difficile - 6x6",
                "difficulty": DifficultyLevel.HARD,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.PATTERN_RECALL,
                    difficulty=DifficultyLevel.HARD,
                    grid_rows=6,
                    grid_cols=6,
                    preview_duration_ms=5000,
                    time_limit_ms=60000,
                    colors=["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#EC4899", "#14B8A6", "#F97316"],
                    time_weight=0.5,
                    accuracy_weight=0.5
                ).model_dump()
            }
        ],
        MemoryExerciseType.SEQUENCE_MEMORY: [
            {
                "name": "Facile - Début 3",
                "difficulty": DifficultyLevel.EASY,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.SEQUENCE_MEMORY,
                    difficulty=DifficultyLevel.EASY,
                    grid_rows=3,
                    grid_cols=3,
                    initial_sequence_length=3,
                    max_sequence_length=20,
                    preview_duration_ms=1000,  # 1s per step
                    time_weight=0.2,
                    accuracy_weight=0.8
                ).model_dump()
            },
            {
                "name": "Moyen - Début 4",
                "difficulty": DifficultyLevel.MEDIUM,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.SEQUENCE_MEMORY,
                    difficulty=DifficultyLevel.MEDIUM,
                    grid_rows=4,
                    grid_cols=4,
                    initial_sequence_length=4,
                    max_sequence_length=30,
                    preview_duration_ms=800,
                    time_weight=0.3,
                    accuracy_weight=0.7
                ).model_dump()
            },
            {
                "name": "Difficile - Début 5",
                "difficulty": DifficultyLevel.HARD,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.SEQUENCE_MEMORY,
                    difficulty=DifficultyLevel.HARD,
                    grid_rows=5,
                    grid_cols=5,
                    initial_sequence_length=5,
                    max_sequence_length=50,
                    preview_duration_ms=600,
                    time_weight=0.4,
                    accuracy_weight=0.6
                ).model_dump()
            }
        ],
        MemoryExerciseType.IMAGE_PAIRS: [
            {
                "name": "Facile - 8 paires",
                "difficulty": DifficultyLevel.EASY,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.IMAGE_PAIRS,
                    difficulty=DifficultyLevel.EASY,
                    grid_rows=4,
                    grid_cols=4,
                    time_limit_ms=120000,
                    time_weight=0.3,
                    accuracy_weight=0.7
                ).model_dump()
            },
            {
                "name": "Moyen - 18 paires",
                "difficulty": DifficultyLevel.MEDIUM,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.IMAGE_PAIRS,
                    difficulty=DifficultyLevel.MEDIUM,
                    grid_rows=6,
                    grid_cols=6,
                    time_limit_ms=180000,
                    time_weight=0.4,
                    accuracy_weight=0.6
                ).model_dump()
            },
            {
                "name": "Difficile - 32 paires",
                "difficulty": DifficultyLevel.HARD,
                "config": MemoryExerciseConfig(
                    exercise_type=MemoryExerciseType.IMAGE_PAIRS,
                    difficulty=DifficultyLevel.HARD,
                    grid_rows=8,
                    grid_cols=8,
                    time_limit_ms=300000,
                    time_weight=0.5,
                    accuracy_weight=0.5
                ).model_dump()
            }
        ]
    }

    return presets.get(exercise_type, [])
