"""
Shizen Message Usage model - Tracks monthly message counts for tier limits
Shinkofa Platform - Planner
"""
from sqlalchemy import Column, String, Integer, DateTime, UniqueConstraint
from datetime import datetime, timezone
from app.core.database import Base


class ShizenMessageUsage(Base):
    """
    Tracks Shizen AI message usage per user per month.
    Used to enforce tier limits:
    - MUSHA: 50 messages/month
    - SAMURAI: 200 messages/month
    - SENSEI+: Unlimited
    """
    __tablename__ = "shizen_message_usage"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(String(36), nullable=False, index=True)
    year_month = Column(String(7), nullable=False)  # Format: "2026-01"
    message_count = Column(Integer, nullable=False, default=0)

    # Timestamps
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    # Unique constraint on user_id + year_month
    __table_args__ = (
        UniqueConstraint('user_id', 'year_month', name='uq_shizen_message_usage_user_month'),
    )

    def __repr__(self):
        return f"<ShizenMessageUsage(user_id={self.user_id}, year_month={self.year_month}, count={self.message_count})>"
