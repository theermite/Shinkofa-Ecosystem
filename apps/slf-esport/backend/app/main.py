"""
Main FastAPI application entry point
SLF E-Sport Training Platform
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import time
import logging

from app.core.config import settings
from app.core.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    docs_url="/docs" if settings.DEBUG else None,
    redoc_url="/redoc" if settings.DEBUG else None,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    """Add X-Process-Time header to responses"""
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Exception handlers
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    """Handle HTTP exceptions"""
    logger.error(f"HTTP error: {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code}
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    logger.error(f"Validation error: {exc.errors()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "status_code": 422}
    )


@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    logger.error(f"Unhandled error: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error" if not settings.DEBUG else str(exc),
            "status_code": 500
        }
    )


# Startup and shutdown events
@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info(f"Starting {settings.PROJECT_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Initialize database
    try:
        init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Database initialization failed: {str(e)}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info(f"Shutting down {settings.PROJECT_NAME}")


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint for monitoring

    Returns:
        dict: Health status information
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information

    Returns:
        dict: API information
    """
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs" if settings.DEBUG else "Documentation disabled in production",
        "health": "/health"
    }


# Import routers
from app.routes import auth, users, exercises, sessions, coaching, media, stats, upload, password_reset, assignments, memory_exercises, notifications, tactical_formations, availabilities, contact_submissions, reports, recruitment

# Include routers with API v1 prefix
app.include_router(
    auth.router,
    prefix=f"{settings.API_V1_STR}/auth",
    tags=["Authentication"]
)
app.include_router(
    password_reset.router,
    prefix=f"{settings.API_V1_STR}/password-reset",
    tags=["Password Reset"]
)
app.include_router(
    users.router,
    prefix=f"{settings.API_V1_STR}/users",
    tags=["Users"]
)
app.include_router(
    exercises.router,
    prefix=f"{settings.API_V1_STR}/exercises",
    tags=["Exercises"]
)
app.include_router(
    sessions.router,
    prefix=f"{settings.API_V1_STR}/sessions",
    tags=["Sessions"]
)
app.include_router(
    coaching.router,
    prefix=f"{settings.API_V1_STR}/coaching",
    tags=["Coaching"]
)
app.include_router(
    assignments.router,
    prefix=f"{settings.API_V1_STR}/assignments",
    tags=["Assignments"]
)
app.include_router(
    media.router,
    prefix=f"{settings.API_V1_STR}/media",
    tags=["Media"]
)
app.include_router(
    stats.router,
    prefix=f"{settings.API_V1_STR}/stats",
    tags=["Statistics"]
)
app.include_router(
    upload.router,
    prefix=f"{settings.API_V1_STR}/upload",
    tags=["Upload"]
)
app.include_router(
    memory_exercises.router,
    prefix=f"{settings.API_V1_STR}/memory-exercises",
    tags=["Memory Exercises"]
)
app.include_router(
    notifications.router,
    prefix=f"{settings.API_V1_STR}/notifications",
    tags=["Notifications"]
)
app.include_router(
    tactical_formations.router,
    prefix=f"{settings.API_V1_STR}/tactical-formations",
    tags=["Tactical Formations"]
)
app.include_router(
    contact_submissions.router,
    prefix=f"{settings.API_V1_STR}/contact-submissions",
    tags=["Contact Submissions"]
)
app.include_router(
    reports.router,
    prefix=f"{settings.API_V1_STR}/reports",
    tags=["Reports"]
)
app.include_router(
    availabilities.router,
    prefix=f"{settings.API_V1_STR}/availabilities",
    tags=["Availabilities"]
)
app.include_router(
    recruitment.router,
    prefix=f"{settings.API_V1_STR}/recruitment",
    tags=["Recruitment"]
)

# Serve uploaded files
from fastapi.staticfiles import StaticFiles
import os

uploads_dir = "/app/uploads"
if not os.path.exists(uploads_dir):
    os.makedirs(uploads_dir)
    os.makedirs(os.path.join(uploads_dir, "avatars"))

app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")
