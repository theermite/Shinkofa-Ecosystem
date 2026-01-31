"""Logs Window Qt6 - Real-time log viewer.

Copyright (C) 2025 La Voie Shinkofa
"""
from pathlib import Path

from PySide6.QtWidgets import (
    QDialog, QVBoxLayout, QHBoxLayout, QTextEdit,
    QPushButton, QLabel, QComboBox, QFileDialog
)
from PySide6.QtCore import Qt, QTimer
from PySide6.QtGui import QTextCursor
from loguru import logger


class LogsWindowQt(QDialog):
    """Logs window with real-time log viewing."""

    # Theme colors for log viewer (always dark-ish for readability)
    LOG_VIEWER_STYLES = {
        'light': """
            QTextEdit {
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 11px;
                background-color: #1F2937;
                color: #E5E7EB;
                border: 1px solid #D1D5DB;
                border-radius: 6px;
                padding: 8px;
            }
        """,
        'dark': """
            QTextEdit {
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 11px;
                background-color: #0F172A;
                color: #E2E8F0;
                border: 1px solid #374151;
                border-radius: 6px;
                padding: 8px;
            }
        """
    }

    def __init__(self, parent, theme_mode: str = "light"):
        super().__init__(parent)
        self.theme_mode = theme_mode

        self._setup_window()
        self._create_ui()
        self._setup_auto_refresh()

    def _setup_window(self):
        """Setup window properties."""
        self.setWindowTitle("📋 Logs")
        self.setMinimumSize(900, 600)
        self.setModal(False)

    def _create_ui(self):
        """Create UI components."""
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Title
        title = QLabel("Logs de l'Application")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # Controls
        controls_layout = QHBoxLayout()

        # Log level filter
        level_label = QLabel("Niveau:")
        controls_layout.addWidget(level_label)

        self.level_combo = QComboBox()
        self.level_combo.addItems(["ALL", "DEBUG", "INFO", "WARNING", "ERROR"])
        self.level_combo.setCurrentText("INFO")
        self.level_combo.currentTextChanged.connect(self._load_logs)
        controls_layout.addWidget(self.level_combo)

        controls_layout.addStretch()

        # Auto-refresh toggle
        self.auto_refresh_check = QPushButton("🔄 Auto-refresh: ON")
        self.auto_refresh_check.setCheckable(True)
        self.auto_refresh_check.setChecked(True)
        self.auto_refresh_check.clicked.connect(self._toggle_auto_refresh)
        controls_layout.addWidget(self.auto_refresh_check)

        layout.addLayout(controls_layout)

        # Log viewer
        self.log_viewer = QTextEdit()
        self.log_viewer.setReadOnly(True)
        self._apply_log_viewer_style()
        layout.addWidget(self.log_viewer)

        # Stats
        self.stats_label = QLabel("")
        self.stats_label.setObjectName("hint")
        self.stats_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.stats_label)

        # Buttons
        buttons_layout = QHBoxLayout()

        export_btn = QPushButton("💾 Exporter")
        export_btn.setObjectName("secondaryButton")
        export_btn.clicked.connect(self._export_logs)
        buttons_layout.addWidget(export_btn)

        clear_btn = QPushButton("🗑️ Effacer")
        clear_btn.setObjectName("secondaryButton")
        clear_btn.clicked.connect(self._clear_logs)
        buttons_layout.addWidget(clear_btn)

        buttons_layout.addStretch()

        close_btn = QPushButton("Fermer")
        close_btn.clicked.connect(self.close)
        buttons_layout.addWidget(close_btn)

        layout.addLayout(buttons_layout)
        self.setLayout(layout)

        # Load initial logs
        self._load_logs()

    def _setup_auto_refresh(self):
        """Setup auto-refresh timer."""
        self.refresh_timer = QTimer()
        self.refresh_timer.timeout.connect(self._load_logs)
        self.refresh_timer.start(2000)  # Refresh every 2 seconds

    def _toggle_auto_refresh(self, checked: bool):
        """Toggle auto-refresh."""
        if checked:
            self.refresh_timer.start(2000)
            self.auto_refresh_check.setText("🔄 Auto-refresh: ON")
        else:
            self.refresh_timer.stop()
            self.auto_refresh_check.setText("⏸️ Auto-refresh: OFF")

    def _load_logs(self):
        """Load logs from file."""
        try:
            # Find latest log file
            log_dir = Path.home() / ".hibiki" / "logs"
            if not log_dir.exists():
                self.log_viewer.setPlainText("Aucun fichier de log trouvé.")
                return

            log_files = sorted(log_dir.glob("hibiki_qt_*.log"), key=lambda p: p.stat().st_mtime, reverse=True)
            if not log_files:
                self.log_viewer.setPlainText("Aucun fichier de log trouvé.")
                return

            latest_log = log_files[0]

            # Read log file
            with open(latest_log, "r", encoding="utf-8") as f:
                lines = f.readlines()

            # Filter by level
            level_filter = self.level_combo.currentText()
            if level_filter != "ALL":
                filtered_lines = [
                    line for line in lines
                    if level_filter in line or "ERROR" in line  # Always show errors
                ]
                lines = filtered_lines

            # Display logs
            log_text = "".join(lines[-500:])  # Last 500 lines
            self.log_viewer.setPlainText(log_text)

            # Scroll to bottom
            cursor = self.log_viewer.textCursor()
            cursor.movePosition(QTextCursor.End)
            self.log_viewer.setTextCursor(cursor)

            # Update stats
            self.stats_label.setText(
                f"📄 {latest_log.name} | 📊 {len(lines)} lignes"
            )

        except Exception as e:
            logger.error(f"Failed to load logs: {e}")
            self.log_viewer.setPlainText(f"Erreur lors du chargement des logs:\n{str(e)}")

    def _export_logs(self):
        """Export current logs to file."""
        try:
            file_path, _ = QFileDialog.getSaveFileName(
                self,
                "Exporter les Logs",
                str(Path.home() / "hibiki_logs.txt"),
                "Text Files (*.txt);;Log Files (*.log)"
            )

            if not file_path:
                return

            # Write current log content
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(self.log_viewer.toPlainText())

            logger.info(f"Logs exported to {file_path}")

        except Exception as e:
            logger.error(f"Failed to export logs: {e}")

    def _clear_logs(self):
        """Clear log viewer."""
        self.log_viewer.clear()
        self.stats_label.setText("Logs effacés (fichier non supprimé)")

    def _apply_log_viewer_style(self):
        """Apply log viewer style based on current theme."""
        style = self.LOG_VIEWER_STYLES.get(self.theme_mode, self.LOG_VIEWER_STYLES['light'])
        self.log_viewer.setStyleSheet(style)

    def set_theme(self, mode: str):
        """Set theme mode and reapply styles.

        Args:
            mode: 'light' or 'dark'
        """
        self.theme_mode = mode
        self._apply_log_viewer_style()

    def closeEvent(self, event):
        """Handle window close."""
        self.refresh_timer.stop()
        event.accept()
