---
description: Configure PostgreSQL database with Alembic migrations
---

# Slash Command: /setup-database

## 🎯 Objectif

Configure une base de données PostgreSQL production-ready avec:
- Configuration SQLAlchemy ORM
- Alembic migrations setup
- Models Pydantic validation
- Seed data initial
- Connection pooling
- Backup strategy

## 📋 Arguments

**Syntaxe** : `/setup-database <database-name> [--tables <table1,table2,...>]`

**Arguments** :
- `<database-name>` : Nom de la base de données (requis)
- `--tables` : Liste tables à créer (optionnel, par défaut: users, sessions)

**Exemples** :
```bash
/setup-database todo_app
/setup-database coaching_platform --tables users,coaches,sessions,exercises
/setup-database family_hub --tables users,tasks,calendar_events,shopping_lists
```

## 🚀 Ce que fait le Command

### Étape 1 : Configuration PostgreSQL

**Créer fichier `.env`** :
```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/database_name
POSTGRES_USER=your_username
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=database_name
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Connection Pool
DATABASE_POOL_SIZE=5
DATABASE_MAX_OVERFLOW=10
DATABASE_POOL_TIMEOUT=30
DATABASE_POOL_RECYCLE=3600

# Backup Configuration
BACKUP_DIR=./backups
BACKUP_RETENTION_DAYS=30
```

**Créer fichier `database.py`** (SQLAlchemy config) :
```python
\"\"\"
Database configuration and session management
\"\"\"
import os
from typing import Generator
from sqlalchemy import create_engine, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from dotenv import load_dotenv

load_dotenv()

# Database URL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# Engine configuration
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=int(os.getenv("DATABASE_POOL_SIZE", 5)),
    max_overflow=int(os.getenv("DATABASE_MAX_OVERFLOW", 10)),
    pool_timeout=int(os.getenv("DATABASE_POOL_TIMEOUT", 30)),
    pool_recycle=int(os.getenv("DATABASE_POOL_RECYCLE", 3600)),
    echo=False,  # Set True for SQL query logging (dev only)
)

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class for models
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    \"\"\"
    Dependency for FastAPI routes to get database session

    Yields:
        Session: SQLAlchemy database session

    Example:
        @app.get("/users")
        def get_users(db: Session = Depends(get_db)):
            return db.query(User).all()
    \"\"\"
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Connection event listeners
@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    \"\"\"Set PostgreSQL connection parameters\"\"\"
    cursor = dbapi_conn.cursor()
    cursor.execute("SET TIME ZONE 'UTC'")
    cursor.close()
```

### Étape 2 : Setup Alembic Migrations

**Initialiser Alembic** :
```bash
pip install alembic
alembic init alembic
```

**Configurer `alembic/env.py`** :
```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Add parent directory to path
sys.path.insert(0, os.path.realpath(os.path.join(os.path.dirname(__file__), '..')))

from database import Base, DATABASE_URL
from models import *  # Import all models

# Alembic Config object
config = context.config

# Override sqlalchemy.url with environment variable
config.set_main_option("sqlalchemy.url", DATABASE_URL)

# Interpret the config file for Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Metadata from models
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    \"\"\"Run migrations in 'offline' mode.\"\"\"
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    \"\"\"Run migrations in 'online' mode.\"\"\"
    connectable = engine_from_config(
        config.get_section(config.config_ini_section),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
```

**Créer première migration** :
```bash
alembic revision --autogenerate -m "Initial migration with tables"
alembic upgrade head
```

### Étape 3 : Créer Models SQLAlchemy

**Fichier `models.py`** (exemple avec tables standard) :
```python
\"\"\"
Database models (SQLAlchemy ORM)
\"\"\"
from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from database import Base


class User(Base):
    \"\"\"User model\"\"\"
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    username = Column(String(100), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<User(id={self.id}, email={self.email})>"


class Session(Base):
    \"\"\"User session model\"\"\"
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")

    def __repr__(self):
        return f"<Session(id={self.id}, user_id={self.user_id})>"
```

### Étape 4 : Créer Schemas Pydantic

**Fichier `schemas.py`** :
```python
\"\"\"
Pydantic schemas for request/response validation
\"\"\"
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator


class UserBase(BaseModel):
    \"\"\"Base user schema\"\"\"
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: Optional[str] = Field(None, max_length=255)


class UserCreate(UserBase):
    \"\"\"Schema for user creation\"\"\"
    password: str = Field(..., min_length=8, max_length=100)

    @validator("password")
    def validate_password(cls, v):
        \"\"\"Validate password strength\"\"\"
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class UserUpdate(BaseModel):
    \"\"\"Schema for user update\"\"\"
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, max_length=255)
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    \"\"\"Schema for user response\"\"\"
    id: int
    is_active: bool
    is_admin: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2 (orm_mode in v1)
```

### Étape 5 : Créer Seed Data

