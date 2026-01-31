"""Overlay Window Qt6 - Always-on-top status display.

Copyright (C) 2025 La Voie Shinkofa
"""
from PySide6.QtWidgets import QWidget, QVBoxLayout, QLabel
from PySide6.QtCore import Qt
from PySide6.QtGui import QPalette, QColor


class OverlayWindowQt(QWidget):
    """Always-on-top overlay window showing transcription status."""

    # Theme colors
    COLORS = {
        'light': {
            'bg': 'rgba(249, 250, 251, 0.95)',
            'text': '#111827',
            'border': '#E5E7EB',
        },
        'dark': {
            'bg': 'rgba(31, 41, 55, 0.95)',
            'text': '#F9FAFB',
            'border': '#374151',
        }
    }

    def __init__(self, theme_mode: str = "light"):
        super().__init__()
        self.theme_mode = theme_mode
        self._setup_window()
        self._create_ui()

    def _setup_window(self):
        """Setup window properties."""
        # Window flags for always-on-top, frameless
        self.setWindowFlags(
            Qt.WindowStaysOnTopHint |
            Qt.FramelessWindowHint |
            Qt.Tool
        )

        # Transparent background
        self.setAttribute(Qt.WA_TranslucentBackground)

        # Size and position (top-right corner)
        self.setFixedSize(300, 100)
        self._position_top_right()

    def _position_top_right(self):
        """Position window at top-right corner."""
        from PySide6.QtWidgets import QApplication
        screen = QApplication.primaryScreen().geometry()
        self.move(screen.width() - self.width() - 20, 20)

    def _create_ui(self):
        """Create UI components."""
        layout = QVBoxLayout()
        layout.setContentsMargins(16, 16, 16, 16)
        layout.setSpacing(8)

        # Status label
        self.status_label = QLabel("Hibiki")
        self.status_label.setAlignment(Qt.AlignCenter)
        layout.addWidget(self.status_label)

        # Info label
        self.info_label = QLabel("")
        self.info_label.setAlignment(Qt.AlignCenter)
        self.info_label.hide()
        layout.addWidget(self.info_label)

        self.setLayout(layout)

        # Apply initial theme
        self._apply_theme()

    def _get_base_style(self) -> str:
        """Get base style for labels based on current theme."""
        c = self.COLORS[self.theme_mode]
        return f"""
            QLabel {{
                font-size: 16px;
                font-weight: bold;
                color: {c['text']};
                background-color: {c['bg']};
                border: 1px solid {c['border']};
                border-radius: 8px;
                padding: 12px;
            }}
        """

    def _get_info_style(self) -> str:
        """Get info label style based on current theme."""
        c = self.COLORS[self.theme_mode]
        return f"""
            QLabel {{
                font-size: 12px;
                color: {c['text']};
                background-color: {c['bg']};
                border: 1px solid {c['border']};
                border-radius: 8px;
                padding: 8px;
            }}
        """

    def _apply_theme(self):
        """Apply current theme to all widgets."""
        self.status_label.setStyleSheet(self._get_base_style())
        self.info_label.setStyleSheet(self._get_info_style())

    def set_theme(self, mode: str):
        """Set theme mode and reapply styles.

        Args:
            mode: 'light' or 'dark'
        """
        self.theme_mode = mode
        self._apply_theme()

    def update_status(self, text: str, color: str = "#10B981"):
        """Update status text and color.

        Args:
            text: Status text
            color: Background color (hex) - used for active states
        """
        self.status_label.setText(text)
        # Use provided color as background for active states
        self.status_label.setStyleSheet(f"""
            QLabel {{
                font-size: 16px;
                font-weight: bold;
                color: #FFFFFF;
                background-color: {color};
                border: none;
                border-radius: 8px;
                padding: 12px;
            }}
        """)
        self.show()

    def update_segments(self, count: int):
        """Update segment count.

        Args:
            count: Number of segments detected
        """
        if count > 0:
            self.info_label.setText(f"Segments: {count}")
            self.info_label.show()
        else:
            self.info_label.hide()

    def reset(self):
        """Reset overlay to idle state."""
        self.status_label.setText("Hibiki")
        self._apply_theme()  # Restore theme-based styling
        self.info_label.hide()

    def mousePressEvent(self, event):
        """Handle mouse press (for dragging)."""
        if event.button() == Qt.LeftButton:
            self.drag_position = event.globalPosition().toPoint() - self.frameGeometry().topLeft()
            event.accept()

    def mouseMoveEvent(self, event):
        """Handle mouse move (for dragging)."""
        if event.buttons() == Qt.LeftButton:
            self.move(event.globalPosition().toPoint() - self.drag_position)
            event.accept()
