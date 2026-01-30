"""Add mood_check_ins column to daily_journals

Revision ID: e3f4g5h6i7j8
Revises: e2f3g4h5i6j7
Create Date: 2025-01-21 22:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e3f4g5h6i7j8'
down_revision: Union[str, None] = 'e2f3g4h5i6j7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add mood_check_ins column (JSON array, nullable with default empty list)
    op.add_column(
        'daily_journals',
        sa.Column('mood_check_ins', sa.JSON(), nullable=False, server_default='[]')
    )


def downgrade() -> None:
    op.drop_column('daily_journals', 'mood_check_ins')
