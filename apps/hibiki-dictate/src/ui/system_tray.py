"""
System tray integration for Hibiki.
Allows minimizing to tray instead of closing.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import threading
from pathlib import Path
from typing import Callable, Optional
from loguru import logger

try:
    from pystray import Icon, Menu, MenuItem
    from PIL import Image, ImageDraw
    PYSTRAY_AVAILABLE = True
except ImportError:
    PYSTRAY_AVAILABLE = False
    logger.warning("pystray not available - system tray will not work")


class SystemTray:
    """
    System tray manager for Hibiki.
    Provides minimize to tray functionality.
    """

    def __init__(
        self,
        on_show: Callable,
        on_quit: Callable,
        icon_path: Optional[Path] = None
    ):
        """
        Initialize system tray.

        Args:
            on_show: Callback when user clicks "Show" in tray
            on_quit: Callback when user clicks "Quit" in tray
            icon_path: Optional path to icon file (PNG/ICO)
        """
        if not PYSTRAY_AVAILABLE:
            raise RuntimeError("pystray module not available")

        self.on_show = on_show
        self.on_quit = on_quit
        self.icon_path = icon_path

        self.icon: Optional[Icon] = None
        self.tray_thread: Optional[threading.Thread] = None
        self.is_running = False

    def start(self):
        """Start the system tray icon."""
        if self.is_running:
            logger.warning("System tray already running")
            return

        logger.info("Starting system tray icon...")

        # Load or create icon
        if self.icon_path and self.icon_path.exists():
            icon_image = Image.open(self.icon_path)
        else:
            # Create a simple icon if no icon file provided
            icon_image = self._create_default_icon()

        # Create menu with default action for double-click
        menu = Menu(
            MenuItem("Afficher Hibiki", self._on_show_clicked, default=True),
            MenuItem("Quitter", self._on_quit_clicked)
        )

        # Create icon
        self.icon = Icon(
            "Hibiki",
            icon_image,
            "🎙️ Hibiki - Dictée Vocale",
            menu
        )

        # Run in background thread
        self.is_running = True
        self.tray_thread = threading.Thread(target=self._run_tray, daemon=True)
        self.tray_thread.start()

        logger.success("✅ System tray icon started")

    def stop(self):
        """Stop the system tray icon."""
        if not self.is_running:
            return

        logger.info("Stopping system tray icon...")
        self.is_running = False

        if self.icon:
            self.icon.stop()

        if self.tray_thread:
            self.tray_thread.join(timeout=2.0)

        logger.info("System tray icon stopped")

    def _run_tray(self):
        """Run the tray icon (blocking call in background thread)."""
        try:
            self.icon.run()
        except Exception as e:
            logger.error(f"System tray error: {e}")
            self.is_running = False

    def _on_show_clicked(self):
        """Handle "Show" menu item click."""
        logger.info("System tray: Show clicked")
        if self.on_show:
            self.on_show()

    def _on_quit_clicked(self):
        """Handle "Quit" menu item click."""
        logger.info("System tray: Quit clicked")
        if self.on_quit:
            self.on_quit()

    def _create_default_icon(self) -> Image.Image:
        """Create a default icon image."""
        # Create a simple 64x64 microphone icon
        size = 64
        img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
        draw = ImageDraw.Draw(img)

        # Draw microphone shape
        # Circle (microphone head)
        circle_radius = 12
        circle_center = (size // 2, size // 3)
        draw.ellipse(
            [
                circle_center[0] - circle_radius,
                circle_center[1] - circle_radius,
                circle_center[0] + circle_radius,
                circle_center[1] + circle_radius
            ],
            fill=(224, 143, 52, 255)  # Shinkofa orange
        )

        # Microphone stand
        stand_top = circle_center[1] + circle_radius
        stand_bottom = size - 10
        stand_width = 4
        draw.rectangle(
            [
                size // 2 - stand_width // 2,
                stand_top,
                size // 2 + stand_width // 2,
                stand_bottom
            ],
            fill=(28, 48, 73, 255)  # Shinkofa blue
        )

        # Base
        base_width = 20
        base_height = 4
        draw.rectangle(
            [
                size // 2 - base_width // 2,
                stand_bottom,
                size // 2 + base_width // 2,
                stand_bottom + base_height
            ],
            fill=(28, 48, 73, 255)
        )

        return img


if __name__ == "__main__":
    # Test system tray
    import time

    def on_show():
        print("Show clicked!")

    def on_quit():
        print("Quit clicked!")
        tray.stop()

    if PYSTRAY_AVAILABLE:
        tray = SystemTray(on_show=on_show, on_quit=on_quit)
        tray.start()

        print("System tray running... Click 'Quit' in tray to exit")
        while tray.is_running:
            time.sleep(0.5)
    else:
        print("pystray not available")
