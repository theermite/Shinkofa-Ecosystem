"""
Pydantic schemas for Visual Memory Exercise configurations and sessions
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Import enums from model to ensure single source of truth
from app.models.memory_exercise import MemoryExerciseType, DifficultyLevel


class MemoryExerciseConfig(BaseModel):
    """Configuration for a memory exercise instance"""
    exercise_type: MemoryExerciseType
    difficulty: DifficultyLevel

    # Grid configuration (for card games and pattern recall)
    grid_rows: Optional[int] = Field(None, ge=2, le=10)
    grid_cols: Optional[int] = Field(None, ge=2, le=10)

    # Sequence configuration
    initial_sequence_length: Optional[int] = Field(None, ge=2, le=20)
    max_sequence_length: Optional[int] = Field(None, ge=2, le=50)

    # Timing
    preview_duration_ms: Optional[int] = Field(None, ge=500, le=30000)  # Time to memorize
    time_limit_ms: Optional[int] = Field(None, ge=5000, le=300000)  # Total time limit

    # Visual settings
    colors: Optional[List[str]] = None  # Color palette for patterns
    images: Optional[List[str]] = None  # Image URLs for card games

    # Scoring weights
    time_weight: float = Field(0.5, ge=0.0, le=1.0)  # How much time affects score
    accuracy_weight: float = Field(0.5, ge=0.0, le=1.0)  # How much accuracy affects score


class MemoryExerciseSession(BaseModel):
    """A play session for a memory exercise"""
    exercise_id: int
    config: MemoryExerciseConfig

    # Session data
    started_at: datetime
    completed_at: Optional[datetime] = None

    # Performance metrics
    total_moves: int = 0
    correct_moves: int = 0
    incorrect_moves: int = 0
    time_elapsed_ms: int = 0

    # Sequence-specific
    max_sequence_reached: Optional[int] = None

    # Final score
    final_score: Optional[float] = None
    score_breakdown: Optional[Dict[str, Any]] = None


class MemoryExerciseSessionCreate(BaseModel):
    """Create a new memory exercise session"""
    exercise_id: int
    config: MemoryExerciseConfig


class MemoryExerciseSessionUpdate(BaseModel):
    """Update session with performance data"""
    completed_at: Optional[datetime] = None
    total_moves: Optional[int] = None
    correct_moves: Optional[int] = None
    incorrect_moves: Optional[int] = None
    time_elapsed_ms: Optional[int] = None
    max_sequence_reached: Optional[int] = None
    final_score: Optional[float] = None
    score_breakdown: Optional[Dict[str, Any]] = None


class MemoryExerciseResult(BaseModel):
    """Result of a completed memory exercise"""
    session_id: int
    exercise_id: int
    exercise_name: str
    exercise_type: MemoryExerciseType
    difficulty: DifficultyLevel

    # Performance
    accuracy: float  # 0.0 to 1.0
    time_elapsed_ms: int
    final_score: float

    # Stats
    total_moves: int
    correct_moves: int
    incorrect_moves: int
    max_sequence_reached: Optional[int] = None

    # Timestamps
    started_at: datetime
    completed_at: datetime

    # Ranking context
    user_rank: Optional[int] = None
    total_players: Optional[int] = None
    percentile: Optional[float] = None


class MemoryExerciseLeaderboard(BaseModel):
    """Leaderboard entry for a memory exercise"""
    rank: int
    user_id: int
    username: str
    final_score: float
    accuracy: float
    time_elapsed_ms: int
    difficulty: DifficultyLevel
    completed_at: datetime

    # Context
    is_current_user: bool = False


class MemoryExerciseStats(BaseModel):
    """User statistics for a specific memory exercise"""
    exercise_id: int
    exercise_name: str
    exercise_type: MemoryExerciseType

    # Attempts
    total_attempts: int
    completed_attempts: int

    # Best performance
    best_score: Optional[float] = None
    best_accuracy: Optional[float] = None
    fastest_time_ms: Optional[int] = None
    longest_sequence: Optional[int] = None

    # Average performance
    avg_score: Optional[float] = None
    avg_accuracy: Optional[float] = None
    avg_time_ms: Optional[int] = None

    # Progression
    improvement_rate: Optional[float] = None  # % improvement over last 10 sessions
    streak_days: int = 0

    # Recent sessions
    recent_scores: List[float] = []
    recent_accuracies: List[float] = []
