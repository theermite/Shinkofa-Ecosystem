"""
Questionnaire API routes
Shinkofa Platform - Holistic Questionnaire (144 questions)
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
import uuid
import os
import re
import logging

logger = logging.getLogger(__name__)

from app.core.database import get_db, get_async_db
from app.models.questionnaire_session import QuestionnaireSession, SessionStatus
from app.models.questionnaire_response import QuestionnaireResponse
from app.models.holistic_profile import HolisticProfile
from app.models.uploaded_chart import UploadedChart, ChartType, ChartStatus
from app.schemas.questionnaire import (
    QuestionnaireSessionCreate,
    QuestionnaireSessionResponse,
    AnswerSubmit,
    AnswersBatchSubmit,
    AnswerResponse,
    UploadedChartResponse,
    HolisticProfileResponse,
    AllBlocsResponse,
    BlocSchema,
    DocumentOCRResponse,
    OCRQuestionAnswer,
)
from app.services.questionnaire_data_loader import (
    get_questionnaire_data,
    get_bloc_questions,
    get_module_questions
)
from app.services.questions_db_service import QuestionsDBService
from app.services.ocr.ocr_service import (
    OCRService,
    save_uploaded_file,
    cleanup_temp_file
)
from app.services.ocr.parser import OCRTextParser
from app.services.holistic_profile_service import get_holistic_profile_service
from app.services.chart_analyzer_service import get_chart_analyzer_service

router = APIRouter(prefix="/questionnaire", tags=["questionnaire"])


# ═════════════════════════════════════════════════════════════
# SESSION MANAGEMENT
# ═════════════════════════════════════════════════════════════

@router.post("/start", response_model=QuestionnaireSessionResponse, status_code=status.HTTP_201_CREATED)
def start_questionnaire_session(
    session_data: QuestionnaireSessionCreate,
    db: Session = Depends(get_db)
):
    """
    Start new questionnaire session

    Creates a new session for the 144-question holistic questionnaire
    Optionally includes birth data for Design Humain/Astrology/Numerology
    """
    # Create new session
    new_session = QuestionnaireSession(
        id=str(uuid.uuid4()),
        user_id=session_data.user_id,
        status=SessionStatus.STARTED,
        current_bloc=None,
        completion_percentage="0",
        birth_data=session_data.birth_data.model_dump() if session_data.birth_data else None,
        full_name=session_data.full_name,
        started_at=datetime.now(timezone.utc),
        last_activity_at=datetime.now(timezone.utc)
    )

    db.add(new_session)
    db.flush()  # Flush pour obtenir l'ID, commit automatique dans get_db()
    db.refresh(new_session)

    return new_session


@router.get("/status/{session_id}", response_model=QuestionnaireSessionResponse)
async def get_session_status(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get questionnaire session status

    Returns current progress, completion percentage, and status
    """
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    return session


