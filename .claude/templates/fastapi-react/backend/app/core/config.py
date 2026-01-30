"""Application Configuration"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    PROJECT_NAME: str = "FastAPI React App"
    API_V1_STR: str = "/api/v1"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://user:password@localhost:5432/dbname"

    # Security
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    ALGORITHM: str = "HS256"

    # CORS
    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:5173"]

    class Config:
        case_sensitive = True
        env_file = ".env"


settings = Settings()
