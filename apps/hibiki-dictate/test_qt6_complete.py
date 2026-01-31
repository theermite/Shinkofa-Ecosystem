"""Complete Qt6 UI Test - All windows and features.

Tests all Qt6 windows to validate the migration is complete.
"""
import sys
from pathlib import Path

from PySide6.QtWidgets import QApplication, QMainWindow, QPushButton, QVBoxLayout, QWidget, QLabel
from PySide6.QtCore import Qt

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.models.config import AppSettings
from src.utils.transcription_history import TranscriptionHistory
from src.utils.custom_dictionary import CustomDictionary
from src.ui.settings_window_qt import SettingsWindowQt
from src.ui.history_window_qt import HistoryWindowQt
from src.ui.dictionary_window_qt import DictionaryWindowQt
from src.ui.stats_window_qt import StatsWindowQt
from src.ui.logs_window_qt import LogsWindowQt
from src.ui.overlay_window_qt import OverlayWindowQt
from src.ui.system_tray_qt import SystemTrayQt
from src.ui.theme_qt import Qt6Theme


class Qt6TestWindow(QMainWindow):
    """Test window to launch all Qt6 dialogs."""

    def __init__(self, config: AppSettings):
        super().__init__()
        self.config = config

        # Setup history and dictionary
        history_db = Path(config.config_file).parent / "transcription_history.db"
        self.transcription_history = TranscriptionHistory(str(history_db), max_entries=100)

        dictionary_file = Path(config.config_file).parent / "custom_dictionary.json"
        self.custom_dictionary = CustomDictionary(str(dictionary_file))

        self.overlay = None
        self.system_tray = None

        self._setup_window()
        self._create_ui()
        self._apply_theme()

    def _setup_window(self):
        """Setup window properties."""
        self.setWindowTitle("Qt6 UI Test - All Windows")
        self.setGeometry(100, 100, 600, 700)

    def _create_ui(self):
        """Create UI components."""
        central = QWidget()
        self.setCentralWidget(central)

        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(12)

        # Title
        title = QLabel("Qt6 UI Test Suite")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # Info
        info = QLabel("Test all Qt6 windows and features")
        info.setObjectName("hint")
        info.setAlignment(Qt.AlignCenter)
        layout.addWidget(info)

        # Buttons for each window
        buttons = [
            ("⚙️ Settings Window", self._test_settings),
            ("📜 History Window", self._test_history),
            ("📚 Dictionary Window", self._test_dictionary),
            ("📊 Stats Window", self._test_stats),
            ("📋 Logs Window", self._test_logs),
            ("👁️ Overlay Window (Toggle)", self._test_overlay),
            ("🔔 System Tray (Toggle)", self._test_tray),
            ("🎨 Toggle Theme", self._toggle_theme),
        ]

        for text, callback in buttons:
            btn = QPushButton(text)
            btn.clicked.connect(callback)
            layout.addWidget(btn)

        layout.addStretch()

        # Status
        self.status_label = QLabel("Ready to test")
        self.status_label.setObjectName("hint")
        self.status_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.status_label)

        central.setLayout(layout)

    def _apply_theme(self):
        """Apply QSS theme."""
        qss = Qt6Theme.get_stylesheet(self.config.theme_mode)
        self.setStyleSheet(qss)

    def _test_settings(self):
        """Test settings window."""
        self.status_label.setText("Opening Settings Window...")
        dialog = SettingsWindowQt(self, self.config)
        dialog.exec()
        self.status_label.setText("Settings window closed")

    def _test_history(self):
        """Test history window."""
        self.status_label.setText("Opening History Window...")
        dialog = HistoryWindowQt(self, self.transcription_history)
        dialog.show()
        self.status_label.setText("History window opened (non-modal)")

    def _test_dictionary(self):
        """Test dictionary window."""
        self.status_label.setText("Opening Dictionary Window...")
        dialog = DictionaryWindowQt(self, self.custom_dictionary)
        dialog.show()
        self.status_label.setText("Dictionary window opened (non-modal)")

    def _test_stats(self):
        """Test stats window."""
        self.status_label.setText("Opening Stats Window...")
        dialog = StatsWindowQt(self, self.transcription_history)
        dialog.show()
        self.status_label.setText("Stats window opened (non-modal)")

    def _test_logs(self):
        """Test logs window."""
        self.status_label.setText("Opening Logs Window...")
        dialog = LogsWindowQt(self)
        dialog.show()
        self.status_label.setText("Logs window opened (non-modal)")

    def _test_overlay(self):
        """Test overlay window."""
        if self.overlay:
            self.overlay.close()
            self.overlay = None
            self.status_label.setText("Overlay closed")
        else:
            self.overlay = OverlayWindowQt()
            self.overlay.update_status("🎤 Test Overlay", "#10B981")
            self.overlay.update_segments(3)
            self.overlay.show()
            self.status_label.setText("Overlay shown (draggable, always-on-top)")

    def _test_tray(self):
        """Test system tray."""
        if self.system_tray:
            self.system_tray.hide()
            self.system_tray = None
            self.status_label.setText("System tray hidden")
        else:
            icon_path = Path(__file__).parent / "assets" / "icon.png"
            self.system_tray = SystemTrayQt(
                parent=self,
                on_show=lambda: self.status_label.setText("Show clicked from tray!"),
                on_quit=self.close,
                icon_path=icon_path if icon_path.exists() else None
            )
            self.system_tray.show_message(
                "Qt6 Test",
                "System tray test notification",
                duration=3000
            )
            self.status_label.setText("System tray shown (check taskbar)")

    def _toggle_theme(self):
        """Toggle theme."""
        new_mode = "light" if self.config.theme_mode == "dark" else "dark"
        self.config.theme_mode = new_mode
        self._apply_theme()
        self.status_label.setText(f"Theme switched to: {new_mode}")


def main():
    """Run Qt6 test suite."""
    print("=" * 60)
    print("🧪 Qt6 UI Test Suite")
    print("=" * 60)
    print()

    # Load config
    config = AppSettings.load()
    print(f"✅ Config loaded: {config.config_file}")

    # Create application
    app = QApplication(sys.argv)
    app.setApplicationName("Qt6 UI Test")

    # Create test window
    window = Qt6TestWindow(config)
    window.show()

    print()
    print("Test window opened. Use buttons to test each Qt6 window.")
    print()

    # Run
    sys.exit(app.exec())


if __name__ == "__main__":
    main()
