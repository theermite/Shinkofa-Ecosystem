"""Add widget_data table for multi-device sync

Revision ID: e2f3g4h5i6j7
Revises: d1e2f3g4h5i6
Create Date: 2026-01-23 17:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e2f3g4h5i6j7'
down_revision: Union[str, None] = 'd1e2f3g4h5i6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Create widget_data table for storing widget state (tasks, journals, etc.)
    Enables multi-device synchronization via API.
    """
    op.create_table(
        'widget_data',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('widget_slug', sa.String(), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text("timezone('utc', now())"), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text("timezone('utc', now())"), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for efficient queries
    op.create_index('ix_widget_data_id', 'widget_data', ['id'])
    op.create_index('ix_widget_data_user_id', 'widget_data', ['user_id'])
    op.create_index('ix_widget_data_widget_slug', 'widget_data', ['widget_slug'])

    # Create unique constraint on (user_id, widget_slug)
    # Each user can have only one state per widget
    op.create_index(
        'idx_widget_data_user_slug_unique',
        'widget_data',
        ['user_id', 'widget_slug'],
        unique=True
    )


def downgrade() -> None:
    """Drop widget_data table"""
    op.drop_index('idx_widget_data_user_slug_unique', table_name='widget_data')
    op.drop_index('ix_widget_data_widget_slug', table_name='widget_data')
    op.drop_index('ix_widget_data_user_id', table_name='widget_data')
    op.drop_index('ix_widget_data_id', table_name='widget_data')
    op.drop_table('widget_data')
