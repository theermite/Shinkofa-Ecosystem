"""
Pydantic schemas for Tactical Formations
"""

from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# Import enums from model to ensure single source of truth
from app.models.tactical_formation import MapType, FormationCategory


class PlayerPosition(BaseModel):
    """Player position on the tactical board"""
    id: int
    role: str = Field(..., description="Player role (top, jungle, mid, adc, support, enemy)")
    x: float = Field(..., ge=0, description="X position on canvas")
    y: float = Field(..., ge=0, description="Y position on canvas")
    color: str = Field(default="blue", description="Player color (blue for team, red for enemy)")


class DrawingElement(BaseModel):
    """Drawing element (arrow, line, zone, text)"""
    type: str = Field(..., description="Drawing type (arrow, line, circle, rectangle, text)")
    color: str = Field(default="#ffffff", description="Element color")
    properties: Dict[str, Any] = Field(default_factory=dict, description="Type-specific properties")


class TimelineFrame(BaseModel):
    """Animation timeline frame"""
    time: int = Field(..., ge=0, description="Time in milliseconds")
    player_positions: Dict[int, Dict[str, float]] = Field(
        default_factory=dict,
        description="Player positions at this frame {player_id: {x, y}}"
    )


class FormationData(BaseModel):
    """Formation data structure"""
    players: List[PlayerPosition] = Field(default_factory=list, description="Team player positions")
    enemies: List[PlayerPosition] = Field(default_factory=list, description="Enemy positions")
    drawings: List[DrawingElement] = Field(default_factory=list, description="Drawn elements (arrows, zones)")
    timeline: List[TimelineFrame] = Field(default_factory=list, description="Animation timeline")


class TacticalFormationCreate(BaseModel):
    """Create a new tactical formation"""
    name: str = Field(..., min_length=3, max_length=100, description="Formation name")
    description: Optional[str] = Field(None, description="Formation description")
    map_type: MapType = Field(default=MapType.GENERIC, description="Map type")
    formation_data: FormationData = Field(..., description="Formation positions and drawings")
    tags: List[str] = Field(default_factory=list, description="Formation tags")
    category: Optional[FormationCategory] = Field(None, description="Formation category")
    team_id: Optional[int] = Field(None, description="Team ID (if applicable)")

    model_config = {"use_enum_values": True}


class TacticalFormationUpdate(BaseModel):
    """Update an existing tactical formation"""
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = None
    formation_data: Optional[FormationData] = None
    tags: Optional[List[str]] = None
    category: Optional[FormationCategory] = None

    model_config = {"use_enum_values": True}


class TacticalFormationResponse(BaseModel):
    """Tactical formation response"""
    id: int
    name: str
    description: Optional[str]
    map_type: MapType
    formation_data: FormationData
    tags: List[str]
    category: Optional[FormationCategory]
    created_by: int
    team_id: Optional[int]
    is_public: bool
    shared_with: List[int]
    created_at: datetime
    updated_at: datetime
    views_count: int
    likes_count: int

    model_config = {"from_attributes": True, "use_enum_values": True}


class ShareFormationRequest(BaseModel):
    """Request to share a formation"""
    user_ids: List[int] = Field(default_factory=list, description="User IDs to share with")
    team_id: Optional[int] = Field(None, description="Team ID to share with all members")
    make_public: bool = Field(default=False, description="Make formation public")
