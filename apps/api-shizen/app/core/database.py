"""
Database connection and session management
Shinkofa Platform - Shizen-Planner Service
"""
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session, declarative_base, scoped_session
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import Pool
from typing import Generator, AsyncGenerator
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Database URL from environment
# Try PLANNER_DATABASE_URL first, fallback to DATABASE_URL
DATABASE_URL = os.getenv(
    "PLANNER_DATABASE_URL",
    os.getenv("DATABASE_URL", "postgresql://dev:dev@localhost:5432/shinkofa_planner_dev")
)

# Force psycopg driver (not psycopg2) for compatibility
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

# Async database URL (for async operations)
ASYNC_DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql+asyncpg://", 1)

# Create engine with explicit isolation level
engine = create_engine(
    DATABASE_URL,
    pool_size=int(os.getenv("PLANNER_DATABASE_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("PLANNER_DATABASE_MAX_OVERFLOW", "10")),
    pool_pre_ping=True,  # Verify connections before using
    echo=bool(os.getenv("SQL_ECHO", "False") == "True"),  # SQL logging via env var
    isolation_level="READ COMMITTED",  # Explicit isolation level
)

# Event listener to ensure proper transaction handling with psycopg3
@event.listens_for(Pool, "connect")
def set_psycopg3_config(dbapi_conn, connection_record):
    """Configure psycopg3 connection for proper transaction handling"""
    # psycopg3 starts in autocommit=False by default, which is correct
    # But we need to ensure isolation level is set
    pass  # Isolation level set in engine creation

# Create session factory with SQLAlchemy 2.0 best practices
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    expire_on_commit=False  # Important pour éviter détachement objets
)

# Create async engine for async operations
async_engine = create_async_engine(
    ASYNC_DATABASE_URL,
    pool_size=int(os.getenv("PLANNER_DATABASE_POOL_SIZE", "5")),
    max_overflow=int(os.getenv("PLANNER_DATABASE_MAX_OVERFLOW", "10")),
    pool_pre_ping=True,
    echo=bool(os.getenv("SQL_ECHO", "False") == "True"),
)

# Create async session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

# Create Base for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """
    Dependency to get database session with explicit transaction management

    Usage:
        @app.get("/endpoint")
        def endpoint(db: Session = Depends(get_db)):
            ...

    CRITICAL: Commit happens AFTER yield returns (after endpoint execution)
    This ensures FastAPI dependency injection doesn't close session before commit
    """
    db = SessionLocal()
    try:
        yield db
        # COMMIT APRÈS yield - critical pour FastAPI dependency injection
        db.commit()
    except Exception as e:
        db.rollback()
        raise
    finally:
        db.close()


async def get_async_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency to get async database session

    Usage:
        @app.get("/endpoint")
        async def endpoint(db: AsyncSession = Depends(get_async_db)):
            ...
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception as e:
            await session.rollback()
            raise
        finally:
            await session.close()
