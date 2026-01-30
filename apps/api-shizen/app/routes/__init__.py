"""
Routes package
"""
from .sync import router as sync_router
from .tasks import router as tasks_router
from .projects import router as projects_router
from .journals import router as journals_router
from .rituals import router as rituals_router
from .shizen import router as shizen_router
from .questionnaire import router as questionnaire_router
from .widget_data import router as widget_data_router

__all__ = [
    "sync_router",
    "tasks_router",
    "projects_router",
    "journals_router",
    "rituals_router",
    "shizen_router",
    "questionnaire_router",
    "widget_data_router",
]
