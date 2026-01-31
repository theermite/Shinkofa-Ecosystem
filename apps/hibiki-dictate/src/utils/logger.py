"""
Logging utility for Hibiki - Voice Dictation application.
Uses loguru for enhanced logging with rotation and formatting.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import sys
import os
from pathlib import Path
from typing import Optional
from loguru import logger


def setup_logger(
    log_dir: Path = Path("logs"),
    log_level: str = "INFO",
    rotation: str = "10 MB",
    retention: str = "1 week",
    console_output: bool = True
) -> None:
    """
    Configure application logger.

    Args:
        log_dir: Directory to store log files
        log_level: Logging level (DEBUG, INFO, WARNING, ERROR)
        rotation: When to rotate log files (e.g., "10 MB", "1 day")
        retention: How long to keep log files (e.g., "1 week", "30 days")
        console_output: Whether to output logs to console
    """
    # Remove default handler
    logger.remove()

    # Determine appropriate log directory
    # If running as PyInstaller exe, use AppData or exe directory
    if getattr(sys, 'frozen', False):
        # Running as PyInstaller exe
        exe_dir = Path(sys.executable).parent

        # Try to use AppData for logs (better permissions)
        try:
            appdata = Path(os.environ.get('APPDATA', ''))
            if appdata.exists():
                log_dir = appdata / "Hibiki" / "logs"
            else:
                log_dir = exe_dir / "logs"
        except Exception:
            log_dir = exe_dir / "logs"

    # Create logs directory if it doesn't exist
    try:
        log_dir.mkdir(parents=True, exist_ok=True)
    except Exception:
        # Fallback to temp directory if can't create logs
        import tempfile
        log_dir = Path(tempfile.gettempdir()) / "Hibiki" / "logs"
        log_dir.mkdir(parents=True, exist_ok=True)

    # Add console handler if requested AND stderr is available
    # In PyInstaller windowed mode, sys.stderr can be None
    if console_output and sys.stderr is not None:
        try:
            logger.add(
                sys.stderr,
                format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
                       "<level>{level: <8}</level> | "
                       "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
                       "<level>{message}</level>",
                level=log_level,
                colorize=True
            )
        except Exception:
            # Silently ignore if can't add console handler
            pass

    # Add file handler with rotation
    try:
        logger.add(
            log_dir / "hibiki_{time:YYYY-MM-DD}.log",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}",
            level=log_level,
            rotation=rotation,
            retention=retention,
            compression="zip",
            encoding="utf-8"
        )
    except Exception as e:
        # If can't create log file, continue without file logging
        print(f"Warning: Could not create log file: {e}")

    # Add separate error log
    try:
        logger.add(
            log_dir / "errors_{time:YYYY-MM-DD}.log",
            format="{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} | {message}\n{exception}",
            level="ERROR",
            rotation=rotation,
            retention=retention,
            compression="zip",
            encoding="utf-8",
            backtrace=True,
            diagnose=True
        )
    except Exception:
        # Silently ignore if can't create error log
        pass

    logger.info(f"Logger initialized with level: {log_level}")
    logger.info(f"Logs directory: {log_dir.absolute()}")


def get_logger(name: Optional[str] = None):
    """Get a logger instance."""
    if name:
        return logger.bind(name=name)
    return logger
