"""System Tray Qt6 - Native Qt system tray integration.

Copyright (C) 2025 La Voie Shinkofa
"""
from pathlib import Path
from typing import Callable, Optional

from PySide6.QtWidgets import QSystemTrayIcon, QMenu
from PySide6.QtGui import QIcon, QAction
from PySide6.QtCore import Qt
from loguru import logger


class SystemTrayQt:
    """System tray icon with menu for Qt6."""

    def __init__(
        self,
        parent,
        on_show: Callable,
        on_quit: Callable,
        icon_path: Optional[Path] = None
    ):
        """Initialize system tray.

        Args:
            parent: Parent widget (main window)
            on_show: Callback when "Show" is clicked
            on_quit: Callback when "Quit" is clicked
            icon_path: Path to tray icon image
        """
        self.parent = parent
        self.on_show = on_show
        self.on_quit = on_quit

        # Create system tray icon
        self.tray_icon = QSystemTrayIcon(parent)

        # Set icon
        if icon_path and icon_path.exists():
            self.tray_icon.setIcon(QIcon(str(icon_path)))
        else:
            # Use default icon or create simple one
            from PySide6.QtGui import QPixmap, QPainter, QBrush, QColor
            pixmap = QPixmap(32, 32)
            pixmap.fill(Qt.transparent)
            painter = QPainter(pixmap)
            painter.setBrush(QBrush(QColor("#F59E0B")))
            painter.drawEllipse(4, 4, 24, 24)
            painter.end()
            self.tray_icon.setIcon(QIcon(pixmap))

        # Create menu
        self._create_menu()

        # Connect signals
        self.tray_icon.activated.connect(self._on_activated)

        # Show tray icon
        self.tray_icon.show()
        logger.info("✅ System tray initialized (Qt6)")

    def _create_menu(self):
        """Create tray icon context menu."""
        menu = QMenu()

        # Show action
        show_action = QAction("🎙️ Afficher Hibiki", self.parent)
        show_action.triggered.connect(self.on_show)
        menu.addAction(show_action)

        # Separator
        menu.addSeparator()

        # Quit action
        quit_action = QAction("❌ Quitter", self.parent)
        quit_action.triggered.connect(self.on_quit)
        menu.addAction(quit_action)

        self.tray_icon.setContextMenu(menu)

    def _on_activated(self, reason: QSystemTrayIcon.ActivationReason):
        """Handle tray icon activation.

        Args:
            reason: Activation reason (click, double-click, etc.)
        """
        if reason == QSystemTrayIcon.DoubleClick:
            self.on_show()
        elif reason == QSystemTrayIcon.Trigger:
            # Single click - show menu on some platforms
            pass

    def show_message(self, title: str, message: str, icon=QSystemTrayIcon.Information, duration: int = 3000):
        """Show balloon notification.

        Args:
            title: Notification title
            message: Notification message
            icon: Icon type (Information, Warning, Critical)
            duration: Display duration in milliseconds
        """
        self.tray_icon.showMessage(title, message, icon, duration)

    def hide(self):
        """Hide tray icon."""
        self.tray_icon.hide()

    def show(self):
        """Show tray icon."""
        self.tray_icon.show()
