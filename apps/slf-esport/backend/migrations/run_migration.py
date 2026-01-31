#!/usr/bin/env python3
"""
Migration runner script
Executes SQL migration files against the database
"""

import sys
import os
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.database import engine
from sqlalchemy import text


def run_migration(migration_file: str):
    """
    Execute a SQL migration file

    Args:
        migration_file: Path to the migration SQL file
    """
    migration_path = Path(__file__).parent / migration_file

    if not migration_path.exists():
        print(f"❌ Migration file not found: {migration_file}")
        sys.exit(1)

    print(f"📂 Loading migration: {migration_file}")

    # Read migration SQL
    with open(migration_path, 'r', encoding='utf-8') as f:
        sql_content = f.read()

    print(f"📜 Migration content loaded ({len(sql_content)} characters)")

    # Execute migration
    try:
        with engine.connect() as connection:
            # Begin transaction
            trans = connection.begin()

            try:
                # Split SQL by semicolons and execute each statement
                statements = [s.strip() for s in sql_content.split(';') if s.strip() and not s.strip().startswith('--')]

                for i, statement in enumerate(statements, 1):
                    if statement:
                        print(f"  ⚙️  Executing statement {i}/{len(statements)}...")
                        connection.execute(text(statement))

                # Commit transaction
                trans.commit()
                print(f"✅ Migration completed successfully!")

            except Exception as e:
                # Rollback on error
                trans.rollback()
                print(f"❌ Migration failed, rolling back...")
                raise e

    except Exception as e:
        print(f"❌ Error executing migration: {e}")
        sys.exit(1)


if __name__ == "__main__":
    print("=" * 60)
    print("🚀 SLF-Esport Database Migration Runner")
    print("=" * 60)

    # Get migration file from command line or use default
    if len(sys.argv) > 1:
        migration_file = sys.argv[1]
    else:
        migration_file = "001_add_super_admin_role.sql"
        print(f"ℹ️  No migration file specified, using default: {migration_file}")

    run_migration(migration_file)

    print("=" * 60)
    print("✅ Migration process completed!")
    print("=" * 60)
