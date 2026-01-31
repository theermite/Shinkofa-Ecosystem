"""
Exercise service - Business logic for exercises and scores
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from fastapi import HTTPException, status

from app.models.exercise import Exercise, ExerciseScore, ExerciseCategory
from app.schemas.exercise import (
    ExerciseCreate,
    ExerciseUpdate,
    ExerciseScoreCreate,
    ExerciseScoreUpdate,
    ExerciseStats
)


class ExerciseService:
    """Service class for exercise-related business logic"""

    @staticmethod
    def get_all_exercises(
        db: Session,
        category: Optional[ExerciseCategory] = None,
        is_active: Optional[bool] = True,
        skip: int = 0,
        limit: int = 100
    ) -> List[Exercise]:
        """Get all exercises with optional filters"""
        query = db.query(Exercise)

        if category:
            query = query.filter(Exercise.category == category)

        if is_active is not None:
            query = query.filter(Exercise.is_active == is_active)

        return query.order_by(Exercise.category, Exercise.order).offset(skip).limit(limit).all()

    @staticmethod
    def get_exercise_by_id(db: Session, exercise_id: int) -> Optional[Exercise]:
        """Get exercise by ID"""
        return db.query(Exercise).filter(Exercise.id == exercise_id).first()

    @staticmethod
    def create_exercise(db: Session, exercise_data: ExerciseCreate) -> Exercise:
        """Create a new exercise"""
        exercise = Exercise(**exercise_data.dict())
        db.add(exercise)
        db.commit()
        db.refresh(exercise)
        return exercise

    @staticmethod
    def update_exercise(
        db: Session,
        exercise_id: int,
        exercise_data: ExerciseUpdate
    ) -> Exercise:
        """Update exercise"""
        exercise = ExerciseService.get_exercise_by_id(db, exercise_id)

        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        update_data = exercise_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(exercise, field, value)

        db.commit()
        db.refresh(exercise)
        return exercise

    @staticmethod
    def delete_exercise(db: Session, exercise_id: int) -> bool:
        """Delete exercise (soft delete)"""
        exercise = ExerciseService.get_exercise_by_id(db, exercise_id)

        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        exercise.is_active = False
        db.commit()
        return True

    # Score methods

    @staticmethod
    def create_score(
        db: Session,
        user_id: int,
        score_data: ExerciseScoreCreate
    ) -> ExerciseScore:
        """Create a new exercise score"""
        # Verify exercise exists
        exercise = ExerciseService.get_exercise_by_id(db, score_data.exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exercise not found"
            )

        score = ExerciseScore(
            user_id=user_id,
            **score_data.dict()
        )
        db.add(score)
        db.commit()
        db.refresh(score)
        return score

    @staticmethod
    def get_user_scores(
        db: Session,
        user_id: int,
        exercise_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[ExerciseScore]:
        """Get user's exercise scores"""
        query = db.query(ExerciseScore).filter(ExerciseScore.user_id == user_id)

        if exercise_id:
            query = query.filter(ExerciseScore.exercise_id == exercise_id)

        return query.order_by(desc(ExerciseScore.created_at)).offset(skip).limit(limit).all()

    @staticmethod
    def get_score_by_id(db: Session, score_id: int) -> Optional[ExerciseScore]:
        """Get score by ID"""
        return db.query(ExerciseScore).filter(ExerciseScore.id == score_id).first()

    @staticmethod
    def update_score(
        db: Session,
        score_id: int,
        user_id: int,
        score_data: ExerciseScoreUpdate
    ) -> ExerciseScore:
        """Update exercise score (only by owner)"""
        score = ExerciseService.get_score_by_id(db, score_id)

        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Score not found"
            )

        # Verify ownership
        if score.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to update this score"
            )

        update_data = score_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(score, field, value)

        db.commit()
        db.refresh(score)
        return score

    @staticmethod
    def delete_score(db: Session, score_id: int, user_id: int) -> bool:
        """Delete score (only by owner)"""
        score = ExerciseService.get_score_by_id(db, score_id)

        if not score:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Score not found"
            )

        # Verify ownership
        if score.user_id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Not authorized to delete this score"
            )

        db.delete(score)
        db.commit()
        return True

    @staticmethod
    def get_user_stats(
        db: Session,
        user_id: int,
        category: Optional[ExerciseCategory] = None
    ) -> List[ExerciseStats]:
        """Get user exercise statistics"""
        query = db.query(
            Exercise.id,
            Exercise.name,
            Exercise.category,
            Exercise.score_unit,
            Exercise.lower_is_better,
            func.count(ExerciseScore.id).label('total_attempts'),
            func.min(ExerciseScore.score_value).label('min_score'),
            func.max(ExerciseScore.score_value).label('max_score'),
            func.avg(ExerciseScore.score_value).label('avg_score')
        ).join(
            ExerciseScore,
            Exercise.id == ExerciseScore.exercise_id
        ).filter(
            ExerciseScore.user_id == user_id
        ).group_by(
            Exercise.id
        )

        if category:
            query = query.filter(Exercise.category == category)

        results = query.all()

        stats = []
        for row in results:
            # Get latest score
            latest_score_obj = db.query(ExerciseScore).filter(
                ExerciseScore.user_id == user_id,
                ExerciseScore.exercise_id == row.id
            ).order_by(desc(ExerciseScore.created_at)).first()

            latest_score = latest_score_obj.score_value if latest_score_obj else None

            # Calculate best score (min if lower_is_better, max otherwise)
            best_score = row.min_score if row.lower_is_better else row.max_score

            # Calculate progression (if we have multiple attempts)
            progression = None
            if row.total_attempts > 1 and latest_score and best_score:
                if row.lower_is_better:
                    # Lower is better (e.g., reaction time)
                    progression = ((row.max_score - latest_score) / row.max_score) * 100
                else:
                    # Higher is better (e.g., accuracy)
                    progression = ((latest_score - row.min_score) / row.min_score) * 100

            stat = ExerciseStats(
                exercise_id=row.id,
                exercise_name=row.name,
                category=row.category,
                total_attempts=row.total_attempts,
                best_score=best_score,
                average_score=row.avg_score,
                latest_score=latest_score,
                score_unit=row.score_unit,
                lower_is_better=row.lower_is_better,
                progression=round(progression, 2) if progression else None
            )
            stats.append(stat)

        return stats
