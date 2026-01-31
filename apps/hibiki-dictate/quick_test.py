"""Quick test of Hibiki UI fixes."""

import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))

from src.models.config import AppSettings
from src.ui.hibiki_app import HibikiApp
from loguru import logger

logger.info("🔧 Testing Hibiki UI fixes...")
logger.info("Fixes applied:")
logger.info("  - EmojiButton click bug fixed")
logger.info("  - Window size increased (500x650)")
logger.info("  - Theme button more visible (44px, with background)")
logger.info("  - Logs button more visible (36px, with background)")
logger.info("  - Stats window smaller (550x600) with better labels")
logger.info("  - Bottom buttons with hover effect")

config_path = Path.home() / ".hibiki" / "config.json"
config = AppSettings.load(config_path)

app = HibikiApp(config)
logger.success("✅ App started - Check UI improvements")

app.mainloop()
