"""
Cognitive Exercise models - Brain training exercise sessions and results

Includes memory, reflexes, attention, gaming MOBA, and wellbeing exercises
"""

from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, Float, Text, Enum, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel


class MemoryExerciseType(str, PyEnum):
    """
    Types of cognitive training exercises

    Categories:
    - Memory: Visual and spatial memory exercises
    - Reflexes & Attention: Reaction time and peripheral awareness
    - Gaming MOBA: MOBA-specific mechanics training
    - Wellbeing: Breathing and stress management
    """
    # Memory exercises
    MEMORY_CARDS = "memory_cards"
    PATTERN_RECALL = "pattern_recall"
    SEQUENCE_MEMORY = "sequence_memory"
    IMAGE_PAIRS = "image_pairs"

    # Reflexes & Attention
    REACTION_TIME = "reaction_time"
    PERIPHERAL_VISION = "peripheral_vision"
    MULTITASK = "multitask"

    # Gaming MOBA
    LAST_HIT_TRAINER = "last_hit_trainer"
    DODGE_MASTER = "dodge_master"
    SKILLSHOT_TRAINER = "skillshot_trainer"

    # Wellbeing
    BREATHING = "breathing"


class DifficultyLevel(str, PyEnum):
    """Difficulty levels"""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"
    EXPERT = "expert"


