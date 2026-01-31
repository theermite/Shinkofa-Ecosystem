"""
User model with role-based access control
"""

from enum import Enum as PyEnum
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Enum, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel


class UserRole(str, PyEnum):
    """
    User roles enumeration
    - JOUEUR: Player role (access to personal training, exercises, coaching)
    - COACH: Coach role (access to team overview, content upload, player feedback)
    - MANAGER: Manager role (full access to analytics, reports, team settings)
    - SUPER_ADMIN: Super administrator (full system access, can manage all users and teams)
    """

    JOUEUR = "JOUEUR"
    COACH = "COACH"
    MANAGER = "MANAGER"
    SUPER_ADMIN = "SUPER_ADMIN"


class User(BaseModel):
    """
    User model with authentication and role-based access
    """

    __tablename__ = "users"

    # Authentication fields
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)

    # Profile fields
    full_name = Column(String(255), nullable=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(String(1000), nullable=True)

    # Role
    role = Column(
        Enum(UserRole, name="user_role_enum"),
        default=UserRole.JOUEUR,
        nullable=False,
        index=True
    )

    # Super admin flag (grants all permissions regardless of role)
    is_super_admin = Column(Boolean, default=False, nullable=False, index=True)

    # Gaming profile (for players)
    game_username = Column(String(100), nullable=True)
    game_uid = Column(String(100), nullable=True)  # UID HOK (Honor of Kings player ID)
    preferred_role = Column(String(50), nullable=True)  # Tank, Mage, Marksman, etc.
    secondary_role = Column(String(50), nullable=True)  # Secondary role preference
    skill_level = Column(String(50), nullable=True)  # Beginner, Intermediate, Advanced

    # Discord integration
    discord_id = Column(String(100), unique=True, nullable=True, index=True)
    discord_username = Column(String(100), nullable=True)

    # Energy profile (Shinkofa - for adaptive scheduling)
    energy_type = Column(String(50), nullable=True)  # Design Humain type
    peak_hours = Column(String(100), nullable=True)  # JSON string or comma-separated

    # Moral contract acceptance
    moral_contract_accepted = Column(Boolean, default=False, nullable=False)
    moral_contract_accepted_at = Column(DateTime, nullable=True)

    # Relationships
    notification_preferences = relationship(
        "NotificationPreferences",
        back_populates="user",
        uselist=False,
        cascade="all, delete-orphan"
    )
    reports = relationship(
        "Report",
        back_populates="generated_by",
        cascade="all, delete-orphan"
    )
    notifications = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<User(id={self.id}, username={self.username}, role={self.role})>"

    @property
    def is_joueur(self) -> bool:
        """Check if user has joueur role"""
        return self.role == UserRole.JOUEUR

    @property
    def is_coach(self) -> bool:
        """Check if user has coach role"""
        return self.role == UserRole.COACH

    @property
    def is_manager(self) -> bool:
        """Check if user has manager role"""
        return self.role == UserRole.MANAGER
