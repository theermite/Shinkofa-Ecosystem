"""fix holistic profiles timestamps timezone

Revision ID: b8a1c9d4e5f2
Revises: 65b640c3324e
Create Date: 2026-01-12 09:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8a1c9d4e5f2'
down_revision: Union[str, None] = '65b640c3324e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Fix timezone consistency in holistic_profiles table

    Changes:
    - generated_at: TIMESTAMP WITHOUT TIME ZONE → TIMESTAMP WITH TIME ZONE
    - updated_at: TIMESTAMP WITHOUT TIME ZONE → TIMESTAMP WITH TIME ZONE

    This fixes the error: "can't subtract offset-naive and offset-aware datetimes"
    All timestamps are now consistently timezone-aware (UTC)
    """
    # PostgreSQL: ALTER COLUMN to add timezone support
    op.execute("""
        ALTER TABLE holistic_profiles
        ALTER COLUMN generated_at TYPE TIMESTAMP WITH TIME ZONE
        USING generated_at AT TIME ZONE 'UTC'
    """)

    op.execute("""
        ALTER TABLE holistic_profiles
        ALTER COLUMN updated_at TYPE TIMESTAMP WITH TIME ZONE
        USING updated_at AT TIME ZONE 'UTC'
    """)


def downgrade() -> None:
    """
    Revert timezone changes (NOT RECOMMENDED - data loss possible)

    Removes timezone information from timestamps.
    WARNING: This may cause precision loss and timezone issues.
    """
    # PostgreSQL: Remove timezone support
    op.execute("""
        ALTER TABLE holistic_profiles
        ALTER COLUMN generated_at TYPE TIMESTAMP WITHOUT TIME ZONE
        USING generated_at AT TIME ZONE 'UTC'
    """)

    op.execute("""
        ALTER TABLE holistic_profiles
        ALTER COLUMN updated_at TYPE TIMESTAMP WITHOUT TIME ZONE
        USING updated_at AT TIME ZONE 'UTC'
    """)
