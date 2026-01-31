"""
Password Reset routes - Request and validate password reset
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.models.user import User
from app.models.password_reset import PasswordResetToken
from app.services.user_service import UserService
from app.services.email_service import EmailService
from app.core.security import get_password_hash

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


class PasswordResetRequest(BaseModel):
    """Request password reset schema"""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """Confirm password reset schema"""
    token: str
    new_password: str = Field(..., min_length=8, max_length=100)

    @validator("new_password")
    def validate_password(cls, v):
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Le mot de passe doit contenir au moins 8 caractères")
        if not any(char.isdigit() for char in v):
            raise ValueError("Le mot de passe doit contenir au moins 1 chiffre")
        if not any(char.isupper() for char in v):
            raise ValueError("Le mot de passe doit contenir au moins 1 majuscule")
        return v


@router.post("/request", status_code=status.HTTP_200_OK)
@limiter.limit("3/minute")
async def request_password_reset(
    request: Request,
    data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    Request password reset - Send email with reset link

    Args:
        request: FastAPI request object (for rate limiting)
        data: Email address
        db: Database session

    Returns:
        Success message (always returns success to avoid email enumeration)
    """
    # Find user by email
    user = UserService.get_by_email(db, data.email)

    # Always return success message (security: don't reveal if email exists)
    if not user:
        return {
            "message": "Si cet email existe, un lien de réinitialisation a été envoyé.",
            "success": True
        }

    # Check if user is active
    if not user.is_active:
        return {
            "message": "Si cet email existe, un lien de réinitialisation a été envoyé.",
            "success": True
        }

    # Invalidate all previous tokens for this user
    db.query(PasswordResetToken).filter(
        PasswordResetToken.user_id == user.id,
        PasswordResetToken.is_used == False
    ).update({"is_used": True})

    # Create new reset token
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=PasswordResetToken.generate_token(),
        expires_at=PasswordResetToken.create_expiration_time(),
        is_used=False
    )

    db.add(reset_token)
    db.commit()
    db.refresh(reset_token)

    # Send email
    email_sent = EmailService.send_password_reset_email(
        to_email=user.email,
        reset_token=reset_token.token,
        username=user.username
    )

    if not email_sent:
        # Log error but don't reveal it to user
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Failed to send password reset email to {user.email}")

    return {
        "message": "Si cet email existe, un lien de réinitialisation a été envoyé.",
        "success": True
    }


@router.post("/confirm", status_code=status.HTTP_200_OK)
@limiter.limit("5/minute")
async def confirm_password_reset(
    request: Request,
    data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """
    Confirm password reset with token

    Args:
        request: FastAPI request object (for rate limiting)
        data: Reset token and new password
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If token is invalid or expired
    """
    # Find token
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == data.token
    ).first()

    if not reset_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token de réinitialisation invalide"
        )

    # Check if token is valid
    if not reset_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ce lien de réinitialisation a expiré ou a déjà été utilisé"
        )

    # Get user
    user = db.query(User).filter(User.id == reset_token.user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Utilisateur non trouvé"
        )

    # Update password
    user.hashed_password = get_password_hash(data.new_password)

    # Mark token as used
    reset_token.is_used = True

    db.commit()

    return {
        "message": "Votre mot de passe a été réinitialisé avec succès",
        "success": True
    }


@router.get("/verify/{token}", status_code=status.HTTP_200_OK)
async def verify_reset_token(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify if a reset token is valid (for frontend validation)

    Args:
        token: Reset token
        db: Database session

    Returns:
        Token validity status

    Raises:
        HTTPException: If token is invalid or expired
    """
    reset_token = db.query(PasswordResetToken).filter(
        PasswordResetToken.token == token
    ).first()

    if not reset_token or not reset_token.is_valid():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token invalide ou expiré"
        )

    return {
        "valid": True,
        "message": "Token valide"
    }
