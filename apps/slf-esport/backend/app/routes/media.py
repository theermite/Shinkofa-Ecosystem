"""
Media routes - Media library with file upload
"""

import os
import shutil
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session as DBSession

from app.core.database import get_db
from app.core.config import settings
from app.models.user import User, UserRole
from app.models.media import MediaType, MediaCategory
from app.schemas.media import (
    MediaCreate,
    MediaUpdate,
    MediaResponse,
    MediaListResponse,
    PlaylistCreate,
    PlaylistUpdate,
    PlaylistResponse,
    FileUploadResponse,
)
from app.services.media_service import MediaService
from app.utils.dependencies import get_current_user, require_role


router = APIRouter(tags=["media"])


# File upload directory (for MVP - local storage)
# In production, you'd use S3 or similar
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "../../uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)


# ========== File Upload ==========

@router.post("/upload", response_model=FileUploadResponse)
async def upload_file(
    file: UploadFile = File(...),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
):
    """
    Upload a media file (coaches/managers only)

    - Supports: videos (mp4, webm), audio (mp3, wav), documents (pdf), images (jpg, png)
    - Max size: 500MB (configurable)
    """
    # Validate file type
    allowed_mime_types = [
        "video/mp4",
        "video/webm",
        "audio/mpeg",
        "audio/wav",
        "audio/mp3",
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/jpg",
    ]

    if file.content_type not in allowed_mime_types:
        raise HTTPException(
            status_code=400,
            detail=f"File type {file.content_type} not allowed. Allowed types: {', '.join(allowed_mime_types)}",
        )

    # Generate unique filename
    timestamp = int(datetime.now().timestamp())
    safe_filename = file.filename.replace(" ", "_")
    unique_filename = f"{timestamp}_{safe_filename}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)

    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

    # Get file size
    file_size = os.path.getsize(file_path)

    # Generate file URL (for MVP, local path; in production, use CDN URL)
    file_url = f"/uploads/{unique_filename}"

    return FileUploadResponse(
        file_url=file_url,
        file_name=safe_filename,
        file_size=file_size,
        mime_type=file.content_type,
    )


# ========== Media CRUD ==========

