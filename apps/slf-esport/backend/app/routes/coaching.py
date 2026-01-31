"""
Coaching routes - Holistic coaching module (Shinkofa philosophy)
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session as DBSession

from app.core.database import get_db
from app.models.user import User, UserRole
from app.models.coaching import QuestionnaireType, JournalMood
from app.schemas.coaching import (
    QuestionnaireCreate,
    QuestionnaireUpdate,
    QuestionnaireResponse as QuestionnaireResponseSchema,
    QuestionnaireResponseCreate,
    QuestionnaireResponseUpdate,
    QuestionnaireResponseResponse,
    JournalEntryCreate,
    JournalEntryUpdate,
    JournalEntryResponse,
    JournalStats,
    GoalCreate,
    GoalUpdate,
    GoalResponse,
    GoalStats,
)
from app.services.coaching_service import CoachingService
from app.utils.dependencies import get_current_user, require_role


router = APIRouter(tags=["coaching"])


# ========== Questionnaires ==========

@router.post("/questionnaires", response_model=QuestionnaireResponseSchema, status_code=201)
async def create_questionnaire(
    questionnaire_data: QuestionnaireCreate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """
    Create a new questionnaire (coaches/managers only)

    - **title**: Questionnaire title
    - **questionnaire_type**: onboarding, energy, goal, progress, wellbeing, custom
    - **questions**: List of questions with type and options
    """
    questionnaire = CoachingService.create_questionnaire(
        db, questionnaire_data, current_user.id
    )
    return questionnaire


@router.get("/questionnaires", response_model=list[QuestionnaireResponseSchema])
async def get_questionnaires(
    questionnaire_type: Optional[QuestionnaireType] = Query(None),
    is_active: Optional[bool] = Query(True),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get all questionnaires"""
    questionnaires = CoachingService.get_questionnaires(
        db, questionnaire_type=questionnaire_type, is_active=is_active
    )
    return questionnaires


# ========== Questionnaire Responses ==========

