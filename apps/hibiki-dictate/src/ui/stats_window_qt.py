"""Stats Window Qt6 - Usage statistics dashboard.

Copyright (C) 2025 La Voie Shinkofa
"""
from datetime import datetime, timedelta
from typing import Optional

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QGridLayout,
    QLabel, QFrame, QPushButton
)
from PySide6.QtCore import Qt
from loguru import logger

from ..utils.transcription_history import TranscriptionHistory


class StatCard(QFrame):
    """Stat card widget with icon, value, and label."""

    def __init__(self, icon: str, value: str, label: str):
        super().__init__()
        self.setObjectName("statusCard")

        layout = QVBoxLayout()
        layout.setSpacing(8)

        # Icon
        icon_label = QLabel(icon)
        icon_label.setStyleSheet("font-size: 32px;")
        icon_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(icon_label)

        # Value
        value_label = QLabel(value)
        value_label.setObjectName("title")
        value_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(value_label)

        # Label
        label_widget = QLabel(label)
        label_widget.setObjectName("hint")
        label_widget.setAlignment(Qt.AlignCenter)
        label_widget.setWordWrap(True)
        layout.addWidget(label_widget)

        self.setLayout(layout)


class StatsWindowQt(QDialog):
    """Statistics window showing usage metrics."""

    def __init__(self, parent, transcription_history: TranscriptionHistory):
        super().__init__(parent)
        self.transcription_history = transcription_history

        self._setup_window()
        self._create_ui()
        self._load_stats()

    def _setup_window(self):
        """Setup window properties."""
        self.setWindowTitle("📊 Statistiques")
        self.setMinimumSize(800, 600)
        self.setModal(False)

    def _create_ui(self):
        """Create UI components."""
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)

        # Title
        title = QLabel("Statistiques d'Utilisation")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # Stats grid
        self.stats_grid = QGridLayout()
        self.stats_grid.setSpacing(16)
        layout.addLayout(self.stats_grid)

        # Spacer
        layout.addStretch()

        # Buttons
        buttons_layout = QHBoxLayout()
        buttons_layout.addStretch()

        refresh_btn = QPushButton("🔄 Actualiser")
        refresh_btn.setObjectName("secondaryButton")
        refresh_btn.clicked.connect(self._load_stats)
        buttons_layout.addWidget(refresh_btn)

        close_btn = QPushButton("Fermer")
        close_btn.clicked.connect(self.close)
        buttons_layout.addWidget(close_btn)

        layout.addLayout(buttons_layout)
        self.setLayout(layout)

    def _load_stats(self):
        """Load and display statistics."""
        try:
            # Clear existing stats
            for i in reversed(range(self.stats_grid.count())):
                widget = self.stats_grid.itemAt(i).widget()
                if widget:
                    widget.setParent(None)

            # Get all entries
            entries = self.transcription_history.get_all_entries()

            if not entries:
                no_data = QLabel("Aucune donnée disponible")
                no_data.setObjectName("hint")
                no_data.setAlignment(Qt.AlignCenter)
                self.stats_grid.addWidget(no_data, 0, 0, 1, 3)
                return

            # Calculate stats
            total_transcriptions = len(entries)
            total_duration = sum(e.get("duration", 0.0) for e in entries)
            total_words = sum(len(e["formatted_text"].split()) for e in entries)

            # Today's stats
            today = datetime.now().date()
            today_entries = [
                e for e in entries
                if datetime.fromisoformat(e["timestamp"]).date() == today
            ]
            today_count = len(today_entries)
            today_duration = sum(e.get("duration", 0.0) for e in today_entries)

            # This week's stats
            week_start = datetime.now() - timedelta(days=7)
            week_entries = [
                e for e in entries
                if datetime.fromisoformat(e["timestamp"]) >= week_start
            ]
            week_count = len(week_entries)

            # Language distribution
            languages = {}
            for entry in entries:
                lang = entry.get("language", "unknown")
                languages[lang] = languages.get(lang, 0) + 1
            most_used_lang = max(languages.items(), key=lambda x: x[1])[0] if languages else "N/A"

            # Create stat cards
            row, col = 0, 0
            cards = [
                ("📝", str(total_transcriptions), "Transcriptions Totales"),
                ("⏱️", f"{total_duration:.1f}s", "Temps Total"),
                ("📖", str(total_words), "Mots Transcrits"),
                ("📅", str(today_count), "Aujourd'hui"),
                ("⏰", f"{today_duration:.1f}s", "Durée Aujourd'hui"),
                ("📆", str(week_count), "Cette Semaine"),
                ("🌍", most_used_lang.upper(), "Langue Principale"),
                ("💾", f"{len(languages)}", "Langues Utilisées"),
            ]

            for icon, value, label in cards:
                card = StatCard(icon, value, label)
                self.stats_grid.addWidget(card, row, col)
                col += 1
                if col >= 4:
                    col = 0
                    row += 1

        except Exception as e:
            logger.error(f"Failed to load stats: {e}")
            error_label = QLabel(f"Erreur lors du chargement des statistiques:\n{str(e)}")
            error_label.setObjectName("hint")
            error_label.setAlignment(Qt.AlignCenter)
            self.stats_grid.addWidget(error_label, 0, 0, 1, 3)
