"""
Emoji Button Component - Standardized emoji button with hover effects
Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from typing import Optional, Callable


class EmojiButton(ctk.CTkButton):
    """Standardized emoji button with hover effects and tooltips.

    Features:
    - Consistent sizing (default 44x44px for accessibility)
    - Emoji-only display (no text)
    - Configurable colors and hover states
    - Optional tooltip support

    Usage:
        button = EmojiButton(
            parent,
            emoji="⚙️",
            tooltip="Settings",
            size=44,
            fg_color="#ff9800",
            hover_color="#ffb74d",
            command=open_settings
        )
    """

    def __init__(
        self,
        parent,
        emoji: str,
        tooltip: str = "",
        size: int = 44,
        command: Optional[Callable] = None,
        **kwargs
    ):
        """Initialize emoji button.

        Args:
            parent: Parent widget
            emoji: Emoji character to display
            tooltip: Optional tooltip text
            size: Button size in pixels (width and height)
            command: Click handler function
            **kwargs: Additional CTkButton arguments
        """
        # Default styling
        default_kwargs = {
            'text': emoji,
            'width': size,
            'height': size,
            'corner_radius': 8,
            'font': ctk.CTkFont(size=20),
            'border_width': 0,
        }

        # Merge with user kwargs (user overrides defaults)
        default_kwargs.update(kwargs)

        # Add command if provided
        if command:
            default_kwargs['command'] = command

        super().__init__(parent, **default_kwargs)

        self.tooltip = tooltip
        self.emoji = emoji

        # Bind tooltip events if tooltip provided
        if tooltip:
            self._setup_tooltip()

    def _setup_tooltip(self):
        """Setup tooltip functionality (basic implementation)."""
        # Tooltip implementation disabled for now to avoid conflicts with CTkButton
        pass

    def update_emoji(self, new_emoji: str):
        """Update button emoji.

        Args:
            new_emoji: New emoji character to display
        """
        self.emoji = new_emoji
        self.configure(text=new_emoji)
