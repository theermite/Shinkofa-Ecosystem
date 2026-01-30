"""add_english_translations

Revision ID: 88gca87c9437
Revises: 77fba76b8326
Create Date: 2026-01-27 16:30:00.000000

Adds English translations to existing questions table
"""
from typing import Sequence, Union
import json
from pathlib import Path

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSON
from sqlalchemy import text


# revision identifiers, used by Alembic.
revision: str = '88gca87c9437'
down_revision: Union[str, None] = '77fba76b8326'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add English translations to questions table"""

    # Load translations
    # Path from alembic/versions/ -> apps/api-shizen-planner/app/data/
    trans_file = Path(__file__).parent.parent.parent / 'app' / 'data' / 'questions-translations-en-complete.json'

    if not trans_file.exists():
        print(f"⚠️  Translation file not found at {trans_file}, skipping")
        return

    print(f"📖 Loading translations from: {trans_file}")

    with open(trans_file, 'r', encoding='utf-8') as f:
        trans_data = json.load(f)

    questions_en = trans_data.get('questions', [])
    print(f"✅ Loaded {len(questions_en)} English translations\n")

    # Get connection
    connection = op.get_bind()

    # Update each question with English translations
    updated_count = 0

    for q_en in questions_en:
        q_num = q_en['number']

        # Prepare update data
        update_data = {
            'text_en': q_en.get('text_en'),
            'bloc_en': q_en.get('bloc_en'),
            'module_en': q_en.get('module_en'),
            'annotation_en': q_en.get('annotation_en', ''),
            'comment_label_en': q_en.get('comment_label_en')
        }

        # Handle options_en (list to JSON)
        options_en = q_en.get('options_en')
        if options_en and isinstance(options_en, list) and len(options_en) > 0:
            update_data['options_en'] = json.dumps(options_en)
        else:
            update_data['options_en'] = None

        # Execute update
        query = text("""
            UPDATE questions
            SET
                text_en = :text_en,
                bloc_en = :bloc_en,
                module_en = :module_en,
                annotation_en = :annotation_en,
                comment_label_en = :comment_label_en,
                options_en = CAST(:options_en AS jsonb)
            WHERE number = :number
        """)

        result = connection.execute(query, {
            **update_data,
            'number': q_num
        })

        if result.rowcount > 0:
            updated_count += 1
            print(f"Updated Q{q_num}", end='\r')

    print(f"\n✅ Updated {updated_count}/{len(questions_en)} questions with English translations")


def downgrade() -> None:
    """Remove English translations (set to NULL)"""

    connection = op.get_bind()

    query = text("""
        UPDATE questions
        SET
            text_en = NULL,
            bloc_en = NULL,
            module_en = NULL,
            annotation_en = NULL,
            comment_label_en = NULL,
            options_en = NULL
    """)

    connection.execute(query)
    print("✅ Removed all English translations from questions table")
