"""
Daily Journal schemas
Shinkofa Platform - Planner
"""
from pydantic import BaseModel, Field, field_validator, field_serializer
from typing import List, Optional, Any
from datetime import date, datetime


class MoodCheckIn(BaseModel):
    """Single mood check-in entry"""
    id: str
    timestamp: datetime
    physical: int = Field(ge=0, le=10)  # 0-10 scale
    emotional: int = Field(ge=0, le=10)  # 0-10 scale
    mental: int = Field(ge=0, le=10)  # 0-10 scale
    note: Optional[str] = None

    @field_serializer('timestamp')
    def serialize_timestamp(self, value: datetime) -> str:
        """Serialize datetime to ISO string for JSON storage"""
        return value.isoformat() if value else None

    class Config:
        from_attributes = True


class DailyJournalBase(BaseModel):
    date: date
    energy_morning: int = Field(default=5, ge=0, le=10)  # 0-10 scale
    energy_evening: int = Field(default=5, ge=0, le=10)  # 0-10 scale
    intentions: str = ""
    gratitudes: List[str] = Field(default_factory=list, max_length=10)
    successes: List[str] = Field(default_factory=list, max_length=10)
    learning: str = ""
    adjustments: str = ""
    mood_check_ins: List[MoodCheckIn] = Field(default_factory=list)

    @field_validator('mood_check_ins', mode='before')
    @classmethod
    def parse_mood_check_ins(cls, v: Any) -> List[Any]:
        """Parse mood_check_ins from JSON (handles both dicts and MoodCheckIn objects)"""
        if v is None:
            return []
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, dict):
                    # Convert timestamp string to datetime if needed
                    if 'timestamp' in item and isinstance(item['timestamp'], str):
                        try:
                            item['timestamp'] = datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00'))
                        except (ValueError, TypeError):
                            pass
                    result.append(item)
                else:
                    result.append(item)
            return result
        return v


class DailyJournalCreate(DailyJournalBase):
    pass


class DailyJournalUpdate(BaseModel):
    date: Optional[date] = None
    energy_morning: Optional[int] = Field(None, ge=0, le=10)
    energy_evening: Optional[int] = Field(None, ge=0, le=10)
    intentions: Optional[str] = None
    gratitudes: Optional[List[str]] = None
    successes: Optional[List[str]] = None
    learning: Optional[str] = None
    adjustments: Optional[str] = None
    mood_check_ins: Optional[List[MoodCheckIn]] = None

    @field_validator('mood_check_ins', mode='before')
    @classmethod
    def parse_mood_check_ins(cls, v: Any) -> Optional[List[Any]]:
        """Parse mood_check_ins from JSON"""
        if v is None:
            return None
        if isinstance(v, list):
            result = []
            for item in v:
                if isinstance(item, dict):
                    if 'timestamp' in item and isinstance(item['timestamp'], str):
                        try:
                            item['timestamp'] = datetime.fromisoformat(item['timestamp'].replace('Z', '+00:00'))
                        except (ValueError, TypeError):
                            pass
                    result.append(item)
                else:
                    result.append(item)
            return result
        return v


class DailyJournal(DailyJournalBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
