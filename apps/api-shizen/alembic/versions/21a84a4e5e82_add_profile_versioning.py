"""add_profile_versioning

Revision ID: 21a84a4e5e82
Revises: 88gca87c9437
Create Date: 2026-01-27 18:36:46.209497

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '21a84a4e5e82'
down_revision: Union[str, None] = '88gca87c9437'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add versioning columns to holistic_profiles table
    op.add_column('holistic_profiles', sa.Column('version', sa.Integer(), nullable=False, server_default='1'))
    op.add_column('holistic_profiles', sa.Column('version_name', sa.String(), nullable=True))
    op.add_column('holistic_profiles', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))

    # Drop unique index on session_id to allow multiple versions per session
    op.drop_index('ix_holistic_profiles_session_id', 'holistic_profiles')


def downgrade() -> None:
    # Re-add unique index on session_id
    op.create_index('ix_holistic_profiles_session_id', 'holistic_profiles', ['session_id'], unique=True)

    # Remove versioning columns
    op.drop_column('holistic_profiles', 'is_active')
    op.drop_column('holistic_profiles', 'version_name')
    op.drop_column('holistic_profiles', 'version')