@router.patch("/sessions/{session_id}/birth-data", response_model=QuestionnaireSessionResponse)
async def update_birth_data(
    session_id: str,
    birth_data: Dict[str, Any],
    full_name: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Update birth data for a questionnaire session

    Accepts:
    - birth_data: Dictionary containing birth information (date, time, location, GPS)
    - full_name: Optional full name (for numerology)
    """
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Update birth_data and full_name
    session.birth_data = birth_data.get("birth_data", birth_data)
    if full_name:
        session.full_name = full_name

    db.commit()
    db.refresh(session)

    return session


@router.get(
    "/sessions/user/{user_id}",
    response_model=List[QuestionnaireSessionResponse],
    response_model_exclude_none=False  # CRITICAL: Include answers field even if empty list
)
async def get_user_sessions(
    user_id: str,
    include_answers: bool = True,  # Include answers by default for session restoration
    limit: int = 10,
    offset: int = 0,
    db: Session = Depends(get_db)
):
    """
    Get all questionnaire sessions for a user

    Returns list of sessions ordered by most recent first
    Includes answers if include_answers=True (default)
    """
    sessions = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.user_id == user_id
    ).order_by(
        QuestionnaireSession.started_at.desc()
    ).limit(limit).offset(offset).all()

    # Build response list with answers included
    result = []
    for session in sessions:
        # Convert session to dict (from_attributes=True)
        session_dict = {
            "id": session.id,
            "user_id": session.user_id,
            "status": session.status,
            "current_bloc": session.current_bloc,
            "completion_percentage": session.completion_percentage,
            "birth_data": session.birth_data,
            "full_name": session.full_name,
            "started_at": session.started_at,
            "last_activity_at": session.last_activity_at,
            "completed_at": session.completed_at,
            "analyzed_at": session.analyzed_at,
            "answers": None
        }

        # Include answers if requested
        if include_answers:
            answers = db.query(QuestionnaireResponse).filter(
                QuestionnaireResponse.session_id == session.id
            ).order_by(QuestionnaireResponse.answered_at).all()

            session_dict["answers"] = [
                {
                    "question_id": ans.question_id,
                    "bloc": ans.bloc,
                    "answer": ans.answer,
                    "question_type": ans.question_type,
                    "answered_at": ans.answered_at.isoformat()
                }
                for ans in answers
            ]

        # Validate and append using Pydantic schema
        result.append(QuestionnaireSessionResponse(**session_dict))

    return result


# ═════════════════════════════════════════════════════════════
# ANSWER SUBMISSION
# ═════════════════════════════════════════════════════════════

@router.post("/submit-answers", response_model=List[AnswerResponse], status_code=status.HTTP_201_CREATED)
async def submit_answers_batch(
    batch: AnswersBatchSubmit,
    db: Session = Depends(get_db)
):
    """
    Submit batch of answers

    Allows submitting multiple answers at once (up to 50 per request)
    Updates session status and completion percentage automatically
    """
    # Verify session exists
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == batch.session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {batch.session_id} not found"
        )

    if session.status == SessionStatus.COMPLETED:
        # Session already completed - return success to avoid frontend errors
        # This can happen due to race conditions during auto-fill
        return [
            {"id": str(uuid.uuid4()), "message": "Session already completed, answer ignored"}
            for _ in batch.answers
        ]

    # Create answer records
    created_answers = []
    for answer_data in batch.answers:
        # Check if answer already exists (update if so)
        existing_answer = db.query(QuestionnaireResponse).filter(
            QuestionnaireResponse.session_id == batch.session_id,
            QuestionnaireResponse.question_id == answer_data.question_id
        ).first()

        if existing_answer:
            # Update existing answer
            existing_answer.answer = answer_data.answer
            existing_answer.question_text = answer_data.question_text
            existing_answer.question_type = answer_data.question_type
            existing_answer.is_required = answer_data.is_required
            existing_answer.updated_at = datetime.now(timezone.utc)
            created_answers.append(existing_answer)
        else:
            # Create new answer
            new_answer = QuestionnaireResponse(
                id=str(uuid.uuid4()),
                session_id=batch.session_id,
                bloc=answer_data.bloc,
                question_id=answer_data.question_id,
                question_text=answer_data.question_text,
                answer=answer_data.answer,
                question_type=answer_data.question_type,
                is_required=answer_data.is_required,
                answered_at=datetime.now(timezone.utc),
                updated_at=datetime.now(timezone.utc)
            )
            db.add(new_answer)
            created_answers.append(new_answer)

    # Update session status
    total_answers = db.query(QuestionnaireResponse).filter(
        QuestionnaireResponse.session_id == batch.session_id
    ).count() + len([a for a in created_answers if a.id.startswith(batch.session_id) is False])

    # NOTE: 144 total questions after questionnaire optimization (was 168)
    # Updated 2026-01-24 to reflect actual question count
    completion_percentage = min(100, int((total_answers / 144) * 100))

    session.status = SessionStatus.IN_PROGRESS
    session.completion_percentage = str(completion_percentage)
    session.current_bloc = batch.answers[-1].bloc if batch.answers else session.current_bloc
    session.last_activity_at = datetime.now(timezone.utc)

    if completion_percentage == 100:
        session.status = SessionStatus.COMPLETED
        session.completed_at = datetime.now(timezone.utc)

    db.commit()

    for answer in created_answers:
        db.refresh(answer)

    return created_answers


@router.get("/answers/{session_id}", response_model=List[AnswerResponse])
async def get_session_answers(
    session_id: str,
    bloc: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    Get all answers for a session

    Optionally filter by bloc (A-I)
    """
    query = db.query(QuestionnaireResponse).filter(
        QuestionnaireResponse.session_id == session_id
    )

    if bloc:
        query = query.filter(QuestionnaireResponse.bloc == bloc)

    answers = query.order_by(QuestionnaireResponse.answered_at).all()

    return answers


# ═════════════════════════════════════════════════════════════
# UPLOADED CHARTS (DESIGN HUMAIN / ASTROLOGY)
# ═════════════════════════════════════════════════════════════

@router.post("/upload-chart/{session_id}", response_model=UploadedChartResponse, status_code=status.HTTP_201_CREATED)
async def upload_chart(
    session_id: str,
    chart_type: ChartType,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload Design Humain or Astrology chart (PDF/image)

    User can upload existing charts for Shizen IA analysis
    Triggers OCR/parsing + AI analysis pipeline
    """
    # Verify session exists
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Validate file type
    allowed_types = ["application/pdf", "image/png", "image/jpeg", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type {file.content_type}. Allowed: PDF, PNG, JPEG"
        )

    # Create upload directory if not exists
    upload_dir = f"uploads/charts/{session_id}"
    os.makedirs(upload_dir, exist_ok=True)

    # Save file
    file_extension = os.path.splitext(file.filename)[1]
    file_id = str(uuid.uuid4())
    file_path = f"{upload_dir}/{file_id}{file_extension}"

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    # Create uploaded chart record
    new_chart = UploadedChart(
        id=file_id,
        session_id=session_id,
        chart_type=chart_type,
        status=ChartStatus.UPLOADED,
        file_name=file.filename,
        file_path=file_path,
        file_size=str(len(content)),
        file_type=file.content_type,
        uploaded_at=datetime.now(timezone.utc)
    )

    db.add(new_chart)
    db.commit()
    db.refresh(new_chart)

    # ═══════════════════════════════════════════════════════════
    # PIPELINE OCR + AI ANALYSIS
    # ═══════════════════════════════════════════════════════════

    try:
        # Step 1: Update status to PROCESSING
        new_chart.status = ChartStatus.PROCESSING
        db.commit()

        # Step 2: Extract text with OCR
        ocr_service = OCRService(language='fra+eng')
        ocr_result = ocr_service.extract_text_from_file(file_path)

        if not ocr_result.get("success"):
            raise Exception(f"OCR extraction failed: {ocr_result.get('error')}")

        extracted_text = ocr_result.get("text", "")
        logger.info(f"✅ OCR extracted {len(extracted_text)} characters from {file.filename}")

        # Step 3: Analyze chart with AI
        chart_analyzer = get_chart_analyzer_service()
        analysis = await chart_analyzer.analyze_chart(
            chart_type=chart_type,
            ocr_text=extracted_text,
            questionnaire_context=None  # TODO: Add questionnaire context if available
        )

        # Step 4: Update chart record with results
        new_chart.extracted_data = analysis.get("extracted_data", {})
        new_chart.shizen_analysis = {
            "interpretation": analysis.get("interpretation", ""),
            "integration_notes": analysis.get("integration_notes", ""),
            "recommendations": analysis.get("recommendations", []),
            "confidence": analysis.get("confidence", "medium"),
            "ocr_metadata": {
                "num_pages": ocr_result.get("num_pages", 1),
                "text_length": len(extracted_text),
                "file_type": ocr_result.get("file_type", "unknown")
            }
        }
        new_chart.status = ChartStatus.PROCESSED
        new_chart.processed_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(new_chart)

        logger.info(f"✅ Chart analysis complete for {file.filename} (confidence: {analysis.get('confidence')})")

    except Exception as e:
        # Update status to FAILED with error message
        new_chart.status = ChartStatus.FAILED
        new_chart.error_message = str(e)
        db.commit()

        logger.error(f"❌ Chart processing failed: {e}")

        # Don't raise - return chart with FAILED status so user can see error
        # User can check chart-status endpoint for details

    return new_chart


@router.get("/chart-status/{chart_id}", response_model=UploadedChartResponse)
async def get_chart_status(
    chart_id: str,
    db: Session = Depends(get_db)
):
    """
    Get uploaded chart processing status

    Returns OCR extraction results and Shizen IA analysis if available
    """
    chart = db.query(UploadedChart).filter(
        UploadedChart.id == chart_id
    ).first()

    if not chart:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Chart {chart_id} not found"
        )

    return chart


@router.get("/charts/{session_id}", response_model=List[UploadedChartResponse])
async def get_session_charts(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get all uploaded charts for a session
    """
    charts = db.query(UploadedChart).filter(
        UploadedChart.session_id == session_id
    ).order_by(UploadedChart.uploaded_at.desc()).all()

    return charts


# ═════════════════════════════════════════════════════════════
# OCR DOCUMENT PROCESSING (OLD PAPER QUESTIONNAIRES)
# ═════════════════════════════════════════════════════════════

@router.post("/upload-document/{session_id}", response_model=DocumentOCRResponse, status_code=status.HTTP_200_OK)
async def upload_questionnaire_document(
    session_id: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    """
    Upload old paper questionnaire (PDF/image) for OCR processing

    Extracts text using Tesseract OCR (French+English)
    Parses question-answer pairs automatically
    Returns structured data ready for manual review and import

    Supported formats: PDF, PNG, JPG, JPEG, TIFF, BMP
    Max file size: 10MB recommended
    """
    # Verify session exists
    session = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Validate file type
    allowed_types = [
        "application/pdf",
        "image/png",
        "image/jpeg",
        "image/jpg",
        "image/tiff",
        "image/bmp"
    ]

    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{file.content_type}'. Allowed: PDF, PNG, JPG, JPEG, TIFF, BMP"
        )

    # Validate file size (10MB max)
    content = await file.read()
    file_size_mb = len(content) / (1024 * 1024)

    if file_size_mb > 10:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File too large ({file_size_mb:.2f}MB). Maximum 10MB allowed"
        )

    temp_file_path = None

    try:
        # Save uploaded file to temporary location
        temp_file_path = save_uploaded_file(content, file.filename)

        # Extract text using OCR service
        ocr_service = OCRService(language='fra+eng')
        ocr_result = ocr_service.extract_text_from_file(temp_file_path)

        if not ocr_result["success"]:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"OCR extraction failed: {ocr_result.get('error', 'Unknown error')}"
            )

        # Parse extracted text to find question-answer pairs
        parser = OCRTextParser()
        parsed_result = parser.parse_document(ocr_result["text"])

        # Build response with OCR results + parsed data
        response = DocumentOCRResponse(
            success=True,
            file_name=file.filename,
            file_type=ocr_result["file_type"],
            num_pages=ocr_result["num_pages"],
            extracted_text=ocr_result["text"],
            questions_found=parsed_result["questions_found"],
            answers_found=parsed_result["answers_found"],
            parsed_data=[
                OCRQuestionAnswer(**qa) for qa in parsed_result["data"]
            ],
            raw_sections=parsed_result["raw_sections"],
            parsing_notes=parsed_result["parsing_notes"],
            error=None
        )

        return response

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise

    except Exception as e:
        # Handle unexpected errors
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Document processing failed: {str(e)}"
        )

    finally:
        # Clean up temporary file
        if temp_file_path:
            cleanup_temp_file(temp_file_path)


