"""fix questionnaire session timestamps timezone

Revision ID: 65b640c3324e
Revises: abd4f785c753
Create Date: 2026-01-11 18:45:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '65b640c3324e'
down_revision: Union[str, None] = 'abd4f785c753'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Fix timezone consistency in questionnaire_sessions table

    Changes:
    - started_at: TIMESTAMP WITHOUT TIME ZONE → TIMESTAMP WITH TIME ZONE
    - last_activity_at: TIMESTAMP WITHOUT TIME ZONE → TIMESTAMP WITH TIME ZONE

    This fixes the error: "can't subtract offset-naive and offset-aware datetimes"
    All timestamps are now consistently timezone-aware (UTC)
    """
    # PostgreSQL: ALTER COLUMN to add timezone support
    op.execute("""
        ALTER TABLE questionnaire_sessions
        ALTER COLUMN started_at TYPE TIMESTAMP WITH TIME ZONE
        USING started_at AT TIME ZONE 'UTC'
    """)

    op.execute("""
        ALTER TABLE questionnaire_sessions
        ALTER COLUMN last_activity_at TYPE TIMESTAMP WITH TIME ZONE
        USING last_activity_at AT TIME ZONE 'UTC'
    """)


def downgrade() -> None:
    """
    Revert timezone changes (NOT RECOMMENDED - data loss possible)

    Removes timezone information from timestamps.
    WARNING: This may cause precision loss and timezone issues.
    """
    # PostgreSQL: Remove timezone support
    op.execute("""
        ALTER TABLE questionnaire_sessions
        ALTER COLUMN started_at TYPE TIMESTAMP WITHOUT TIME ZONE
        USING started_at AT TIME ZONE 'UTC'
    """)

    op.execute("""
        ALTER TABLE questionnaire_sessions
        ALTER COLUMN last_activity_at TYPE TIMESTAMP WITHOUT TIME ZONE
        USING last_activity_at AT TIME ZONE 'UTC'
    """)
