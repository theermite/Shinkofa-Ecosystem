"""
Report schemas for API validation
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ReportBase(BaseModel):
    """Base report schema"""
    title: str = Field(..., min_length=1, max_length=255)
    report_type: str = Field(..., max_length=100)
    format: str = Field(..., max_length=20)  # markdown, pdf, csv, excel


class ReportCreate(ReportBase):
    """Schema for creating a report"""
    filename: str = Field(..., max_length=255)
    file_size: Optional[int] = None
    file_path: Optional[str] = None
    content: Optional[str] = None
    parameters: Optional[str] = None


class ReportUpdate(BaseModel):
    """Schema for updating a report"""
    is_available: Optional[bool] = None


class ReportResponse(ReportBase):
    """Schema for report response"""
    id: int
    filename: str
    file_size: Optional[int]
    file_path: Optional[str]
    generated_by_id: int
    generated_at: datetime
    parameters: Optional[str]
    is_available: bool

    class Config:
        from_attributes = True


class ReportWithContent(ReportResponse):
    """Schema for report with full content (for markdown reports)"""
    content: Optional[str]

    class Config:
        from_attributes = True


class ReportGenerateRequest(BaseModel):
    """Request schema for generating a report"""
    report_type: str = Field(..., description="Type: analytics, progression, attendance, exercises")
    format: str = Field(default="markdown", description="Format: markdown, pdf, csv, excel")
    title: Optional[str] = Field(None, description="Custom title for the report")
    parameters: Optional[dict] = Field(None, description="Additional parameters for report generation")


class ReportListResponse(BaseModel):
    """Schema for listing reports"""
    total: int
    reports: list[ReportResponse]
