"""
Utility functions and dependencies
"""

from .dependencies import (
    get_current_user,
    get_current_active_user,
    require_role,
    get_current_coach,
    get_current_manager
)

__all__ = [
    "get_current_user",
    "get_current_active_user",
    "require_role",
    "get_current_coach",
    "get_current_manager"
]
