"""
User service - Business logic for user management
"""

import secrets
import string
from typing import Optional, List, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.user import User, UserRole
from app.schemas.user import UserCreate, UserUpdate
from app.core.security import get_password_hash, verify_password
from app.services.email_service import EmailService


class UserService:
    """Service class for user-related business logic"""

    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        """Get user by ID"""
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        """Get user by email"""
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def get_by_username(db: Session, username: str) -> Optional[User]:
        """Get user by username"""
        return db.query(User).filter(User.username == username).first()

    @staticmethod
    def get_all(
        db: Session,
        skip: int = 0,
        limit: int = 100,
        role: Optional[UserRole] = None
    ) -> List[User]:
        """
        Get all users with pagination and optional role filter

        Args:
            db: Database session
            skip: Number of records to skip
            limit: Maximum number of records to return
            role: Optional role filter

        Returns:
            List of users
        """
        query = db.query(User)

        if role:
            query = query.filter(User.role == role)

        return query.offset(skip).limit(limit).all()

    @staticmethod
    def create(db: Session, user_data: UserCreate) -> User:
        """
        Create a new user

        Args:
            db: Database session
            user_data: User creation data

        Returns:
            Created user

        Raises:
            HTTPException: If username or email already exists
        """
        # Check if username exists
        if UserService.get_by_username(db, user_data.username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        # Check if email exists
        if UserService.get_by_email(db, user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Create user
        db_user = User(
            email=user_data.email,
            username=user_data.username,
            hashed_password=get_password_hash(user_data.password),
            full_name=user_data.full_name,
            bio=user_data.bio,
            role=user_data.role,
            game_username=user_data.game_username,
            game_uid=user_data.game_uid,
            preferred_role=user_data.preferred_role,
            skill_level=user_data.skill_level,
            discord_username=user_data.discord_username,
            energy_type=user_data.energy_type,
            peak_hours=user_data.peak_hours
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def update(
        db: Session,
        user_id: int,
        user_data: UserUpdate
    ) -> User:
        """
        Update user profile

        Args:
            db: Database session
            user_id: ID of user to update
            user_data: Update data

        Returns:
            Updated user

        Raises:
            HTTPException: If user not found or email already exists
        """
        db_user = UserService.get_by_id(db, user_id)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Check if email is being changed and already exists
        if user_data.email and user_data.email != db_user.email:
            existing_user = UserService.get_by_email(db, user_data.email)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )

        # Check if username is being changed and already exists
        if user_data.username and user_data.username != db_user.username:
            existing_user = UserService.get_by_username(db, user_data.username)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Username already taken"
                )

        # Update fields explicitly
        update_data = user_data.model_dump(exclude_unset=True, exclude_none=False)

        for field, value in update_data.items():
            if hasattr(db_user, field):
                setattr(db_user, field, value)

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        return db_user

    @staticmethod
    def delete(db: Session, user_id: int) -> bool:
        """
        Delete user (soft delete by setting is_active=False)

        Args:
            db: Database session
            user_id: ID of user to delete

        Returns:
            True if deleted successfully

        Raises:
            HTTPException: If user not found
        """
        db_user = UserService.get_by_id(db, user_id)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        db_user.is_active = False
        db.commit()

        return True

    @staticmethod
    def change_password(
        db: Session,
        user_id: int,
        current_password: str,
        new_password: str
    ) -> bool:
        """
        Change user password

        Args:
            db: Database session
            user_id: ID of user
            current_password: Current password
            new_password: New password

        Returns:
            True if password changed successfully

        Raises:
            HTTPException: If user not found or current password incorrect
        """
        db_user = UserService.get_by_id(db, user_id)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Verify current password
        if not verify_password(current_password, db_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Incorrect current password"
            )

        # Update password
        db_user.hashed_password = get_password_hash(new_password)
        db.commit()

        return True

    @staticmethod
    def authenticate(
        db: Session,
        username: str,
        password: str
    ) -> Optional[User]:
        """
        Authenticate user with username and password

        Args:
            db: Database session
            username: Username
            password: Password

        Returns:
            User if authentication successful, None otherwise
        """
        user = UserService.get_by_username(db, username)

        if not user:
            return None

        if not verify_password(password, user.hashed_password):
            return None

        if not user.is_active:
            return None

        return user

    @staticmethod
    def admin_reset_password(
        db: Session,
        user_id: int,
        new_password: str
    ) -> bool:
        """
        Reset user password by admin (Super Admin only)

        Args:
            db: Database session
            user_id: ID of user whose password to reset
            new_password: New password to set

        Returns:
            True if password reset successfully

        Raises:
            HTTPException: If user not found
        """
        db_user = UserService.get_by_id(db, user_id)

        if not db_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Update password
        db_user.hashed_password = get_password_hash(new_password)
        db.commit()

        return True

    @staticmethod
    def generate_secure_password(length: int = 12) -> str:
        """
        Generate a secure random password

        Args:
            length: Length of password (default 12)

        Returns:
            Secure random password containing uppercase, lowercase, digits, and special chars
        """
        # Ensure password contains at least one of each character type
        password_chars = [
            secrets.choice(string.ascii_uppercase),  # At least 1 uppercase
            secrets.choice(string.ascii_lowercase),  # At least 1 lowercase
            secrets.choice(string.digits),           # At least 1 digit
            secrets.choice("!@#$%^&*")              # At least 1 special char
        ]

        # Fill the rest with random characters
        all_chars = string.ascii_letters + string.digits + "!@#$%^&*"
        password_chars += [secrets.choice(all_chars) for _ in range(length - 4)]

        # Shuffle to avoid predictable pattern
        password_list = list(password_chars)
        secrets.SystemRandom().shuffle(password_list)

        return ''.join(password_list)

    @staticmethod
    def create_player_with_email(
        db: Session,
        email: str,
        username: str,
        full_name: str,
        **kwargs
    ) -> Tuple[User, str, bool]:
        """
        Create a new player with auto-generated password and send welcome email

        Args:
            db: Database session
            email: Player email address
            username: Player username
            full_name: Player full name
            **kwargs: Additional optional fields (bio, game_username, etc.)

        Returns:
            Tuple of (created user, temporary password, email_sent success)

        Raises:
            HTTPException: If username or email already exists
        """
        # Check if username exists
        if UserService.get_by_username(db, username):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )

        # Check if email exists
        if UserService.get_by_email(db, email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )

        # Generate secure temporary password
        temp_password = UserService.generate_secure_password()

        # Create user
        db_user = User(
            email=email,
            username=username,
            hashed_password=get_password_hash(temp_password),
            full_name=full_name,
            role=UserRole.JOUEUR,
            bio=kwargs.get('bio'),
            game_username=kwargs.get('game_username'),
            game_uid=kwargs.get('game_uid'),
            preferred_role=kwargs.get('preferred_role'),
            skill_level=kwargs.get('skill_level'),
            discord_username=kwargs.get('discord_username'),
            energy_type=kwargs.get('energy_type'),
            peak_hours=kwargs.get('peak_hours')
        )

        db.add(db_user)
        db.commit()
        db.refresh(db_user)

        # Send welcome email with credentials
        email_sent = EmailService.send_welcome_email(
            to_email=email,
            username=username,
            temp_password=temp_password
        )

        return db_user, temp_password, email_sent