# ═════════════════════════════════════════════════════════════
# HOLISTIC PROFILE
# ═════════════════════════════════════════════════════════════

@router.get("/profile/{session_id}", response_model=HolisticProfileResponse)
async def get_holistic_profile(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Get holistic profile for a session

    Returns complete analysis:
    - Psychological (MBTI, Big Five, Enneagram, PNL, PCM, VAKOG)
    - Neurodivergences (TDAH, Autisme, HPI, etc.)
    - Shinkofa dimensions (Roue de vie, Archétypes, etc.)
    - Design Humain
    - Astrology (occidental + oriental)
    - Numerology
    - Shizen IA synthesis
    """
    profile = db.query(HolisticProfile).filter(
        HolisticProfile.session_id == session_id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile for session {session_id} not found"
        )

    return profile


@router.get("/profile/user/{user_id}", response_model=HolisticProfileResponse)
async def get_holistic_profile_by_user(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Get holistic profile for a user (latest profile)

    Returns the most recent complete analysis for the user:
    - Psychological (MBTI, Big Five, Enneagram, PNL, PCM, VAKOG)
    - Neurodivergences (TDAH, Autisme, HPI, etc.)
    - Shinkofa dimensions (Roue de vie, Archétypes, etc.)
    - Design Humain
    - Astrology (occidental + oriental)
    - Numerology
    - Shizen IA synthesis
    """
    profile = db.query(HolisticProfile).filter(
        HolisticProfile.user_id == user_id
    ).order_by(HolisticProfile.generated_at.desc()).first()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No profile found for user {user_id}"
        )

    return profile


