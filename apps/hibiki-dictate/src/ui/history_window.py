"""
Transcription History Window.
Displays recent transcriptions with copy/reinject functionality.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from typing import Optional, Callable, List, Dict
from loguru import logger
from datetime import datetime

from ..utils.transcription_history import TranscriptionHistory


class HistoryWindow(ctk.CTkToplevel):
    """
    Window displaying transcription history with management features.
    """

    def __init__(
        self,
        parent,
        history: TranscriptionHistory,
        on_reinject: Optional[Callable[[str], None]] = None,
        theme_colors: Optional[Dict[str, str]] = None
    ):
        """
        Initialize history window.

        Args:
            parent: Parent window
            history: TranscriptionHistory instance
            on_reinject: Callback to reinject text (takes text as parameter)
            theme_colors: Color scheme dictionary
        """
        super().__init__(parent)

        self.history = history
        self.on_reinject = on_reinject
        self.colors = theme_colors or self._get_default_colors()

        # Window setup
        self._setup_window()

        # Create UI
        self._create_ui()

        # Load history
        self._load_history()

        logger.info("📜 History window opened")

    def _get_default_colors(self) -> Dict[str, str]:
        """Get default Shinkofa colors (light mode)."""
        return {
            'bg': "#FFFFFF",
            'fg': "#1c3049",
            'primary': "#e08f34",
            'primary_hover': "#1c3049",
            'accent': "#f5cd3e",
            'success': "#2d7a2f",
            'error': "#c62828",
            'warning': "#e65100",
            'border': "#1c3049",
        }

    def _setup_window(self):
        """Setup window properties."""
        self.title("📜 Historique des Transcriptions")

        # Window size
        width, height = 700, 600
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Minimum size
        self.minsize(600, 500)

        # Make window modal
        self.transient(self.master)
        self.grab_set()

    def _create_ui(self):
        """Create UI components."""
        # Main container
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", padx=20, pady=(20, 10))
        header_frame.grid_columnconfigure(0, weight=1)

        title_label = ctk.CTkLabel(
            header_frame,
            text="📜 Historique des Transcriptions",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, sticky="w")

        # Count label
        self.count_label = ctk.CTkLabel(
            header_frame,
            text="Chargement...",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['primary']
        )
        self.count_label.grid(row=1, column=0, sticky="w", pady=(4, 0))

        # Scrollable frame for history entries
        self.scrollable_frame = ctk.CTkScrollableFrame(
            self,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['border']
        )
        self.scrollable_frame.grid(row=1, column=0, sticky="nsew", padx=20, pady=10)
        self.scrollable_frame.grid_columnconfigure(0, weight=1)

        # Bottom buttons
        buttons_frame = ctk.CTkFrame(self, fg_color="transparent")
        buttons_frame.grid(row=2, column=0, sticky="ew", padx=20, pady=(10, 20))
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)
        buttons_frame.grid_columnconfigure(2, weight=1)

        # Refresh button
        refresh_button = ctk.CTkButton(
            buttons_frame,
            text="🔄 Actualiser",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['primary'],
            text_color=self.colors['primary'],
            hover_color=self.colors['primary'],
            command=self._load_history
        )
        refresh_button.grid(row=0, column=0, sticky="ew", padx=(0, 8))

        # Clear all button
        clear_button = ctk.CTkButton(
            buttons_frame,
            text="🗑️ Tout Effacer",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['error'],
            text_color=self.colors['error'],
            hover_color=self.colors['error'],
            command=self._clear_all
        )
        clear_button.grid(row=0, column=1, sticky="ew", padx=8)

        # Close button
        close_button = ctk.CTkButton(
            buttons_frame,
            text="✕ Fermer",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color=self.colors['primary'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            command=self._on_close
        )
        close_button.grid(row=0, column=2, sticky="ew", padx=(8, 0))

    def _load_history(self):
        """Load and display transcription history."""
        try:
            # Clear existing entries
            for widget in self.scrollable_frame.winfo_children():
                widget.destroy()

            # Get history entries (most recent first)
            entries = self.history.get_all(limit=100)

            if not entries:
                # No entries
                no_entries_label = ctk.CTkLabel(
                    self.scrollable_frame,
                    text="Aucune transcription dans l'historique",
                    font=ctk.CTkFont(size=14),
                    text_color=self.colors['fg']
                )
                no_entries_label.grid(row=0, column=0, pady=40)
                self.count_label.configure(text="0 transcription")
                return

            # Update count
            count = len(entries)
            self.count_label.configure(
                text=f"{count} transcription{'s' if count > 1 else ''}"
            )

            # Display each entry
            for idx, entry in enumerate(entries):
                self._create_entry_card(entry, idx)

            logger.info(f"📜 Loaded {count} history entries")

        except Exception as e:
            logger.error(f"Failed to load history: {e}")
            logger.exception(e)

    def _create_entry_card(self, entry: dict, index: int):
        """
        Create a card for a history entry.

        Args:
            entry: Entry dict with id, timestamp, text, confidence, etc.
            index: Entry index
        """
        # Entry card
        card = ctk.CTkFrame(
            self.scrollable_frame,
            corner_radius=8,
            border_width=1,
            border_color=self.colors['border']
        )
        card.grid(row=index, column=0, sticky="ew", pady=8)
        card.grid_columnconfigure(0, weight=1)

        # Header (timestamp + confidence)
        header_frame = ctk.CTkFrame(card, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", padx=12, pady=(12, 0))
        header_frame.grid_columnconfigure(0, weight=1)

        # Timestamp
        timestamp_str = entry.get('timestamp', '')
        try:
            timestamp_dt = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")
            timestamp_display = timestamp_dt.strftime("%d/%m/%Y %H:%M:%S")
        except:
            timestamp_display = timestamp_str

        timestamp_label = ctk.CTkLabel(
            header_frame,
            text=f"🕒 {timestamp_display}",
            font=ctk.CTkFont(size=12, weight="bold"),
            text_color=self.colors['fg']
        )
        timestamp_label.grid(row=0, column=0, sticky="w")

        # Confidence (if available)
        confidence = entry.get('confidence')
        if confidence is not None:
            confidence_pct = int(confidence * 100)
            if confidence_pct >= 80:
                confidence_color = self.colors['success']
                confidence_icon = "✨"
            elif confidence_pct >= 60:
                confidence_color = self.colors['warning']
                confidence_icon = "⭐"
            else:
                confidence_color = self.colors['error']
                confidence_icon = "⚠️"

            confidence_label = ctk.CTkLabel(
                header_frame,
                text=f"{confidence_icon} {confidence_pct}%",
                font=ctk.CTkFont(size=12),
                text_color=confidence_color
            )
            confidence_label.grid(row=0, column=1, sticky="e", padx=(8, 0))

        # Text content
        text = entry.get('text', '')
        text_label = ctk.CTkLabel(
            card,
            text=text,
            font=ctk.CTkFont(size=14),
            text_color=self.colors['fg'],
            justify="left",
            anchor="w",
            wraplength=600
        )
        text_label.grid(row=1, column=0, sticky="ew", padx=12, pady=12)

        # Buttons frame
        buttons_frame = ctk.CTkFrame(card, fg_color="transparent")
        buttons_frame.grid(row=2, column=0, sticky="ew", padx=12, pady=(0, 12))
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)

        # Copy button
        copy_button = ctk.CTkButton(
            buttons_frame,
            text="📋 Copier",
            font=ctk.CTkFont(size=12),
            height=32,
            corner_radius=6,
            fg_color="transparent",
            border_width=1,
            border_color=self.colors['primary'],
            text_color=self.colors['primary'],
            hover_color=self.colors['primary'],
            command=lambda t=text: self._copy_text(t)
        )
        copy_button.grid(row=0, column=0, sticky="ew", padx=(0, 4))

        # Reinject button (if callback provided)
        if self.on_reinject:
            reinject_button = ctk.CTkButton(
                buttons_frame,
                text="⚡ Réinjecter",
                font=ctk.CTkFont(size=12),
                height=32,
                corner_radius=6,
                fg_color=self.colors['primary'],
                hover_color=self.colors['primary_hover'],
                text_color="#FFFFFF",
                command=lambda t=text: self._reinject_text(t)
            )
            reinject_button.grid(row=0, column=1, sticky="ew", padx=(4, 0))

    def _copy_text(self, text: str):
        """
        Copy text to clipboard.

        Args:
            text: Text to copy
        """
        try:
            import pyperclip
            pyperclip.copy(text)
            logger.info(f"📋 Copied to clipboard: {text[:50]}...")

            # Visual feedback (optional: show toast notification)
            # For now, just log

        except Exception as e:
            logger.error(f"Failed to copy text: {e}")

    def _reinject_text(self, text: str):
        """
        Reinject text into active application.

        Args:
            text: Text to reinject
        """
        try:
            if self.on_reinject:
                logger.info(f"⚡ Reinjecting text: {text[:50]}...")
                self.on_reinject(text)
            else:
                logger.warning("No reinject callback provided")

        except Exception as e:
            logger.error(f"Failed to reinject text: {e}")

    def _clear_all(self):
        """Clear all history entries (with confirmation)."""
        # Confirmation dialog
        confirm_window = ctk.CTkToplevel(self)
        confirm_window.title("Confirmation")
        confirm_window.geometry("400x200")
        confirm_window.resizable(False, False)
        confirm_window.transient(self)
        confirm_window.grab_set()

        # Center window
        confirm_window.update_idletasks()
        width = confirm_window.winfo_width()
        height = confirm_window.winfo_height()
        x = (confirm_window.winfo_screenwidth() // 2) - (width // 2)
        y = (confirm_window.winfo_screenheight() // 2) - (height // 2)
        confirm_window.geometry(f'{width}x{height}+{x}+{y}')

        # Content
        content_frame = ctk.CTkFrame(confirm_window, fg_color="transparent")
        content_frame.pack(fill="both", expand=True, padx=20, pady=20)

        warning_label = ctk.CTkLabel(
            content_frame,
            text="⚠️ Confirmer la suppression",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['error']
        )
        warning_label.pack(pady=(0, 16))

        message_label = ctk.CTkLabel(
            content_frame,
            text="Voulez-vous vraiment effacer tout l'historique ?\nCette action est irréversible.",
            font=ctk.CTkFont(size=14),
            text_color=self.colors['fg'],
            justify="center"
        )
        message_label.pack(pady=(0, 24))

        # Buttons
        buttons_frame = ctk.CTkFrame(content_frame, fg_color="transparent")
        buttons_frame.pack(fill="x")

        def do_clear():
            try:
                self.history.clear_all()
                logger.info("🗑️ History cleared")
                self._load_history()
                confirm_window.destroy()
            except Exception as e:
                logger.error(f"Failed to clear history: {e}")

        cancel_button = ctk.CTkButton(
            buttons_frame,
            text="Annuler",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['border'],
            text_color=self.colors['fg'],
            hover_color=self.colors['border'],
            command=confirm_window.destroy
        )
        cancel_button.pack(side="left", expand=True, fill="x", padx=(0, 8))

        confirm_button = ctk.CTkButton(
            buttons_frame,
            text="Effacer tout",
            font=ctk.CTkFont(size=14, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['error'],
            hover_color="#a02020",
            text_color="#FFFFFF",
            command=do_clear
        )
        confirm_button.pack(side="right", expand=True, fill="x", padx=(8, 0))

    def _on_close(self):
        """Handle window close."""
        logger.info("📜 History window closed")
        self.grab_release()
        self.destroy()


if __name__ == "__main__":
    # Test history window
    from ..utils.logger import setup_logger

    setup_logger(log_level="INFO")

    # Create test app
    app = ctk.CTk()
    app.geometry("400x300")
    app.title("Test App")

    # Create test history
    history = TranscriptionHistory(db_file="test_history.db")

    # Add some test entries
    history.add_entry("Ceci est un test de transcription.", confidence=0.95, provider="whisperx", duration=2.5)
    history.add_entry("Deuxième transcription pour tester l'historique.", confidence=0.87, provider="whisperx", duration=3.1)
    history.add_entry("Troisième entrée avec un texte un peu plus long pour voir comment ça se comporte dans l'interface.", confidence=0.92, provider="whisperx", duration=4.2)

    # Test reinject callback
    def test_reinject(text):
        logger.info(f"TEST REINJECT: {text}")

    # Button to open history
    def open_history():
        HistoryWindow(app, history, on_reinject=test_reinject)

    button = ctk.CTkButton(app, text="Open History", command=open_history)
    button.pack(pady=20)

    app.mainloop()
