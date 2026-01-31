"""
Media schemas - Pydantic validation for media library
"""

from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.models.media import MediaType, MediaCategory


# ========== Media Schemas ==========

class MediaBase(BaseModel):
    """Base media schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    media_type: MediaType
    category: MediaCategory
    file_url: str
    file_name: str
    file_size: Optional[int] = None
    mime_type: Optional[str] = None
    duration_seconds: Optional[int] = None
    thumbnail_url: Optional[str] = None
    is_public: bool = False
    tags: Optional[str] = None


class MediaCreate(MediaBase):
    """Schema for creating media"""
    pass


class MediaUpdate(BaseModel):
    """Schema for updating media"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    category: Optional[MediaCategory] = None
    is_public: Optional[bool] = None
    tags: Optional[str] = None


class MediaResponse(MediaBase):
    """Schema for media response"""
    id: int
    uploaded_by_id: int
    view_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class MediaListResponse(BaseModel):
    """Schema for media list with pagination"""
    total: int
    media: List[MediaResponse]
    page: int
    page_size: int


# ========== Playlist Schemas ==========

class PlaylistBase(BaseModel):
    """Base playlist schema"""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    is_public: bool = False


class PlaylistCreate(PlaylistBase):
    """Schema for creating a playlist"""
    media_ids: Optional[List[int]] = Field(default_factory=list)


class PlaylistUpdate(BaseModel):
    """Schema for updating a playlist"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    is_public: Optional[bool] = None


class PlaylistMediaItem(BaseModel):
    """Schema for playlist media item"""
    id: int
    media_id: int
    order: int
    media: MediaResponse

    class Config:
        from_attributes = True


class PlaylistResponse(PlaylistBase):
    """Schema for playlist response"""
    id: int
    created_by_id: int
    created_at: datetime
    updated_at: datetime
    media_items: List[PlaylistMediaItem] = []

    class Config:
        from_attributes = True


# ========== File Upload ==========

class FileUploadResponse(BaseModel):
    """Schema for file upload response"""
    file_url: str
    file_name: str
    file_size: int
    mime_type: str