@router.delete("/profile/user/{user_id}", status_code=status.HTTP_200_OK)
async def delete_holistic_profile_by_user(
    user_id: str,
    delete_questionnaire: bool = False,
    db: Session = Depends(get_db)
):
    """
    Delete holistic profile for a user

    Allows user to delete their profile to regenerate a new one.

    Args:
        user_id: User ID
        delete_questionnaire: If True, also deletes questionnaire sessions and responses
                            (allows starting completely fresh)

    Returns:
        Success message with deletion details
    """
    # Find all profiles for this user
    profiles = db.query(HolisticProfile).filter(
        HolisticProfile.user_id == user_id
    ).all()

    if not profiles:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No profile found for user {user_id}"
        )

    profiles_deleted = len(profiles)
    sessions_deleted = 0
    responses_deleted = 0

    # Delete all profiles
    for profile in profiles:
        db.delete(profile)

    # Optionally delete questionnaire data
    if delete_questionnaire:
        # Find all sessions for this user
        sessions = db.query(QuestionnaireSession).filter(
            QuestionnaireSession.user_id == user_id
        ).all()

        for session in sessions:
            # Delete all responses for this session
            responses = db.query(QuestionnaireResponse).filter(
                QuestionnaireResponse.session_id == session.id
            ).all()
            responses_deleted += len(responses)
            for response in responses:
                db.delete(response)

            # Delete uploaded charts for this session
            charts = db.query(UploadedChart).filter(
                UploadedChart.session_id == session.id
            ).all()
            for chart in charts:
                db.delete(chart)

            db.delete(session)
            sessions_deleted += 1

    db.commit()

    logger.info(f"✅ Deleted {profiles_deleted} profile(s) for user {user_id}")
    if delete_questionnaire:
        logger.info(f"   Also deleted {sessions_deleted} session(s) and {responses_deleted} response(s)")

    return {
        "success": True,
        "message": f"Profile deleted successfully for user {user_id}",
        "details": {
            "profiles_deleted": profiles_deleted,
            "sessions_deleted": sessions_deleted,
            "responses_deleted": responses_deleted,
            "questionnaire_data_deleted": delete_questionnaire
        }
    }


