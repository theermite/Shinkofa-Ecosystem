"""
JWT Authentication utilities
Shinkofa Platform - Planner Service

Validates JWT tokens issued by auth service
"""
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
import os
from typing import Optional

# Must match auth service SECRET_KEY
SECRET_KEY = os.getenv("AUTH_JWT_SECRET", "dev-secret-key-change-in-production")
ALGORITHM = os.getenv("AUTH_JWT_ALGORITHM", "HS256")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="http://localhost:8000/auth/login", auto_error=False)


def get_current_user_id(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_id: Optional[str] = Header(None)
) -> str:
    """
    Extract user_id from JWT token OR X-User-ID header (fallback for dev/alpha)

    Args:
        token: JWT access token from Authorization header (optional)
        x_user_id: User ID from X-User-ID header (fallback for dev/alpha)

    Returns:
        user_id: User ID string

    Raises:
        HTTPException: 401 if neither token nor X-User-ID provided
    """
    # FALLBACK FOR DEV/ALPHA: Use X-User-ID header if no token
    if x_user_id:
        return x_user_id

    # JWT token validation (production)
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise credentials_exception

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception

        # For now, we use username as user identifier
        # In production, you might want to add user_id to JWT payload
        return username

    except JWTError:
        raise credentials_exception
