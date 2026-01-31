"""
Media models - Media library for videos, audio, documents
"""

from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, BigInteger
from sqlalchemy.orm import relationship
from .base import BaseModel


class MediaType(str, PyEnum):
    """Types of media"""
    VIDEO = "video"
    AUDIO = "audio"
    DOCUMENT = "document"
    IMAGE = "image"


class MediaCategory(str, PyEnum):
    """Media categories"""
    MEDITATION = "meditation"
    COACHING = "coaching"
    REPLAY = "replay"
    TUTORIAL = "tutorial"
    STRATEGY = "strategy"
    OTHER = "other"


class Media(BaseModel):
    """Media file model"""
    __tablename__ = "media"

    # Basic info
    title = Column(String(200), nullable=False)
    description = Column(Text)
    media_type = Column(Enum(MediaType), nullable=False)
    category = Column(Enum(MediaCategory), nullable=False)

    # File information
    file_url = Column(String(500), nullable=False)  # URL to the file (could be S3, local, etc.)
    file_name = Column(String(255), nullable=False)
    file_size = Column(BigInteger)  # Size in bytes
    mime_type = Column(String(100))  # video/mp4, audio/mpeg, application/pdf, etc.
    duration_seconds = Column(Integer)  # For audio/video

    # Thumbnail for videos/images
    thumbnail_url = Column(String(500))

    # Metadata
    uploaded_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)  # Public to all users
    view_count = Column(Integer, default=0)

    # Tags as JSON array
    tags = Column(Text)  # Comma-separated tags

    # Relationships
    uploaded_by = relationship("User", backref="uploaded_media")
    playlists = relationship("PlaylistMedia", back_populates="media", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Media(id={self.id}, title='{self.title}', type={self.media_type})>"


class Playlist(BaseModel):
    """Playlist model for organizing media"""
    __tablename__ = "playlists"

    # Basic info
    title = Column(String(200), nullable=False)
    description = Column(Text)

    # Owner
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    is_public = Column(Boolean, default=False)

    # Relationships
    created_by = relationship("User", backref="playlists")
    media_items = relationship("PlaylistMedia", back_populates="playlist", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Playlist(id={self.id}, title='{self.title}')>"


class PlaylistMedia(BaseModel):
    """Many-to-many relationship between playlists and media"""
    __tablename__ = "playlist_media"

    playlist_id = Column(Integer, ForeignKey("playlists.id"), nullable=False)
    media_id = Column(Integer, ForeignKey("media.id"), nullable=False)
    order = Column(Integer, default=0)  # Order in playlist

    # Relationships
    playlist = relationship("Playlist", back_populates="media_items")
    media = relationship("Media", back_populates="playlists")

    def __repr__(self):
        return f"<PlaylistMedia(playlist_id={self.playlist_id}, media_id={self.media_id})>"
