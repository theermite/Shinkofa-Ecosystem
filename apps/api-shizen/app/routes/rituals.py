"""
Rituals CRUD endpoints
Shinkofa Platform - Planner
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid

from app.core.database import get_db
from app.models.ritual import Ritual
from app.schemas.ritual import Ritual as RitualSchema, RitualCreate, RitualUpdate
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/rituals", tags=["rituals"])


@router.get("", response_model=List[RitualSchema])
def get_rituals(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
    category: str = None,
):
    """
    Get all rituals for current user

    Query params:
    - category: Filter by category (morning, evening, daily, custom)
    """
    query = db.query(Ritual).filter(Ritual.user_id == user_id)

    if category:
        query = query.filter(Ritual.category == category)

    return query.order_by(Ritual.order, Ritual.label).all()


@router.get("/{ritual_id}", response_model=RitualSchema)
def get_ritual(
    ritual_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Get a single ritual by ID"""
    ritual = (
        db.query(Ritual)
        .filter(Ritual.id == ritual_id, Ritual.user_id == user_id)
        .first()
    )

    if not ritual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ritual {ritual_id} not found",
        )

    return ritual


@router.post("", response_model=RitualSchema, status_code=status.HTTP_201_CREATED)
def create_ritual(
    ritual_data: RitualCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Create a new ritual"""
    new_ritual = Ritual(
        id=f"ritual-{uuid.uuid4()}",
        user_id=user_id,
        **ritual_data.model_dump(),
    )

    db.add(new_ritual)
    db.commit()
    db.refresh(new_ritual)

    return new_ritual


@router.put("/{ritual_id}", response_model=RitualSchema)
def update_ritual(
    ritual_id: str,
    ritual_update: RitualUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Update an existing ritual"""
    ritual = (
        db.query(Ritual)
        .filter(Ritual.id == ritual_id, Ritual.user_id == user_id)
        .first()
    )

    if not ritual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ritual {ritual_id} not found",
        )

    # Update only provided fields
    update_data = ritual_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(ritual, field, value)

    db.commit()
    db.refresh(ritual)

    return ritual


@router.delete("/{ritual_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_ritual(
    ritual_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Delete a ritual"""
    ritual = (
        db.query(Ritual)
        .filter(Ritual.id == ritual_id, Ritual.user_id == user_id)
        .first()
    )

    if not ritual:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ritual {ritual_id} not found",
        )

    db.delete(ritual)
    db.commit()

    return None


@router.post("/reset", status_code=status.HTTP_200_OK)
def reset_rituals(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """Reset all rituals (mark as not completed)"""
    db.query(Ritual).filter(Ritual.user_id == user_id).update({"completed_today": False})
    db.commit()

    return {"message": "All rituals reset successfully"}
