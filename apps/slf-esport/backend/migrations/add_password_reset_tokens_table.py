"""
Migration: Add password_reset_tokens table
"""

import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text
from app.core.config import settings


def migrate():
    """Add password_reset_tokens table"""
    engine = create_engine(settings.DATABASE_URL)

    with engine.connect() as conn:
        # Check if table exists
        result = conn.execute(text("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables
                WHERE table_name = 'password_reset_tokens'
            );
        """))
        exists = result.scalar()

        if exists:
            print("✓ Table password_reset_tokens already exists")
            return

        # Create password_reset_tokens table
        conn.execute(text("""
            CREATE TABLE password_reset_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token VARCHAR(100) UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                is_used BOOLEAN DEFAULT FALSE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
            );
        """))

        # Create index on token for fast lookup
        conn.execute(text("""
            CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
        """))

        # Create index on user_id
        conn.execute(text("""
            CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
        """))

        conn.commit()
        print("✓ Created password_reset_tokens table with indexes")


if __name__ == "__main__":
    migrate()
    print("Migration completed successfully!")
