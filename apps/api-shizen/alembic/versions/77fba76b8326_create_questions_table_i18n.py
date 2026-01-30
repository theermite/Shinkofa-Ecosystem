"""create_questions_table_i18n

Revision ID: 77fba76b8326
Revises: f3a4b5c6d7e8
Create Date: 2026-01-27 14:56:55.222998

Creates multilingual questions table and imports existing questions from JSON
"""
from typing import Sequence, Union
import json
from pathlib import Path

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON


# revision identifiers, used by Alembic.
revision: str = '77fba76b8326'
down_revision: Union[str, None] = 'f3a4b5c6d7e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create questions table
    op.create_table(
        'questions',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('number', sa.Integer(), nullable=False),
        sa.Column('text_fr', sa.Text(), nullable=False),
        sa.Column('text_en', sa.Text(), nullable=True),
        sa.Column('text_es', sa.Text(), nullable=True),
        sa.Column('bloc_fr', sa.String(), nullable=False),
        sa.Column('bloc_en', sa.String(), nullable=True),
        sa.Column('bloc_es', sa.String(), nullable=True),
        sa.Column('module_fr', sa.String(), nullable=False),
        sa.Column('module_en', sa.String(), nullable=True),
        sa.Column('module_es', sa.String(), nullable=True),
        sa.Column('type', sa.String(), nullable=False),
        sa.Column('options_fr', JSON, nullable=True),
        sa.Column('options_en', JSON, nullable=True),
        sa.Column('options_es', JSON, nullable=True),
        sa.Column('annotation_fr', sa.Text(), nullable=True),
        sa.Column('annotation_en', sa.Text(), nullable=True),
        sa.Column('annotation_es', sa.Text(), nullable=True),
        sa.Column('comment_label_fr', sa.String(), nullable=True),
        sa.Column('comment_label_en', sa.String(), nullable=True),
        sa.Column('comment_label_es', sa.String(), nullable=True),
        sa.Column('is_required', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('line_number', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_questions_id'), 'questions', ['id'], unique=False)
    op.create_index(op.f('ix_questions_number'), 'questions', ['number'], unique=True)

    # Import existing questions from JSON
    # Path from alembic/versions/ -> apps/api-shizen-planner/app/data/
    json_path = Path(__file__).parent.parent.parent / 'app' / 'data' / 'questions-index.json'
    if json_path.exists():
        print(f"📥 Importing questions from {json_path}")
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        questions = data.get('questions', [])
        print(f"Found {len(questions)} questions to import")

        # Prepare bulk insert data
        questions_to_insert = []
        for q in questions:
            # Parse options string into list
            options_fr = []
            if q.get('options') and isinstance(q['options'], str):
                options_fr = [opt.strip() for opt in q['options'].split(',')]
            elif q.get('options') and isinstance(q['options'], list):
                options_fr = q['options']

            question_data = {
                'id': f"q{q['number']}",
                'number': q['number'],
                'text_fr': q['text'],
                'text_en': None,  # Will be translated later
                'text_es': None,
                'bloc_fr': q['bloc'],
                'bloc_en': None,
                'bloc_es': None,
                'module_fr': q['module'],
                'module_en': None,
                'module_es': None,
                'type': q['type'],
                'options_fr': options_fr if options_fr else None,
                'options_en': None,
                'options_es': None,
                'annotation_fr': q.get('annotation'),
                'annotation_en': None,
                'annotation_es': None,
                'comment_label_fr': q.get('commentaire_libre'),
                'comment_label_en': None,
                'comment_label_es': None,
                'is_required': True,  # Default
                'line_number': q.get('line_number')
            }
            questions_to_insert.append(question_data)

        # Bulk insert
        op.bulk_insert(
            sa.table('questions',
                sa.column('id', sa.String()),
                sa.column('number', sa.Integer()),
                sa.column('text_fr', sa.Text()),
                sa.column('text_en', sa.Text()),
                sa.column('text_es', sa.Text()),
                sa.column('bloc_fr', sa.String()),
                sa.column('bloc_en', sa.String()),
                sa.column('bloc_es', sa.String()),
                sa.column('module_fr', sa.String()),
                sa.column('module_en', sa.String()),
                sa.column('module_es', sa.String()),
                sa.column('type', sa.String()),
                sa.column('options_fr', JSON),
                sa.column('options_en', JSON),
                sa.column('options_es', JSON),
                sa.column('annotation_fr', sa.Text()),
                sa.column('annotation_en', sa.Text()),
                sa.column('annotation_es', sa.Text()),
                sa.column('comment_label_fr', sa.String()),
                sa.column('comment_label_en', sa.String()),
                sa.column('comment_label_es', sa.String()),
                sa.column('is_required', sa.Boolean()),
                sa.column('line_number', sa.Integer())
            ),
            questions_to_insert
        )
        print(f"✅ Imported {len(questions_to_insert)} questions successfully")
    else:
        print(f"⚠️ JSON file not found at {json_path}, skipping import")


def downgrade() -> None:
    op.drop_index(op.f('ix_questions_number'), table_name='questions')
    op.drop_index(op.f('ix_questions_id'), table_name='questions')
    op.drop_table('questions')
