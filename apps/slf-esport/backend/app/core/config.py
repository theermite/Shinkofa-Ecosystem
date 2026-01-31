"""
Core configuration module using Pydantic Settings
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import Field, validator


class Settings(BaseSettings):
    """
    Application settings loaded from environment variables
    """

    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "SLF E-Sport Training Platform"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Plateforme d'entraînement e-sport holistique La Salade de Fruits"
    ENVIRONMENT: str = Field(default="development")
    DEBUG: bool = Field(default=True)
    API_HOST: str = Field(default="0.0.0.0")
    API_PORT: int = Field(default=8000)

    # Security
    SECRET_KEY: str = Field(..., min_length=32)
    JWT_SECRET_KEY: str = Field(..., min_length=32)
    JWT_ALGORITHM: str = Field(default="HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440)  # 24 hours

    # Database
    POSTGRES_SERVER: str
    POSTGRES_PORT: int = Field(default=5432)
    POSTGRES_USER: str
    POSTGRES_PASSWORD: str
    POSTGRES_DB: str
    DATABASE_URL: Optional[str] = None

    @validator("DATABASE_URL", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: dict) -> str:
        """
        Assemble database URL from components if not provided
        """
        if isinstance(v, str):
            return v
        return f"postgresql://{values.get('POSTGRES_USER')}:{values.get('POSTGRES_PASSWORD')}@{values.get('POSTGRES_SERVER')}:{values.get('POSTGRES_PORT')}/{values.get('POSTGRES_DB')}"

    # Redis
    REDIS_HOST: str = Field(default="localhost")
    REDIS_PORT: int = Field(default=6379)

    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"]
    )

    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """
        Parse CORS origins from comma-separated string
        """
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # File Upload
    MAX_UPLOAD_SIZE: int = Field(default=104857600)  # 100MB
    UPLOAD_DIR: str = Field(default="./uploads")
    MEDIA_DIR: str = Field(default="./media")
    ALLOWED_EXTENSIONS: List[str] = Field(
        default=[
            ".jpg", ".jpeg", ".png", ".gif", ".webp",  # Images
            ".mp3", ".wav", ".ogg", ".m4a",  # Audio
            ".mp4", ".webm", ".mkv", ".avi",  # Video
            ".pdf", ".doc", ".docx", ".txt", ".md"  # Documents
        ]
    )

    # Discord Integration
    DISCORD_WEBHOOK_URL: Optional[str] = None

    # Email Configuration (SMTP)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = 465
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: Optional[str] = None
    SMTP_FROM_NAME: Optional[str] = "SLF Esport Platform"
    FRONTEND_URL: str = Field(default="http://localhost:3000")

    # Sentry (optional)
    SENTRY_DSN: Optional[str] = None

    class Config:
        env_file = ".env"
        case_sensitive = True


# Create global settings instance
settings = Settings()
