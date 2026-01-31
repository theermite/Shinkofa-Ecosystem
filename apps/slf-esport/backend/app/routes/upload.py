"""
File upload routes - Avatar upload with size and format validation
"""

import os
import uuid
from typing import Optional
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from PIL import Image
import io

from app.core.database import get_db
from app.utils.dependencies import get_current_active_user
from app.models.user import User
from app.services.user_service import UserService
from app.schemas.user import UserResponse

router = APIRouter()

# Configuration
UPLOAD_DIR = Path("/app/uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FORMATS = {"jpg", "jpeg", "png", "webp"}


def validate_image(file: UploadFile) -> None:
    """
    Validate uploaded image file

    Args:
        file: Uploaded file

    Raises:
        HTTPException: If file is invalid
    """
    # Check file extension
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename is required"
        )

    ext = file.filename.split(".")[-1].lower()
    if ext not in ALLOWED_FORMATS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Format non supporté. Formats autorisés : {', '.join(ALLOWED_FORMATS)}"
        )

    # Check file size
    file.file.seek(0, 2)  # Seek to end
    file_size = file.file.tell()
    file.file.seek(0)  # Reset to beginning

    if file_size > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Fichier trop volumineux. Taille maximum : {MAX_FILE_SIZE / (1024*1024):.0f}MB"
        )

    # Validate it's actually an image
    try:
        contents = file.file.read()
        file.file.seek(0)
        Image.open(io.BytesIO(contents))
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Le fichier n'est pas une image valide"
        )


@router.post("/avatar", response_model=UserResponse)
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Upload user avatar image

    Args:
        file: Image file (jpg, png, webp, max 10MB)
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user with new avatar URL

    Raises:
        HTTPException: If file is invalid or upload fails
    """
    # Validate image
    validate_image(file)

    # Generate unique filename
    ext = file.filename.split(".")[-1].lower()
    filename = f"{uuid.uuid4()}.{ext}"
    filepath = UPLOAD_DIR / filename

    # Delete old avatar if exists
    if current_user.avatar_url:
        old_filename = current_user.avatar_url.split("/")[-1]
        old_filepath = UPLOAD_DIR / old_filename
        if old_filepath.exists():
            old_filepath.unlink()

    # Save file
    try:
        contents = await file.read()
        with open(filepath, "wb") as f:
            f.write(contents)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur lors de l'upload : {str(e)}"
        )

    # Update user avatar URL
    avatar_url = f"/uploads/avatars/{filename}"
    current_user.avatar_url = avatar_url
    db.commit()
    db.refresh(current_user)

    return current_user


@router.delete("/avatar", response_model=UserResponse)
async def delete_avatar(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Delete user avatar

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user with avatar removed
    """
    if not current_user.avatar_url:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aucun avatar à supprimer"
        )

    # Delete file
    filename = current_user.avatar_url.split("/")[-1]
    filepath = UPLOAD_DIR / filename
    if filepath.exists():
        filepath.unlink()

    # Remove from database
    current_user.avatar_url = None
    db.commit()
    db.refresh(current_user)

    return current_user
