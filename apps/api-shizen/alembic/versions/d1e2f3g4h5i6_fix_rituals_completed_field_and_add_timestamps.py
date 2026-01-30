"""Fix rituals: rename completed to completed_today and add timestamps

Revision ID: d1e2f3g4h5i6
Revises: c9f1d2e3a4b5
Create Date: 2026-01-12 12:30:00.000000

"""
from typing import Sequence, Union
from datetime import datetime, timezone

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd1e2f3g4h5i6'
down_revision: Union[str, None] = 'c9f1d2e3a4b5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Fix rituals table issues:
    1. Rename completed column to completed_today for clarity
    2. Add created_at and updated_at timestamp columns
    """

    # Step 1: Rename completed column to completed_today
    op.alter_column('rituals', 'completed', new_column_name='completed_today')

    # Step 2: Add created_at column with default value for existing rows
    op.add_column(
        'rituals',
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("timezone('utc', now())")
        )
    )

    # Step 3: Add updated_at column with default value for existing rows
    op.add_column(
        'rituals',
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("timezone('utc', now())")
        )
    )


def downgrade() -> None:
    """Revert changes"""

    # Drop added columns
    op.drop_column('rituals', 'updated_at')
    op.drop_column('rituals', 'created_at')

    # Rename completed_today back to completed
    op.alter_column('rituals', 'completed_today', new_column_name='completed')
