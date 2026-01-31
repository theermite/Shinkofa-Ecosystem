"""
Password Reset Token model
"""

from datetime import datetime, timedelta
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
import secrets

from .base import BaseModel


class PasswordResetToken(BaseModel):
    """Password reset token model"""
    __tablename__ = "password_reset_tokens"

    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    token = Column(String(100), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)

    # Relationship
    user = relationship("User", backref="reset_tokens")

    @staticmethod
    def generate_token() -> str:
        """Generate a secure random token"""
        return secrets.token_urlsafe(32)

    @staticmethod
    def create_expiration_time() -> datetime:
        """Create expiration time (1 hour from now)"""
        return datetime.utcnow() + timedelta(hours=1)

    def is_valid(self) -> bool:
        """Check if token is still valid"""
        return not self.is_used and datetime.utcnow() < self.expires_at

    def __repr__(self):
        return f"<PasswordResetToken(user_id={self.user_id}, expires_at={self.expires_at}, is_used={self.is_used})>"
