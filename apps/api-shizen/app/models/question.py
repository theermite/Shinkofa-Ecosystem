"""
Question Model - Multilingual questionnaire questions
Shinkofa Platform - Shizen Planner API
"""
from sqlalchemy import Column, String, Integer, Text, JSON, Boolean
from app.core.database import Base


class Question(Base):
    """
    Multilingual questionnaire questions

    Supports FR, EN, ES translations for all text fields
    """
    __tablename__ = "questions"

    # Primary key
    id = Column(String, primary_key=True, index=True)  # e.g., "q1", "q2"
    number = Column(Integer, nullable=False, unique=True, index=True)

    # Question text (multilingual)
    text_fr = Column(Text, nullable=False)
    text_en = Column(Text, nullable=True)  # Will be populated
    text_es = Column(Text, nullable=True)  # Future

    # Bloc (multilingual)
    bloc_fr = Column(String, nullable=False)
    bloc_en = Column(String, nullable=True)
    bloc_es = Column(String, nullable=True)

    # Module (multilingual)
    module_fr = Column(String, nullable=False)
    module_en = Column(String, nullable=True)
    module_es = Column(String, nullable=True)

    # Question type (language-independent)
    type = Column(String, nullable=False)  # "text", "radio", "checkbox", "likert", "number"

    # Options (multilingual - JSON format)
    options_fr = Column(JSON, nullable=True)  # ["Option 1", "Option 2"]
    options_en = Column(JSON, nullable=True)
    options_es = Column(JSON, nullable=True)

    # Annotation/help text (multilingual)
    annotation_fr = Column(Text, nullable=True)
    annotation_en = Column(Text, nullable=True)
    annotation_es = Column(Text, nullable=True)

    # Comment field label (multilingual)
    comment_label_fr = Column(String, nullable=True)
    comment_label_en = Column(String, nullable=True)
    comment_label_es = Column(String, nullable=True)

    # Metadata
    is_required = Column(Boolean, default=True, nullable=False)
    line_number = Column(Integer, nullable=True)  # Reference to markdown source

    def __repr__(self):
        return f"<Question(id={self.id}, number={self.number}, text_fr='{self.text_fr[:50]}...')>"

    def get_text(self, locale: str = "fr") -> str:
        """Get question text in specified language"""
        if locale == "en" and self.text_en:
            return self.text_en
        elif locale == "es" and self.text_es:
            return self.text_es
        return self.text_fr  # Default fallback

    def get_bloc(self, locale: str = "fr") -> str:
        """Get bloc name in specified language"""
        if locale == "en" and self.bloc_en:
            return self.bloc_en
        elif locale == "es" and self.bloc_es:
            return self.bloc_es
        return self.bloc_fr

    def get_module(self, locale: str = "fr") -> str:
        """Get module name in specified language"""
        if locale == "en" and self.module_en:
            return self.module_en
        elif locale == "es" and self.module_es:
            return self.module_es
        return self.module_fr

    def get_options(self, locale: str = "fr") -> list:
        """Get options in specified language"""
        if locale == "en" and self.options_en:
            return self.options_en
        elif locale == "es" and self.options_es:
            return self.options_es
        return self.options_fr or []

    def get_annotation(self, locale: str = "fr") -> str:
        """Get annotation in specified language"""
        if locale == "en" and self.annotation_en:
            return self.annotation_en
        elif locale == "es" and self.annotation_es:
            return self.annotation_es
        return self.annotation_fr or ""

    def get_comment_label(self, locale: str = "fr") -> str:
        """Get comment label in specified language"""
        if locale == "en" and self.comment_label_en:
            return self.comment_label_en
        elif locale == "es" and self.comment_label_es:
            return self.comment_label_es
        return self.comment_label_fr or ""

    def to_dict(self, locale: str = "fr") -> dict:
        """Convert to dict with specified language"""
        return {
            "id": self.id,
            "number": self.number,
            "text": self.get_text(locale),
            "bloc": self.get_bloc(locale),
            "module": self.get_module(locale),
            "type": self.type,
            "options": self.get_options(locale),
            "annotation": self.get_annotation(locale),
            "comment_label": self.get_comment_label(locale),
            "is_required": self.is_required,
            "line_number": self.line_number
        }
