"""
Quick test script to verify Hibiki app starts without errors.
Tests the new UI layout with all components.
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent))

from src.models.config import AppSettings
from src.ui.hibiki_app import HibikiApp
from loguru import logger


def test_app():
    """Test that app starts and UI loads correctly."""
    logger.info("🧪 Testing Hibiki app with new UI...")

    # Load or create default config
    config_path = Path.home() / ".hibiki" / "config.json"
    config = AppSettings.load(config_path)

    # Create app
    app = HibikiApp(config)

    logger.info("✅ App created successfully")
    logger.info("Testing new UI elements:")
    logger.info("  - Corner buttons (⚙️, ☀️/🌙, 📋)")
    logger.info("  - Language dropdown with flags")
    logger.info("  - Bottom buttons (📜, 📚, 📊)")
    logger.info("")
    logger.info("Manual checks:")
    logger.info("  1. Check corner buttons placement")
    logger.info("  2. Test theme toggle (emoji should change)")
    logger.info("  3. Test language dropdown (flags visible)")
    logger.info("  4. Click 📊 Stats button")
    logger.info("  5. Resize window (corners should stay fixed)")
    logger.info("")
    logger.info("Press Ctrl+C or close window to exit test")

    # Run app
    app.mainloop()


if __name__ == "__main__":
    try:
        test_app()
    except KeyboardInterrupt:
        logger.info("Test interrupted by user")
    except Exception as e:
        logger.error(f"Test failed: {e}")
        raise