**Fichier `seed.py`** :
```python
\"\"\"
Seed initial data into database
\"\"\"
from database import SessionLocal, engine, Base
from models import User
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def seed_database():
    \"\"\"Seed initial data\"\"\"
    # Create tables if not exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()

    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == "admin@example.com").first()
        if not admin:
            # Create admin user
            admin = User(
                email="admin@example.com",
                username="admin",
                hashed_password=pwd_context.hash("Admin123!"),
                full_name="Administrator",
                is_active=True,
                is_admin=True,
            )
            db.add(admin)
            print("✅ Admin user created")

        # Create test user
        test_user = db.query(User).filter(User.email == "test@example.com").first()
        if not test_user:
            test_user = User(
                email="test@example.com",
                username="testuser",
                hashed_password=pwd_context.hash("Test123!"),
                full_name="Test User",
                is_active=True,
                is_admin=False,
            )
            db.add(test_user)
            print("✅ Test user created")

        db.commit()
        print("✅ Database seeded successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding database: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
```

**Exécuter seed** :
```bash
python seed.py
```

### Étape 6 : Backup Strategy

**Créer script `backup_db.sh`** :
```bash
#!/bin/bash
# PostgreSQL Backup Script

# Load environment variables
source .env

# Configuration
BACKUP_DIR=${BACKUP_DIR:-./backups}
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/${POSTGRES_DB}_backup_$TIMESTAMP.sql"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Perform backup
echo "🔄 Starting database backup..."
PGPASSWORD=$POSTGRES_PASSWORD pg_dump \
  -h $POSTGRES_HOST \
  -p $POSTGRES_PORT \
  -U $POSTGRES_USER \
  -d $POSTGRES_DB \
  -F c \
  -f "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "✅ Backup completed: $BACKUP_FILE"

  # Compress backup
  gzip "$BACKUP_FILE"
  echo "✅ Backup compressed: $BACKUP_FILE.gz"

  # Delete old backups
  find "$BACKUP_DIR" -name "*.sql.gz" -mtime +$RETENTION_DAYS -delete
  echo "✅ Old backups deleted (retention: $RETENTION_DAYS days)"
else
  echo "❌ Backup failed!"
  exit 1
fi
```

**Ajouter cron job (Linux/Mac)** :
```bash
# Backup tous les jours à 2h du matin
0 2 * * * /path/to/backup_db.sh >> /path/to/backup.log 2>&1
```

### Étape 7 : Tests Database

**Fichier `test_database.py`** :
```python
\"\"\"
Database tests
\"\"\"
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models import User
import os

# Test database URL
TEST_DATABASE_URL = os.getenv("TEST_DATABASE_URL", "postgresql://test:test@localhost:5432/test_db")

# Test engine
engine = create_engine(TEST_DATABASE_URL)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db():
    \"\"\"Database fixture for tests\"\"\"
    # Create tables
    Base.metadata.create_all(bind=engine)

    db = TestSessionLocal()
    yield db

    # Cleanup
    db.close()
    Base.metadata.drop_all(bind=engine)


def test_create_user(db):
    \"\"\"Test creating a user\"\"\"
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password_here",
        full_name="Test User",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    assert user.id is not None
    assert user.email == "test@example.com"
    assert user.is_active is True


def test_user_relationships(db):
    \"\"\"Test user relationships\"\"\"
    user = User(
        email="test@example.com",
        username="testuser",
        hashed_password="hashed_password_here",
    )
    db.add(user)
    db.commit()

    # Test sessions relationship
    assert user.sessions == []
```

## ✅ Checklist Post-Setup

- [ ] `.env` créé avec DATABASE_URL valide
- [ ] `database.py` configuré (SQLAlchemy + pooling)
- [ ] Alembic initialisé et configuré
- [ ] Models SQLAlchemy créés
- [ ] Schemas Pydantic créés
- [ ] Migration initiale générée et appliquée
- [ ] Seed data exécuté (admin + test users)
- [ ] Backup script créé et testé
- [ ] Tests database passent (pytest)
- [ ] Documentation `.claude/docs/database-schema.md` créée

## 📚 Références

**SQLAlchemy** : https://docs.sqlalchemy.org/
**Alembic** : https://alembic.sqlalchemy.org/
**Pydantic** : https://docs.pydantic.dev/
**PostgreSQL** : https://www.postgresql.org/docs/

## 🔧 Commandes Utiles

```bash
# Créer nouvelle migration
alembic revision --autogenerate -m "Description"

# Appliquer migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1

# Voir historique migrations
alembic history

# Reset database (⚠️ PERTE DONNÉES)
alembic downgrade base
alembic upgrade head

# Backup manuel
./backup_db.sh

# Restore backup
gunzip backups/mydb_backup_20251113_140000.sql.gz
psql -h localhost -U username -d database_name < backups/mydb_backup_20251113_140000.sql
```

## 🚨 Notes Importantes

- **Sécurité** : Ne JAMAIS commit `.env` avec credentials production
- **Backup** : Tester restore régulièrement (backups inutiles si restore impossible)
- **Migrations** : Review TOUJOURS migrations auto-générées avant appliquer
- **Pooling** : Adapter pool_size selon charge serveur (5-10 pour apps moyennes)
- **Indexes** : Ajouter indexes sur colonnes fréquemment filtrées (email, username)

---

**Version 1.0 | 2025-11-13 | Command /setup-database**
