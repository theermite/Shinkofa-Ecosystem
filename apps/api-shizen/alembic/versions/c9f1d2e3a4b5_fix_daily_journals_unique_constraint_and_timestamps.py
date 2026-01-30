"""Fix daily_journals unique constraint and add timestamps

Revision ID: c9f1d2e3a4b5
Revises: b8a1c9d4e5f2
Create Date: 2026-01-12 10:30:00.000000

"""
from typing import Sequence, Union
from datetime import datetime, timezone

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9f1d2e3a4b5'
down_revision: Union[str, None] = 'b8a1c9d4e5f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Fix daily_journals table issues:
    1. Drop UNIQUE constraint on date column (allows only 1 journal per date across all users)
    2. Add composite UNIQUE constraint on (date, user_id) (allows 1 journal per date per user)
    3. Add created_at and updated_at timestamp columns
    """

    # Step 1: Drop the existing unique index on date
    op.drop_index('ix_daily_journals_date', table_name='daily_journals')

    # Step 2: Create a non-unique index on date (for query performance)
    op.create_index(op.f('ix_daily_journals_date'), 'daily_journals', ['date'], unique=False)

    # Step 3: Create a composite unique constraint on (user_id, date)
    # This ensures one journal per date per user
    op.create_unique_constraint(
        'uq_daily_journals_user_date',
        'daily_journals',
        ['user_id', 'date']
    )

    # Step 4: Add created_at column with default value for existing rows
    op.add_column(
        'daily_journals',
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("timezone('utc', now())")
        )
    )

    # Step 5: Add updated_at column with default value for existing rows
    op.add_column(
        'daily_journals',
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
    op.drop_column('daily_journals', 'updated_at')
    op.drop_column('daily_journals', 'created_at')

    # Drop composite unique constraint
    op.drop_constraint('uq_daily_journals_user_date', 'daily_journals', type_='unique')

    # Drop non-unique index on date
    op.drop_index(op.f('ix_daily_journals_date'), table_name='daily_journals')

    # Recreate original unique index on date (the buggy version)
    op.create_index(op.f('ix_daily_journals_date'), 'daily_journals', ['date'], unique=True)
