"""
Reports routes - API endpoints for report generation and history
"""

from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User, UserRole
from app.utils.dependencies import get_current_user, require_role
from app.schemas.report import (
    ReportResponse,
    ReportWithContent,
    ReportGenerateRequest,
    ReportListResponse,
    ReportCreate
)
from app.services.report_service import ReportService
from app.models.report import Report


router = APIRouter(tags=["reports"])


@router.post("/generate", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def generate_report(
    request: ReportGenerateRequest,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Generate a new report (coaches/managers only)

    This endpoint creates a report record in the database.
    The actual content generation happens on the frontend.
    """
    try:
        report = ReportService.generate_analytics_report(db, current_user, request)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate report: {str(e)}"
        )


@router.post("/save", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def save_report(
    report_data: ReportCreate,
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """
    Save a generated report with content (for frontend-generated reports)
    """
    try:
        report = Report(
            **report_data.dict(),
            generated_by_id=current_user.id,
            is_available=True
        )
        db.add(report)
        db.commit()
        db.refresh(report)
        return report
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save report: {str(e)}"
        )


@router.get("/my", response_model=List[ReportResponse])
def get_my_reports(
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's reports"""
    reports = ReportService.get_user_reports(
        db, current_user.id, report_type, skip, limit
    )
    return reports


@router.get("/all", response_model=ReportListResponse)
def get_all_reports(
    report_type: Optional[str] = Query(None, description="Filter by report type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    current_user: User = Depends(require_role(UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """Get all reports (managers only)"""
    reports, total = ReportService.get_all_reports(db, report_type, skip, limit)
    return ReportListResponse(total=total, reports=reports)


@router.get("/{report_id}", response_model=ReportWithContent)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific report by ID"""
    report = ReportService.get_report_by_id(db, report_id)

    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found"
        )

    # Check permission: owner or manager
    if report.generated_by_id != current_user.id and current_user.role not in [UserRole.MANAGER, UserRole.SUPER_ADMIN]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this report"
        )

    return report


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a report (soft delete)"""
    success = ReportService.delete_report(db, report_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found or already deleted"
        )


@router.get("/stats/summary")
def get_report_stats(
    current_user: User = Depends(require_role(UserRole.COACH, UserRole.MANAGER)),
    db: Session = Depends(get_db)
):
    """Get report generation statistics"""
    # Managers see all, coaches see only their own
    user_id = None if current_user.role == UserRole.MANAGER else current_user.id
    stats = ReportService.get_report_stats(db, user_id)
    return stats
