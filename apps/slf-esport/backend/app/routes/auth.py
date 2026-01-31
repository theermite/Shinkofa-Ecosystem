"""
Authentication routes - Login, Register, Refresh Token
"""

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import create_access_token, create_refresh_token
from app.core.config import settings
from app.schemas.user import UserCreate, UserResponse, UserLogin
from app.schemas.token import Token
from app.services.user_service import UserService
from app.utils.dependencies import get_current_active_user
from app.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    user_data: UserCreate,
    db: Session = Depends(get_db)
):
    """
    Register a new user

    Args:
        user_data: User registration data
        db: Database session

    Returns:
        Created user information

    Raises:
        HTTPException: If username or email already exists
    """
    user = UserService.create(db, user_data)
    return user


@router.post("/login", response_model=Token)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return JWT tokens

    Args:
        credentials: Username and password
        db: Database session

    Returns:
        Access token and expiration time

    Raises:
        HTTPException: If credentials are invalid
    """
    # Authenticate user
    user = UserService.authenticate(
        db,
        username=credentials.username,
        password=credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role.value}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60  # Convert to seconds
    }


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current authenticated user information

    Args:
        current_user: Current authenticated user from JWT

    Returns:
        Current user information
    """
    return current_user


@router.post("/logout")
async def logout(
    current_user: User = Depends(get_current_active_user)
):
    """
    Logout user (client-side token invalidation)

    Note: JWT tokens are stateless, so actual invalidation happens client-side.
    For production, consider implementing a token blacklist with Redis.

    Args:
        current_user: Current authenticated user

    Returns:
        Logout confirmation message
    """
    return {
        "message": "Logged out successfully",
        "user_id": current_user.id
    }


@router.post("/accept-moral-contract")
async def accept_moral_contract(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Accept moral contract for current user

    Args:
        current_user: Current authenticated user
        db: Database session

    Returns:
        Confirmation message with acceptance timestamp

    Raises:
        HTTPException: If contract already accepted
    """
    # Check if already accepted
    if current_user.moral_contract_accepted:
        return {
            "message": "Contract already accepted",
            "accepted": True,
            "accepted_at": current_user.moral_contract_accepted_at.isoformat() if current_user.moral_contract_accepted_at else None
        }

    # Update user record
    current_user.moral_contract_accepted = True
    current_user.moral_contract_accepted_at = datetime.utcnow()

    db.commit()
    db.refresh(current_user)

    return {
        "message": "Moral contract accepted successfully",
        "accepted": True,
        "accepted_at": current_user.moral_contract_accepted_at.isoformat()
    }
