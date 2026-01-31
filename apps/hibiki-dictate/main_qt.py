"""Entry point for Hibiki Qt6 version.

This launches the Qt6/PySide6 version of Hibiki with modern UI.
Copyright (C) 2025 La Voie Shinkofa
"""
import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from PySide6.QtWidgets import QApplication
from PySide6.QtCore import Qt
from loguru import logger

from src.models.config import AppSettings
from src.ui.hibiki_app_qt import HibikiMainWindow


def setup_logging():
    """Configure logging for Qt6 version."""
    # Remove default handler
    logger.remove()

    # Add console handler with colors
    logger.add(
        sys.stderr,
        format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <level>{message}</level>",
        level="INFO"
    )

    # Add file handler
    log_dir = Path.home() / ".hibiki" / "logs"
    log_dir.mkdir(parents=True, exist_ok=True)
    logger.add(
        log_dir / "hibiki_qt_{time}.log",
        rotation="10 MB",
        retention="7 days",
        level="DEBUG"
    )


def main():
    """Launch Hibiki Qt6 version."""
    setup_logging()

    logger.info("=" * 60)
    logger.info("🎙️  HIBIKI - VOICE DICTATION (Qt6 Version)")
    logger.info("=" * 60)
    logger.info("UI Framework: PySide6 (Qt6)")
    logger.info("Copyright (C) 2025 La Voie Shinkofa")
    logger.info("")

    # Load configuration
    try:
        config = AppSettings.load()
        logger.info(f"✅ Configuration loaded from: {config.config_file}")
    except Exception as e:
        logger.error(f"❌ Failed to load configuration: {e}")
        sys.exit(1)

    # Create Qt application
    app = QApplication(sys.argv)
    app.setApplicationName("Hibiki")
    app.setOrganizationName("La Voie Shinkofa")
    app.setApplicationDisplayName("Hibiki - Dictée Vocale")

    # Enable high DPI scaling
    app.setHighDpiScaleFactorRoundingPolicy(
        Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
    )

    # Create main window
    try:
        window = HibikiMainWindow(config)
        window.show()
        logger.success("✅ Qt6 main window created and shown")
    except Exception as e:
        logger.error(f"❌ Failed to create main window: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

    # Run event loop
    logger.info("Starting Qt6 event loop...")
    exit_code = app.exec()

    logger.info(f"Qt6 application exited with code {exit_code}")
    return exit_code


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        logger.info("Application interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Unhandled exception: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