class MemoryExerciseSession(BaseModel):
    """
    Cognitive exercise play session - tracks a single playthrough

    Supports multiple exercise types:
    - Memory (cards, patterns, sequences, images)
    - Reflexes (reaction time)
    - Attention (peripheral vision, multitask)
    - Gaming MOBA (last hit, dodge, skillshot)
    - Wellbeing (breathing)
    """

    __tablename__ = "memory_exercise_sessions"

    # Foreign keys
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False, index=True)

    # Exercise configuration
    exercise_type = Column(
        Enum(MemoryExerciseType, name="memory_exercise_type_enum"),
        nullable=False,
        index=True
    )
    difficulty = Column(
        Enum(DifficultyLevel, name="difficulty_level_enum"),
        nullable=False,
        index=True
    )
    config = Column(JSON, nullable=False)  # Full MemoryExerciseConfig as JSON

    # Session status
    is_completed = Column(Boolean, default=False, index=True)
    completed_at = Column(Integer, nullable=True)  # Timestamp

    # Performance metrics
    total_moves = Column(Integer, default=0)
    correct_moves = Column(Integer, default=0)
    incorrect_moves = Column(Integer, default=0)
    time_elapsed_ms = Column(Integer, default=0)

    # Sequence-specific (for sequence memory)
    max_sequence_reached = Column(Integer, nullable=True)

    # Final score and breakdown
    final_score = Column(Float, nullable=True, index=True)
    score_breakdown = Column(JSON, nullable=True)  # Detailed scoring info

    # Relationships
    exercise = relationship("Exercise")

    def __repr__(self) -> str:
        return f"<MemoryExerciseSession(id={self.id}, user_id={self.user_id}, type={self.exercise_type}, score={self.final_score})>"

    def calculate_score(self) -> float:
        """
        Calculate final score based on performance metrics and config weights

        Scoring varies by exercise type:
        - Memory exercises: Accuracy + Time
        - Reflexes: Reaction time (lower is better)
        - Attention: Accuracy + Consistency
        - Gaming MOBA: Precision + Timing
        - Wellbeing: Duration + Pattern adherence

        Returns:
            float: Final score (0-100+, multiplied by difficulty)
        """
        if not self.is_completed:
            return 0.0

        config = self.config
        final = 0.0

        # Exercise-specific scoring
        if self.exercise_type in [
            MemoryExerciseType.MEMORY_CARDS,
            MemoryExerciseType.PATTERN_RECALL,
            MemoryExerciseType.IMAGE_PAIRS
        ]:
            # Memory exercises: Accuracy + Time
            final = self._calculate_memory_score(config)

        elif self.exercise_type == MemoryExerciseType.SEQUENCE_MEMORY:
            # Sequence memory: Base score + sequence bonus
            final = self._calculate_memory_score(config)
            if self.max_sequence_reached:
                sequence_bonus = min(20, self.max_sequence_reached * 2)
                final = min(100, final + sequence_bonus)

        elif self.exercise_type == MemoryExerciseType.REACTION_TIME:
            # Reaction time: Lower time = higher score
            final = self._calculate_reaction_score(config)

        elif self.exercise_type in [
            MemoryExerciseType.PERIPHERAL_VISION,
            MemoryExerciseType.MULTITASK
        ]:
            # Attention exercises: Accuracy-focused
            final = self._calculate_attention_score(config)

        elif self.exercise_type in [
            MemoryExerciseType.LAST_HIT_TRAINER,
            MemoryExerciseType.DODGE_MASTER,
            MemoryExerciseType.SKILLSHOT_TRAINER
        ]:
            # Gaming MOBA: Precision + Success rate
            final = self._calculate_gaming_score(config)

        elif self.exercise_type == MemoryExerciseType.BREATHING:
            # Wellbeing: Duration completed + Pattern adherence
            final = self._calculate_breathing_score(config)

        else:
            # Fallback: Generic scoring
            final = self._calculate_memory_score(config)

        # Apply difficulty multiplier
        difficulty_multipliers = {
            DifficultyLevel.EASY: 1.0,
            DifficultyLevel.MEDIUM: 1.2,
            DifficultyLevel.HARD: 1.5,
            DifficultyLevel.EXPERT: 2.0
        }
        multiplier = difficulty_multipliers.get(self.difficulty, 1.0)

        return round(final * multiplier, 2)

    def _calculate_memory_score(self, config: dict) -> float:
        """Calculate score for memory-based exercises"""
        if self.total_moves == 0:
            return 0.0

        time_weight = config.get("time_weight", 0.5)
        accuracy_weight = config.get("accuracy_weight", 0.5)

        # Accuracy score (0-100)
        accuracy_score = (self.correct_moves / self.total_moves) * 100

        # Time score (0-100, faster = better)
        time_limit = config.get("time_limit_ms", 60000)
        if self.time_elapsed_ms > 0 and time_limit > 0:
            time_ratio = min(1.0, self.time_elapsed_ms / time_limit)
            time_score = (1.0 - time_ratio) * 100
        else:
            time_score = 0.0

        return (accuracy_score * accuracy_weight) + (time_score * time_weight)

    def _calculate_reaction_score(self, config: dict) -> float:
        """Calculate score for reaction time exercise"""
        # Lower average time = higher score
        # Assuming avg reaction time stored in metadata
        metadata = self.score_breakdown or {}
        avg_reaction_ms = metadata.get("avg_reaction_ms", 500)

        # Ideal reaction time: 200ms, Slow: 500ms+
        # Score: 100 at 200ms, 0 at 1000ms
        if avg_reaction_ms <= 200:
            return 100.0
        elif avg_reaction_ms >= 1000:
            return 0.0
        else:
            # Linear interpolation
            return 100 - ((avg_reaction_ms - 200) / 800 * 100)

    def _calculate_attention_score(self, config: dict) -> float:
        """Calculate score for attention exercises"""
        if self.total_moves == 0:
            return 0.0

        # Accuracy is primary metric
        accuracy_score = (self.correct_moves / self.total_moves) * 100

        # Time bonus (completing faster gives bonus)
        time_limit = config.get("time_limit_ms", 60000)
        if self.time_elapsed_ms > 0 and time_limit > 0:
            time_ratio = self.time_elapsed_ms / time_limit
            time_bonus = max(0, (1.0 - time_ratio) * 20)  # Up to +20 points
            return min(100, accuracy_score + time_bonus)

        return accuracy_score

    def _calculate_gaming_score(self, config: dict) -> float:
        """Calculate score for gaming MOBA exercises"""
        if self.total_moves == 0:
            return 0.0

        # Success rate is critical
        success_rate = (self.correct_moves / self.total_moves) * 100

        # Precision/timing bonus from metadata
        metadata = self.score_breakdown or {}
        precision_score = metadata.get("precision_score", 0)  # 0-20 bonus

        return min(100, success_rate + precision_score)

    def _calculate_breathing_score(self, config: dict) -> float:
        """
        Calculate score for breathing exercise

        Score based on:
        - Duration completed (50%)
        - Pattern adherence (50%)
        """
        metadata = self.score_breakdown or {}

        # Duration score
        target_duration_ms = config.get("duration_minutes", 5) * 60 * 1000
        duration_score = min(1.0, self.time_elapsed_ms / target_duration_ms) if target_duration_ms > 0 else 0.0

        # Pattern adherence (from metadata, default to perfect if not provided)
        pattern_adherence = metadata.get("pattern_adherence", 1.0)

        return (duration_score * 0.5 + pattern_adherence * 0.5) * 100

    def get_accuracy(self) -> float:
        """
        Get accuracy percentage

        Returns:
            float: Accuracy (0.0 to 1.0)
        """
        if self.total_moves == 0:
            return 0.0
        return self.correct_moves / self.total_moves

    def get_score_breakdown(self) -> dict:
        """
        Get detailed score breakdown

        Returns:
            dict: Score components
        """
        config = self.config
        accuracy = self.get_accuracy()
        accuracy_score = accuracy * 100

        time_limit = config.get("time_limit_ms") or 60000  # Default 60s if None
        time_ratio = min(1.0, self.time_elapsed_ms / time_limit) if time_limit and time_limit > 0 else 0
        time_score = (1.0 - time_ratio) * 100

        return {
            "accuracy": round(accuracy, 4),
            "accuracy_score": round(accuracy_score, 2),
            "time_score": round(time_score, 2),
            "time_elapsed_ms": self.time_elapsed_ms,
            "total_moves": self.total_moves,
            "correct_moves": self.correct_moves,
            "incorrect_moves": self.incorrect_moves,
            "max_sequence": self.max_sequence_reached,
            "difficulty_multiplier": {
                DifficultyLevel.EASY: 1.0,
                DifficultyLevel.MEDIUM: 1.2,
                DifficultyLevel.HARD: 1.5,
                DifficultyLevel.EXPERT: 2.0
            }.get(self.difficulty, 1.0),
            "final_score": self.final_score or 0.0
        }
