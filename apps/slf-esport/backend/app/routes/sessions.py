"""
Session routes - Training session booking and management
"""

from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.session import SessionType, SessionStatus
from app.schemas.session import (
    SessionCreate,
    SessionUpdate,
    SessionResponse,
    SessionListResponse,
    SessionStats,
    SessionParticipantCreate,
    SessionParticipantResponse,
    SessionParticipantUpdate,
)
from app.services.session_service import SessionService
from app.utils.dependencies import get_current_user, require_role


router = APIRouter(tags=["sessions"])


# ========== Session CRUD ==========

@router.post("", response_model=SessionResponse, status_code=201)
async def create_session(
    session_data: SessionCreate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Create a new training session

    - **title**: Session title
    - **session_type**: solo, duo, trio, team, group
    - **start_time**: Session start date/time
    - **end_time**: Session end date/time
    - **coach_id**: Optional coach ID
    - **participant_ids**: List of participant user IDs
    """
    session = SessionService.create_session(db, session_data, current_user.id)
    return session


@router.get("", response_model=SessionListResponse)
async def get_sessions(
    user_id: Optional[int] = Query(None, description="Filter by user participation"),
    coach_id: Optional[int] = Query(None, description="Filter by coach"),
    session_type: Optional[SessionType] = Query(None, description="Filter by session type"),
    status: Optional[SessionStatus] = Query(None, description="Filter by status"),
    start_date: Optional[datetime] = Query(None, description="Filter by start date (>=)"),
    end_date: Optional[datetime] = Query(None, description="Filter by end date (<=)"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Get sessions with filters

    - Players can see their own sessions only
    - Coaches and managers can see all sessions
    """
    # Enforce access control for players
    if current_user.role == UserRole.JOUEUR and not user_id:
        user_id = current_user.id

    skip = (page - 1) * page_size

    sessions, total = SessionService.get_sessions(
        db,
        user_id=user_id,
        coach_id=coach_id,
        session_type=session_type,
        status=status,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=page_size,
    )

    return SessionListResponse(
        total=total,
        sessions=sessions,
        page=page,
        page_size=page_size,
    )


@router.get("/me", response_model=SessionListResponse)
async def get_my_sessions(
    session_type: Optional[SessionType] = Query(None),
    status: Optional[SessionStatus] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's sessions"""
    skip = (page - 1) * page_size

    sessions, total = SessionService.get_sessions(
        db,
        user_id=current_user.id,
        session_type=session_type,
        status=status,
        start_date=start_date,
        end_date=end_date,
        skip=skip,
        limit=page_size,
    )

    return SessionListResponse(
        total=total,
        sessions=sessions,
        page=page,
        page_size=page_size,
    )


@router.get("/{session_id}", response_model=SessionResponse)
async def get_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get session by ID"""
    session = SessionService.get_session(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check access (players can only see their own sessions)
    if current_user.role == UserRole.JOUEUR:
        is_participant = any(p.user_id == current_user.id for p in session.participants)
        is_coach = session.coach_id == current_user.id
        is_creator = session.created_by_id == current_user.id

        if not (is_participant or is_coach or is_creator):
            raise HTTPException(status_code=403, detail="Access denied")

    return session


@router.put("/{session_id}", response_model=SessionResponse)
async def update_session(
    session_id: int,
    session_data: SessionUpdate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Update a session

    - Only coaches, managers, and session creator can update
    """
    session = SessionService.get_session(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check permissions
    is_creator = session.created_by_id == current_user.id
    is_coach_or_manager = current_user.role in [UserRole.COACH, UserRole.MANAGER]

    if not (is_creator or is_coach_or_manager):
        raise HTTPException(status_code=403, detail="Only creator, coaches, or managers can update sessions")

    updated_session = SessionService.update_session(db, session_id, session_data)

    return updated_session


@router.delete("/{session_id}", status_code=204)
async def delete_session(
    session_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Delete a session

    - Only coaches, managers, and session creator can delete
    """
    session = SessionService.get_session(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check permissions
    is_creator = session.created_by_id == current_user.id
    is_coach_or_manager = current_user.role in [UserRole.COACH, UserRole.MANAGER]

    if not (is_creator or is_coach_or_manager):
        raise HTTPException(status_code=403, detail="Only creator, coaches, or managers can delete sessions")

    SessionService.delete_session(db, session_id)

    return None


# ========== Participant Management ==========

@router.post("/{session_id}/participants/{user_id}", response_model=SessionParticipantResponse)
async def add_participant(
    session_id: int,
    user_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Add a participant to a session (coaches/managers only)"""
    session = SessionService.get_session(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    participant = SessionService.add_participant(db, session_id, user_id)

    return participant


@router.delete("/{session_id}/participants/{user_id}", status_code=204)
async def remove_participant(
    session_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Remove a participant from a session

    - Coaches/managers can remove any participant
    - Players can remove themselves (quit a session they joined)
    """
    session = SessionService.get_session(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    # Check permissions: coaches/managers can remove anyone, players can only remove themselves
    is_coach_or_manager = current_user.role in [UserRole.COACH, UserRole.MANAGER]
    is_removing_self = user_id == current_user.id

    if not (is_coach_or_manager or is_removing_self):
        raise HTTPException(status_code=403, detail="You can only remove yourself from a session")

    success = SessionService.remove_participant(db, session_id, user_id)

    if not success:
        raise HTTPException(status_code=404, detail="Participant not found")

    return None


@router.put("/{session_id}/participants/{user_id}/attendance", response_model=SessionParticipantResponse)
async def update_attendance(
    session_id: int,
    user_id: int,
    update_data: SessionParticipantUpdate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """
    Update participant attendance status (coaches/managers only)

    - **attendance_status**: pending, present, absent, excused
    """
    session = SessionService.get_session(db, session_id)

    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    participant = SessionService.update_attendance(
        db,
        session_id,
        user_id,
        update_data.attendance_status or "pending",
        update_data.notes,
    )

    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    return participant


# ========== Statistics ==========

@router.get("/stats/me", response_model=SessionStats)
async def get_my_stats(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's session statistics"""
    stats = SessionService.get_user_stats(db, current_user.id)
    return stats


@router.get("/stats/user/{user_id}", response_model=SessionStats)
async def get_user_stats(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get session statistics for a user (coaches/managers only)"""
    stats = SessionService.get_user_stats(db, user_id)
    return stats


# ========== Session Invitations ==========

@router.post("/{session_id}/invite", response_model=list[SessionParticipantResponse])
async def invite_players_to_session(
    session_id: int,
    user_ids: list[int],
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Invite players to a session (coaches/managers only)"""
    try:
        participants = SessionService.invite_players(db, session_id, user_ids)
        return participants
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/{session_id}/respond", response_model=SessionParticipantResponse)
async def respond_to_session_invitation(
    session_id: int,
    response_status: str,
    decline_reason: str = None,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Respond to a session invitation (confirmed/maybe/declined)"""
    if response_status not in ["confirmed", "maybe", "declined"]:
        raise HTTPException(
            status_code=400,
            detail="response_status must be 'confirmed', 'maybe', or 'declined'"
        )

    try:
        participant = SessionService.respond_to_invitation(
            db, session_id, current_user.id, response_status, decline_reason
        )
        return participant
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/invitations/pending", response_model=list[SessionResponse])
async def get_my_pending_invitations(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get all pending session invitations for current user"""
    sessions = SessionService.get_pending_invitations(db, current_user.id)
    return sessions