@router.post("/questionnaire-responses", response_model=QuestionnaireResponseResponse, status_code=201)
async def submit_questionnaire_response(
    response_data: QuestionnaireResponseCreate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Submit a questionnaire response

    - **questionnaire_id**: ID of the questionnaire
    - **answers**: List of answers matching question indices
    """
    response = CoachingService.submit_questionnaire_response(
        db, response_data, current_user.id
    )
    return response


@router.get("/questionnaire-responses/me", response_model=list[QuestionnaireResponseResponse])
async def get_my_questionnaire_responses(
    questionnaire_id: Optional[int] = Query(None),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's questionnaire responses"""
    responses = CoachingService.get_user_responses(
        db, current_user.id, questionnaire_id=questionnaire_id
    )
    return responses


@router.get("/questionnaire-responses/user/{user_id}", response_model=list[QuestionnaireResponseResponse])
async def get_user_questionnaire_responses(
    user_id: int,
    questionnaire_id: Optional[int] = Query(None),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get user's questionnaire responses (coaches/managers only)"""
    responses = CoachingService.get_user_responses(
        db, user_id, questionnaire_id=questionnaire_id
    )
    return responses


# ========== Journal Entries ==========

@router.post("/journal", response_model=JournalEntryResponse, status_code=201)
async def create_journal_entry(
    entry_data: JournalEntryCreate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Create a new journal entry

    - **content**: Entry content (required)
    - **mood**: excellent, good, neutral, low, bad
    - **energy_level**: 1-10 scale
    - **training_quality**: 1-10 scale
    - **sleep_hours**: Hours slept
    - **tags**: List of tags
    """
    entry = CoachingService.create_journal_entry(db, entry_data, current_user.id)
    return entry


@router.get("/journal/me", response_model=list[JournalEntryResponse])
async def get_my_journal_entries(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    mood: Optional[JournalMood] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's journal entries"""
    skip = (page - 1) * page_size

    entries, total = CoachingService.get_journal_entries(
        db,
        current_user.id,
        start_date=start_date,
        end_date=end_date,
        mood=mood,
        skip=skip,
        limit=page_size,
    )

    return entries


@router.get("/journal/user/{user_id}", response_model=list[JournalEntryResponse])
async def get_user_journal_entries(
    user_id: int,
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    mood: Optional[JournalMood] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get user's journal entries (coaches/managers only) - only public entries"""
    skip = (page - 1) * page_size

    entries, total = CoachingService.get_journal_entries(
        db,
        user_id,
        start_date=start_date,
        end_date=end_date,
        mood=mood,
        skip=skip,
        limit=page_size,
    )

    # Filter to only public entries for coaches
    if current_user.id != user_id:
        entries = [e for e in entries if not e.is_private]

    return entries


@router.put("/journal/{entry_id}", response_model=JournalEntryResponse)
async def update_journal_entry(
    entry_id: int,
    entry_data: JournalEntryUpdate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Update a journal entry"""
    entry = CoachingService.update_journal_entry(db, entry_id, entry_data)

    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    # Check ownership
    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    return entry


@router.delete("/journal/{entry_id}", status_code=204)
async def delete_journal_entry(
    entry_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Delete a journal entry"""
    # First, get the entry to check ownership
    from app.models.coaching import JournalEntry

    entry = db.query(JournalEntry).filter(JournalEntry.id == entry_id).first()

    if not entry:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    if entry.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")

    success = CoachingService.delete_journal_entry(db, entry_id)

    if not success:
        raise HTTPException(status_code=404, detail="Journal entry not found")

    return None


@router.get("/journal/stats/me", response_model=JournalStats)
async def get_my_journal_stats(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's journal statistics"""
    stats = CoachingService.get_journal_stats(db, current_user.id, days=days)
    return stats


@router.get("/journal/stats/user/{user_id}", response_model=JournalStats)
async def get_user_journal_stats(
    user_id: int,
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get user's journal statistics (coaches/managers only)"""
    stats = CoachingService.get_journal_stats(db, user_id, days=days)
    return stats


# ========== Goals ==========

@router.post("/goals", response_model=GoalResponse, status_code=201)
async def create_goal(
    goal_data: GoalCreate,
    user_id: Optional[int] = Query(None, description="User ID (coaches/managers only)"),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Create a new goal

    - Players can create their own goals
    - Coaches/managers can create goals for any user
    """
    # Determine target user
    target_user_id = user_id if user_id else current_user.id

    # Check permissions
    if target_user_id != current_user.id:
        if current_user.role not in [UserRole.COACH, UserRole.MANAGER]:
            raise HTTPException(
                status_code=403, detail="Only coaches/managers can create goals for other users"
            )

    goal = CoachingService.create_goal(
        db, goal_data, target_user_id, created_by_id=current_user.id
    )
    return goal


@router.get("/goals/me", response_model=list[GoalResponse])
async def get_my_goals(
    is_completed: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's goals"""
    goals = CoachingService.get_goals(
        db, current_user.id, is_completed=is_completed, category=category
    )
    return goals


@router.get("/goals/user/{user_id}", response_model=list[GoalResponse])
async def get_user_goals(
    user_id: int,
    is_completed: Optional[bool] = Query(None),
    category: Optional[str] = Query(None),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get user's goals (coaches/managers only)"""
    goals = CoachingService.get_goals(
        db, user_id, is_completed=is_completed, category=category
    )
    return goals


@router.put("/goals/{goal_id}", response_model=GoalResponse)
async def update_goal(
    goal_id: int,
    goal_data: GoalUpdate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Update a goal"""
    from app.models.coaching import Goal

    goal = db.query(Goal).filter(Goal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Check permissions (owner or coach/manager)
    is_owner = goal.user_id == current_user.id
    is_coach_or_manager = current_user.role in [UserRole.COACH, UserRole.MANAGER]

    if not (is_owner or is_coach_or_manager):
        raise HTTPException(status_code=403, detail="Access denied")

    updated_goal = CoachingService.update_goal(db, goal_id, goal_data)

    return updated_goal


@router.delete("/goals/{goal_id}", status_code=204)
async def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Delete a goal"""
    from app.models.coaching import Goal

    goal = db.query(Goal).filter(Goal.id == goal_id).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    # Check permissions (owner or coach/manager)
    is_owner = goal.user_id == current_user.id
    is_coach_or_manager = current_user.role in [UserRole.COACH, UserRole.MANAGER]

    if not (is_owner or is_coach_or_manager):
        raise HTTPException(status_code=403, detail="Access denied")

    success = CoachingService.delete_goal(db, goal_id)

    if not success:
        raise HTTPException(status_code=404, detail="Goal not found")

    return None


@router.get("/goals/stats/me", response_model=GoalStats)
async def get_my_goal_stats(
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get current user's goal statistics"""
    stats = CoachingService.get_goal_stats(db, current_user.id)
    return stats


@router.get("/goals/stats/user/{user_id}", response_model=GoalStats)
async def get_user_goal_stats(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Get user's goal statistics (coaches/managers only)"""
    stats = CoachingService.get_goal_stats(db, user_id)
    return stats
