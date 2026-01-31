"""
User management routes - CRUD operations with role-based access control
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.user import UserResponse, UserUpdate, PasswordChange, AdminPasswordReset, PlayerCreate, PlayerCreateResponse
from app.services.user_service import UserService
from app.utils.dependencies import (
    get_current_active_user,
    get_current_manager,
    get_current_super_admin,
    require_role
)
from app.models.user import User, UserRole

router = APIRouter()


@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of records"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER, UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get all users (Coach, Manager, and Super Admin only)

    Args:
        skip: Number of records to skip (pagination)
        limit: Maximum number of records to return
        role: Optional filter by user role
        current_user: Current authenticated coach, manager, or super admin
        db: Database session

    Returns:
        List of users
    """
    users = UserService.get_all(db, skip=skip, limit=limit, role=role)
    return users


@router.get("/me", response_model=UserResponse)
async def get_my_profile(
    current_user: User = Depends(get_current_active_user)
):
    """
    Get current user's own profile

    Args:
        current_user: Current authenticated user

    Returns:
        Current user information
    """
    return current_user


@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: int,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER, UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get user by ID (Coach, Manager, and Super Admin only)

    Args:
        user_id: User ID
        current_user: Current authenticated coach, manager, or super admin
        db: Database session

    Returns:
        User information

    Raises:
        HTTPException: If user not found
    """
    user = UserService.get_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


@router.put("/me", response_model=UserResponse)
async def update_my_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Update current user's own profile

    Args:
        user_data: Updated user data
        current_user: Current authenticated user
        db: Database session

    Returns:
        Updated user information
    """
    updated_user = UserService.update(db, current_user.id, user_data)
    return updated_user


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    current_user: User = Depends(require_role(UserRole.MANAGER, UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Update user profile (Manager and Super Admin only)

    Args:
        user_id: User ID to update
        user_data: Updated user data
        current_user: Current authenticated manager or super admin
        db: Database session

    Returns:
        Updated user information
    """
    updated_user = UserService.update(db, user_id, user_data)
    return updated_user


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    permanent: bool = False,
    current_user: User = Depends(require_role(UserRole.MANAGER, UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Delete user (soft or hard delete - Manager and Super Admin only)

    Args:
        user_id: User ID to delete
        permanent: If True, permanently delete (Super Admin only). If False, soft delete.
        current_user: Current authenticated manager or super admin
        db: Database session

    Returns:
        No content (204)

    Raises:
        HTTPException: If trying to delete yourself or permission denied
    """
    # Prevent deleting yourself
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot delete your own account"
        )

    # Permanent deletion requires Super Admin
    if permanent and not current_user.is_super_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only Super Admins can permanently delete users"
        )

    if permanent:
        # Hard delete
        db_user = UserService.get_by_id(db, user_id)
        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        db.delete(db_user)
        db.commit()
    else:
        # Soft delete
        UserService.delete(db, user_id)

    return None


@router.post("/me/change-password")
async def change_my_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """
    Change current user's password

    Args:
        password_data: Current and new password
        current_user: Current authenticated user
        db: Database session

    Returns:
        Success message
    """
    UserService.change_password(
        db,
        current_user.id,
        password_data.current_password,
        password_data.new_password
    )

    return {"message": "Password changed successfully"}


@router.get("/joueurs/", response_model=List[UserResponse])
async def get_joueurs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER, UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Get all players (joueurs) - Coach, Manager, and Super Admin only

    Args:
        skip: Number of records to skip
        limit: Maximum number of records
        current_user: Current authenticated coach, manager, or super admin
        db: Database session

    Returns:
        List of players
    """
    joueurs = UserService.get_all(db, skip=skip, limit=limit, role=UserRole.JOUEUR)
    return joueurs


@router.post("/joueurs/", response_model=PlayerCreateResponse, status_code=status.HTTP_201_CREATED)
async def create_joueur(
    player_data: PlayerCreate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER, UserRole.SUPER_ADMIN)),
    db: Session = Depends(get_db)
):
    """
    Create a new player (joueur) with auto-generated password and email notification
    (Coach, Manager, and Super Admin only)

    Args:
        player_data: Player creation data (no password required - auto-generated)
        current_user: Current authenticated coach, manager, or super admin
        db: Database session

    Returns:
        Created player information with temporary password and email status

    Raises:
        HTTPException: If username or email already exists
    """
    # Create player with auto-generated password and send email
    user, temp_password, email_sent = UserService.create_player_with_email(
        db=db,
        email=player_data.email,
        username=player_data.username,
        full_name=player_data.full_name,
        bio=player_data.bio,
        game_username=player_data.game_username,
        game_uid=player_data.game_uid,
        preferred_role=player_data.preferred_role,
        skill_level=player_data.skill_level,
        discord_username=player_data.discord_username,
        energy_type=player_data.energy_type,
        peak_hours=player_data.peak_hours
    )

    # Prepare response message
    message = "Player created successfully. "
    if email_sent:
        message += f"Welcome email with login credentials sent to {player_data.email}."
    else:
        message += "WARNING: Failed to send welcome email. Please share credentials manually."

    return PlayerCreateResponse(
        user=user,
        temp_password=temp_password,
        email_sent=email_sent,
        message=message
    )


@router.patch("/{user_id}/role", response_model=UserResponse)
async def change_user_role(
    user_id: int,
    role_data: dict,
    current_user: User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """
    Change a user's role, super admin status, and active status (Super Admin only)

    Args:
        user_id: User ID whose role to change
        role_data: Dictionary with 'new_role', optional 'is_super_admin', optional 'is_active'
        current_user: Current authenticated super admin
        db: Session = Session database

    Returns:
        Updated user information

    Raises:
        HTTPException: If user not found or trying to modify own role
    """
    # Prevent super admin from demoting themselves
    if user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot modify your own role or status"
        )

    user = UserService.get_by_id(db, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Update user role
    new_role = role_data.get("new_role")
    if new_role:
        try:
            user.role = UserRole(new_role)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role: {new_role}"
            )

    # Update super admin status if provided
    if "is_super_admin" in role_data:
        user.is_super_admin = role_data["is_super_admin"]

    # Update active status if provided (to allow reactivation)
    if "is_active" in role_data:
        user.is_active = role_data["is_active"]

    db.add(user)
    db.commit()
    db.refresh(user)

    return user


@router.post("/{user_id}/reset-password")
async def admin_reset_user_password(
    user_id: int,
    password_data: AdminPasswordReset,
    current_user: User = Depends(get_current_super_admin),
    db: Session = Depends(get_db)
):
    """
    Reset user password (Super Admin only)

    Args:
        user_id: User ID whose password to reset
        password_data: New password data
        current_user: Current authenticated super admin
        db: Database session

    Returns:
        Success message

    Raises:
        HTTPException: If user not found
    """
    UserService.admin_reset_password(
        db,
        user_id,
        password_data.new_password
    )

    return {
        "message": f"Password reset successfully for user ID {user_id}",
        "user_id": user_id
    }
