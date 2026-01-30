"""
Configuration Settings
Shinkofa Platform - Shizen-Planner Service
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # Database
    DATABASE_URL: str = "postgresql://localhost:5432/shinkofa"

    # Auth Service (for tier verification)
    AUTH_SERVICE_URL: str = "http://api-auth:8000"
    INTERNAL_API_KEY: str = "shinkofa-internal-2026"

    # Stripe API Keys
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str

    # Stripe Price IDs - Plans Mensuels
    STRIPE_PRICE_SAMURAI_MONTHLY: str
    STRIPE_PRICE_SAMURAI_FAMILLE_MONTHLY: str
    STRIPE_PRICE_SENSEI_MONTHLY: str
    STRIPE_PRICE_SENSEI_FAMILLE_MONTHLY: str

    # Stripe Price IDs - Plans Annuels
    STRIPE_PRICE_SAMURAI_YEARLY: str
    STRIPE_PRICE_SAMURAI_FAMILLE_YEARLY: str
    STRIPE_PRICE_SENSEI_YEARLY: str
    STRIPE_PRICE_SENSEI_FAMILLE_YEARLY: str

    # Stripe Price IDs - Manuel Holistique (One-time)
    STRIPE_PRICE_MANUEL_FULL: str  # 29€
    STRIPE_PRICE_MANUEL_SAMURAI: str  # 20,30€
    STRIPE_PRICE_MANUEL_SENSEI: str  # 14,50€

    # Application
    NODE_ENV: str = "production"
    API_URL: str = "https://alpha.shinkofa.com/api"

    class Config:
        # Load from environment variables (passed by Docker)
        # env_file = ".env.production"  # Disabled - use Docker environment
        case_sensitive = True


# Global settings instance
settings = Settings()
