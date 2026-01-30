"""
Questionnaire schemas
Shinkofa Platform - Holistic Questionnaire
"""
from pydantic import BaseModel, Field, field_validator
from typing import Optional, Dict, Any, List
from datetime import datetime
from app.models.questionnaire_session import SessionStatus
from app.models.uploaded_chart import ChartType, ChartStatus


# ═════════════════════════════════════════════════════════════
# BIRTH DATA SCHEMAS
# ═════════════════════════════════════════════════════════════

class BirthDataSchema(BaseModel):
    """
    Birth data for Design Humain, Astrology, Numerology calculations
    CRITICAL: Precise location (GPS ±10km) and exact time required
    """
    date: str = Field(..., description="Birth date YYYY-MM-DD", pattern=r"^\d{4}-\d{2}-\d{2}$")
    time: str = Field(..., description="Birth time HH:MM:SS (seconds optional)", pattern=r"^\d{2}:\d{2}(:\d{2})?$")
    city: str = Field(..., min_length=2, max_length=100)
    country: str = Field(..., min_length=2, max_length=100)
    latitude: float = Field(..., ge=-90, le=90, description="GPS latitude (PRECISE ±10km)")
    longitude: float = Field(..., ge=-180, le=180, description="GPS longitude (PRECISE ±10km)")
    timezone: str = Field(..., description="IANA timezone (e.g., Europe/Paris)")
    utc_offset: str = Field(..., description="UTC offset (e.g., +01:00)", pattern=r"^[+-]\d{2}:\d{2}$")

    class Config:
        json_schema_extra = {
            "example": {
                "date": "1990-06-15",
                "time": "14:30:00",
                "city": "Paris",
                "country": "France",
                "latitude": 48.8566,
                "longitude": 2.3522,
                "timezone": "Europe/Paris",
                "utc_offset": "+01:00"
            }
        }


# ═════════════════════════════════════════════════════════════
# SESSION SCHEMAS
# ═════════════════════════════════════════════════════════════

class QuestionnaireSessionCreate(BaseModel):
    """Start new questionnaire session"""
    user_id: str = Field(..., min_length=1)
    full_name: Optional[str] = Field(None, description="Full name for Numerology")
    birth_data: Optional[BirthDataSchema] = None


class QuestionnaireSessionResponse(BaseModel):
    """Questionnaire session response"""
    id: str
    user_id: str
    status: SessionStatus
    current_bloc: Optional[str]
    completion_percentage: str
    birth_data: Optional[Dict[str, Any]]
    full_name: Optional[str]
    started_at: datetime
    last_activity_at: datetime
    completed_at: Optional[datetime]
    analyzed_at: Optional[datetime]
    answers: Optional[List[Dict[str, Any]]] = None  # Include answers for session restoration

    class Config:
        from_attributes = True


# ═════════════════════════════════════════════════════════════
# ANSWER SCHEMAS
# ═════════════════════════════════════════════════════════════

class AnswerSubmit(BaseModel):
    """Individual answer submission"""
    question_id: str = Field(..., min_length=1)
    bloc: str = Field(..., pattern=r"^[A-I]$", description="Bloc A-I")
    question_text: Optional[str] = None
    answer: Dict[str, Any] = Field(..., description="Flexible JSON answer")
    question_type: str = Field(..., description="radio, checkbox, likert, text, comment")
    is_required: str = Field(default="false", pattern=r"^(true|false)$")

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "question_id": "A01",
                    "bloc": "A",
                    "question_text": "Quel est votre niveau d'énergie le matin ?",
                    "answer": {"value": "option_2", "label": "Énergie modérée"},
                    "question_type": "radio",
                    "is_required": "true"
                },
                {
                    "question_id": "B12",
                    "bloc": "B",
                    "answer": {"values": ["option_1", "option_3"], "labels": ["TDAH", "HPI"]},
                    "question_type": "checkbox",
                    "is_required": "false"
                },
                {
                    "question_id": "C05",
                    "bloc": "C",
                    "answer": {"value": 8, "scale": 10},
                    "question_type": "likert",
                    "is_required": "true"
                }
            ]
        }


class AnswersBatchSubmit(BaseModel):
    """Batch answer submission (multiple answers at once)"""
    session_id: str
    answers: List[AnswerSubmit] = Field(..., min_length=1, max_length=50)


class AnswerResponse(BaseModel):
    """Individual answer response"""
    id: str
    session_id: str
    bloc: str
    question_id: str
    question_text: Optional[str]
    answer: Dict[str, Any]
    question_type: str
    is_required: str
    answered_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ═════════════════════════════════════════════════════════════
