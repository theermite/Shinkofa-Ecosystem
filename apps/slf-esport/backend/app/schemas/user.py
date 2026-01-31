"""
Pydantic schemas for User model validation
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
from app.models.user import UserRole


class UserBase(BaseModel):
    """Base user schema with common fields"""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)
    game_username: Optional[str] = Field(None, max_length=100)
    game_uid: Optional[str] = Field(None, max_length=100)
    preferred_role: Optional[str] = Field(None, max_length=50)
    secondary_role: Optional[str] = Field(None, max_length=50)
    skill_level: Optional[str] = Field(None, max_length=50)
    discord_username: Optional[str] = Field(None, max_length=100)
    energy_type: Optional[str] = Field(None, max_length=50)
    peak_hours: Optional[str] = Field(None, max_length=100)


class UserCreate(UserBase):
    """Schema for creating a new user"""

    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = Field(default=UserRole.JOUEUR)

    @validator("password")
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class UserUpdate(BaseModel):
    """Schema for updating user profile"""

    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=100)  # Super Admin only
    full_name: Optional[str] = Field(None, max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)
    avatar_url: Optional[str] = Field(None, max_length=500)
    game_username: Optional[str] = Field(None, max_length=100)
    game_uid: Optional[str] = Field(None, max_length=100)
    preferred_role: Optional[str] = Field(None, max_length=50)
    secondary_role: Optional[str] = Field(None, max_length=50)
    skill_level: Optional[str] = Field(None, max_length=50)
    discord_username: Optional[str] = Field(None, max_length=100)
    energy_type: Optional[str] = Field(None, max_length=50)
    peak_hours: Optional[str] = Field(None, max_length=100)


class UserInDB(UserBase):
    """Schema for user stored in database"""

    id: int
    role: UserRole
    is_super_admin: bool
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str]
    discord_id: Optional[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    """Schema for user response (public data only)"""

    id: int
    email: EmailStr
    username: str
    full_name: Optional[str]
    bio: Optional[str]
    avatar_url: Optional[str]
    role: UserRole
    is_super_admin: bool
    is_active: bool
    game_username: Optional[str]
    game_uid: Optional[str]
    preferred_role: Optional[str]
    skill_level: Optional[str]
    discord_username: Optional[str]
    discord_id: Optional[str]
    moral_contract_accepted: bool
    moral_contract_accepted_at: Optional[datetime]
    created_at: datetime

    class Config:
        from_attributes = True


class UserLogin(BaseModel):
    """Schema for user login"""

    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)


class PasswordChange(BaseModel):
    """Schema for changing password"""

    current_password: str = Field(..., min_length=8)
    new_password: str = Field(..., min_length=8, max_length=100)

    @validator("new_password")
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class AdminPasswordReset(BaseModel):
    """Schema for admin resetting user password (Super Admin only)"""

    new_password: str = Field(..., min_length=8, max_length=100)

    @validator("new_password")
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(char.isdigit() for char in v):
            raise ValueError("Password must contain at least one digit")
        if not any(char.isupper() for char in v):
            raise ValueError("Password must contain at least one uppercase letter")
        return v


class PlayerCreate(BaseModel):
    """Schema for creating a player by Manager/Coach/Admin (auto-generates password)"""

    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str = Field(..., max_length=255)
    bio: Optional[str] = Field(None, max_length=1000)
    game_username: Optional[str] = Field(None, max_length=100)
    game_uid: Optional[str] = Field(None, max_length=100)
    preferred_role: Optional[str] = Field(None, max_length=50)
    secondary_role: Optional[str] = Field(None, max_length=50)
    skill_level: Optional[str] = Field(None, max_length=50)
    discord_username: Optional[str] = Field(None, max_length=100)
    energy_type: Optional[str] = Field(None, max_length=50)
    peak_hours: Optional[str] = Field(None, max_length=100)


class PlayerCreateResponse(BaseModel):
    """Response when creating a player with auto-generated password"""

    user: UserResponse
    temp_password: str
    email_sent: bool
    message: str
