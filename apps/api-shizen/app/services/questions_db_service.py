"""
Questions Database Service - Load questions from PostgreSQL with i18n support
Shinkofa Platform - Multilingual Questionnaire (FR/EN/ES)
"""
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import select
from app.models.question import Question


class QuestionsDBService:
    """Service to load questions from database with locale support"""

    def __init__(self, db: Session):
        self.db = db

    def get_all_questions(self, locale: str = "fr") -> List[Dict[str, Any]]:
        """
        Get all 144 questions with translations

        Args:
            locale: Language code (fr, en, es)

        Returns:
            List of question dicts with translated fields
        """
        # Fetch all questions ordered by number
        questions = self.db.query(Question).order_by(Question.number).all()

        # Convert to dict with translated fields
        result = []
        for q in questions:
            question_dict = {
                "id": q.id,
                "number": q.number,
                "text": q.get_text(locale),
                "bloc": q.get_bloc(locale),
                "module": q.get_module(locale),
                "type": q.type,
                "options": q.get_options(locale),
                "annotation": q.get_annotation(locale),
                "comment_label": q.get_comment_label(locale),
                "is_required": q.is_required,
                "line_number": q.line_number
            }
            result.append(question_dict)

        return result

    def get_question_by_number(self, number: int, locale: str = "fr") -> Optional[Dict[str, Any]]:
        """
        Get single question by number with translations

        Args:
            number: Question number (1-144)
            locale: Language code (fr, en, es)

        Returns:
            Question dict or None if not found
        """
        question = self.db.query(Question).filter(Question.number == number).first()

        if not question:
            return None

        return {
            "id": question.id,
            "number": question.number,
            "text": question.get_text(locale),
            "bloc": question.get_bloc(locale),
            "module": question.get_module(locale),
            "type": question.type,
            "options": question.get_options(locale),
            "annotation": question.get_annotation(locale),
            "comment_label": question.get_comment_label(locale),
            "is_required": question.is_required,
            "line_number": question.line_number
        }

    def get_questions_by_bloc(self, bloc_letter: str, locale: str = "fr") -> List[Dict[str, Any]]:
        """
        Get all questions for a specific bloc (A-I)

        Args:
            bloc_letter: Bloc letter (A, B, C, D, E, F, G, H, I)
            locale: Language code (fr, en, es)

        Returns:
            List of question dicts filtered by bloc
        """
        # Build bloc pattern to match (e.g., "🏠 BLOC A : ...")
        bloc_pattern = f"%BLOC {bloc_letter.upper()} :%"

        questions = self.db.query(Question).filter(
            Question.bloc_fr.like(bloc_pattern)
        ).order_by(Question.number).all()

        result = []
        for q in questions:
            question_dict = {
                "id": q.id,
                "number": q.number,
                "text": q.get_text(locale),
                "bloc": q.get_bloc(locale),
                "module": q.get_module(locale),
                "type": q.type,
                "options": q.get_options(locale),
                "annotation": q.get_annotation(locale),
                "comment_label": q.get_comment_label(locale),
                "is_required": q.is_required,
                "line_number": q.line_number
            }
            result.append(question_dict)

        return result

    def get_questions_grouped_by_bloc(self, locale: str = "fr") -> Dict[str, List[Dict[str, Any]]]:
        """
        Get all questions grouped by bloc

        Args:
            locale: Language code (fr, en, es)

        Returns:
            Dict with bloc names as keys and question lists as values
        """
        all_questions = self.get_all_questions(locale)

        # Group by bloc
        blocs = {}
        for q in all_questions:
            bloc_name = q["bloc"]
            if bloc_name not in blocs:
                blocs[bloc_name] = []
            blocs[bloc_name].append(q)

        return blocs

    def get_available_locales(self) -> List[str]:
        """
        Get list of available locales based on translated fields in database

        Returns:
            List of locale codes with at least some translations
        """
        # Check if English translations exist
        en_count = self.db.query(Question).filter(Question.text_en.isnot(None)).count()

        # Check if Spanish translations exist
        es_count = self.db.query(Question).filter(Question.text_es.isnot(None)).count()

        locales = ["fr"]  # French always available
        if en_count > 0:
            locales.append("en")
        if es_count > 0:
            locales.append("es")

        return locales

    def get_translation_stats(self) -> Dict[str, Any]:
        """
        Get translation statistics

        Returns:
            Dict with translation completion percentages for each locale
        """
        total_questions = self.db.query(Question).count()

        fr_count = self.db.query(Question).filter(Question.text_fr.isnot(None)).count()
        en_count = self.db.query(Question).filter(Question.text_en.isnot(None)).count()
        es_count = self.db.query(Question).filter(Question.text_es.isnot(None)).count()

        return {
            "total_questions": total_questions,
            "translations": {
                "fr": {
                    "count": fr_count,
                    "percentage": round((fr_count / total_questions * 100) if total_questions > 0 else 0, 1)
                },
                "en": {
                    "count": en_count,
                    "percentage": round((en_count / total_questions * 100) if total_questions > 0 else 0, 1)
                },
                "es": {
                    "count": es_count,
                    "percentage": round((es_count / total_questions * 100) if total_questions > 0 else 0, 1)
                }
            },
            "available_locales": self.get_available_locales()
        }


# Dependency for FastAPI endpoints
def get_questions_service(db: Session = None):
    """Dependency injection for questions service"""
    if db is None:
        from app.core.database import get_db
        db = next(get_db())
    return QuestionsDBService(db)