@router.post("/analyze/{session_id}", response_model=HolisticProfileResponse, status_code=status.HTTP_202_ACCEPTED)
async def trigger_analysis(
    session_id: str,
    db: AsyncSession = Depends(get_async_db)
):
    """
    Trigger holistic analysis

    Starts async analysis pipeline:
    1. Psychological analysis (Ollama)
    2. Neurodivergence detection (Ollama)
    3. Shinkofa dimensions (Ollama)
    4. Design Humain calculation (Swiss Ephemeris)
    5. Astrology calculation (kerykeion)
    6. Numerology calculation (Pythagorean)
    7. Final synthesis (Ollama)

    Returns 202 Accepted - profile will be updated asynchronously
    """
    # Verify session exists and is completed
    result = await db.execute(
        select(QuestionnaireSession).where(QuestionnaireSession.id == session_id)
    )
    session = result.scalar_one_or_none()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session {session_id} not found"
        )

    # Check if profile(s) already exist - if yes, allow re-analysis even if session not "completed"
    # Check by session_id first
    profile_result = await db.execute(
        select(HolisticProfile).where(HolisticProfile.session_id == session_id)
    )
    existing_profiles = profile_result.scalars().all()

    # Also check by user_id (profile might have different session_id)
    if not existing_profiles:
        user_profile_result = await db.execute(
            select(HolisticProfile).where(HolisticProfile.user_id == session.user_id)
        )
        user_profiles = user_profile_result.scalars().all()
        if user_profiles:
            logger.info(f"🔍 Found {len(user_profiles)} profile(s) for user {session.user_id} (different session)")
            existing_profiles = user_profiles

    # If no existing profile, check if session is ready for analysis
    if not existing_profiles and session.status != SessionStatus.COMPLETED:
        # Check if session has enough responses to analyze anyway
        from app.models.questionnaire_response import QuestionnaireResponse
        responses_result = await db.execute(
            select(QuestionnaireResponse).where(QuestionnaireResponse.session_id == session_id)
        )
        responses_count = len(list(responses_result.scalars().all()))

        if responses_count >= 10:
            # Enough responses - allow analysis and mark session as completed
            logger.warning(f"⚠️ Session {session_id} has {responses_count} responses but status={session.status}. Forcing to COMPLETED.")
            session.status = SessionStatus.COMPLETED
            await db.flush()
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Session must be completed before analysis (current: {session.status}, responses: {responses_count})"
            )

    # If profile exists, allow re-analysis (session was analyzed before)
    if existing_profiles:
        # Re-analyze existing profile - delete ALL existing profiles for this session
        logger.info(f"🗑️ Deleting {len(existing_profiles)} existing profile(s) for session {session_id}")
        for profile in existing_profiles:
            await db.delete(profile)
        await db.flush()  # Flush immediately to avoid duplicate key error
        await db.commit()

    # Generate complete holistic profile using service
    try:
        profile_service = get_holistic_profile_service()
        profile = await profile_service.generate_profile(
            session_id=session_id,
            user_id=session.user_id,
            db=db,
        )

        return profile

    except Exception as e:
        # Rollback handled by service, just re-raise
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Profile generation failed: {str(e)}"
        )


# ═════════════════════════════════════════════════════════════
# HELPER FUNCTIONS
# ═════════════════════════════════════════════════════════════

def _transform_questions_to_structure(questions: List[Dict], locale: str = 'en') -> Dict:
    """
    Transform flat questions list (from DB) to hierarchical structure (for frontend)

    Args:
        questions: List of question dictionaries from database
        locale: Language code for metadata/introduction (en, es)

    Returns:
        Hierarchical structure: {metadata, introduction, total_questions, blocs: [...]}
    """
    from collections import OrderedDict

    # Group questions by bloc and module
    blocs_map = OrderedDict()

    for q in questions:
        # Extract bloc ID from bloc name (e.g., "🏠 BLOC A : CONTEXTE" -> "A")
        bloc_match = re.search(r'BLOC\s+([A-I])', q['bloc'])
        bloc_id = bloc_match.group(1) if bloc_match else 'A'

        # Extract module ID from module name (e.g., "Module A1: Info" -> "A1")
        module_match = re.search(r'Module\s+([A-I]\d+)', q['module'])
        module_id = module_match.group(1) if module_match else f"{bloc_id}1"

        # Get or create bloc
        if bloc_id not in blocs_map:
            # Extract emoji and title from bloc name
            emoji_match = re.search(r'^(.)\s', q['bloc'])
            emoji = emoji_match.group(1) if emoji_match else '📝'

            title_match = re.search(r':\s*(.+)$', q['bloc'])
            title = title_match.group(1).strip() if title_match else ''

            blocs_map[bloc_id] = {
                'id': bloc_id,
                'title': title,
                'emoji': emoji,
                'modules': OrderedDict()
            }

        bloc = blocs_map[bloc_id]

        # Get or create module
        if module_id not in bloc['modules']:
            # Extract title from module name
            title_match = re.search(r':\s*(.+)$', q['module'])
            title = title_match.group(1).strip() if title_match else ''

            bloc['modules'][module_id] = {
                'id': module_id,
                'title': title,
                'questions': []
            }

        module = bloc['modules'][module_id]

        # Add question to module (transform DB format to frontend format)
        question = {
            'id': q['id'],
            'text': q['text'],
            'type': _map_db_type_to_frontend_type(q['type']),
            'options': q['options'] if q['options'] else [],
            'annotation': q['annotation'] if q['annotation'] else '',
            'comment_allowed': bool(q['comment_label']),
            'required': q['is_required']
        }

        module['questions'].append(question)

    # Convert OrderedDicts to lists
    blocs = []
    for bloc_id, bloc_data in blocs_map.items():
        modules = []
        for module_id, module_data in bloc_data['modules'].items():
            modules.append(module_data)

        blocs.append({
            'id': bloc_data['id'],
            'title': bloc_data['title'],
            'emoji': bloc_data['emoji'],
            'modules': modules
        })

    # Add translated metadata and introduction
    metadata = _get_translated_metadata(locale)
    introduction = _get_translated_introduction(locale)

    return {
        'metadata': metadata,
        'introduction': introduction,
        'total_questions': len(questions),
        'blocs': blocs
    }


