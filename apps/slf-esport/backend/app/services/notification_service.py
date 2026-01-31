"""
Notification Service - Manage in-app notifications
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import desc, or_

from app.models.notification import Notification, NotificationType
from app.schemas.notification import NotificationCreate


class NotificationService:
    """Service for notification management"""

    @staticmethod
    def create_notification(db: Session, notification_data: NotificationCreate) -> Notification:
        """Create a new notification"""
        notification = Notification(**notification_data.dict())
        db.add(notification)
        db.commit()
        db.refresh(notification)
        return notification

    @staticmethod
    def create_bulk_notifications(db: Session, user_ids: List[int], type: str, title: str, message: str, link: Optional[str] = None, action_text: Optional[str] = None):
        """Create notifications for multiple users"""
        notifications = []
        for user_id in user_ids:
            notif = Notification(
                user_id=user_id,
                type=type,
                title=title,
                message=message,
                link=link,
                action_text=action_text
            )
            notifications.append(notif)
        
        db.bulk_save_objects(notifications)
        db.commit()
        return len(notifications)

    @staticmethod
    def get_user_notifications(
        db: Session,
        user_id: int,
        unread_only: bool = False,
        skip: int = 0,
        limit: int = 50
    ) -> tuple[List[Notification], int, int]:
        """Get user notifications with counts"""
        query = db.query(Notification).filter(Notification.user_id == user_id)
        
        # Count unread
        unread_count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read == False
        ).count()
        
        # Filter if unread only
        if unread_only:
            query = query.filter(Notification.read == False)
        
        # Total count for this filter
        total = query.count()
        
        # Get paginated results
        notifications = query.order_by(desc(Notification.created_at)).offset(skip).limit(limit).all()
        
        return notifications, total, unread_count

    @staticmethod
    def mark_as_read(db: Session, notification_id: int, user_id: int) -> bool:
        """Mark notification as read"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            return False
        
        notification.read = True
        notification.read_at = datetime.utcnow()
        db.commit()
        return True

    @staticmethod
    def mark_all_as_read(db: Session, user_id: int) -> int:
        """Mark all user notifications as read"""
        count = db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read == False
        ).update({
            "read": True,
            "read_at": datetime.utcnow()
        })
        db.commit()
        return count

    @staticmethod
    def delete_notification(db: Session, notification_id: int, user_id: int) -> bool:
        """Delete a notification"""
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if not notification:
            return False
        
        db.delete(notification)
        db.commit()
        return True

    @staticmethod
    def get_unread_count(db: Session, user_id: int) -> int:
        """Get count of unread notifications"""
        return db.query(Notification).filter(
            Notification.user_id == user_id,
            Notification.read == False
        ).count()
