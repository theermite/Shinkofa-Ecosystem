"""
Tactical Formation routes - API endpoints for coach strategy board
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_, any_

from app.core.database import get_db
from app.models.tactical_formation import TacticalFormation
from app.schemas.tactical_formation import (
    TacticalFormationCreate,
    TacticalFormationUpdate,
    TacticalFormationResponse,
    ShareFormationRequest,
    FormationCategory,
    MapType
)
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/", status_code=status.HTTP_201_CREATED, response_model=TacticalFormationResponse)
async def create_formation(
    formation_data: TacticalFormationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Create a new tactical formation

    Args:
        formation_data: Formation creation data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Created formation
    """
    formation = TacticalFormation(
        name=formation_data.name,
        description=formation_data.description,
        map_type=formation_data.map_type,
        formation_data=formation_data.formation_data.model_dump(),
        tags=formation_data.tags,
        category=formation_data.category,
        created_by=current_user.id,
        team_id=formation_data.team_id
    )

    db.add(formation)
    db.commit()
    db.refresh(formation)

    return formation


@router.get("/", response_model=List[TacticalFormationResponse])
async def list_formations(
    category: Optional[FormationCategory] = Query(None, description="Filter by category"),
    team_id: Optional[int] = Query(None, description="Filter by team"),
    map_type: Optional[MapType] = Query(None, description="Filter by map type"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    List tactical formations accessible to the user

    Returns formations created by user, shared with user, or public
    """
    query = db.query(TacticalFormation).filter(
        or_(
            TacticalFormation.created_by == current_user.id,
            TacticalFormation.is_public == True,
            TacticalFormation.shared_with.any(current_user.id)
        )
    )

    # Apply filters
    if category:
        query = query.filter(TacticalFormation.category == category)

    if team_id:
        query = query.filter(TacticalFormation.team_id == team_id)

    if map_type:
        query = query.filter(TacticalFormation.map_type == map_type)

    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            or_(
                TacticalFormation.name.ilike(search_pattern),
                TacticalFormation.description.ilike(search_pattern)
            )
        )

    formations = query.order_by(TacticalFormation.updated_at.desc()).all()
    return formations


@router.get("/{formation_id}", response_model=TacticalFormationResponse)
async def get_formation(
    formation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Get a specific tactical formation

    Args:
        formation_id: Formation ID
        db: Database session
        current_user: Current authenticated user

    Returns:
        Formation details

    Raises:
        HTTPException: If formation not found or user doesn't have access
    """
    formation = db.query(TacticalFormation).filter(TacticalFormation.id == formation_id).first()

    if not formation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation not found"
        )

    # Check access
    if not formation.is_accessible_by(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this formation"
        )

    # Increment view count
    formation.views_count += 1
    db.commit()

    return formation


@router.put("/{formation_id}", response_model=TacticalFormationResponse)
async def update_formation(
    formation_id: int,
    update_data: TacticalFormationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Update a tactical formation

    Only the creator can update a formation

    Args:
        formation_id: Formation ID
        update_data: Update data
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated formation

    Raises:
        HTTPException: If formation not found or user is not the creator
    """
    formation = db.query(TacticalFormation).filter(TacticalFormation.id == formation_id).first()

    if not formation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation not found"
        )

    # Only creator can update
    if formation.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can update this formation"
        )

    # Update fields
    if update_data.name is not None:
        formation.name = update_data.name

    if update_data.description is not None:
        formation.description = update_data.description

    if update_data.formation_data is not None:
        formation.formation_data = update_data.formation_data.model_dump()

    if update_data.tags is not None:
        formation.tags = update_data.tags

    if update_data.category is not None:
        formation.category = update_data.category

    db.commit()
    db.refresh(formation)

    return formation


@router.delete("/{formation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_formation(
    formation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Delete a tactical formation

    Only the creator can delete a formation

    Args:
        formation_id: Formation ID
        db: Database session
        current_user: Current authenticated user

    Raises:
        HTTPException: If formation not found or user is not the creator
    """
    formation = db.query(TacticalFormation).filter(TacticalFormation.id == formation_id).first()

    if not formation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation not found"
        )

    # Only creator can delete
    if formation.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can delete this formation"
        )

    db.delete(formation)
    db.commit()

    return None


@router.post("/{formation_id}/share", response_model=TacticalFormationResponse)
async def share_formation(
    formation_id: int,
    share_data: ShareFormationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Share a tactical formation with team members or make it public

    Only the creator can share a formation

    Args:
        formation_id: Formation ID
        share_data: Share configuration
        db: Database session
        current_user: Current authenticated user

    Returns:
        Updated formation

    Raises:
        HTTPException: If formation not found or user is not the creator
    """
    formation = db.query(TacticalFormation).filter(TacticalFormation.id == formation_id).first()

    if not formation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation not found"
        )

    # Only creator can share
    if formation.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the creator can share this formation"
        )

    # Update sharing settings
    if share_data.make_public:
        formation.is_public = True

    if share_data.user_ids:
        # Add user IDs to shared_with (avoid duplicates)
        current_shared = formation.shared_with or []
        new_shared = list(set(current_shared + share_data.user_ids))
        formation.shared_with = new_shared

    # TODO: If team_id provided, get all team member IDs and add to shared_with
    # Requires teams table implementation

    db.commit()
    db.refresh(formation)

    return formation


@router.post("/{formation_id}/duplicate", response_model=TacticalFormationResponse)
async def duplicate_formation(
    formation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """
    Duplicate a tactical formation for editing

    Creates a copy of the formation owned by the current user

    Args:
        formation_id: Formation ID to duplicate
        db: Database session
        current_user: Current authenticated user

    Returns:
        New duplicated formation

    Raises:
        HTTPException: If formation not found or user doesn't have access
    """
    original = db.query(TacticalFormation).filter(TacticalFormation.id == formation_id).first()

    if not original:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Formation not found"
        )

    # Check access
    if not original.is_accessible_by(current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to access this formation"
        )

    # Create duplicate
    duplicate = TacticalFormation(
        name=f"{original.name} (Copy)",
        description=original.description,
        map_type=original.map_type,
        formation_data=original.formation_data,
        tags=original.tags,
        category=original.category,
        created_by=current_user.id,
        team_id=original.team_id,
        is_public=False,  # Duplicates start private
        shared_with=[]
    )

    db.add(duplicate)
    db.commit()
    db.refresh(duplicate)

    return duplicate
