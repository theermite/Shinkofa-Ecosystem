"""
Database models
"""

from .base import BaseModel
from .user import User, UserRole
from .exercise import Exercise, ExerciseScore, ExerciseCategory, ExerciseType
from .session import Session, SessionParticipant, SessionType, SessionStatus
from .coaching import (
    Questionnaire,
    QuestionnaireResponse,
    JournalEntry,
    Goal,
    QuestionnaireType,
    JournalMood,
)
from .media import Media, Playlist, PlaylistMedia, MediaType, MediaCategory
from .assignment import ExerciseAssignment, AssignmentStatus
from .memory_exercise import (
    MemoryExerciseSession,
    MemoryExerciseType,
    DifficultyLevel,
)
from .notification_preferences import NotificationPreferences
from .notification import Notification, NotificationType
from .tactical_formation import TacticalFormation, MapType, FormationCategory
from .availability import PlayerAvailability, PlayerAvailabilityException, DayOfWeek
from .report import Report
from .contact_submission import ContactSubmission, SubmissionStatus
from .recruitment_application import RecruitmentApplication, ApplicationStatus

__all__ = [
    "BaseModel",
    "User",
    "UserRole",
    "Exercise",
    "ExerciseScore",
    "ExerciseCategory",
    "ExerciseType",
    "Session",
    "SessionParticipant",
    "SessionType",
    "SessionStatus",
    "Questionnaire",
    "QuestionnaireResponse",
    "JournalEntry",
    "Goal",
    "QuestionnaireType",
    "JournalMood",
    "Media",
    "Playlist",
    "PlaylistMedia",
    "MediaType",
    "MediaCategory",
    "ExerciseAssignment",
    "AssignmentStatus",
    "MemoryExerciseSession",
    "MemoryExerciseType",
    "DifficultyLevel",
    "NotificationPreferences",
    "Notification",
    "NotificationType",
    "TacticalFormation",
    "MapType",
    "FormationCategory",
    "PlayerAvailability",
    "PlayerAvailabilityException",
    "DayOfWeek",
    "Report",
    "ContactSubmission",
    "SubmissionStatus",
    "RecruitmentApplication",
    "ApplicationStatus",
]
