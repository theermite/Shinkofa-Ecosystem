"""
Widget Data endpoints - Multi-device sync for widgets
Shinkofa Platform - Planner
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from app.core.database import get_db
from app.models.widget_data import WidgetData
from app.schemas.widget_data import WidgetData as WidgetDataSchema, WidgetDataUpdate
from app.utils.auth import get_current_user_id

router = APIRouter(prefix="/v1/widget-data", tags=["widget-data"])


@router.get("/{widget_slug}/{target_user_id}", response_model=WidgetDataSchema | None)
def get_widget_data(
    widget_slug: str,
    target_user_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Get widget data for a specific widget and user.

    Users can only access their own widget data.
    Returns null if no data exists (widget never synced).
    """
    # Security check: users can only access their own data
    if user_id != target_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own widget data"
        )

    widget_data = (
        db.query(WidgetData)
        .filter(WidgetData.user_id == user_id, WidgetData.widget_slug == widget_slug)
        .first()
    )

    return widget_data


@router.put("/{widget_slug}/{target_user_id}", response_model=WidgetDataSchema)
def update_widget_data(
    widget_slug: str,
    target_user_id: str,
    data_update: WidgetDataUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db),
):
    """
    Create or update widget data for a specific widget and user.

    Users can only update their own widget data.
    Uses upsert logic (create if doesn't exist, update if exists).
    """
    # Security check: users can only update their own data
    if user_id != target_user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own widget data"
        )

    # Try to find existing widget data
    widget_data = (
        db.query(WidgetData)
        .filter(WidgetData.user_id == user_id, WidgetData.widget_slug == widget_slug)
        .first()
    )

    if widget_data:
        # Update existing
        widget_data.data = data_update.data
    else:
        # Create new
        widget_data = WidgetData(
            id=f"widget-data-{uuid.uuid4()}",
            user_id=user_id,
            widget_slug=widget_slug,
            data=data_update.data,
        )
        db.add(widget_data)

    db.commit()
    db.refresh(widget_data)

    return widget_data
