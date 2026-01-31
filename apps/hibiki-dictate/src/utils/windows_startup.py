"""
Windows Startup Management for Hibiki.
Handles adding/removing Hibiki from Windows startup via Registry.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import sys
import os
from pathlib import Path
from typing import Optional
from loguru import logger

# Windows Registry only available on Windows
try:
    import winreg
    WINREG_AVAILABLE = True
except ImportError:
    WINREG_AVAILABLE = False
    logger.warning("winreg not available - Windows startup features disabled")


# Registry key for Windows startup
STARTUP_REGISTRY_KEY = r"Software\Microsoft\Windows\CurrentVersion\Run"
APP_NAME = "Hibiki-Dictate"


def get_executable_path() -> Optional[str]:
    """
    Get the path to the Hibiki executable.

    Returns:
        Path to the executable, or None if not found.
        Works for both:
        - PyInstaller bundled executable (.exe)
        - Python script execution (python main.py)
    """
    try:
        # Check if running as PyInstaller bundle
        if getattr(sys, 'frozen', False):
            # Running as bundled executable
            executable_path = sys.executable
            logger.debug(f"Running as bundled executable: {executable_path}")
            return executable_path
        else:
            # Running as Python script - find main.py
            # Look for main.py in project root
            current_file = Path(__file__).resolve()
            project_root = current_file.parent.parent.parent  # src/utils -> src -> project_root
            main_py = project_root / "main.py"

            if main_py.exists():
                # Return python command with main.py path
                python_exe = sys.executable
                return f'"{python_exe}" "{main_py}"'
            else:
                logger.warning(f"main.py not found at {main_py}")
                return None

    except Exception as e:
        logger.error(f"Error getting executable path: {e}")
        return None


def is_startup_enabled() -> bool:
    """
    Check if Hibiki is set to start with Windows.

    Returns:
        True if startup is enabled, False otherwise.
    """
    if not WINREG_AVAILABLE:
        return False

    try:
        # Open registry key
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            STARTUP_REGISTRY_KEY,
            0,
            winreg.KEY_READ
        )

        try:
            # Try to read our app's value
            value, _ = winreg.QueryValueEx(key, APP_NAME)
            winreg.CloseKey(key)

            # Check if the registered path still exists
            if value:
                logger.debug(f"Startup entry found: {value}")
                return True
            return False

        except FileNotFoundError:
            # Value doesn't exist
            winreg.CloseKey(key)
            return False

    except Exception as e:
        logger.error(f"Error checking startup status: {e}")
        return False


def enable_startup() -> bool:
    """
    Enable Hibiki to start with Windows.
    Adds an entry to the Windows Registry Run key.

    Returns:
        True if successful, False otherwise.
    """
    if not WINREG_AVAILABLE:
        logger.error("Windows Registry not available")
        return False

    try:
        # Get executable path
        exe_path = get_executable_path()
        if not exe_path:
            logger.error("Could not determine executable path")
            return False

        # Open registry key with write access
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            STARTUP_REGISTRY_KEY,
            0,
            winreg.KEY_WRITE
        )

        # Set the value
        winreg.SetValueEx(
            key,
            APP_NAME,
            0,
            winreg.REG_SZ,
            exe_path
        )

        winreg.CloseKey(key)

        logger.success(f"Startup enabled: {exe_path}")
        return True

    except PermissionError:
        logger.error("Permission denied - cannot write to registry")
        return False
    except Exception as e:
        logger.error(f"Error enabling startup: {e}")
        return False


def disable_startup() -> bool:
    """
    Disable Hibiki from starting with Windows.
    Removes the entry from the Windows Registry Run key.

    Returns:
        True if successful, False otherwise.
    """
    if not WINREG_AVAILABLE:
        logger.error("Windows Registry not available")
        return False

    try:
        # Open registry key with write access
        key = winreg.OpenKey(
            winreg.HKEY_CURRENT_USER,
            STARTUP_REGISTRY_KEY,
            0,
            winreg.KEY_WRITE
        )

        try:
            # Delete the value
            winreg.DeleteValue(key, APP_NAME)
            winreg.CloseKey(key)
            logger.success("Startup disabled")
            return True

        except FileNotFoundError:
            # Value doesn't exist - already disabled
            winreg.CloseKey(key)
            logger.info("Startup was already disabled")
            return True

    except PermissionError:
        logger.error("Permission denied - cannot write to registry")
        return False
    except Exception as e:
        logger.error(f"Error disabling startup: {e}")
        return False


def sync_startup_setting(enabled: bool) -> bool:
    """
    Synchronize the startup setting with the Windows Registry.

    Args:
        enabled: True to enable startup, False to disable.

    Returns:
        True if synchronization was successful, False otherwise.
    """
    current_state = is_startup_enabled()

    if enabled == current_state:
        logger.debug(f"Startup already {'enabled' if enabled else 'disabled'}")
        return True

    if enabled:
        return enable_startup()
    else:
        return disable_startup()


def is_available() -> bool:
    """
    Check if Windows startup management is available.

    Returns:
        True if available (Windows with winreg), False otherwise.
    """
    return WINREG_AVAILABLE


if __name__ == "__main__":
    # Test the module
    from ..utils.logger import setup_logger

    setup_logger(log_level="DEBUG")

    print("=" * 60)
    print("WINDOWS STARTUP MODULE TEST")
    print("=" * 60)

    print(f"\nWindows Registry available: {is_available()}")
    print(f"Executable path: {get_executable_path()}")
    print(f"Startup currently enabled: {is_startup_enabled()}")

    # Test enable/disable
    print("\nTesting enable...")
    if enable_startup():
        print(f"  Startup enabled: {is_startup_enabled()}")

    print("\nTesting disable...")
    if disable_startup():
        print(f"  Startup enabled: {is_startup_enabled()}")

    print("\n" + "=" * 60)
    print("TEST COMPLETE")
