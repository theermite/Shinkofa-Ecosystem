"""Create shizen_message_usage table for tier limits

Revision ID: f3a4b5c6d7e8
Revises: e2f3g4h5i6j7
Create Date: 2026-01-25 19:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3a4b5c6d7e8'
down_revision: Union[str, None] = 'e3f4g5h6i7j8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Create shizen_message_usage table for tracking monthly message counts"""
    op.create_table(
        'shizen_message_usage',
        sa.Column('id', sa.String(36), primary_key=True),
        sa.Column('user_id', sa.String(36), nullable=False, index=True),
        sa.Column('year_month', sa.String(7), nullable=False),  # Format: "2026-01"
        sa.Column('message_count', sa.Integer(), nullable=False, default=0),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
    )

    # Unique constraint on user_id + year_month
    op.create_unique_constraint(
        'uq_shizen_message_usage_user_month',
        'shizen_message_usage',
        ['user_id', 'year_month']
    )

    # Index for efficient queries
    op.create_index(
        'ix_shizen_message_usage_user_month',
        'shizen_message_usage',
        ['user_id', 'year_month']
    )


def downgrade() -> None:
    """Drop shizen_message_usage table"""
    op.drop_index('ix_shizen_message_usage_user_month', table_name='shizen_message_usage')
    op.drop_constraint('uq_shizen_message_usage_user_month', 'shizen_message_usage', type_='unique')
    op.drop_table('shizen_message_usage')
