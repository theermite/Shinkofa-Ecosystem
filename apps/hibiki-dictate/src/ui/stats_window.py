"""
Statistics Dashboard Window for Hibiki.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from typing import Optional
from datetime import datetime, timedelta
from loguru import logger


class StatsWindow(ctk.CTkToplevel):
    """Statistics dashboard window."""

    def __init__(self, parent, history, theme_colors: dict):
        """
        Initialize stats window.

        Args:
            parent: Parent window
            history: TranscriptionHistory instance
            theme_colors: Color dictionary from ShinkofaColors
        """
        super().__init__(parent)

        self.history = history
        self.colors = theme_colors

        # Setup window
        self._setup_window()
        self._create_ui()
        self._load_stats()

    def _setup_window(self):
        """Setup window properties."""
        self.title("Statistiques - Hibiki")
        self.geometry("600x650")
        self.resizable(True, True)

        # Center on screen
        self.update_idletasks()
        width = 600
        height = 650
        x = (self.winfo_screenwidth() // 2) - (width // 2)
        y = (self.winfo_screenheight() // 2) - (height // 2)
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Apply theme
        self.configure(fg_color=self.colors['bg'])

    def _create_ui(self):
        """Create UI elements."""
        # Main container with padding
        main_container = ctk.CTkFrame(self, fg_color="transparent")
        main_container.pack(fill="both", expand=True, padx=24, pady=24)

        # Title
        title = ctk.CTkLabel(
            main_container,
            text="Statistiques d'utilisation",
            font=ctk.CTkFont(size=22, weight="bold"),
            text_color=self.colors['fg']
        )
        title.pack(pady=(0, 20))

        # Stats grid container
        self.stats_grid = ctk.CTkFrame(main_container, fg_color="transparent")
        self.stats_grid.pack(fill="both", expand=True)
        self.stats_grid.grid_columnconfigure((0, 1), weight=1)
        # Make rows expand to fill space
        for i in range(3):
            self.stats_grid.grid_rowconfigure(i, weight=1)

        # Footer
        footer = ctk.CTkLabel(
            main_container,
            text="Données basées sur l'historique de transcription",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['fg']
        )
        footer.pack(side="bottom", pady=(16, 0))

    def _load_stats(self):
        """Load and display statistics."""
        try:
            # Get all entries (limit to last 1000 for performance)
            entries = self.history.get_all(limit=1000)

            if not entries:
                self._show_no_data_message()
                return

            # Calculate statistics
            total_transcriptions = len(entries)
            total_words = sum(len(e.get('text', '').split()) for e in entries)
            total_chars = sum(len(e.get('text', '')) for e in entries)
            total_duration = sum(e.get('duration', 0) for e in entries)

            # Calculate average confidence
            confidences = [e.get('confidence', 0) for e in entries if e.get('confidence', 0) > 0]
            avg_confidence = sum(confidences) / len(confidences) if confidences else 0

            # Today's stats
            today = datetime.now().date()
            today_entries = [
                e for e in entries
                if datetime.fromisoformat(e.get('timestamp', '')).date() == today
            ]
            today_words = sum(len(e.get('text', '').split()) for e in today_entries)
            today_transcriptions = len(today_entries)

            # Average transcription duration
            avg_duration = total_duration / total_transcriptions if total_transcriptions > 0 else 0

            # Display stats in cards (2 columns x 3 rows for essential stats)
            row = 0
            col = 0

            stats = [
                (str(total_transcriptions), "Enregistrements", "Total de sessions"),
                (f"{total_words:,}", "Mots dictés", f"{total_chars:,} caractères"),
                (f"{int(total_duration // 60)}m {int(total_duration % 60)}s", "Temps total", "D'utilisation"),
                (f"{avg_confidence * 100:.0f}%", "Confiance", "Précision moyenne"),
                (str(today_transcriptions), "Aujourd'hui", f"{today_words} mots dictés"),
                (f"{avg_duration:.1f}s", "Durée moyenne", "Par enregistrement"),
            ]

            for value, label, sublabel in stats:
                self._create_modern_stat_card(value, label, sublabel, row, col)
                col += 1
                if col > 1:
                    col = 0
                    row += 1

            logger.info(f"Stats loaded: {total_transcriptions} transcriptions, {total_words} words")

        except Exception as e:
            logger.error(f"Failed to load stats: {e}")
            self._show_error_message(str(e))

    def _create_modern_stat_card(
        self,
        value: str,
        label: str,
        sublabel: str,
        row: int,
        col: int
    ):
        """Create a modern statistic card without emojis.

        Args:
            value: Main value to display
            label: Main description label
            sublabel: Secondary description (context)
            row: Grid row position
            col: Grid column position
        """
        # Card frame - MODERN DESIGN
        card = ctk.CTkFrame(
            self.stats_grid,
            corner_radius=10,
            border_width=1,
            border_color=self.colors['border'],
            fg_color=self.colors['card_bg']
        )
        card.grid(row=row, column=col, sticky="nsew", padx=8, pady=8)

        # Inner padding
        inner = ctk.CTkFrame(card, fg_color="transparent")
        inner.pack(fill="both", expand=True, padx=16, pady=16)

        # Value (LARGE and prominent)
        value_label = ctk.CTkLabel(
            inner,
            text=value,
            font=ctk.CTkFont(size=36, weight="bold"),
            text_color=self.colors['primary']
        )
        value_label.pack(pady=(8, 4))

        # Main label (bold)
        label_widget = ctk.CTkLabel(
            inner,
            text=label,
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['fg']
        )
        label_widget.pack(pady=(0, 4))

        # Sublabel (context - smaller)
        sublabel_widget = ctk.CTkLabel(
            inner,
            text=sublabel,
            font=ctk.CTkFont(size=11),
            text_color=self.colors['fg'],
            wraplength=240
        )
        sublabel_widget.pack(pady=(0, 8))

    def _show_no_data_message(self):
        """Show message when no data available."""
        message = ctk.CTkLabel(
            self.stats_grid,
            text="📊\n\nAucune donnée disponible\n\nCommencez à utiliser Hibiki pour voir vos statistiques.",
            font=ctk.CTkFont(size=16),
            text_color=self.colors['fg'],
            justify="center"
        )
        message.pack(expand=True, pady=100)

    def _show_error_message(self, error: str):
        """Show error message.

        Args:
            error: Error message to display
        """
        message = ctk.CTkLabel(
            self.stats_grid,
            text=f"❌\n\nErreur lors du chargement des statistiques\n\n{error}",
            font=ctk.CTkFont(size=14),
            text_color=self.colors['error'],
            justify="center"
        )
        message.pack(expand=True, pady=100)