@router.post("", response_model=MediaResponse, status_code=201)
async def create_media(
    media_data: MediaCreate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """
    Create a new media entry (coaches/managers only)

    After uploading a file, create a media entry with metadata
    """
    media = MediaService.create_media(db, media_data, current_user.id)
    return media


@router.get("", response_model=MediaListResponse)
async def get_media(
    media_type: Optional[MediaType] = Query(None),
    category: Optional[MediaCategory] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """
    Get media library

    - Players can see public media and their own uploads
    - Coaches/managers can see all media
    """
    skip = (page - 1) * page_size

    # Filter by access rights
    is_public = None if current_user.role in [UserRole.COACH, UserRole.MANAGER] else True

    media, total = MediaService.get_media(
        db,
        media_type=media_type,
        category=category,
        is_public=is_public,
        search=search,
        skip=skip,
        limit=page_size,
    )

    return MediaListResponse(
        total=total,
        media=media,
        page=page,
        page_size=page_size,
    )


@router.get("/{media_id}", response_model=MediaResponse)
async def get_media_by_id(
    media_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get media by ID"""
    media = MediaService.get_media_by_id(db, media_id)

    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Check access rights
    if not media.is_public and current_user.role == UserRole.JOUEUR:
        if media.uploaded_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Increment view count
    MediaService.increment_view_count(db, media_id)

    return media


@router.put("/{media_id}", response_model=MediaResponse)
async def update_media(
    media_id: int,
    media_data: MediaUpdate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Update media metadata (coaches/managers only)"""
    media = MediaService.update_media(db, media_id, media_data)

    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    return media


@router.delete("/{media_id}", status_code=204)
async def delete_media(
    media_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: DBSession = Depends(get_db),
):
    """Delete media (coaches/managers only)"""
    media = MediaService.get_media_by_id(db, media_id)

    if not media:
        raise HTTPException(status_code=404, detail="Media not found")

    # Delete file from disk
    if media.file_url.startswith("/uploads/"):
        file_path = os.path.join(UPLOAD_DIR, media.file_url.split("/")[-1])
        if os.path.exists(file_path):
            os.remove(file_path)

    success = MediaService.delete_media(db, media_id)

    if not success:
        raise HTTPException(status_code=404, detail="Media not found")

    return None


# ========== Playlists ==========

@router.post("/playlists", response_model=PlaylistResponse, status_code=201)
async def create_playlist(
    playlist_data: PlaylistCreate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Create a new playlist"""
    playlist = MediaService.create_playlist(db, playlist_data, current_user.id)
    return playlist


@router.get("/playlists", response_model=list[PlaylistResponse])
async def get_playlists(
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get playlists"""
    skip = (page - 1) * page_size

    # Filter: coaches/managers see all, players see public + their own
    is_public = None if current_user.role in [UserRole.COACH, UserRole.MANAGER] else True

    playlists, total = MediaService.get_playlists(
        db,
        is_public=is_public,
        skip=skip,
        limit=page_size,
    )

    return playlists


@router.get("/playlists/{playlist_id}", response_model=PlaylistResponse)
async def get_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Get playlist by ID"""
    playlist = MediaService.get_playlist_by_id(db, playlist_id)

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check access rights
    if not playlist.is_public and current_user.role == UserRole.JOUEUR:
        if playlist.created_by_id != current_user.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return playlist


@router.put("/playlists/{playlist_id}", response_model=PlaylistResponse)
async def update_playlist(
    playlist_id: int,
    playlist_data: PlaylistUpdate,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Update playlist"""
    playlist = MediaService.get_playlist_by_id(db, playlist_id)

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check permissions
    if playlist.created_by_id != current_user.id and current_user.role not in [
        UserRole.COACH,
        UserRole.MANAGER,
    ]:
        raise HTTPException(status_code=403, detail="Access denied")

    updated_playlist = MediaService.update_playlist(db, playlist_id, playlist_data)

    return updated_playlist


@router.delete("/playlists/{playlist_id}", status_code=204)
async def delete_playlist(
    playlist_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Delete playlist"""
    playlist = MediaService.get_playlist_by_id(db, playlist_id)

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check permissions
    if playlist.created_by_id != current_user.id and current_user.role not in [
        UserRole.COACH,
        UserRole.MANAGER,
    ]:
        raise HTTPException(status_code=403, detail="Access denied")

    success = MediaService.delete_playlist(db, playlist_id)

    if not success:
        raise HTTPException(status_code=404, detail="Playlist not found")

    return None


@router.post("/playlists/{playlist_id}/media/{media_id}", status_code=201)
async def add_media_to_playlist(
    playlist_id: int,
    media_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Add media to playlist"""
    playlist = MediaService.get_playlist_by_id(db, playlist_id)

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check permissions
    if playlist.created_by_id != current_user.id and current_user.role not in [
        UserRole.COACH,
        UserRole.MANAGER,
    ]:
        raise HTTPException(status_code=403, detail="Access denied")

    MediaService.add_media_to_playlist(db, playlist_id, media_id)

    return {"message": "Media added to playlist"}


@router.delete("/playlists/{playlist_id}/media/{media_id}", status_code=204)
async def remove_media_from_playlist(
    playlist_id: int,
    media_id: int,
    current_user: User = Depends(get_current_user),
    db: DBSession = Depends(get_db),
):
    """Remove media from playlist"""
    playlist = MediaService.get_playlist_by_id(db, playlist_id)

    if not playlist:
        raise HTTPException(status_code=404, detail="Playlist not found")

    # Check permissions
    if playlist.created_by_id != current_user.id and current_user.role not in [
        UserRole.COACH,
        UserRole.MANAGER,
    ]:
        raise HTTPException(status_code=403, detail="Access denied")

    success = MediaService.remove_media_from_playlist(db, playlist_id, media_id)

    if not success:
        raise HTTPException(status_code=404, detail="Media not found in playlist")

    return None
