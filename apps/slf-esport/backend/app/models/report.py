"""
Report model - Store generated reports history
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, Boolean, ForeignKey
from sqlalchemy.orm import relationship

from app.core.database import Base


class Report(Base):
    """Generated report metadata and storage"""
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)

    # Report metadata
    title = Column(String(255), nullable=False)
    report_type = Column(String(100), nullable=False)  # analytics, progression, attendance, etc.
    format = Column(String(20), nullable=False)  # markdown, pdf, csv, excel

    # File info
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=True)  # Size in bytes
    file_path = Column(String(500), nullable=True)  # Storage path if saved on server

    # Content (for markdown/text reports)
    content = Column(Text, nullable=True)

    # Generation metadata
    generated_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Parameters used for generation
    parameters = Column(Text, nullable=True)  # JSON string of parameters

    # Status
    is_available = Column(Boolean, default=True, nullable=False)

    # Relationships
    generated_by = relationship("User", back_populates="reports")

    def __repr__(self):
        return f"<Report {self.id}: {self.title} ({self.format})>"
