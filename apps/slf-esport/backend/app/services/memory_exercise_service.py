"""
Memory Exercise Service - Business logic for visual memory exercises
"""

from typing import List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, desc
from fastapi import HTTPException, status

from app.models.memory_exercise import (
    MemoryExerciseSession,
    MemoryExerciseType,
    DifficultyLevel
)
from app.models.exercise import Exercise, ExerciseScore
from app.schemas.memory_exercise import (
    MemoryExerciseConfig,
    MemoryExerciseSessionCreate,
    MemoryExerciseSessionUpdate,
    MemoryExerciseResult,
    MemoryExerciseLeaderboard,
    MemoryExerciseStats
)


class MemoryExerciseService:
    """Service for managing visual memory exercise sessions"""

    @staticmethod
    def create_session(
        db: Session,
        user_id: int,
        session_data: MemoryExerciseSessionCreate
    ) -> MemoryExerciseSession:
        """
        Create a new memory exercise session

        Args:
            db: Database session
            user_id: User ID
            session_data: Session creation data

        Returns:
            Created session

        Raises:
            HTTPException: If exercise not found
        """
        # Verify exercise exists
        exercise = db.query(Exercise).filter(Exercise.id == session_data.exercise_id).first()
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        # Create session
        session = MemoryExerciseSession(
            user_id=user_id,
            exercise_id=session_data.exercise_id,
            exercise_type=session_data.config.exercise_type,
            difficulty=session_data.config.difficulty,
            config=session_data.config.model_dump(),
            is_completed=False
        )

        db.add(session)
        db.commit()
        db.refresh(session)

        return session

    @staticmethod
    def update_session(
        db: Session,
        session_id: int,
        user_id: int,
        update_data: MemoryExerciseSessionUpdate
    ) -> MemoryExerciseSession:
        """
        Update a memory exercise session with performance data

        Args:
            db: Database session
            session_id: Session ID
            user_id: User ID (for ownership check)
            update_data: Session update data

        Returns:
            Updated session

        Raises:
            HTTPException: If session not found or not owned by user
        """
        session = db.query(MemoryExerciseSession).filter(
            and_(
                MemoryExerciseSession.id == session_id,
                MemoryExerciseSession.user_id == user_id
            )
        ).first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or not owned by user"
            )

        # Update fields
        update_dict = update_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(session, field, value)

        # If completed, calculate score
        if update_data.completed_at:
            session.is_completed = True
            session.completed_at = int(update_data.completed_at.timestamp())
            session.final_score = session.calculate_score()
            session.score_breakdown = session.get_score_breakdown()

            # Also create an ExerciseScore entry for compatibility
            MemoryExerciseService._create_exercise_score(db, session)

        db.commit()
        db.refresh(session)

        return session

    @staticmethod
    def _create_exercise_score(db: Session, session: MemoryExerciseSession) -> ExerciseScore:
        """
        Create an ExerciseScore entry from completed memory session

        Args:
            db: Database session
            session: Completed memory session

        Returns:
            Created exercise score
        """
        score = ExerciseScore(
            user_id=session.user_id,
            exercise_id=session.exercise_id,
            score_value=session.final_score or 0.0,
            score_unit="points",
            notes=f"Memory exercise: {session.exercise_type.value} ({session.difficulty.value})"
        )

        db.add(score)
        db.commit()

        return score

    @staticmethod
    def get_session(db: Session, session_id: int, user_id: Optional[int] = None) -> MemoryExerciseSession:
        """
        Get a memory exercise session

        Args:
            db: Database session
            session_id: Session ID
            user_id: Optional user ID for ownership check

        Returns:
            Session

        Raises:
            HTTPException: If not found
        """
        query = db.query(MemoryExerciseSession).filter(MemoryExerciseSession.id == session_id)

        if user_id is not None:
            query = query.filter(MemoryExerciseSession.user_id == user_id)

        session = query.first()

        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found"
            )

        return session

    @staticmethod
    def get_user_sessions(
        db: Session,
        user_id: int,
        exercise_id: Optional[int] = None,
        exercise_type: Optional[MemoryExerciseType] = None,
        completed_only: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> List[MemoryExerciseSession]:
        """
        Get user's memory exercise sessions

        Args:
            db: Database session
            user_id: User ID
            exercise_id: Optional filter by exercise
            exercise_type: Optional filter by type
            completed_only: Only return completed sessions
            skip: Number to skip
            limit: Max number to return

        Returns:
            List of sessions
        """
        query = db.query(MemoryExerciseSession).filter(MemoryExerciseSession.user_id == user_id)

        if exercise_id:
            query = query.filter(MemoryExerciseSession.exercise_id == exercise_id)

        if exercise_type:
            query = query.filter(MemoryExerciseSession.exercise_type == exercise_type)

        if completed_only:
            query = query.filter(MemoryExerciseSession.is_completed == True)

        sessions = query.order_by(desc(MemoryExerciseSession.created_at)).offset(skip).limit(limit).all()

        return sessions

    @staticmethod
    def get_leaderboard(
        db: Session,
        exercise_id: int,
        difficulty: Optional[DifficultyLevel] = None,
        exercise_type: Optional[MemoryExerciseType] = None,
        limit: int = 10,
        current_user_id: Optional[int] = None
    ) -> List[MemoryExerciseLeaderboard]:
        """
        Get leaderboard for a memory exercise

        Args:
            db: Database session
            exercise_id: Exercise ID
            difficulty: Optional filter by difficulty
            exercise_type: Optional filter by type
            limit: Max entries to return
            current_user_id: Current user for highlighting

        Returns:
            List of leaderboard entries
        """
        from app.models.user import User

        # Build query for best sessions per user
        subquery = db.query(
            MemoryExerciseSession.user_id,
            func.max(MemoryExerciseSession.final_score).label('best_score')
        ).filter(
            and_(
                MemoryExerciseSession.exercise_id == exercise_id,
                MemoryExerciseSession.is_completed == True,
                MemoryExerciseSession.final_score.isnot(None)
            )
        )

        if difficulty:
            subquery = subquery.filter(MemoryExerciseSession.difficulty == difficulty)

        if exercise_type:
            subquery = subquery.filter(MemoryExerciseSession.exercise_type == exercise_type)

        subquery = subquery.group_by(MemoryExerciseSession.user_id).subquery()

        # Get full session details for best scores
        query = db.query(
            MemoryExerciseSession,
            User.username
        ).join(
            User, User.id == MemoryExerciseSession.user_id
        ).join(
            subquery,
            and_(
                MemoryExerciseSession.user_id == subquery.c.user_id,
                MemoryExerciseSession.final_score == subquery.c.best_score
            )
        ).order_by(desc(MemoryExerciseSession.final_score)).limit(limit)

        results = query.all()

        # Build leaderboard entries
        leaderboard = []
        for rank, (session, username) in enumerate(results, 1):
            leaderboard.append(
                MemoryExerciseLeaderboard(
                    rank=rank,
                    user_id=session.user_id,
                    username=username,
                    final_score=session.final_score or 0.0,
                    accuracy=session.get_accuracy(),
                    time_elapsed_ms=session.time_elapsed_ms,
                    difficulty=session.difficulty,
                    completed_at=datetime.fromtimestamp(session.completed_at) if session.completed_at else datetime.now(),
                    is_current_user=(session.user_id == current_user_id) if current_user_id else False
                )
            )

        return leaderboard

    @staticmethod
    def get_user_stats(
        db: Session,
        user_id: int,
        exercise_id: Optional[int] = None,
        exercise_type: Optional[MemoryExerciseType] = None
    ) -> List[MemoryExerciseStats]:
        """
        Get user's statistics for memory exercises

        Args:
            db: Database session
            user_id: User ID
            exercise_id: Optional specific exercise
            exercise_type: Optional filter by type

        Returns:
            List of stats per exercise
        """
        # Build query
        query = db.query(
            MemoryExerciseSession.exercise_id,
            Exercise.name,
            MemoryExerciseSession.exercise_type,
            func.count(MemoryExerciseSession.id).label('total_attempts'),
            func.sum(func.cast(MemoryExerciseSession.is_completed, Integer)).label('completed_attempts'),
            func.max(MemoryExerciseSession.final_score).label('best_score'),
            func.avg(MemoryExerciseSession.final_score).label('avg_score'),
            func.max(MemoryExerciseSession.get_accuracy()).label('best_accuracy'),
            func.avg(MemoryExerciseSession.get_accuracy()).label('avg_accuracy'),
            func.min(MemoryExerciseSession.time_elapsed_ms).label('fastest_time'),
            func.avg(MemoryExerciseSession.time_elapsed_ms).label('avg_time'),
            func.max(MemoryExerciseSession.max_sequence_reached).label('longest_sequence')
        ).join(
            Exercise, Exercise.id == MemoryExerciseSession.exercise_id
        ).filter(
            MemoryExerciseSession.user_id == user_id
        )

        if exercise_id:
            query = query.filter(MemoryExerciseSession.exercise_id == exercise_id)

        if exercise_type:
            query = query.filter(MemoryExerciseSession.exercise_type == exercise_type)

        query = query.group_by(
            MemoryExerciseSession.exercise_id,
            Exercise.name,
            MemoryExerciseSession.exercise_type
        )

        results = query.all()

        # Build stats
        stats = []
        for result in results:
            # Get recent scores for progression
            recent_sessions = db.query(MemoryExerciseSession).filter(
                and_(
                    MemoryExerciseSession.user_id == user_id,
                    MemoryExerciseSession.exercise_id == result.exercise_id,
                    MemoryExerciseSession.is_completed == True,
                    MemoryExerciseSession.final_score.isnot(None)
                )
            ).order_by(desc(MemoryExerciseSession.created_at)).limit(10).all()

            recent_scores = [s.final_score for s in recent_sessions if s.final_score]
            recent_accuracies = [s.get_accuracy() for s in recent_sessions]

            # Calculate improvement rate
            improvement_rate = None
            if len(recent_scores) >= 2:
                old_avg = sum(recent_scores[-5:]) / len(recent_scores[-5:])
                new_avg = sum(recent_scores[:5]) / min(5, len(recent_scores))
                if old_avg > 0:
                    improvement_rate = ((new_avg - old_avg) / old_avg) * 100

            stats.append(
                MemoryExerciseStats(
                    exercise_id=result.exercise_id,
                    exercise_name=result.name,
                    exercise_type=result.exercise_type,
                    total_attempts=result.total_attempts,
                    completed_attempts=result.completed_attempts or 0,
                    best_score=result.best_score,
                    avg_score=result.avg_score,
                    best_accuracy=result.best_accuracy,
                    avg_accuracy=result.avg_accuracy,
                    fastest_time_ms=result.fastest_time,
                    avg_time_ms=int(result.avg_time) if result.avg_time else None,
                    longest_sequence=result.longest_sequence,
                    improvement_rate=improvement_rate,
                    recent_scores=recent_scores,
                    recent_accuracies=recent_accuracies
                )
            )

        return stats
