"""
UploadedChart model
Shinkofa Platform - Holistic Questionnaire
"""
from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from datetime import datetime, timezone
from enum import Enum
from app.core.database import Base


class ChartType(str, Enum):
    """Type of uploaded chart"""
    DESIGN_HUMAN = "design_human"
    BIRTH_CHART = "birth_chart"  # Astrology


class ChartStatus(str, Enum):
    """Upload processing status"""
    UPLOADED = "uploaded"
    PROCESSING = "processing"
    PROCESSED = "processed"
    FAILED = "failed"


class UploadedChart(Base):
    """
    User-uploaded Design Human or Astrology charts

    Allows users to upload existing charts (PDF/images) for Shizen IA analysis
    OCR/parsing extracts data, Shizen IA integrates into holistic profile
    """
    __tablename__ = "uploaded_charts"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(
        String,
        ForeignKey("questionnaire_sessions.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    # Chart information
    chart_type = Column(
        SQLEnum(ChartType),
        nullable=False,
        index=True
    )
    status = Column(
        SQLEnum(ChartStatus),
        default=ChartStatus.UPLOADED,
        nullable=False,
        index=True
    )

    # File storage
    file_name = Column(String, nullable=False)
    file_path = Column(String, nullable=False)  # Server storage path
    file_size = Column(String, nullable=False)  # Bytes
    file_type = Column(String, nullable=False)  # image/png, application/pdf, etc.

    # Extracted data (from OCR/parsing)
    extracted_data = Column(JSON, nullable=True)
    # Structure depends on chart_type:
    # Design Human:
    # {
    #     "type": "projector",
    #     "authority": "splenic",
    #     "profile": "1/3",
    #     "defined_centers": [...],
    #     "gates": [...],
    #     "raw_text": "..."  # Full OCR text
    # }
    # Birth Chart:
    # {
    #     "sun_sign": "libra",
    #     "moon_sign": "scorpio",
    #     "ascendant": "capricorn",
    #     "planets": [...],
    #     "raw_text": "..."  # Full OCR text
    # }

    # Shizen IA analysis
    shizen_analysis = Column(JSON, nullable=True)
    # {
    #     "interpretation": "Long-form analysis...",
    #     "integration_notes": "How this connects with questionnaire responses...",
    #     "recommendations": [...]
    # }

    # Processing errors (if failed)
    error_message = Column(String, nullable=True)

    # Timestamps
    uploaded_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc),
        nullable=False
    )
    processed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    session = relationship("QuestionnaireSession", back_populates="uploaded_charts")
