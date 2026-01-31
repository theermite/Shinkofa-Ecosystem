"""
Availability Service - Business logic for player availabilities
"""

from datetime import datetime, time, date, timedelta
from typing import List, Optional, Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from app.models.availability import PlayerAvailability, PlayerAvailabilityException
from app.models.user import User, UserRole
from app.schemas.availability import (
    PlayerAvailabilityCreate,
    PlayerAvailabilityUpdate,
    PlayerAvailabilityExceptionCreate,
    PlayerAvailabilityExceptionUpdate,
    AvailablePlayerResponse,
    TeamMemberAvailabilityResponse,
)


def get_user_availabilities(db: Session, user_id: int) -> List[PlayerAvailability]:
    """Get all availabilities for a user (both recurring and specific dates)"""
    availabilities = db.query(PlayerAvailability).filter(
        PlayerAvailability.user_id == user_id
    ).all()

    # Sort: specific dates first (by date), then recurring (by day_of_week)
    def sort_key(a):
        if a.specific_date:
            return (0, a.specific_date, a.start_time)
        else:
            return (1, a.day_of_week if a.day_of_week is not None else 99, a.start_time)

    return sorted(availabilities, key=sort_key)


def get_team_availabilities(db: Session, team_member_ids: Optional[List[int]] = None) -> List[TeamMemberAvailabilityResponse]:
    """
    Get all availabilities for team members (coaches only)
    Returns availabilities with user info included
    """
    # Query availabilities with user join
    query = db.query(PlayerAvailability, User).join(
        User, PlayerAvailability.user_id == User.id
    )

    # Filter by specific team members if provided
    if team_member_ids:
        query = query.filter(User.id.in_(team_member_ids))
    else:
        # Default: all players
        query = query.filter(User.role == UserRole.JOUEUR)

    results = query.all()

    # Build response with user info
    team_availabilities = []
    for availability, user in results:
        team_availabilities.append(TeamMemberAvailabilityResponse(
            id=availability.id,
            user_id=user.id,
            username=user.username,
            email=user.email,
            day_of_week=availability.day_of_week,
            specific_date=availability.specific_date,
            start_time=availability.start_time,
            end_time=availability.end_time,
            is_active=availability.is_active,
            notes=availability.notes,
            created_at=availability.created_at,
            updated_at=availability.updated_at
        ))

    # Sort: by username, then specific dates, then day_of_week
    def sort_key(a):
        if a.specific_date:
            return (a.username, 0, a.specific_date, a.start_time)
        else:
            return (a.username, 1, a.day_of_week if a.day_of_week is not None else 99, a.start_time)

    return sorted(team_availabilities, key=sort_key)


def create_availability(db: Session, user_id: int, availability_data: PlayerAvailabilityCreate) -> PlayerAvailability:
    """Create a new availability for a user"""
    availability = PlayerAvailability(
        user_id=user_id,
        **availability_data.dict()
    )
    db.add(availability)
    db.commit()
    db.refresh(availability)
    return availability


def update_availability(db: Session, availability_id: int, user_id: int, availability_data: PlayerAvailabilityUpdate) -> Optional[PlayerAvailability]:
    """Update an availability"""
    availability = db.query(PlayerAvailability).filter(
        PlayerAvailability.id == availability_id,
        PlayerAvailability.user_id == user_id
    ).first()

    if not availability:
        return None

    for key, value in availability_data.dict(exclude_unset=True).items():
        setattr(availability, key, value)

    db.commit()
    db.refresh(availability)
    return availability


def delete_availability(db: Session, availability_id: int, user_id: int) -> bool:
    """Delete an availability"""
    availability = db.query(PlayerAvailability).filter(
        PlayerAvailability.id == availability_id,
        PlayerAvailability.user_id == user_id
    ).first()

    if not availability:
        return False

    db.delete(availability)
    db.commit()
    return True


# ========== Availability Exceptions ==========

def get_user_exceptions(db: Session, user_id: int, start_date: Optional[date] = None, end_date: Optional[date] = None) -> List[PlayerAvailabilityException]:
    """Get availability exceptions for a user"""
    query = db.query(PlayerAvailabilityException).filter(
        PlayerAvailabilityException.user_id == user_id
    )

    if start_date:
        query = query.filter(PlayerAvailabilityException.exception_date >= start_date)
    if end_date:
        query = query.filter(PlayerAvailabilityException.exception_date <= end_date)

    return query.order_by(PlayerAvailabilityException.exception_date).all()


def create_exception(db: Session, user_id: int, exception_data: PlayerAvailabilityExceptionCreate) -> PlayerAvailabilityException:
    """Create a new availability exception"""
    exception = PlayerAvailabilityException(
        user_id=user_id,
        **exception_data.dict()
    )
    db.add(exception)
    db.commit()
    db.refresh(exception)
    return exception


