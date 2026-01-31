"""
Media service - Business logic for media library
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func, desc
from app.models.media import Media, Playlist, PlaylistMedia, MediaType, MediaCategory
from app.schemas.media import MediaCreate, MediaUpdate, PlaylistCreate, PlaylistUpdate


class MediaService:
    """Service for managing media library"""

    # ========== Media ==========

    @staticmethod
    def create_media(db: Session, media_data: MediaCreate, uploaded_by_id: int) -> Media:
        """Create a new media item"""
        media = Media(
            title=media_data.title,
            description=media_data.description,
            media_type=media_data.media_type,
            category=media_data.category,
            file_url=media_data.file_url,
            file_name=media_data.file_name,
            file_size=media_data.file_size,
            mime_type=media_data.mime_type,
            duration_seconds=media_data.duration_seconds,
            thumbnail_url=media_data.thumbnail_url,
            is_public=media_data.is_public,
            tags=media_data.tags,
            uploaded_by_id=uploaded_by_id,
            view_count=0,
        )

        db.add(media)
        db.commit()
        db.refresh(media)

        return media

    @staticmethod
    def get_media(
        db: Session,
        media_type: Optional[MediaType] = None,
        category: Optional[MediaCategory] = None,
        is_public: Optional[bool] = None,
        uploaded_by_id: Optional[int] = None,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[Media], int]:
        """Get media with filters"""
        query = db.query(Media)

        if media_type:
            query = query.filter(Media.media_type == media_type)

        if category:
            query = query.filter(Media.category == category)

        if is_public is not None:
            query = query.filter(Media.is_public == is_public)

        if uploaded_by_id:
            query = query.filter(Media.uploaded_by_id == uploaded_by_id)

        if search:
            search_term = f"%{search}%"
            query = query.filter(
                or_(
                    Media.title.ilike(search_term),
                    Media.description.ilike(search_term),
                    Media.tags.ilike(search_term),
                )
            )

        total = query.count()

        media = query.order_by(desc(Media.created_at)).offset(skip).limit(limit).all()

        return media, total

    @staticmethod
    def get_media_by_id(db: Session, media_id: int) -> Optional[Media]:
        """Get media by ID"""
        return db.query(Media).filter(Media.id == media_id).first()

    @staticmethod
    def update_media(db: Session, media_id: int, media_data: MediaUpdate) -> Optional[Media]:
        """Update media"""
        media = MediaService.get_media_by_id(db, media_id)

        if not media:
            return None

        update_data = media_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(media, field, value)

        db.commit()
        db.refresh(media)

        return media

    @staticmethod
    def delete_media(db: Session, media_id: int) -> bool:
        """Delete media"""
        media = MediaService.get_media_by_id(db, media_id)

        if not media:
            return False

        db.delete(media)
        db.commit()

        return True

    @staticmethod
    def increment_view_count(db: Session, media_id: int) -> Optional[Media]:
        """Increment view count for a media item"""
        media = MediaService.get_media_by_id(db, media_id)

        if not media:
            return None

        media.view_count += 1
        db.commit()
        db.refresh(media)

        return media

    # ========== Playlists ==========

    @staticmethod
    def create_playlist(
        db: Session, playlist_data: PlaylistCreate, created_by_id: int
    ) -> Playlist:
        """Create a new playlist"""
        playlist = Playlist(
            title=playlist_data.title,
            description=playlist_data.description,
            is_public=playlist_data.is_public,
            created_by_id=created_by_id,
        )

        db.add(playlist)
        db.flush()  # Get playlist ID

        # Add media items to playlist
        if playlist_data.media_ids:
            for order, media_id in enumerate(playlist_data.media_ids):
                playlist_media = PlaylistMedia(
                    playlist_id=playlist.id,
                    media_id=media_id,
                    order=order,
                )
                db.add(playlist_media)

        db.commit()
        db.refresh(playlist)

        return playlist

    @staticmethod
    def get_playlists(
        db: Session,
        created_by_id: Optional[int] = None,
        is_public: Optional[bool] = None,
        skip: int = 0,
        limit: int = 50,
    ) -> tuple[List[Playlist], int]:
        """Get playlists with filters"""
        query = db.query(Playlist).options(joinedload(Playlist.media_items))

        if created_by_id:
            query = query.filter(Playlist.created_by_id == created_by_id)

        if is_public is not None:
            query = query.filter(Playlist.is_public == is_public)

        total = query.count()

        playlists = query.order_by(desc(Playlist.created_at)).offset(skip).limit(limit).all()

        return playlists, total

    @staticmethod
    def get_playlist_by_id(db: Session, playlist_id: int) -> Optional[Playlist]:
        """Get playlist by ID with media items"""
        return (
            db.query(Playlist)
            .options(joinedload(Playlist.media_items))
            .filter(Playlist.id == playlist_id)
            .first()
        )

    @staticmethod
    def update_playlist(
        db: Session, playlist_id: int, playlist_data: PlaylistUpdate
    ) -> Optional[Playlist]:
        """Update playlist"""
        playlist = MediaService.get_playlist_by_id(db, playlist_id)

        if not playlist:
            return None

        update_data = playlist_data.model_dump(exclude_unset=True)

        for field, value in update_data.items():
            setattr(playlist, field, value)

        db.commit()
        db.refresh(playlist)

        return playlist

    @staticmethod
    def delete_playlist(db: Session, playlist_id: int) -> bool:
        """Delete playlist"""
        playlist = MediaService.get_playlist_by_id(db, playlist_id)

        if not playlist:
            return False

        db.delete(playlist)
        db.commit()

        return True

    @staticmethod
    def add_media_to_playlist(db: Session, playlist_id: int, media_id: int) -> Optional[PlaylistMedia]:
        """Add media to playlist"""
        # Check if already in playlist
        existing = (
            db.query(PlaylistMedia)
            .filter(
                and_(
                    PlaylistMedia.playlist_id == playlist_id,
                    PlaylistMedia.media_id == media_id,
                )
            )
            .first()
        )

        if existing:
            return existing

        # Get max order
        max_order = (
            db.query(func.max(PlaylistMedia.order))
            .filter(PlaylistMedia.playlist_id == playlist_id)
            .scalar()
        ) or -1

        playlist_media = PlaylistMedia(
            playlist_id=playlist_id,
            media_id=media_id,
            order=max_order + 1,
        )

        db.add(playlist_media)
        db.commit()
        db.refresh(playlist_media)

        return playlist_media

    @staticmethod
    def remove_media_from_playlist(db: Session, playlist_id: int, media_id: int) -> bool:
        """Remove media from playlist"""
        playlist_media = (
            db.query(PlaylistMedia)
            .filter(
                and_(
                    PlaylistMedia.playlist_id == playlist_id,
                    PlaylistMedia.media_id == media_id,
                )
            )
            .first()
        )

        if not playlist_media:
            return False

        db.delete(playlist_media)
        db.commit()

        return True
