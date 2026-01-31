"""History Window Qt6 - Transcription history viewer.

Copyright (C) 2025 La Voie Shinkofa
"""
from typing import Optional
from pathlib import Path
from datetime import datetime

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QTableWidget, QTableWidgetItem,
    QPushButton, QLabel, QLineEdit, QHeaderView, QFileDialog, QMessageBox
)
from PySide6.QtCore import Qt
from loguru import logger

from ..utils.transcription_history import TranscriptionHistory


class HistoryWindowQt(QDialog):
    """History window with search and export capabilities."""

    def __init__(self, parent, transcription_history: TranscriptionHistory):
        super().__init__(parent)
        self.transcription_history = transcription_history

        self._setup_window()
        self._create_ui()
        self._load_history()

    def _setup_window(self):
        """Setup window properties."""
        self.setWindowTitle("📜 Historique des Transcriptions")
        self.setMinimumSize(900, 600)
        self.setModal(False)

    def _create_ui(self):
        """Create UI components."""
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Title
        title = QLabel("Historique des Transcriptions")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # Search bar
        search_layout = QHBoxLayout()
        search_label = QLabel("🔍 Rechercher:")
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("Rechercher dans les transcriptions...")
        self.search_input.textChanged.connect(self._on_search)
        search_layout.addWidget(search_label)
        search_layout.addWidget(self.search_input)
        layout.addLayout(search_layout)

        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(5)
        self.table.setHorizontalHeaderLabels([
            "Date", "Texte Original", "Texte Formaté", "Langue", "Durée (s)"
        ])
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(2, QHeaderView.Stretch)
        self.table.setSelectionBehavior(QTableWidget.SelectRows)
        self.table.setAlternatingRowColors(True)
        layout.addWidget(self.table)

        # Stats
        self.stats_label = QLabel("")
        self.stats_label.setObjectName("hint")
        self.stats_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.stats_label)

        # Buttons
        buttons_layout = QHBoxLayout()

        export_btn = QPushButton("💾 Exporter")
        export_btn.setObjectName("secondaryButton")
        export_btn.clicked.connect(self._export_history)
        buttons_layout.addWidget(export_btn)

        clear_btn = QPushButton("🗑️ Effacer")
        clear_btn.setObjectName("secondaryButton")
        clear_btn.clicked.connect(self._clear_history)
        buttons_layout.addWidget(clear_btn)

        buttons_layout.addStretch()

        close_btn = QPushButton("Fermer")
        close_btn.clicked.connect(self.close)
        buttons_layout.addWidget(close_btn)

        layout.addLayout(buttons_layout)
        self.setLayout(layout)

    def _load_history(self, search_query: str = ""):
        """Load history entries into table."""
        self.table.setRowCount(0)

        try:
            # Get entries
            if search_query:
                entries = self.transcription_history.search(search_query)
            else:
                entries = self.transcription_history.get_all_entries()

            # Populate table
            for entry in entries:
                row = self.table.rowCount()
                self.table.insertRow(row)

                # Date
                timestamp = datetime.fromisoformat(entry["timestamp"])
                date_str = timestamp.strftime("%Y-%m-%d %H:%M:%S")
                self.table.setItem(row, 0, QTableWidgetItem(date_str))

                # Original text
                self.table.setItem(row, 1, QTableWidgetItem(entry["original_text"]))

                # Formatted text
                self.table.setItem(row, 2, QTableWidgetItem(entry["formatted_text"]))

                # Language
                self.table.setItem(row, 3, QTableWidgetItem(entry.get("language", "fr")))

                # Duration
                duration = entry.get("duration", 0.0)
                self.table.setItem(row, 4, QTableWidgetItem(f"{duration:.2f}"))

            # Update stats
            total = len(entries)
            total_duration = sum(e.get("duration", 0.0) for e in entries)
            self.stats_label.setText(
                f"📊 {total} entrées | ⏱️ Durée totale: {total_duration:.1f}s"
            )

        except Exception as e:
            logger.error(f"Failed to load history: {e}")

    def _on_search(self, query: str):
        """Handle search input."""
        self._load_history(query)

    def _export_history(self):
        """Export history to markdown file."""
        try:
            # File dialog
            file_path, _ = QFileDialog.getSaveFileName(
                self,
                "Exporter l'Historique",
                str(Path.home() / "hibiki_history.md"),
                "Markdown Files (*.md);;Text Files (*.txt)"
            )

            if not file_path:
                return

            # Get all entries
            entries = self.transcription_history.get_all_entries()

            # Write markdown
            with open(file_path, "w", encoding="utf-8") as f:
                f.write("# Hibiki - Historique des Transcriptions\n\n")
                f.write(f"**Date d'export:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                f.write(f"**Total:** {len(entries)} transcriptions\n\n")
                f.write("---\n\n")

                for entry in entries:
                    timestamp = datetime.fromisoformat(entry["timestamp"])
                    f.write(f"## {timestamp.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
                    f.write(f"**Langue:** {entry.get('language', 'fr')}\n\n")
                    f.write(f"**Durée:** {entry.get('duration', 0):.2f}s\n\n")
                    f.write(f"**Texte:**\n\n")
                    f.write(f"{entry['formatted_text']}\n\n")
                    f.write("---\n\n")

            logger.info(f"History exported to {file_path}")
            QMessageBox.information(
                self,
                "Export Réussi",
                f"L'historique a été exporté vers:\n{file_path}"
            )

        except Exception as e:
            logger.error(f"Failed to export history: {e}")
            QMessageBox.critical(
                self,
                "Erreur d'Export",
                f"Impossible d'exporter l'historique:\n{str(e)}"
            )

    def _clear_history(self):
        """Clear all history entries."""
        reply = QMessageBox.question(
            self,
            "Confirmation",
            "Êtes-vous sûr de vouloir effacer tout l'historique?\n\nCette action est irréversible.",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            try:
                self.transcription_history.clear()
                self._load_history()
                logger.info("History cleared")
                QMessageBox.information(
                    self,
                    "Historique Effacé",
                    "L'historique a été effacé avec succès."
                )
            except Exception as e:
                logger.error(f"Failed to clear history: {e}")
                QMessageBox.critical(
                    self,
                    "Erreur",
                    f"Impossible d'effacer l'historique:\n{str(e)}"
                )
