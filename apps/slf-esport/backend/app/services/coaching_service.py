"""
Coaching service - Business logic for holistic coaching module
"""

from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc
from app.models.coaching import (
    Questionnaire,
    QuestionnaireResponse,
    JournalEntry,
    Goal,
    QuestionnaireType,
    JournalMood,
)
from app.schemas.coaching import (
    QuestionnaireCreate,
    QuestionnaireUpdate,
    QuestionnaireResponseCreate,
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalStats,
    GoalCreate,
    GoalUpdate,
    GoalStats,
)


class CoachingService:
    """Service for managing coaching resources"""

    # ========== Questionnaires ==========

    @staticmethod
    def create_questionnaire(
        db: Session, questionnaire_data: QuestionnaireCreate, created_by_id: Optional[int] = None
    ) -> Questionnaire:
        """Create a new questionnaire"""
        questionnaire = Questionnaire(
            title=questionnaire_data.title,
            description=questionnaire_data.description,
            questionnaire_type=questionnaire_data.questionnaire_type,
            is_active=questionnaire_data.is_active,
            is_required=questionnaire_data.is_required,
            questions=questionnaire_data.questions,
            order=questionnaire_data.order,
            created_by_id=created_by_id,
        )

        db.add(questionnaire)
        db.commit()
        db.refresh(questionnaire)

        return questionnaire

    @staticmethod
    def get_questionnaires(
        db: Session,
        questionnaire_type: Optional[QuestionnaireType] = None,
        is_active: Optional[bool] = True,
    ) -> List[Questionnaire]:
        """Get questionnaires with filters"""
        query = db.query(Questionnaire)

        if questionnaire_type:
            query = query.filter(Questionnaire.questionnaire_type == questionnaire_type)

        if is_active is not None:
            query = query.filter(Questionnaire.is_active == is_active)

        return query.order_by(Questionnaire.order.asc()).all()

    @staticmethod
    def submit_questionnaire_response(
        db: Session, response_data: QuestionnaireResponseCreate, user_id: int
    ) -> QuestionnaireResponse:
        """Submit a questionnaire response"""
        response = QuestionnaireResponse(
            questionnaire_id=response_data.questionnaire_id,
            user_id=user_id,
            answers=response_data.answers,
            notes=response_data.notes,
        )

        db.add(response)
        db.commit()
        db.refresh(response)

        return response

    @staticmethod
    def get_user_responses(
        db: Session, user_id: int, questionnaire_id: Optional[int] = None
    ) -> List[QuestionnaireResponse]:
        """Get user's questionnaire responses"""
        query = db.query(QuestionnaireResponse).filter(
            QuestionnaireResponse.user_id == user_id
        )

        if questionnaire_id:
            query = query.filter(QuestionnaireResponse.questionnaire_id == questionnaire_id)

        return query.order_by(desc(QuestionnaireResponse.completed_at)).all()

    # ========== Journal Entries ==========

    @staticmethod
    def create_journal_entry(
        db: Session, entry_data: JournalEntryCreate, user_id: int
    ) -> JournalEntry:
        """Create a new journal entry"""
        entry = JournalEntry(
            user_id=user_id,
            title=entry_data.title,
            content=entry_data.content,
            mood=entry_data.mood,
            energy_level=entry_data.energy_level,
            training_quality=entry_data.training_quality,
            sleep_hours=entry_data.sleep_hours,
            tags=entry_data.tags or [],
            entry_date=entry_data.entry_date or datetime.utcnow(),
            is_private=entry_data.is_private,
        )

        db.add(entry)
        db.commit()
        db.refresh(entry)

        return entry

    @staticmethod
    def get_journal_entries(
        db: Session,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        mood: Optional[JournalMood] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[JournalEntry], int]:
        """Get journal entries with filters"""
        query = db.query(JournalEntry).filter(JournalEntry.user_id == user_id)

        if start_date:
            query = query.filter(JournalEntry.entry_date >= start_date)
        if end_date:
            query = query.filter(JournalEntry.entry_date <= end_date)
        if mood:
            query = query.filter(JournalEntry.mood == mood)

        total = query.count()

        entries = (
            query.order_by(desc(JournalEntry.entry_date)).offset(skip).limit(limit).all()
        )

        return entries, total

    @staticmethod
    def update_journal_entry(
        db: Session, entry_id: int, entry_data: JournalEntryUpdate
    ) -> Optional[JournalEntry]:
        """Update a journal entry"""
        entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()

        if not entry:
            return None

        update_data = entry_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(entry, field, value)

        db.commit()
        db.refresh(entry)

        return entry

    @staticmethod
    def delete_journal_entry(db: Session, entry_id: int) -> bool:
        """Delete a journal entry"""
        entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()

        if not entry:
            return False

        db.delete(entry)
        db.commit()

        return True

    @staticmethod
    def get_journal_stats(
        db: Session, user_id: int, days: int = 30
    ) -> JournalStats:
        """Get journal statistics for a user"""
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        entries = (
            db.query(JournalEntry)
            .filter(
                and_(
                    JournalEntry.user_id == user_id,
                    JournalEntry.entry_date >= cutoff_date,
                )
            )
            .all()
        )

        total_entries = len(entries)

        # Calculate averages
        energy_levels = [e.energy_level for e in entries if e.energy_level]
        training_qualities = [e.training_quality for e in entries if e.training_quality]
        sleep_hours = [e.sleep_hours for e in entries if e.sleep_hours]

        avg_energy = sum(energy_levels) / len(energy_levels) if energy_levels else None
        avg_training = (
            sum(training_qualities) / len(training_qualities) if training_qualities else None
        )
        avg_sleep = sum(sleep_hours) / len(sleep_hours) if sleep_hours else None

        # Mood distribution
        mood_distribution = {}
        for entry in entries:
            if entry.mood:
                mood_str = entry.mood.value
                mood_distribution[mood_str] = mood_distribution.get(mood_str, 0) + 1

        return JournalStats(
            total_entries=total_entries,
            avg_energy_level=round(avg_energy, 1) if avg_energy else None,
            avg_training_quality=round(avg_training, 1) if avg_training else None,
            avg_sleep_hours=round(avg_sleep, 1) if avg_sleep else None,
            mood_distribution=mood_distribution,
        )

    # ========== Goals ==========

    @staticmethod
    def create_goal(
        db: Session, goal_data: GoalCreate, user_id: int, created_by_id: Optional[int] = None
    ) -> Goal:
        """Create a new goal"""
        goal = Goal(
            user_id=user_id,
            title=goal_data.title,
            description=goal_data.description,
            category=goal_data.category,
            target_date=goal_data.target_date,
            progress_percentage=goal_data.progress_percentage,
            is_completed=goal_data.is_completed,
            milestones=goal_data.milestones or [],
            is_public=goal_data.is_public,
            created_by_id=created_by_id,
        )

        db.add(goal)
        db.commit()
        db.refresh(goal)

        return goal

    @staticmethod
    def get_goals(
        db: Session,
        user_id: int,
        is_completed: Optional[bool] = None,
        category: Optional[str] = None,
    ) -> List[Goal]:
        """Get goals with filters"""
        query = db.query(Goal).filter(Goal.user_id == user_id)

        if is_completed is not None:
            query = query.filter(Goal.is_completed == is_completed)

        if category:
            query = query.filter(Goal.category == category)

        return query.order_by(Goal.target_date.asc()).all()

    @staticmethod
    def update_goal(
        db: Session, goal_id: int, goal_data: GoalUpdate
    ) -> Optional[Goal]:
        """Update a goal"""
        goal = db.query(Goal).filter(Goal.id == goal_id).first()

        if not goal:
            return None

        update_data = goal_data.model_dump(exclude_unset=True)

        # Auto-set completed_at if marked as completed
        if update_data.get("is_completed") and not goal.is_completed:
            update_data["completed_at"] = datetime.utcnow()

        for field, value in update_data.items():
            setattr(goal, field, value)

        db.commit()
        db.refresh(goal)

        return goal

    @staticmethod
    def delete_goal(db: Session, goal_id: int) -> bool:
        """Delete a goal"""
        goal = db.query(Goal).filter(Goal.id == goal_id).first()

        if not goal:
            return False

        db.delete(goal)
        db.commit()

        return True

    @staticmethod
    def get_goal_stats(db: Session, user_id: int) -> GoalStats:
        """Get goal statistics for a user"""
        goals = db.query(Goal).filter(Goal.user_id == user_id).all()

        total_goals = len(goals)
        completed_goals = sum(1 for g in goals if g.is_completed)
        in_progress_goals = total_goals - completed_goals

        completion_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0

        return GoalStats(
            total_goals=total_goals,
            completed_goals=completed_goals,
            in_progress_goals=in_progress_goals,
            completion_rate=round(completion_rate, 1),
        )
