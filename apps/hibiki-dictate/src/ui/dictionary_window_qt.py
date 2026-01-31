"""Dictionary Window Qt6 - Custom dictionary editor.

Copyright (C) 2025 La Voie Shinkofa
"""
from typing import Optional

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QTableWidget, QTableWidgetItem,
    QPushButton, QLabel, QLineEdit, QHeaderView, QMessageBox
)
from PySide6.QtCore import Qt
from loguru import logger

from ..utils.custom_dictionary import CustomDictionary


class DictionaryWindowQt(QDialog):
    """Dictionary window for managing custom word replacements."""

    def __init__(self, parent, custom_dictionary: CustomDictionary):
        super().__init__(parent)
        self.custom_dictionary = custom_dictionary

        self._setup_window()
        self._create_ui()
        self._load_dictionary()

    def _setup_window(self):
        """Setup window properties."""
        self.setWindowTitle("📚 Dictionnaire Personnalisé")
        self.setMinimumSize(700, 500)
        self.setModal(False)

    def _create_ui(self):
        """Create UI components."""
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Title
        title = QLabel("Dictionnaire Personnalisé")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # Info
        info = QLabel(
            "Ajoutez des corrections automatiques pour les mots mal transcrits.\n"
            "Exemple: 'ai bique' → 'Hibiki'"
        )
        info.setObjectName("hint")
        info.setAlignment(Qt.AlignCenter)
        info.setWordWrap(True)
        layout.addWidget(info)

        # Add entry section
        add_layout = QHBoxLayout()

        add_label = QLabel("➕ Ajouter:")
        add_layout.addWidget(add_label)

        self.from_input = QLineEdit()
        self.from_input.setPlaceholderText("Mot incorrect (ex: ai bique)")
        add_layout.addWidget(self.from_input)

        arrow = QLabel("→")
        add_layout.addWidget(arrow)

        self.to_input = QLineEdit()
        self.to_input.setPlaceholderText("Correction (ex: Hibiki)")
        add_layout.addWidget(self.to_input)

        add_btn = QPushButton("Ajouter")
        add_btn.clicked.connect(self._add_entry)
        add_layout.addWidget(add_btn)

        layout.addLayout(add_layout)

        # Table
        self.table = QTableWidget()
        self.table.setColumnCount(3)
        self.table.setHorizontalHeaderLabels(["Mot Incorrect", "Correction", "Actions"])
        self.table.horizontalHeader().setSectionResizeMode(0, QHeaderView.Stretch)
        self.table.horizontalHeader().setSectionResizeMode(1, QHeaderView.Stretch)
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
        buttons_layout.addStretch()

        close_btn = QPushButton("Fermer")
        close_btn.clicked.connect(self.close)
        buttons_layout.addWidget(close_btn)

        layout.addLayout(buttons_layout)
        self.setLayout(layout)

    def _load_dictionary(self):
        """Load dictionary entries into table."""
        self.table.setRowCount(0)

        try:
            entries = self.custom_dictionary.get_all_entries()

            for from_text, to_text in entries.items():
                row = self.table.rowCount()
                self.table.insertRow(row)

                # From text
                self.table.setItem(row, 0, QTableWidgetItem(from_text))

                # To text
                self.table.setItem(row, 1, QTableWidgetItem(to_text))

                # Delete button
                delete_btn = QPushButton("🗑️ Supprimer")
                delete_btn.setObjectName("secondaryButton")
                delete_btn.clicked.connect(lambda checked, f=from_text: self._delete_entry(f))
                self.table.setCellWidget(row, 2, delete_btn)

            # Update stats
            self.stats_label.setText(f"📊 {len(entries)} entrées dans le dictionnaire")

        except Exception as e:
            logger.error(f"Failed to load dictionary: {e}")

    def _add_entry(self):
        """Add new dictionary entry."""
        from_text = self.from_input.text().strip()
        to_text = self.to_input.text().strip()

        if not from_text or not to_text:
            QMessageBox.warning(
                self,
                "Champs Requis",
                "Veuillez remplir les deux champs."
            )
            return

        try:
            self.custom_dictionary.add_entry(from_text, to_text)
            self._load_dictionary()

            # Clear inputs
            self.from_input.clear()
            self.to_input.clear()

            logger.info(f"Dictionary entry added: '{from_text}' → '{to_text}'")

        except Exception as e:
            logger.error(f"Failed to add dictionary entry: {e}")
            QMessageBox.critical(
                self,
                "Erreur",
                f"Impossible d'ajouter l'entrée:\n{str(e)}"
            )

    def _delete_entry(self, from_text: str):
        """Delete dictionary entry."""
        reply = QMessageBox.question(
            self,
            "Confirmation",
            f"Supprimer l'entrée:\n'{from_text}' ?\n\nCette action est irréversible.",
            QMessageBox.Yes | QMessageBox.No,
            QMessageBox.No
        )

        if reply == QMessageBox.Yes:
            try:
                self.custom_dictionary.remove_entry(from_text)
                self._load_dictionary()
                logger.info(f"Dictionary entry deleted: '{from_text}'")
            except Exception as e:
                logger.error(f"Failed to delete dictionary entry: {e}")
                QMessageBox.critical(
                    self,
                    "Erreur",
                    f"Impossible de supprimer l'entrée:\n{str(e)}"
                )
