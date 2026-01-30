"""Users endpoints"""

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class User(BaseModel):
    id: int
    email: str
    name: str


@router.get("/me", response_model=User)
async def get_current_user():
    """Get current user (example)"""
    # TODO: Get from JWT token + database
    return User(id=1, email="admin@example.com", name="Admin User")


@router.get("/", response_model=list[User])
async def list_users():
    """List all users (example)"""
    # TODO: Get from database
    return [
        User(id=1, email="admin@example.com", name="Admin User"),
        User(id=2, email="user@example.com", name="Regular User"),
    ]
