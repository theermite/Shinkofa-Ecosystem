"""add questionnaire tables

Revision ID: 590ced3fe486
Revises: a68983c8d413
Create Date: 2026-01-04 22:59:34.384976

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '590ced3fe486'
down_revision: Union[str, None] = 'a68983c8d413'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create questionnaire_sessions table
    op.create_table(
        'questionnaire_sessions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('status', sa.Enum('STARTED', 'IN_PROGRESS', 'COMPLETED', 'ANALYZED', 'ABANDONED', name='sessionstatus'), nullable=False),
        sa.Column('current_bloc', sa.String(), nullable=True),
        sa.Column('completion_percentage', sa.String(), nullable=False, server_default='0'),
        sa.Column('birth_data', sa.JSON(), nullable=True),
        sa.Column('full_name', sa.String(), nullable=True),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('last_activity_at', sa.DateTime(), nullable=False),
        sa.Column('completed_at', sa.DateTime(), nullable=True),
        sa.Column('analyzed_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questionnaire_sessions_id'), 'questionnaire_sessions', ['id'], unique=False)
    op.create_index(op.f('ix_questionnaire_sessions_user_id'), 'questionnaire_sessions', ['user_id'], unique=False)
    op.create_index(op.f('ix_questionnaire_sessions_status'), 'questionnaire_sessions', ['status'], unique=False)

    # Create questionnaire_responses table
    op.create_table(
        'questionnaire_responses',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('session_id', sa.String(), nullable=False),
        sa.Column('bloc', sa.String(), nullable=False),
        sa.Column('question_id', sa.String(), nullable=False),
        sa.Column('question_text', sa.String(), nullable=True),
        sa.Column('answer', sa.JSON(), nullable=False),
        sa.Column('question_type', sa.String(), nullable=False),
        sa.Column('is_required', sa.String(), nullable=False, server_default='false'),
        sa.Column('answered_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['questionnaire_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questionnaire_responses_id'), 'questionnaire_responses', ['id'], unique=False)
    op.create_index(op.f('ix_questionnaire_responses_session_id'), 'questionnaire_responses', ['session_id'], unique=False)
    op.create_index(op.f('ix_questionnaire_responses_bloc'), 'questionnaire_responses', ['bloc'], unique=False)
    op.create_index(op.f('ix_questionnaire_responses_question_id'), 'questionnaire_responses', ['question_id'], unique=False)

    # Create holistic_profiles table
    op.create_table(
        'holistic_profiles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('session_id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('psychological_analysis', sa.JSON(), nullable=True),
        sa.Column('neurodivergence_analysis', sa.JSON(), nullable=True),
        sa.Column('shinkofa_analysis', sa.JSON(), nullable=True),
        sa.Column('design_human', sa.JSON(), nullable=True),
        sa.Column('astrology_western', sa.JSON(), nullable=True),
        sa.Column('astrology_chinese', sa.JSON(), nullable=True),
        sa.Column('numerology', sa.JSON(), nullable=True),
        sa.Column('synthesis', sa.Text(), nullable=True),
        sa.Column('recommendations', sa.JSON(), nullable=True),
        sa.Column('pdf_export_path', sa.String(), nullable=True),
        sa.Column('markdown_export_path', sa.String(), nullable=True),
        sa.Column('generated_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['session_id'], ['questionnaire_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('session_id')
    )
    op.create_index(op.f('ix_holistic_profiles_id'), 'holistic_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_holistic_profiles_session_id'), 'holistic_profiles', ['session_id'], unique=True)
    op.create_index(op.f('ix_holistic_profiles_user_id'), 'holistic_profiles', ['user_id'], unique=False)

    # Create uploaded_charts table
    op.create_table(
        'uploaded_charts',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('session_id', sa.String(), nullable=False),
        sa.Column('chart_type', sa.Enum('DESIGN_HUMAN', 'BIRTH_CHART', name='charttype'), nullable=False),
        sa.Column('status', sa.Enum('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED', name='chartstatus'), nullable=False),
        sa.Column('file_name', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=False),
        sa.Column('file_size', sa.String(), nullable=False),
        sa.Column('file_type', sa.String(), nullable=False),
        sa.Column('extracted_data', sa.JSON(), nullable=True),
        sa.Column('shizen_analysis', sa.JSON(), nullable=True),
        sa.Column('error_message', sa.String(), nullable=True),
        sa.Column('uploaded_at', sa.DateTime(), nullable=False),
        sa.Column('processed_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['session_id'], ['questionnaire_sessions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_uploaded_charts_id'), 'uploaded_charts', ['id'], unique=False)
    op.create_index(op.f('ix_uploaded_charts_session_id'), 'uploaded_charts', ['session_id'], unique=False)
    op.create_index(op.f('ix_uploaded_charts_chart_type'), 'uploaded_charts', ['chart_type'], unique=False)
    op.create_index(op.f('ix_uploaded_charts_status'), 'uploaded_charts', ['status'], unique=False)


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign keys)
    op.drop_index(op.f('ix_uploaded_charts_status'), table_name='uploaded_charts')
    op.drop_index(op.f('ix_uploaded_charts_chart_type'), table_name='uploaded_charts')
    op.drop_index(op.f('ix_uploaded_charts_session_id'), table_name='uploaded_charts')
    op.drop_index(op.f('ix_uploaded_charts_id'), table_name='uploaded_charts')
    op.drop_table('uploaded_charts')

    op.drop_index(op.f('ix_holistic_profiles_user_id'), table_name='holistic_profiles')
    op.drop_index(op.f('ix_holistic_profiles_session_id'), table_name='holistic_profiles')
    op.drop_index(op.f('ix_holistic_profiles_id'), table_name='holistic_profiles')
    op.drop_table('holistic_profiles')

    op.drop_index(op.f('ix_questionnaire_responses_question_id'), table_name='questionnaire_responses')
    op.drop_index(op.f('ix_questionnaire_responses_bloc'), table_name='questionnaire_responses')
    op.drop_index(op.f('ix_questionnaire_responses_session_id'), table_name='questionnaire_responses')
    op.drop_index(op.f('ix_questionnaire_responses_id'), table_name='questionnaire_responses')
    op.drop_table('questionnaire_responses')

    op.drop_index(op.f('ix_questionnaire_sessions_status'), table_name='questionnaire_sessions')
    op.drop_index(op.f('ix_questionnaire_sessions_user_id'), table_name='questionnaire_sessions')
    op.drop_index(op.f('ix_questionnaire_sessions_id'), table_name='questionnaire_sessions')
    op.drop_table('questionnaire_sessions')

    # Drop enums
    sa.Enum(name='chartstatus').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='charttype').drop(op.get_bind(), checkfirst=True)
    sa.Enum(name='sessionstatus').drop(op.get_bind(), checkfirst=True)
