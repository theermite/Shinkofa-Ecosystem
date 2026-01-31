"""
Hibiki - Voice Dictation Application
Main entry point.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import sys
from pathlib import Path

# Add src directory to path
src_dir = Path(__file__).parent
sys.path.insert(0, str(src_dir.parent))

# Load environment variables from .env file
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass  # python-dotenv not installed, skip

from src.utils.logger import setup_logger
from src.models.config import AppSettings
from src.ui.hibiki_app import HibikiApp

from loguru import logger


def main():
    """Main application entry point."""

    # Print banner
    print("="*60)
    print("  🎙️ HIBIKI - Dictée Vocale")
    print("  La Voie Shinkofa")
    print("="*60)
    print()

    # Load or create configuration
    config_path = Path("config/hibiki_preferences.json")

    if config_path.exists():
        logger.info(f"Loading configuration from {config_path}")
        config = AppSettings.load(config_path)
    else:
        logger.info("Creating default configuration")
        config = AppSettings()
        config.save()

    # Fix legacy config values
    if config.text_injection.add_space_before:
        config.text_injection.add_space_before = False
        logger.info("🔧 Fixed legacy config: add_space_before → False")
        config.save()  # Save corrected config

    # Setup logging
    setup_logger(
        log_dir=config.logs_dir,
        log_level=config.log_level,
        console_output=True
    )

    logger.info("Hibiki Application Starting...")
    logger.info(f"Model: {config.whisperx.model.value}")
    logger.info(f"Device: {config.whisperx.device}")
    logger.info(f"Language: {config.whisperx.language}")
    logger.info(f"Hotkey: {config.hotkey.toggle_key}")
    logger.info("")

    # Create and run application
    try:
        app = HibikiApp(config)
        app.run()
    except KeyboardInterrupt:
        logger.info("\nApplication interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Application error: {e}")
        logger.exception(e)
        sys.exit(1)


if __name__ == "__main__":
    main()
