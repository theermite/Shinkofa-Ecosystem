"""
Pydantic schemas for JWT tokens
"""

from typing import Optional
from pydantic import BaseModel


class Token(BaseModel):
    """Schema for access token response"""

    access_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


class TokenPayload(BaseModel):
    """Schema for JWT token payload"""

    sub: Optional[int] = None  # User ID
    exp: Optional[int] = None  # Expiration timestamp


class RefreshToken(BaseModel):
    """Schema for refresh token request"""

    refresh_token: str
