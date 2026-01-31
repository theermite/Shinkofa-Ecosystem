"""
Player Availability models - Manage player availability schedules
"""

from datetime import datetime, time, date
from enum import Enum as PyEnum
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Enum, Boolean, Text, Time, Date
from sqlalchemy.orm import relationship
from .base import BaseModel


class DayOfWeek(int, PyEnum):
    """Days of the week (0=Monday, 6=Sunday)"""
    MONDAY = 0
    TUESDAY = 1
    WEDNESDAY = 2
    THURSDAY = 3
    FRIDAY = 4
    SATURDAY = 5
    SUNDAY = 6


class PlayerAvailability(BaseModel):
    """Hybrid availability for a player - supports both recurring and specific dates"""
    __tablename__ = "player_availabilities"

    # User reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Hybrid schedule: EITHER recurring OR specific date
    day_of_week = Column(Integer, nullable=True)  # 0=Monday, 6=Sunday (for recurring)
    specific_date = Column(Date, nullable=True, index=True)  # Specific date (for one-time)
    start_time = Column(Time, nullable=False)  # e.g., 18:00
    end_time = Column(Time, nullable=False)  # e.g., 20:00

    # Status
    is_active = Column(Boolean, default=True, nullable=False)  # Can be temporarily disabled
    notes = Column(Text)  # Optional notes about availability

    # Relationships
    user = relationship("User", backref="availabilities")

    def __repr__(self):
        if self.specific_date:
            return f"<PlayerAvailability(user_id={self.user_id}, date={self.specific_date}, {self.start_time}-{self.end_time})>"
        else:
            return f"<PlayerAvailability(user_id={self.user_id}, day={self.day_of_week}, {self.start_time}-{self.end_time})>"


class PlayerAvailabilityException(BaseModel):
    """One-time exceptions to recurring availability (absences, special availability)"""
    __tablename__ = "player_availability_exceptions"

    # User reference
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    # Exception date
    exception_date = Column(Date, nullable=False, index=True)  # Specific date
    start_time = Column(Time)  # Optional: if only part of the day is affected
    end_time = Column(Time)  # Optional

    # Type of exception
    is_unavailable = Column(Boolean, default=True, nullable=False)  # True=unavailable, False=extra availability
    reason = Column(Text)  # Optional reason for unavailability

    # Relationships
    user = relationship("User", backref="availability_exceptions")

    def __repr__(self):
        status = "Unavailable" if self.is_unavailable else "Available"
        return f"<AvailabilityException(user_id={self.user_id}, date={self.exception_date}, {status})>"
