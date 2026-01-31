"""
Tactical Formation models - Coach strategy board for team positioning

Allows coaches to create, save, and share tactical formations with their team
"""

from enum import Enum as PyEnum
from sqlalchemy import Column, String, Integer, Text, Enum, ForeignKey, Boolean, ARRAY
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from .base import BaseModel


class MapType(str, PyEnum):
    """Map types for tactical board"""
    SUMMONERS_RIFT = "summoners_rift"
    DOTA2 = "dota2"
    GENERIC = "generic"
    # Honor of Kings maps
    HOK_FULL = "hok_full"
    HOK_TOP_LANE = "hok_top_lane"
    HOK_MID_LANE = "hok_mid_lane"
    HOK_BOT_LANE = "hok_bot_lane"
    HOK_BLUE_BUFF = "hok_blue_buff"
    HOK_RED_BUFF = "hok_red_buff"
    HOK_DRAKE = "hok_drake"
    HOK_LORD = "hok_lord"


class FormationCategory(str, PyEnum):
    """Formation categories for organizing strategies"""
    ENGAGE = "engage"
    POKE = "poke"
    SIEGE = "siege"
    TEAMFIGHT = "teamfight"
    ROTATION = "rotation"
    DEFENSE = "defense"
    SPLIT_PUSH = "split_push"


class TacticalFormation(BaseModel):
    """
    Tactical formation for team strategy planning

    Stores player/enemy positions, drawings, and animations
    Created by coaches, shared with team members
    """

    __tablename__ = "tactical_formations"

    # Basic info
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    map_type = Column(
        Enum(MapType, name="map_type_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=False,
        default=MapType.GENERIC
    )

    # Ownership
    created_by = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    team_id = Column(Integer, nullable=True, index=True)  # TODO: Add FK when teams table exists

    # Formation data (JSONB)
    # Structure:
    # {
    #   "players": [
    #     {"id": 1, "role": "top", "x": 100, "y": 200, "color": "blue"},
    #     ...
    #   ],
    #   "enemies": [
    #     {"id": 1, "role": "enemy", "x": 500, "y": 600, "color": "red"},
    #     ...
    #   ],
    #   "drawings": [
    #     {"type": "arrow", "from": [100, 200], "to": [300, 400], "color": "#00ff00"},
    #     {"type": "circle", "center": [500, 500], "radius": 100, "color": "#ff0000"},
    #     ...
    #   ],
    #   "timeline": [
    #     {"time": 0, "playerPositions": {...}},
    #     {"time": 1000, "playerPositions": {...}},
    #     ...
    #   ]
    # }
    formation_data = Column(JSONB, nullable=False)

    # Tags & categorization
    tags = Column(ARRAY(String(50)), default=[])
    category = Column(
        Enum(FormationCategory, name="formation_category_enum", values_callable=lambda x: [e.value for e in x]),
        nullable=True,
        index=True
    )

    # Sharing
    is_public = Column(Boolean, default=False, index=True)
    shared_with = Column(ARRAY(Integer), default=[])  # User IDs

    # Stats
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)

    # Relationships
    creator = relationship("User", foreign_keys=[created_by], lazy="joined")

    def __repr__(self):
        return f"<TacticalFormation(id={self.id}, name='{self.name}', created_by={self.created_by})>"

    def is_accessible_by(self, user_id: int) -> bool:
        """Check if user can access this formation"""
        return (
            self.created_by == user_id or
            self.is_public or
            user_id in (self.shared_with or [])
        )

    def to_dict(self):
        """Convert formation to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "map_type": self.map_type.value if self.map_type else None,
            "created_by": self.created_by,
            "team_id": self.team_id,
            "formation_data": self.formation_data,
            "tags": self.tags or [],
            "category": self.category.value if self.category else None,
            "is_public": self.is_public,
            "shared_with": self.shared_with or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "views_count": self.views_count,
            "likes_count": self.likes_count,
        }
