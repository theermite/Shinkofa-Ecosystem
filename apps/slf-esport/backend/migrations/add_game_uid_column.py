"""
Migration: Add game_uid column to users table
Run this migration to add the game_uid (HOK UID) field for players
"""

import sys
import os
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import create_engine, text
from app.core.config import settings


def run_migration():
    """Add game_uid column to users table"""

    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        try:
            # Check if column already exists
            result = conn.execute(text("""
                SELECT column_name
                FROM information_schema.columns
                WHERE table_name='users' AND column_name='game_uid'
            """))

            if result.fetchone():
                print("✅ Column 'game_uid' already exists in users table")
                return

            # Add game_uid column
            conn.execute(text("""
                ALTER TABLE users
                ADD COLUMN game_uid VARCHAR(100) NULL
            """))

            conn.commit()
            print("✅ Migration successful: Added game_uid column to users table")

        except Exception as e:
            print(f"❌ Migration failed: {e}")
            conn.rollback()
            raise


if __name__ == "__main__":
    print("Running migration: Add game_uid column...")
    run_migration()
    print("Migration completed!")
