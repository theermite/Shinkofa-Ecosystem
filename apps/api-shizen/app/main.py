"""
SHINKOFA PLATFORM - SHIZEN-PLANNER SERVICE
FastAPI AI Companion + Planner (Unified Service)
Powered by Ollama (Qwen 2.5 7B, CodeLlama 7B) + LangChain
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware
from app.routes import (
    tasks_router,
    projects_router,
    journals_router,
    rituals_router,
    shizen_router,
    questionnaire_router,
    widget_data_router,
    sync_router,
)
from app.routes.stripe_webhooks import router as stripe_webhooks_router
from app.routes.admin_questions import router as admin_questions_router
from app.routes.admin_profiles import router as admin_profiles_router

app = FastAPI(
    title="Shinkofa Shizen-Planner API",
    description="AI Companion + Intelligent Planner (Unified Service)",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    redirect_slashes=False,  # Disable automatic slash redirects to prevent breaking nginx proxy
)

# Proxy Headers Middleware (MUST be first - before CORS)
# Allows FastAPI to respect X-Forwarded-* headers from nginx
# This fixes HTTPS redirects when behind reverse proxy
app.add_middleware(ProxyHeadersMiddleware, trusted_hosts=["*"])

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://shinkofa.com",
        "https://app.shinkofa.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "shizen-planner",
        "version": "1.0.0",
        "ai_enabled": True,
        "gpu_enabled": False  # TODO: Check GPU availability
    }


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "service": "Shinkofa Shizen-Planner API",
        "version": "1.0.0",
        "docs": "/docs",
        "features": [
            "AI Chat (Shizen)",
            "AI Coaching (Design Humain)",
            "Holistic Questionnaire (144 questions)",
            "Tasks Management (AI-powered)",
            "Goals Tracking",
            "Energy Logging",
            "Neural Recommendations"
        ]
    }


# Include Planner routers
app.include_router(sync_router)
app.include_router(tasks_router)
app.include_router(projects_router)
app.include_router(journals_router)
app.include_router(rituals_router)
app.include_router(widget_data_router)

# Include Questionnaire router
app.include_router(questionnaire_router)

# Include Admin Questions router (Super Admin only)
app.include_router(admin_questions_router)

# Include Admin Profiles router (Super Admin only)
app.include_router(admin_profiles_router)

# Include Shizen AI router
app.include_router(shizen_router)

# Include Stripe Webhooks router
app.include_router(stripe_webhooks_router)

# TODO: Add advanced AI routes (Phase 3.1)
# - WS /shizen/ws/{user_id} - WebSocket real-time chat
# - POST /shizen/recommend - AI recommendations
# - GET /shizen/avatar/state - Avatar emotional state
# - PUT /shizen/avatar/update - Update avatar