def _map_db_type_to_frontend_type(db_type: str) -> str:
    """
    Map database question type to frontend expected type

    DB types: "Free text", "Single choice", "Multiple choice", "Likert 5 points", "Numeric field"
    Frontend types: "text", "radio", "checkbox", "likert_5", "number"
    """
    type_mapping = {
        'Free text': 'text',
        'Single choice': 'radio',
        'Multiple choice': 'checkbox',
        'Likert 5 points (1 = Not at all → 5 = Completely)': 'likert_5',
        'Numeric field (16-100)': 'number',
        'Likert 5 points for each item': 'likert_5',
        'Single choice + "Other" option': 'radio',
        'Likert 5 points (Very difficult → Very harmonious)': 'likert_5',
    }

    # Try direct mapping first
    if db_type in type_mapping:
        return type_mapping[db_type]

    # Fallback: detect type from keywords
    db_type_lower = db_type.lower()
    if 'likert' in db_type_lower:
        return 'likert_5'
    elif 'numeric' in db_type_lower or 'number' in db_type_lower:
        return 'number'
    elif 'multiple' in db_type_lower or 'checkbox' in db_type_lower:
        return 'checkbox'
    elif 'radio' in db_type_lower or 'choice' in db_type_lower:
        return 'radio'

    # Default to text
    return 'text'


def _get_translated_metadata(locale: str) -> Dict[str, str]:
    """
    Get translated metadata for questionnaire structure

    Args:
        locale: Language code (en, es)

    Returns:
        Dict with translated metadata fields
    """
    metadata_translations = {
        'en': {
            'title': 'Shizen Holistic Questionnaire',
            'version': '5.1',
            'total_estimated_questions': 144,
            'estimated_duration_minutes': '40-55',
            'creator': 'The Shinkofa Path',
            'purpose': 'Complete holistic analysis (psychology + neurodivergences + Shinkofa)'
        },
        'es': {
            'title': 'Cuestionario Holístico Shizen',
            'version': '5.1',
            'total_estimated_questions': 144,
            'estimated_duration_minutes': '40-55',
            'creator': 'El Camino Shinkofa',
            'purpose': 'Análisis holístico completo (psicología + neurodivergencias + Shinkofa)'
        },
        'fr': {  # Fallback
            'title': 'Questionnaire Holistique Shizen',
            'version': '5.1',
            'total_estimated_questions': 144,
            'estimated_duration_minutes': '40-55',
            'creator': 'La Voie Shinkofa',
            'purpose': 'Analyse holistique complète (psychologie + neurodivergences + Shinkofa)'
        }
    }
    return metadata_translations.get(locale, metadata_translations['en'])