def delete_exception(db: Session, exception_id: int, user_id: int) -> bool:
    """Delete an availability exception"""
    exception = db.query(PlayerAvailabilityException).filter(
        PlayerAvailabilityException.id == exception_id,
        PlayerAvailabilityException.user_id == user_id
    ).first()

    if not exception:
        return False

    db.delete(exception)
    db.commit()
    return True


# ========== Availability Calculation ==========

def check_user_available(db: Session, user_id: int, start_time: datetime, end_time: datetime) -> Dict[str, any]:
    """
    Check if a user is available for a given time slot
    Returns: {
        "is_available": bool,
        "availability_type": str,  # "specific_date", "recurring", "exception_available", "exception_unavailable", "no_availability"
        "reason": str (optional)
    }
    """
    # Extract date and time
    session_date = start_time.date()
    session_start_time = start_time.time()
    session_end_time = end_time.time()

    # Convert Python weekday to our system
    # Python: 0=Monday, 1=Tuesday, ..., 6=Sunday
    # Our system: 0=Sunday, 1=Monday, 2=Tuesday, ..., 6=Saturday
    python_weekday = start_time.weekday()
    day_of_week = (python_weekday + 1) % 7  # 0=Sunday, 1=Monday, ..., 6=Saturday

    # 1. Check for exceptions on this specific date (highest priority)
    exceptions = db.query(PlayerAvailabilityException).filter(
        PlayerAvailabilityException.user_id == user_id,
        PlayerAvailabilityException.exception_date == session_date
    ).all()

    for exception in exceptions:
        # If exception has specific times, check overlap
        if exception.start_time and exception.end_time:
            # Check if session overlaps with exception time
            if (session_start_time < exception.end_time and session_end_time > exception.start_time):
                if exception.is_unavailable:
                    return {
                        "is_available": False,
                        "availability_type": "exception_unavailable",
                        "reason": exception.reason
                    }
                else:
                    return {
                        "is_available": True,
                        "availability_type": "exception_available",
                        "reason": exception.reason
                    }
        else:
            # Whole day exception
            if exception.is_unavailable:
                return {
                    "is_available": False,
                    "availability_type": "exception_unavailable",
                    "reason": exception.reason
                }
            else:
                return {
                    "is_available": True,
                    "availability_type": "exception_available",
                    "reason": exception.reason
                }

    # 2. Check specific date availabilities (second priority)
    specific_availabilities = db.query(PlayerAvailability).filter(
        PlayerAvailability.user_id == user_id,
        PlayerAvailability.specific_date == session_date,
        PlayerAvailability.is_active == True
    ).all()

    for availability in specific_availabilities:
        # Check if session time overlaps with availability window
        # Two time ranges overlap if: start1 < end2 AND end1 > start2
        if (session_start_time < availability.end_time and session_end_time > availability.start_time):
            return {
                "is_available": True,
                "availability_type": "specific_date",
                "reason": availability.notes
            }

    # 3. Check recurring availability for this day of week (third priority)
    recurring_availabilities = db.query(PlayerAvailability).filter(
        PlayerAvailability.user_id == user_id,
        PlayerAvailability.day_of_week == day_of_week,
        PlayerAvailability.specific_date == None,  # Only recurring
        PlayerAvailability.is_active == True
    ).all()

    for availability in recurring_availabilities:
        # Check if session time overlaps with availability window
        # Two time ranges overlap if: start1 < end2 AND end1 > start2
        if (session_start_time < availability.end_time and session_end_time > availability.start_time):
            return {
                "is_available": True,
                "availability_type": "recurring",
                "reason": availability.notes
            }

    # 4. No availability found
    return {
        "is_available": False,
        "availability_type": "no_availability",
        "reason": None
    }


def get_available_players(db: Session, start_time: datetime, end_time: datetime, team_player_ids: Optional[List[int]] = None) -> List[AvailablePlayerResponse]:
    """
    Get all available players for a given time slot
    If team_player_ids is provided, only check those players
    """
    # Get all players (or specific team members)
    query = db.query(User).filter(User.role == UserRole.JOUEUR)
    if team_player_ids:
        query = query.filter(User.id.in_(team_player_ids))

    players = query.all()

    # Check availability for each player
    available_players = []
    for player in players:
        availability_info = check_user_available(db, player.id, start_time, end_time)

        available_players.append(AvailablePlayerResponse(
            user_id=player.id,
            username=player.username,
            email=player.email,
            is_available=availability_info["is_available"],
            availability_type=availability_info["availability_type"],
            reason=availability_info.get("reason")
        ))

    # Sort: available first, then by username
    available_players.sort(key=lambda p: (not p.is_available, p.username))

    return available_players
