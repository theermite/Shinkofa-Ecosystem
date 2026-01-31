"""
Visual Overlay Window for Hibiki.
Always-on-top window showing recording status and audio level.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from typing import Optional, Callable, List
from loguru import logger


class OverlayWindow(ctk.CTkToplevel):
    """
    Compact overlay window showing recording status.
    Stays on top of all windows for visual feedback without needing main window focus.
    """

    # Language display map
    LANGUAGE_DISPLAY = {
        "fr": "FR",
        "en": "EN",
        "es": "ES",
        "de": "DE",
        "it": "IT",
        "pt": "PT",
        "nl": "NL",
        "pl": "PL",
        "ru": "RU",
        "zh": "ZH",
        "ja": "JA",
        "ko": "KO",
    }

    def __init__(
        self,
        parent,
        position: str = "bottom_left",
        opacity: float = 0.85,
        current_language: str = "fr",
        quick_languages: Optional[List[str]] = None,
        on_language_change: Optional[Callable[[str], None]] = None
    ):
        """
        Initialize overlay window.

        Args:
            parent: Parent window (Hibiki main app)
            position: Position on screen (bottom_left, bottom_center, bottom_right, top_left, top_center, top_right, center_left, center_right, center)
            opacity: Window opacity (0.3-1.0, higher = more visible)
            current_language: Current transcription language code
            quick_languages: List of quick-access language codes
            on_language_change: Callback when language is changed
        """
        super().__init__(parent)

        # Store configuration
        self.position_setting = position
        self.opacity_setting = max(0.3, min(1.0, opacity))
        self.current_language = current_language
        self.quick_languages = quick_languages or ["fr", "en", "es", "de"]
        self.on_language_change = on_language_change

        # Window configuration (ultra-compact)
        self.title("Hibiki")
        self.resizable(False, False)

        # Always on top
        self.attributes("-topmost", True)

        # Configurable transparency
        try:
            self.attributes("-alpha", self.opacity_setting)
        except Exception:
            pass  # Not supported on all platforms

        # Borderless window for minimal look
        self.overrideredirect(True)

        # Calculate position based on setting (compact overlay with language button)
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        window_width = 100  # Wider to accommodate language button
        window_height = 36

        # Calculate x and y based on position
        margin = 10  # Distance from screen edges
        taskbar_height = 60  # Approximate taskbar height

        positions = {
            "bottom_left": (margin, screen_height - window_height - taskbar_height),
            "bottom_center": ((screen_width - window_width) // 2, screen_height - window_height - taskbar_height),
            "bottom_right": (screen_width - window_width - margin, screen_height - window_height - taskbar_height),
            "top_left": (margin, margin),
            "top_center": ((screen_width - window_width) // 2, margin),
            "top_right": (screen_width - window_width - margin, margin),
            "center_left": (margin, (screen_height - window_height) // 2),
            "center_right": (screen_width - window_width - margin, (screen_height - window_height) // 2),
            "center": ((screen_width - window_width) // 2, (screen_height - window_height) // 2),
        }

        x_pos, y_pos = positions.get(self.position_setting, positions["bottom_left"])
        self.geometry(f"{window_width}x{window_height}+{x_pos}+{y_pos}")

        # State variables
        self.current_status = "Prêt"
        self.segments_count = 0
        self.audio_level = 0.0

        # Setup UI
        self._setup_ui()

        logger.info(f"📺 Overlay window created (position={position}, opacity={opacity:.2f})")

    def _setup_ui(self):
        """Setup UI components (ultra-compact Shinkofa design)."""
        # Main container
        main_frame = ctk.CTkFrame(self, corner_radius=10, fg_color="#1a1a1a")
        main_frame.pack(fill="both", expand=True, padx=1, pady=1)

        # Horizontal layout: [Icon] [Voice Indicator] [Language Button]
        content_frame = ctk.CTkFrame(main_frame, fg_color="transparent")
        content_frame.pack(fill="both", expand=True, padx=4, pady=4)

        # Status icon (emoji) - LARGER
        self.status_label = ctk.CTkLabel(
            content_frame,
            text="🎙️",
            font=("Segoe UI", 22),
            text_color="#FFF"
        )
        self.status_label.pack(side="left", padx=(0, 2))

        # Voice detection indicator (colored dot) - LARGER
        self.voice_indicator = ctk.CTkLabel(
            content_frame,
            text="●",
            font=("Segoe UI", 24),
            text_color="#666"  # Gray when no voice
        )
        self.voice_indicator.pack(side="left")

        # Language button (compact)
        lang_display = self.LANGUAGE_DISPLAY.get(self.current_language, self.current_language.upper()[:2])
        self.language_button = ctk.CTkButton(
            content_frame,
            text=lang_display,
            font=("Segoe UI", 11, "bold"),
            width=28,
            height=24,
            corner_radius=4,
            fg_color="#444",
            hover_color="#666",
            text_color="#FFF",
            command=self._show_language_menu
        )
        self.language_button.pack(side="left", padx=(4, 0))

        # Language popup menu (hidden by default)
        self.language_menu_window: Optional[ctk.CTkToplevel] = None

    def update_status(self, status: str, color: Optional[str] = None):
        """
        Update status display (icon only).

        Args:
            status: Status with icon (e.g., "🎙️ Prêt", "✍️ Transcription...")
            color: Optional text color (ignored in compact mode)
        """
        self.current_status = status

        # Extract icon from status (first emoji)
        icon = status[0] if status else "🎙️"
        self.status_label.configure(text=icon)

        logger.debug(f"📺 Overlay status: {status}")

    def update_segments(self, count: int):
        """
        Update segments counter (no-op in compact mode).

        Args:
            count: Number of segments captured (ignored)
        """
        self.segments_count = count
        # No visual update in compact mode

    def update_voice_detected(self, detected: bool):
        """
        Update voice detection indicator.

        Args:
            detected: True if voice is detected, False otherwise
        """
        if detected:
            self.voice_indicator.configure(text_color="#4CAF50")  # Green = voice detected
        else:
            self.voice_indicator.configure(text_color="#666")  # Gray = no voice

    def update_audio_level(self, level: float):
        """
        Update audio level (changes voice indicator color and size).
        HIGH SENSITIVITY for immediate visual feedback.

        Args:
            level: Audio level (0.0 to 1.0)
        """
        self.audio_level = max(0.0, min(1.0, level))

        # Change voice indicator color based on level (VERY SENSITIVE thresholds)
        if self.audio_level > 0.35:
            # Very loud (red) - Shinkofa orange-red
            self.voice_indicator.configure(text_color="#F44336", font=("Segoe UI", 28))
        elif self.audio_level > 0.20:
            # Loud (orange) - Shinkofa orange
            self.voice_indicator.configure(text_color="#FF9800", font=("Segoe UI", 27))
        elif self.audio_level > 0.10:
            # Good level (light green)
            self.voice_indicator.configure(text_color="#8BC34A", font=("Segoe UI", 26))
        elif self.audio_level > 0.05:
            # Moderate (green)
            self.voice_indicator.configure(text_color="#4CAF50", font=("Segoe UI", 25))
        elif self.audio_level > 0.015:
            # Faint voice (light gray)
            self.voice_indicator.configure(text_color="#9E9E9E", font=("Segoe UI", 24))
        else:
            # No voice (dark gray)
            self.voice_indicator.configure(text_color="#666", font=("Segoe UI", 24))

    def reset(self):
        """Reset overlay to initial state."""
        self.update_status("🎙️ Prêt")
        self.update_audio_level(0.0)
        # Reset voice indicator to default size
        self.voice_indicator.configure(font=("Segoe UI", 24))

    def update_language(self, lang_code: str):
        """
        Update the displayed language.

        Args:
            lang_code: New language code (e.g., "fr", "en")
        """
        self.current_language = lang_code
        lang_display = self.LANGUAGE_DISPLAY.get(lang_code, lang_code.upper()[:2])
        self.language_button.configure(text=lang_display)
        logger.debug(f"Overlay language updated: {lang_code}")

    def _show_language_menu(self):
        """Show language selection popup menu."""
        # Close existing menu if open
        if self.language_menu_window and self.language_menu_window.winfo_exists():
            self.language_menu_window.destroy()
            self.language_menu_window = None
            return

        # Create popup menu
        self.language_menu_window = ctk.CTkToplevel(self)
        self.language_menu_window.overrideredirect(True)
        self.language_menu_window.attributes("-topmost", True)

        try:
            self.language_menu_window.attributes("-alpha", self.opacity_setting)
        except Exception:
            pass

        # Calculate position (above or below the overlay)
        overlay_x = self.winfo_x()
        overlay_y = self.winfo_y()
        overlay_height = self.winfo_height()

        # Position above the overlay
        menu_width = 60
        menu_height = len(self.quick_languages) * 28 + 8
        menu_x = overlay_x + 70  # Align with language button
        menu_y = overlay_y - menu_height - 4  # Above overlay

        # If too close to top of screen, show below instead
        if menu_y < 0:
            menu_y = overlay_y + overlay_height + 4

        self.language_menu_window.geometry(f"{menu_width}x{menu_height}+{menu_x}+{menu_y}")

        # Menu frame
        menu_frame = ctk.CTkFrame(
            self.language_menu_window,
            corner_radius=8,
            fg_color="#2d2d2d"
        )
        menu_frame.pack(fill="both", expand=True, padx=2, pady=2)

        # Language buttons
        for lang_code in self.quick_languages:
            lang_display = self.LANGUAGE_DISPLAY.get(lang_code, lang_code.upper()[:2])

            # Highlight current language
            is_current = lang_code == self.current_language
            fg_color = "#ff9800" if is_current else "transparent"
            text_color = "#000" if is_current else "#FFF"

            lang_btn = ctk.CTkButton(
                menu_frame,
                text=lang_display,
                font=("Segoe UI", 12, "bold"),
                width=48,
                height=24,
                corner_radius=4,
                fg_color=fg_color,
                hover_color="#555",
                text_color=text_color,
                command=lambda lc=lang_code: self._on_language_selected(lc)
            )
            lang_btn.pack(pady=2, padx=4)

        # Close menu when clicking elsewhere
        self.language_menu_window.bind("<FocusOut>", lambda e: self._close_language_menu())

        # Give focus to menu
        self.language_menu_window.focus_set()

    def _close_language_menu(self):
        """Close the language menu."""
        if self.language_menu_window and self.language_menu_window.winfo_exists():
            self.language_menu_window.destroy()
            self.language_menu_window = None

    def _on_language_selected(self, lang_code: str):
        """
        Handle language selection.

        Args:
            lang_code: Selected language code
        """
        logger.info(f"Language selected from overlay: {lang_code}")

        # Close menu
        self._close_language_menu()

        # Update display
        self.update_language(lang_code)

        # Call callback if provided
        if self.on_language_change:
            self.on_language_change(lang_code)


if __name__ == "__main__":
    # Test overlay window
    from ..utils.logger import setup_logger
    import time

    setup_logger(log_level="INFO")

    print("Testing overlay window...")

    root = ctk.CTk()
    root.geometry("400x300")
    root.title("Main Window")

    overlay = OverlayWindow(root)

    # Simulate recording states
    def test_states():
        print("\n🔴 Simulating START...")
        overlay.update_status("🎤 Écoute en cours...", "#4CAF50")
        overlay.update_segments(1)

        for i in range(10):
            level = (i + 1) / 10
            overlay.update_audio_level(level)
            root.update()
            time.sleep(0.2)

        print("\n⏹️ Simulating STOP...")
        overlay.update_status("✍️ Transcription...", "#FFC107")
        overlay.update_audio_level(0)
        root.update()
        time.sleep(2)

        print("\n✅ Simulating SUCCESS...")
        overlay.update_status("✅ Terminé !", "#00C853")
        root.update()
        time.sleep(1)

        print("\n🔄 Resetting...")
        overlay.reset()

    # Start test after 1 second
    root.after(1000, test_states)

    root.mainloop()

    print("\n✅ Overlay window test complete!")
