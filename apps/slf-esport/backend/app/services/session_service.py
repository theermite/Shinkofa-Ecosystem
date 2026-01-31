"""
Session service - Business logic for training sessions
"""

from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func
from app.models.session import Session as SessionModel, SessionParticipant, SessionType, SessionStatus
from app.models.user import User
from app.schemas.session import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionStats,
    SessionParticipantCreate,
)


class SessionService:
    """Service for managing training sessions"""

    @staticmethod
    def create_session(db: Session, session_data: SessionCreate, created_by_id: int) -> SessionModel:
        """
        Create a new training session

        Args:
            db: Database session
            session_data: Session creation data
            created_by_id: ID of user creating the session

        Returns:
            Created session
        """
        # Calculate duration
        duration = (session_data.end_time - session_data.start_time).total_seconds() / 60

        # Create session
        db_session = SessionModel(
            title=session_data.title,
            description=session_data.description,
            session_type=session_data.session_type,
            start_time=session_data.start_time,
            end_time=session_data.end_time,
            duration_minutes=int(duration),
            coach_id=session_data.coach_id,
            meeting_url=session_data.meeting_url,
            notes=session_data.notes,
            created_by_id=created_by_id,
            status=SessionStatus.PENDING,
        )

        db.add(db_session)
        db.flush()  # Get the session ID

        # Add participants
        if session_data.participant_ids:
            for user_id in session_data.participant_ids:
                participant = SessionParticipant(
                    session_id=db_session.id,
                    user_id=user_id,
                    attendance_status="pending",
                )
                db.add(participant)

        db.commit()
        db.refresh(db_session)

        return db_session

    @staticmethod
    def get_session(db: Session, session_id: int) -> Optional[SessionModel]:
        """Get session by ID with participants"""
        return (
            db.query(SessionModel)
            .options(joinedload(SessionModel.participants).joinedload(SessionParticipant.user))
            .filter(SessionModel.id == session_id)
            .first()
        )

    @staticmethod
    def get_sessions(
        db: Session,
        user_id: Optional[int] = None,
        coach_id: Optional[int] = None,
        session_type: Optional[SessionType] = None,
        status: Optional[SessionStatus] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[List[SessionModel], int]:
        """
        Get sessions with filters

        Returns:
            Tuple of (sessions, total_count)
        """
        query = db.query(SessionModel).options(joinedload(SessionModel.participants).joinedload(SessionParticipant.user))

        # Filter by user participation
        if user_id:
            # Use distinct() to avoid duplicates from the outerjoin
            query = query.outerjoin(SessionModel.participants).filter(
                or_(
                    SessionParticipant.user_id == user_id,
                    SessionModel.coach_id == user_id,
                    SessionModel.created_by_id == user_id,
                )
            ).distinct()

        # Filter by coach
        if coach_id:
            query = query.filter(SessionModel.coach_id == coach_id)

        # Filter by type
        if session_type:
            query = query.filter(SessionModel.session_type == session_type)

        # Filter by status
        if status:
            query = query.filter(SessionModel.status == status)

        # Filter by date range
        if start_date:
            query = query.filter(SessionModel.start_time >= start_date)
        if end_date:
            query = query.filter(SessionModel.start_time <= end_date)

        # Get total count
        total = query.count()

        # Order by start time (soonest first)
        query = query.order_by(SessionModel.start_time.asc())

        # Pagination
        sessions = query.offset(skip).limit(limit).all()

        return sessions, total

    @staticmethod
    def update_session(
        db: Session,
        session_id: int,
        session_data: SessionUpdate,
    ) -> Optional[SessionModel]:
        """Update a session"""
        db_session = SessionService.get_session(db, session_id)
        if not db_session:
            return None

        # Update fields
        update_data = session_data.model_dump(exclude_unset=True)

        # Recalculate duration if times changed
        if 'start_time' in update_data or 'end_time' in update_data:
            start = update_data.get('start_time', db_session.start_time)
            end = update_data.get('end_time', db_session.end_time)
            duration = (end - start).total_seconds() / 60
            update_data['duration_minutes'] = int(duration)

        for field, value in update_data.items():
            setattr(db_session, field, value)

        db.commit()
        db.refresh(db_session)

        return db_session

    @staticmethod
    def delete_session(db: Session, session_id: int) -> bool:
        """Delete a session"""
        db_session = SessionService.get_session(db, session_id)
        if not db_session:
            return False

        db.delete(db_session)
        db.commit()

        return True

    @staticmethod
    def add_participant(
        db: Session,
        session_id: int,
        user_id: int,
    ) -> Optional[SessionParticipant]:
        """Add a participant to a session"""
        # Check if already participating
        existing = (
            db.query(SessionParticipant)
            .filter(
                and_(
                    SessionParticipant.session_id == session_id,
                    SessionParticipant.user_id == user_id,
                )
            )
            .first()
        )

        if existing:
            return existing

        participant = SessionParticipant(
            session_id=session_id,
            user_id=user_id,
            attendance_status="pending",
        )

        db.add(participant)
        db.commit()
        db.refresh(participant)

        return participant

    @staticmethod
    def remove_participant(db: Session, session_id: int, user_id: int) -> bool:
        """Remove a participant from a session"""
        participant = (
            db.query(SessionParticipant)
            .filter(
                and_(
                    SessionParticipant.session_id == session_id,
                    SessionParticipant.user_id == user_id,
                )
            )
            .first()
        )

        if not participant:
            return False

        db.delete(participant)
        db.commit()

        return True

    @staticmethod
    def update_attendance(
        db: Session,
        session_id: int,
        user_id: int,
        attendance_status: str,
        notes: Optional[str] = None,
    ) -> Optional[SessionParticipant]:
        """Update participant attendance status"""
        participant = (
            db.query(SessionParticipant)
            .filter(
                and_(
                    SessionParticipant.session_id == session_id,
                    SessionParticipant.user_id == user_id,
                )
            )
            .first()
        )

        if not participant:
            return None

        participant.attendance_status = attendance_status
        if notes is not None:
            participant.notes = notes

        db.commit()
        db.refresh(participant)

        return participant

    @staticmethod
    def get_user_stats(db: Session, user_id: int) -> SessionStats:
        """Get session statistics for a user"""
        # Get all sessions user participated in
        sessions = (
            db.query(SessionModel)
            .join(SessionParticipant)
            .filter(SessionParticipant.user_id == user_id)
            .all()
        )

        total_sessions = len(sessions)
        completed = sum(1 for s in sessions if s.status == SessionStatus.COMPLETED)
        upcoming = sum(
            1 for s in sessions
            if s.status in [SessionStatus.PENDING, SessionStatus.CONFIRMED]
            and s.start_time > datetime.utcnow()
        )
        cancelled = sum(1 for s in sessions if s.status == SessionStatus.CANCELLED)

        # Calculate attendance rate
        attended_count = (
            db.query(SessionParticipant)
            .filter(
                and_(
                    SessionParticipant.user_id == user_id,
                    SessionParticipant.attendance_status == "present",
                )
            )
            .count()
        )

        attendance_rate = (attended_count / total_sessions * 100) if total_sessions > 0 else 0

        # Calculate total hours
        total_minutes = sum(s.duration_minutes or 0 for s in sessions if s.status == SessionStatus.COMPLETED)
        total_hours = total_minutes / 60

        return SessionStats(
            total_sessions=total_sessions,
            completed_sessions=completed,
            upcoming_sessions=upcoming,
            cancelled_sessions=cancelled,
            attendance_rate=round(attendance_rate, 1),
            total_hours=round(total_hours, 1),
        )


    # ========== Session Invitations ==========

    @staticmethod
    def invite_players(db: Session, session_id: int, user_ids: list[int]) -> list[SessionParticipant]:
        """
        Invite players to a session
        Creates or updates SessionParticipant records with invitation timestamp
        """
        session = db.query(SessionModel).filter(SessionModel.id == session_id).first()
        if not session:
            raise ValueError(f"Session {session_id} not found")

        invited_participants = []
        for user_id in user_ids:
            # Check if participant already exists
            participant = db.query(SessionParticipant).filter(
                and_(
                    SessionParticipant.session_id == session_id,
                    SessionParticipant.user_id == user_id
                )
            ).first()

            if participant:
                # Update existing participant
                participant.invitation_sent_at = datetime.utcnow()
                participant.response_status = "pending"
            else:
                # Create new participant
                participant = SessionParticipant(
                    session_id=session_id,
                    user_id=user_id,
                    response_status="pending",
                    invitation_sent_at=datetime.utcnow()
                )
                db.add(participant)

            invited_participants.append(participant)

        db.commit()
        for p in invited_participants:
            db.refresh(p)

        return invited_participants

    @staticmethod
    def respond_to_invitation(db: Session, session_id: int, user_id: int, response_status: str, decline_reason: str = None) -> SessionParticipant:
        """
        Player responds to a session invitation
        response_status: "confirmed", "maybe", "declined"
        """
        if response_status not in ["confirmed", "maybe", "declined"]:
            raise ValueError(f"Invalid response_status: {response_status}")

        participant = db.query(SessionParticipant).filter(
            and_(
                SessionParticipant.session_id == session_id,
                SessionParticipant.user_id == user_id
            )
        ).first()

        if not participant:
            raise ValueError(f"No invitation found for user {user_id} in session {session_id}")

        participant.response_status = response_status
        participant.response_at = datetime.utcnow()
        if decline_reason and response_status == "declined":
            participant.decline_reason = decline_reason

        db.commit()
        db.refresh(participant)

        return participant

    @staticmethod
    def get_pending_invitations(db: Session, user_id: int) -> list[SessionModel]:
        """
        Get all pending session invitations for a user
        Only returns future sessions
        """
        return (
            db.query(SessionModel)
            .join(SessionParticipant)
            .filter(
                and_(
                    SessionParticipant.user_id == user_id,
                    SessionParticipant.response_status == "pending",
                    SessionModel.start_time > datetime.utcnow()
                )
            )
            .order_by(SessionModel.start_time)
            .all()
        )