def _get_translated_introduction(locale: str) -> str:
    """
    Get translated introduction text for questionnaire

    Args:
        locale: Language code (en, es)

    Returns:
        Markdown-formatted introduction text
    """
    introductions = {
        'en': """# 🧠 SHIZEN HOLISTIC QUESTIONNAIRE - V5.1 OPTIMIZED (144 questions)

## 🌱 WELCOME TO YOUR SELF-DISCOVERY JOURNEY

This holistic questionnaire has been designed to accompany you in the deep discovery of who you truly are. The more authentic and honest your answers, the greater the positive impact of the personalized analysis and recommendations on your life.

### 🔒 Absolute confidentiality

- Your answers are **strictly private and confidential**
- **Only you** have access to your results
- No data is shared or sold to third parties
- All information is secure and protected

### 💎 The importance of authenticity

This questionnaire is not a test to "pass". There are **no right or wrong answers**.

Its purpose is to help you:
- **Know yourself** deeply, beyond social masks
- **Live fully** your unique individuality
- **Find your balance** in this moving world
- **Understand your patterns** to better use them

Even if some questions may make you feel vulnerable, it is in this authentic vulnerability that lies the true power of transformation.

### ⏱️ Practical information

- **Estimated duration**: 40-55 minutes
- **144 questions** divided into 9 thematic blocks (optimized version V5.1)
- **You can take breaks** and resume later (progress saved)
- **Take your time** to think about each answer
- **Add comments** when you want to nuance your answers

### 🎯 What will be analyzed

Your holistic profile will integrate:
- **Psychological profiles**: Personality traits, communication modes, preferences
- **Neurodivergences**: ADHD, autism, giftedness, hypersensitivity
- **Shinkofa wisdom**: Life context, values, aspirations
- **Personal astrology**: Human Design, Western astrology, Chinese astrology, numerology

🙏 **Thank you for your trust and authenticity.**""",
        'es': """# 🧠 CUESTIONARIO HOLÍSTICO SHIZEN - V5.1 OPTIMIZADO (144 preguntas)

## 🌱 BIENVENIDO A TU VIAJE DE AUTOCONOCIMIENTO

Este cuestionario holístico ha sido diseñado para acompañarte en el descubrimiento profundo de quién eres realmente. Cuanto más auténticas y honestas sean tus respuestas, mayor será el impacto positivo del análisis y las recomendaciones personalizadas en tu vida.

### 🔒 Confidencialidad absoluta

- Tus respuestas son **estrictamente privadas y confidenciales**
- **Solo tú** tienes acceso a tus resultados
- Ningún dato se comparte o vende a terceros
- Toda la información está segura y protegida

### 💎 La importancia de la autenticidad

Este cuestionario no es una prueba para "aprobar". **No hay respuestas correctas o incorrectas**.

Su propósito es ayudarte a:
- **Conocerte** profundamente, más allá de las máscaras sociales
- **Vivir plenamente** tu individualidad única
- **Encontrar tu equilibrio** en este mundo en movimiento
- **Comprender tus patrones** para usarlos mejor

Aunque algunas preguntas puedan hacerte sentir vulnerable, es en esta vulnerabilidad auténtica donde reside el verdadero poder de transformación.

### ⏱️ Información práctica

- **Duración estimada**: 40-55 minutos
- **144 preguntas** divididas en 9 bloques temáticos (versión optimizada V5.1)
- **Puedes tomar descansos** y reanudar más tarde (progreso guardado)
- **Tómate tu tiempo** para reflexionar sobre cada respuesta
- **Añade comentarios** cuando quieras matizar tus respuestas

### 🎯 Lo que se analizará

Tu perfil holístico integrará:
- **Perfiles psicológicos**: Rasgos de personalidad, modos de comunicación, preferencias
- **Neurodivergencias**: TDAH, autismo, superdotación, hipersensibilidad
- **Sabiduría Shinkofa**: Contexto de vida, valores, aspiraciones
- **Astrología personal**: Diseño Humano, astrología occidental, astrología china, numerología

🙏 **Gracias por tu confianza y autenticidad.**"""
    }
    return introductions.get(locale, introductions['en'])


# ═════════════════════════════════════════════════════════════
# QUESTIONNAIRE STRUCTURE (BLOCS A-I)
# ═════════════════════════════════════════════════════════════

@router.get("/structure")
async def get_questionnaire_structure(
    locale: str = "fr",
    db: Session = Depends(get_db)
):
    """
    Get complete questionnaire structure (144 questions, 9 blocs A-I)

    Args:
        locale: Language code (fr, en, es) - defaults to French

    Returns:
        Full questionnaire structure with all questions, metadata, and organization

    Note:
        - locale=fr: Loads from Markdown source (default, legacy)
        - locale=en/es: Loads from PostgreSQL with translations
    """
    try:
        # If French, use legacy Markdown source
        if locale == "fr":
            data = get_questionnaire_data()
            return data

        # For EN/ES, load from database and transform to structure
        questions_service = QuestionsDBService(db)
        questions = questions_service.get_all_questions(locale=locale)

        # Transform flat questions list to hierarchical structure with translations
        structure = _transform_questions_to_structure(questions, locale=locale)
        return structure

    except FileNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Questionnaire data source not found: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error loading questionnaire data: {str(e)}"
        )


@router.get("/structure/bloc/{bloc_id}")
async def get_bloc_structure(bloc_id: str):
    """
    Get structure for a specific bloc (A-I)

    Args:
        bloc_id: Bloc identifier (A, B, C, D, E, F, G, H, I)

    Returns:
        Bloc data with all modules and questions
    """
    bloc_data = get_bloc_questions(bloc_id.upper())

    if not bloc_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bloc {bloc_id.upper()} not found"
        )

    return bloc_data


