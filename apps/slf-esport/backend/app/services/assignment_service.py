"""
Exercise assignment service
"""

from datetime import datetime, date
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session as DBSession
from sqlalchemy import and_, or_

from app.models.assignment import ExerciseAssignment, AssignmentStatus
from app.models.exercise import Exercise
from app.models.user import User
from app.schemas.assignment import (
    ExerciseAssignmentCreate,
    ExerciseAssignmentUpdate,
    AssignmentStats,
)


class AssignmentService:
    """Service for managing exercise assignments"""

    @staticmethod
    def create_assignment(
        db: DBSession,
        assignment_data: ExerciseAssignmentCreate,
        coach_id: int,
    ) -> ExerciseAssignment:
        """
        Create a new exercise assignment

        Args:
            db: Database session
            assignment_data: Assignment data
            coach_id: ID of the coach creating the assignment

        Returns:
            Created assignment
        """
        assignment = ExerciseAssignment(
            **assignment_data.model_dump(),
            coach_id=coach_id,
            assigned_date=datetime.utcnow(),
        )
        db.add(assignment)
        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def get_assignment_by_id(db: DBSession, assignment_id: int) -> Optional[ExerciseAssignment]:
        """Get assignment by ID"""
        return db.query(ExerciseAssignment).filter(ExerciseAssignment.id == assignment_id).first()

    @staticmethod
    def get_player_assignments(
        db: DBSession,
        player_id: int,
        status: Optional[AssignmentStatus] = None,
        include_completed: bool = True,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[ExerciseAssignment], int]:
        """
        Get assignments for a specific player

        Args:
            db: Database session
            player_id: Player ID
            status: Filter by status
            include_completed: Include completed assignments
            skip: Pagination offset
            limit: Max results

        Returns:
            Tuple of (assignments, total_count)
        """
        query = db.query(ExerciseAssignment).filter(ExerciseAssignment.player_id == player_id)

        if status:
            query = query.filter(ExerciseAssignment.status == status)
        elif not include_completed:
            query = query.filter(ExerciseAssignment.status != AssignmentStatus.COMPLETED)

        # Order by priority (descending), then due date (ascending), then assigned date
        query = query.order_by(
            ExerciseAssignment.priority.desc(),
            ExerciseAssignment.due_date.asc(),
            ExerciseAssignment.assigned_date.desc(),
        )

        total = query.count()
        assignments = query.offset(skip).limit(limit).all()

        return assignments, total

    @staticmethod
    def get_coach_assignments(
        db: DBSession,
        coach_id: int,
        player_id: Optional[int] = None,
        status: Optional[AssignmentStatus] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> Tuple[List[ExerciseAssignment], int]:
        """
        Get assignments created by a specific coach

        Args:
            db: Database session
            coach_id: Coach ID
            player_id: Filter by player
            status: Filter by status
            skip: Pagination offset
            limit: Max results

        Returns:
            Tuple of (assignments, total_count)
        """
        query = db.query(ExerciseAssignment).filter(ExerciseAssignment.coach_id == coach_id)

        if player_id:
            query = query.filter(ExerciseAssignment.player_id == player_id)

        if status:
            query = query.filter(ExerciseAssignment.status == status)

        query = query.order_by(ExerciseAssignment.assigned_date.desc())

        total = query.count()
        assignments = query.offset(skip).limit(limit).all()

        return assignments, total

    @staticmethod
    def update_assignment(
        db: DBSession,
        assignment_id: int,
        assignment_data: ExerciseAssignmentUpdate,
    ) -> Optional[ExerciseAssignment]:
        """
        Update an assignment

        Args:
            db: Database session
            assignment_id: Assignment ID
            assignment_data: Update data

        Returns:
            Updated assignment or None if not found
        """
        assignment = AssignmentService.get_assignment_by_id(db, assignment_id)
        if not assignment:
            return None

        update_data = assignment_data.model_dump(exclude_unset=True)

        # Auto-set completed_date if status changes to completed
        if "status" in update_data and update_data["status"] == AssignmentStatus.COMPLETED:
            if assignment.status != AssignmentStatus.COMPLETED:
                update_data["completed_date"] = datetime.utcnow()

        for key, value in update_data.items():
            setattr(assignment, key, value)

        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def delete_assignment(db: DBSession, assignment_id: int) -> bool:
        """
        Delete an assignment

        Args:
            db: Database session
            assignment_id: Assignment ID

        Returns:
            True if deleted, False if not found
        """
        assignment = AssignmentService.get_assignment_by_id(db, assignment_id)
        if not assignment:
            return False

        db.delete(assignment)
        db.commit()
        return True

    @staticmethod
    def increment_attempts(db: DBSession, assignment_id: int) -> Optional[ExerciseAssignment]:
        """
        Increment the attempts counter for an assignment

        Args:
            db: Database session
            assignment_id: Assignment ID

        Returns:
            Updated assignment or None if not found
        """
        assignment = AssignmentService.get_assignment_by_id(db, assignment_id)
        if not assignment:
            return None

        assignment.attempts_count += 1

        # Auto-set status to in_progress if it was pending
        if assignment.status == AssignmentStatus.PENDING:
            assignment.status = AssignmentStatus.IN_PROGRESS

        db.commit()
        db.refresh(assignment)
        return assignment

    @staticmethod
    def get_assignment_stats(db: DBSession, player_id: int) -> AssignmentStats:
        """
        Get assignment statistics for a player

        Args:
            db: Database session
            player_id: Player ID

        Returns:
            Assignment statistics
        """
        query = db.query(ExerciseAssignment).filter(ExerciseAssignment.player_id == player_id)

        total = query.count()
        pending = query.filter(ExerciseAssignment.status == AssignmentStatus.PENDING).count()
        in_progress = query.filter(ExerciseAssignment.status == AssignmentStatus.IN_PROGRESS).count()
        completed = query.filter(ExerciseAssignment.status == AssignmentStatus.COMPLETED).count()

        completion_rate = (completed / total * 100) if total > 0 else 0.0

        # Count overdue assignments (past due date and not completed)
        today = date.today()
        overdue = (
            query.filter(
                and_(
                    ExerciseAssignment.due_date < today,
                    ExerciseAssignment.status.in_([AssignmentStatus.PENDING, AssignmentStatus.IN_PROGRESS]),
                )
            ).count()
        )

        return AssignmentStats(
            total_assignments=total,
            pending=pending,
            in_progress=in_progress,
            completed=completed,
            completion_rate=completion_rate,
            overdue=overdue,
        )
