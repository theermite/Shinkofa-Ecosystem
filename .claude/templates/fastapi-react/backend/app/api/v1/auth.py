"""Authentication endpoints"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel

from app.core.security import create_access_token, verify_password

router = APIRouter()


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """Login endpoint

    Example user: email=admin@example.com, password=admin123
    """
    # TODO: Replace with actual database lookup
    if credentials.email == "admin@example.com" and credentials.password == "admin123":
        access_token = create_access_token(subject=credentials.email)
        return LoginResponse(access_token=access_token)

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password",
    )
