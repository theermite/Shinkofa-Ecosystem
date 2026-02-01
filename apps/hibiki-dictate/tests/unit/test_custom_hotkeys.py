"""
Test script for custom keyboard shortcuts system.

Tests:
1. KeyRecorderDialog - Record custom key combinations
2. Conflict detection with Windows shortcuts
3. Recent hotkeys history
4. Integration with HotkeySettingsWindow

Usage:
    python test_custom_hotkeys.py
"""

import sys
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

import customtkinter as ctk
from loguru import logger

from src.ui.key_recorder_dialog import KeyRecorderDialog, WINDOWS_RESERVED_SHORTCUTS
from src.ui.hotkey_settings_window import HotkeySettingsWindow
from src.models.config import HotkeyConfig

# Configure logger
logger.remove()
logger.add(sys.stdout, level="INFO", format="<green>{time:HH:mm:ss}</green> | <level>{message}</level>")


def test_key_recorder():
    """Test KeyRecorderDialog standalone."""
    logger.info("=" * 60)
    logger.info("TEST 1: KeyRecorderDialog")
    logger.info("=" * 60)

    ctk.set_appearance_mode("light")

    def on_record(hotkey: str):
        logger.success(f"✅ Recorded hotkey: {hotkey}")

        # Check if it's a Windows reserved shortcut
        if hotkey.lower() in WINDOWS_RESERVED_SHORTCUTS:
            conflict = WINDOWS_RESERVED_SHORTCUTS[hotkey.lower()]
            logger.warning(f"⚠️  This shortcut conflicts with Windows: {conflict}")
        else:
            logger.info("✅ No conflict detected")

    app = ctk.CTk()
    app.withdraw()

    dialog = KeyRecorderDialog(app, on_record=on_record)

    logger.info("Press any key combination to test...")
    logger.info("Press Escape to cancel")

    app.mainloop()


def test_hotkey_settings_window():
    """Test HotkeySettingsWindow with recent hotkeys."""
    logger.info("=" * 60)
    logger.info("TEST 2: HotkeySettingsWindow with Custom Recorder")
    logger.info("=" * 60)

    ctk.set_appearance_mode("light")

    # Create a test config with recent hotkeys
    config = HotkeyConfig(
        toggle_key="alt+shift+d",
        push_to_talk_key="ctrl+shift",
        mode="toggle",
        recent_hotkeys=["ctrl+space", "alt+r", "win+f1"]
    )

    def on_save(mode, toggle_key, push_to_talk_key):
        logger.success(f"✅ Settings saved:")
        logger.info(f"   Mode: {mode}")
        logger.info(f"   Toggle key: {toggle_key}")
        logger.info(f"   Push-to-talk key: {push_to_talk_key}")

        # Add to recent
        if mode == "toggle":
            config.add_to_recent(toggle_key)
        else:
            config.add_to_recent(push_to_talk_key)

        logger.info(f"   Recent hotkeys: {config.recent_hotkeys}")

    app = ctk.CTk()
    app.withdraw()

    window = HotkeySettingsWindow(
        app,
        current_toggle_key=config.toggle_key,
        current_push_to_talk_key=config.push_to_talk_key,
        current_mode=config.mode,
        recent_hotkeys=config.recent_hotkeys,
        on_save=on_save
    )

    logger.info("Test the following:")
    logger.info("1. Select a preset hotkey")
    logger.info("2. Click '🎹 Enregistrer un raccourci personnalisé'")
    logger.info("3. Press any key combination")
    logger.info("4. Check recent hotkeys list")
    logger.info("5. Try a Windows reserved shortcut (e.g., Win+D)")

    app.mainloop()


def test_config_recent_hotkeys():
    """Test HotkeyConfig recent hotkeys management."""
    logger.info("=" * 60)
    logger.info("TEST 3: HotkeyConfig Recent Hotkeys")
    logger.info("=" * 60)

    config = HotkeyConfig()

    # Add hotkeys
    test_hotkeys = [
        "ctrl+space",
        "alt+r",
        "win+f1",
        "ctrl+shift+a",
        "alt+shift+x",
        "ctrl+alt+z",  # This should push out the oldest if max is 5
    ]

    for hotkey in test_hotkeys:
        config.add_to_recent(hotkey)
        logger.info(f"Added '{hotkey}' → Recent: {config.recent_hotkeys}")

    # Test duplicate (should move to top)
    logger.info("\nTesting duplicate (should move to top):")
    config.add_to_recent("ctrl+space")
    logger.info(f"Added 'ctrl+space' again → Recent: {config.recent_hotkeys}")

    # Verify max 5
    assert len(config.recent_hotkeys) <= 5, "Recent hotkeys should be limited to 5"
    logger.success("✅ Recent hotkeys limited to 5 correctly")

    # Verify most recent is first
    assert config.recent_hotkeys[0] == "ctrl+space", "Most recent should be first"
    logger.success("✅ Most recent hotkey is first")


def test_windows_conflicts():
    """Test Windows shortcuts conflict detection."""
    logger.info("=" * 60)
    logger.info("TEST 4: Windows Shortcuts Conflict Detection")
    logger.info("=" * 60)

    test_cases = [
        ("win+d", True, "Afficher/masquer le bureau"),
        ("ctrl+space", False, None),
        ("alt+tab", True, "Basculer entre les fenêtres"),
        ("ctrl+shift+a", False, None),
        ("win+l", True, "Verrouiller la session"),
    ]

    for hotkey, should_conflict, expected_desc in test_cases:
        normalized = hotkey.lower().replace("windows", "win")
        is_conflict = normalized in WINDOWS_RESERVED_SHORTCUTS

        if should_conflict:
            if is_conflict:
                desc = WINDOWS_RESERVED_SHORTCUTS[normalized]
                logger.success(f"✅ '{hotkey}' → Conflict detected: {desc}")
                assert desc == expected_desc, f"Description mismatch for {hotkey}"
            else:
                logger.error(f"❌ '{hotkey}' → Expected conflict but none detected")
        else:
            if not is_conflict:
                logger.success(f"✅ '{hotkey}' → No conflict (as expected)")
            else:
                logger.error(f"❌ '{hotkey}' → Unexpected conflict detected")


def main():
    """Run all tests."""
    logger.info("\n" + "=" * 60)
    logger.info("CUSTOM HOTKEYS SYSTEM - TEST SUITE")
    logger.info("=" * 60 + "\n")

    # Test 3: Config recent hotkeys (non-interactive)
    test_config_recent_hotkeys()
    logger.info("\n")

    # Test 4: Windows conflicts (non-interactive)
    test_windows_conflicts()
    logger.info("\n")

    # Interactive tests
    logger.info("Choose a test to run:")
    logger.info("1. Test KeyRecorderDialog (standalone)")
    logger.info("2. Test HotkeySettingsWindow (full integration)")
    logger.info("3. Exit")

    choice = input("\nEnter choice (1-3): ").strip()

    if choice == "1":
        test_key_recorder()
    elif choice == "2":
        test_hotkey_settings_window()
    elif choice == "3":
        logger.info("Exiting...")
    else:
        logger.error("Invalid choice")


if __name__ == "__main__":
    main()
