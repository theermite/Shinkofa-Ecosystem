"""
Daily Journals CRUD endpoints
Shinkofa Platform - Planner
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import date
import uuid

from app.core.database import get_db
from app.models.journal import DailyJournal
from app.schemas.journal import (
    DailyJournal as JournalSchema,
    DailyJournalCreate,
    DailyJournalUpdate,
)
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/journals", tags=["journals"])


@router.get("", response_model=List[JournalSchema])
def get_journals(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    limit: int = 30,
):
    """
    Get all daily journals for current user

    Query params:
    - limit: Maximum number of journals to return (default 30)
    """
    return (
        db.query(DailyJournal)
        .filter(DailyJournal.user_id == user_id)
        .order_by(DailyJournal.date.desc())
        .limit(limit)
        .all()
    )


@router.get("/date/{journal_date}", response_model=JournalSchema | None)
def get_journal_by_date(
    journal_date: date,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get journal for a specific date.
    Returns null if no journal exists for this date (allowing frontend to create one).
    """
    journal = (
        db.query(DailyJournal)
        .filter(DailyJournal.date == journal_date, DailyJournal.user_id == user_id)
        .first()
    )

    # Return null instead of 404 if journal doesn't exist
    # This allows frontend to display empty journal or create new one
    return journal


@router.get("/{journal_id}", response_model=JournalSchema)
def get_journal(
    journal_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a journal by ID"""
    journal = (
        db.query(DailyJournal)
        .filter(DailyJournal.id == journal_id, DailyJournal.user_id == user_id)
        .first()
    )

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal {journal_id} not found",
        )

    return journal


@router.post("", response_model=JournalSchema, status_code=status.HTTP_201_CREATED)
def create_journal(
    journal_data: DailyJournalCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new daily journal"""
    # Check if journal already exists for this date
    existing = (
        db.query(DailyJournal)
        .filter(
            DailyJournal.date == journal_data.date, DailyJournal.user_id == user_id
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Journal for date {journal_data.date} already exists",
        )

    new_journal = DailyJournal(
        id=f"journal-{uuid.uuid4()}",
        user_id=user_id,
        **journal_data.model_dump(),
    )

    db.add(new_journal)
    db.commit()
    db.refresh(new_journal)

    return new_journal


@router.put("/date/{journal_date}", response_model=JournalSchema)
def upsert_journal_by_date(
    journal_date: date,
    journal_update: DailyJournalUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Create or update journal for a specific date (upsert).
    Convenient endpoint for saving journal without checking if it exists.
    """
    # Try to find existing journal
    journal = (
        db.query(DailyJournal)
        .filter(DailyJournal.date == journal_date, DailyJournal.user_id == user_id)
        .first()
    )

    if journal:
        # Update existing journal
        update_data = journal_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(journal, field, value)
    else:
        # Create new journal
        journal_data = journal_update.model_dump(exclude_unset=True)
        journal_data['date'] = journal_date
        journal = DailyJournal(
            id=f"journal-{uuid.uuid4()}",
            user_id=user_id,
            **journal_data,
        )
        db.add(journal)

    db.commit()
    db.refresh(journal)

    return journal


@router.put("/{journal_id}", response_model=JournalSchema)
def update_journal(
    journal_id: str,
    journal_update: DailyJournalUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update an existing journal by ID"""
    journal = (
        db.query(DailyJournal)
        .filter(DailyJournal.id == journal_id, DailyJournal.user_id == user_id)
        .first()
    )

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal {journal_id} not found",
        )

    # Update only provided fields
    update_data = journal_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(journal, field, value)

    db.commit()
    db.refresh(journal)

    return journal


@router.delete("/{journal_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_journal(
    journal_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a journal"""
    journal = (
        db.query(DailyJournal)
        .filter(DailyJournal.id == journal_id, DailyJournal.user_id == user_id)
        .first()
    )

    if not journal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Journal {journal_id} not found",
        )

    db.delete(journal)
    db.commit()

    return None
