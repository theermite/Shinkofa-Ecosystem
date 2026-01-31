"""
Statistics routes - Dashboard stats for Coach/Manager
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.session import Session as SessionModel, SessionStatus
from app.utils.dependencies import get_current_active_user, require_role
from app.models.exercise import ExerciseScore

router = APIRouter()


@router.get("/coach-dashboard")
async def get_coach_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for Coach

    Returns:
        - active_players: Number of active JOUEUR accounts
        - total_capacity: Maximum team capacity
        - attendance_rate: Average attendance rate (%)
        - progression_rate: Progression rate vs last month (%)
        - upcoming_sessions: Number of upcoming sessions this week
    """

    # Count active players
    active_players = db.query(User).filter(
        User.role == UserRole.JOUEUR,
        User.is_active == True
    ).count()

    total_capacity = 10  # Max team size

    # Calculate attendance rate (based on session participation)
    # For now, return 0 if no data, will be calculated when we have real sessions
    total_sessions = db.query(SessionModel).count()
    if total_sessions > 0:
        # TODO: Calculate real attendance based on session_participants
        attendance_rate = 85.0  # Placeholder
    else:
        attendance_rate = 0.0

    # Calculate progression rate
    # For now, return 0 if no scores
    total_scores = db.query(ExerciseScore).count()
    if total_scores > 0:
        # TODO: Calculate real progression comparing this month vs last month
        progression_rate = 0.0  # Placeholder
    else:
        progression_rate = 0.0

    # Count upcoming sessions this week
    now = datetime.utcnow()
    week_end = now + timedelta(days=7)

    upcoming_sessions = db.query(SessionModel).filter(
        SessionModel.start_time >= now,
        SessionModel.start_time <= week_end,
        SessionModel.status.in_([SessionStatus.PENDING, SessionStatus.CONFIRMED])
    ).count()

    return {
        "active_players": active_players,
        "total_capacity": total_capacity,
        "attendance_rate": round(attendance_rate, 1),
        "progression_rate": round(progression_rate, 1),
        "upcoming_sessions": upcoming_sessions
    }


@router.get("/manager-dashboard")
async def get_manager_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Get dashboard statistics for Manager

    Returns similar stats as coach dashboard plus additional management metrics
    """

    # Reuse coach stats
    coach_stats = await get_coach_dashboard_stats(current_user, db)

    # Add manager-specific stats
    total_users = db.query(User).count()
    total_exercises = db.query(func.count()).select_from(db.query(ExerciseScore).subquery()).scalar() or 0

    return {
        **coach_stats,
        "total_users": total_users,
        "total_exercises_completed": total_exercises
    }


@router.get("/team-exercises")
async def get_team_exercise_stats(
    period_days: int = Query(30, description="Period in days"),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """Get exercise completion stats for all players (Coach/Manager only)"""
    from datetime import timedelta
    
    start_date = datetime.utcnow() - timedelta(days=period_days)
    
    # Get all players
    players = db.query(User).filter(User.role == UserRole.JOUEUR).all()
    
    player_stats = []
    for player in players:
        # Count exercises completed in period
        completed = db.query(ExerciseScore).filter(
            ExerciseScore.user_id == player.id,
            ExerciseScore.completed_at >= start_date
        ).count()
        
        # Average score
        avg_score_result = db.query(func.avg(ExerciseScore.score)).filter(
            ExerciseScore.user_id == player.id,
            ExerciseScore.completed_at >= start_date
        ).scalar()
        
        avg_score = float(avg_score_result) if avg_score_result else 0.0
        
        # Latest exercise
        latest_score = db.query(ExerciseScore).filter(
            ExerciseScore.user_id == player.id
        ).order_by(ExerciseScore.completed_at.desc()).first()
        
        player_stats.append({
            "player_id": player.id,
            "player_name": f"{player.prenom} {player.nom}",
            "username": player.username,
            "is_active": player.is_active,
            "exercises_completed": completed,
            "avg_score": round(avg_score, 1),
            "last_activity": latest_score.completed_at.isoformat() if latest_score else None
        })
    
    # Sort by exercises completed descending
    player_stats.sort(key=lambda x: x["exercises_completed"], reverse=True)
    
    return {
        "period_days": period_days,
        "player_count": len(players),
        "players": player_stats
    }