@router.get("/structure/module/{module_id}")
async def get_module_structure(module_id: str):
    """
    Get structure for a specific module (e.g., A1, B2, C3)

    Args:
        module_id: Module identifier (e.g., "A1", "B2")

    Returns:
        Module data with all questions
    """
    module_data = get_module_questions(module_id.upper())

    if not module_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module {module_id.upper()} not found"
        )

    return module_data


# ═════════════════════════════════════════════════════════════
# MULTILINGUAL QUESTIONS (DATABASE i18n)
# ═════════════════════════════════════════════════════════════

@router.get("/questions/{locale}")
async def get_questions_by_locale(
    locale: str,
    db: Session = Depends(get_db)
):
    """
    Get all 144 questions in specified language

    Supported locales: fr (French), en (English), es (Spanish - coming soon)

    Returns questions with full translations from PostgreSQL database
    """
    # Validate locale
    valid_locales = ["fr", "en", "es"]
    if locale not in valid_locales:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid locale '{locale}'. Supported: {', '.join(valid_locales)}"
        )

    # Get questions from database
    questions_service = QuestionsDBService(db)
    questions = questions_service.get_all_questions(locale=locale)

    return {
        "locale": locale,
        "total_questions": len(questions),
        "questions": questions
    }


@router.get("/questions/{locale}/bloc/{bloc_letter}")
async def get_bloc_questions_i18n(
    locale: str,
    bloc_letter: str,
    db: Session = Depends(get_db)
):
    """
    Get questions for specific bloc (A-I) in specified language

    Args:
        locale: Language code (fr, en, es)
        bloc_letter: Bloc letter (A, B, C, D, E, F, G, H, I)

    Returns questions filtered by bloc with translations
    """
    # Validate locale
    valid_locales = ["fr", "en", "es"]
    if locale not in valid_locales:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid locale '{locale}'. Supported: {', '.join(valid_locales)}"
        )

    # Validate bloc letter
    valid_blocs = ["A", "B", "C", "D", "E", "F", "G", "H", "I"]
    bloc_upper = bloc_letter.upper()
    if bloc_upper not in valid_blocs:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid bloc '{bloc_letter}'. Supported: {', '.join(valid_blocs)}"
        )

    # Get bloc questions
    questions_service = QuestionsDBService(db)
    questions = questions_service.get_questions_by_bloc(bloc_upper, locale=locale)

    return {
        "locale": locale,
        "bloc": bloc_upper,
        "total_questions": len(questions),
        "questions": questions
    }


@router.get("/translations/stats")
async def get_translation_stats(
    db: Session = Depends(get_db)
):
    """
    Get translation statistics

    Returns completion percentages for each locale (FR/EN/ES)
    """
    questions_service = QuestionsDBService(db)
    stats = questions_service.get_translation_stats()
    return stats


# ═══════════════════════════════════════════════════════════════
# DEPRECATED: Old placeholder endpoint (kept for backward compatibility)
# Use /structure instead
# ═══════════════════════════════════════════════════════════════
@router.get("/sections", response_model=AllBlocsResponse, deprecated=True)
async def get_questionnaire_sections():
    """
    DEPRECATED: Use /structure instead

    Get all questionnaire sections (blocs A-I)

    Returns complete 144-question structure
    """
    # Return placeholder for backward compatibility
    blocs = [
        BlocSchema(
            bloc_id="A",
            title="Contexte de Vie",
            description="Questions sur votre contexte quotidien, énergie, routines",
            questions=[]
        ),
        BlocSchema(
            bloc_id="B",
            title="Neurodivergences",
            description="Identification TDAH, Autisme, HPI, Multipotentialité, etc.",
            questions=[]
        ),
        BlocSchema(
            bloc_id="C",
            title="Tests Psychologiques",
            description="MBTI, Big Five, Enneagramme, PNL, PCM, VAKOG",
            questions=[]
        ),
        BlocSchema(
            bloc_id="D",
            title="Dimensions Shinkofa",
            description="Roue de vie, Archétypes, Paradigmes limitants, Dialogue intérieur",
            questions=[]
        ),
        BlocSchema(
            bloc_id="E",
            title="Spiritualité & Ésotérisme",
            description="Niveau connaissance Design Humain, Astrologie, Numérologie",
            questions=[]
        ),
        BlocSchema(
            bloc_id="F",
            title="Informatique & IA",
            description="Niveau technique informatique et IA",
            questions=[]
        ),
        BlocSchema(
            bloc_id="G",
            title="Données Naissance",
            description="Date, heure, lieu de naissance PRÉCIS (GPS, timezone)",
            questions=[]
        ),
        BlocSchema(
            bloc_id="H",
            title="Langages d'Amour",
            description="5 langages d'amour de Gary Chapman",
            questions=[]
        ),
        BlocSchema(
            bloc_id="I",
            title="Validation Anti-Biais",
            description="Questions de contrôle qualité réponses",
            questions=[]
        )
    ]

    return AllBlocsResponse(
        blocs=blocs,
        total_questions=144
    )