# UPLOADED CHART SCHEMAS
# ═════════════════════════════════════════════════════════════

class UploadedChartResponse(BaseModel):
    """Uploaded chart response"""
    id: str
    session_id: str
    chart_type: ChartType
    status: ChartStatus
    file_name: str
    file_size: str
    file_type: str
    extracted_data: Optional[Dict[str, Any]]
    shizen_analysis: Optional[Dict[str, Any]]
    error_message: Optional[str]
    uploaded_at: datetime
    processed_at: Optional[datetime]

    class Config:
        from_attributes = True


# ═════════════════════════════════════════════════════════════
# HOLISTIC PROFILE SCHEMAS
# ═════════════════════════════════════════════════════════════

class HolisticProfileResponse(BaseModel):
    """Holistic profile response"""
    id: str
    session_id: str
    user_id: str
    psychological_analysis: Optional[Dict[str, Any]]
    neurodivergence_analysis: Optional[Dict[str, Any]]
    shinkofa_analysis: Optional[Dict[str, Any]]
    design_human: Optional[Dict[str, Any]]
    astrology_western: Optional[Dict[str, Any]]
    astrology_chinese: Optional[Dict[str, Any]]
    numerology: Optional[Dict[str, Any]]
    synthesis: Optional[str]
    recommendations: Optional[Dict[str, Any]]
    pdf_export_path: Optional[str]
    markdown_export_path: Optional[str]
    generated_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# ═════════════════════════════════════════════════════════════
# QUESTIONNAIRE SECTIONS (BLOCS A-I)
# ═════════════════════════════════════════════════════════════

class QuestionOption(BaseModel):
    """Question option"""
    value: str
    label: str
    score: Optional[int] = None


class QuestionSchema(BaseModel):
    """Individual question schema"""
    id: str
    bloc: str
    question_text: str
    question_type: str  # radio, checkbox, likert, text, comment
    options: Optional[List[QuestionOption]] = None
    is_required: bool = False
    scale_min: Optional[int] = None
    scale_max: Optional[int] = None
    placeholder: Optional[str] = None


class BlocSchema(BaseModel):
    """Questionnaire bloc (section)"""
    bloc_id: str  # A, B, C... I
    title: str
    description: str
    questions: List[QuestionSchema]


class AllBlocsResponse(BaseModel):
    """All questionnaire blocs"""
    blocs: List[BlocSchema]
    total_questions: int = Field(..., description="Total number of questions (should be 144)")


# ═════════════════════════════════════════════════════════════
# OCR DOCUMENT PROCESSING SCHEMAS
# ═════════════════════════════════════════════════════════════

class OCRQuestionAnswer(BaseModel):
    """Single question-answer pair extracted from OCR"""
    question_number: Optional[int] = None
    question_text: Optional[str] = None
    answer: Optional[str] = None
    confidence: str = Field(..., description="Extraction confidence: high, medium, low, none")


class DocumentOCRResponse(BaseModel):
    """OCR processing result for uploaded questionnaire document"""
    success: bool
    file_name: str
    file_type: str
    num_pages: int

    # OCR extraction results
    extracted_text: str = Field(..., description="Full extracted text from OCR")

    # Parsed question-answer pairs
    questions_found: int
    answers_found: int
    parsed_data: List[OCRQuestionAnswer]

    # Parsing quality metrics
    raw_sections: List[str] = Field(default_factory=list, description="Detected bloc markers (BLOC A, etc.)")
    parsing_notes: List[str] = Field(default_factory=list, description="Warnings and quality notes")

    # Error information
    error: Optional[str] = None

    class Config:
        json_schema_extra = {
            "example": {
                "success": True,
                "file_name": "questionnaire_ancien.pdf",
                "file_type": "pdf",
                "num_pages": 5,
                "extracted_text": "BLOC A: Contexte de Vie\nQuestion 1: Quel est votre niveau d'énergie...",
                "questions_found": 25,
                "answers_found": 23,
                "parsed_data": [
                    {
                        "question_number": 1,
                        "question_text": "Quel est votre niveau d'énergie le matin ?",
                        "answer": "Énergie modérée",
                        "confidence": "high"
                    }
                ],
                "raw_sections": ["BLOC A: Contexte de Vie", "BLOC B: Neurodivergences"],
                "parsing_notes": ["✅ 23/25 questions answered", "⚠️ 2 questions without answers"],
                "error": None
            }
        }
