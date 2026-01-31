"""
Global hotkey manager for Voice Dictation application.
Handles keyboard shortcuts to control dictation (toggle, push-to-talk).
"""

import keyboard
import threading
from typing import Callable, Optional
from enum import Enum

from loguru import logger
from ..models.config import HotkeyConfig


class HotkeyMode(Enum):
    """Hotkey operation modes."""
    TOGGLE = "toggle"           # Press to toggle on/off
    PUSH_TO_TALK = "push_to_talk"  # Hold to record


class HotkeyManager:
    """
    Manages global hotkeys for dictation control.
    Uses keyboard library for system-wide hotkey capture.
    """

    def __init__(self, config: HotkeyConfig):
        """
        Initialize hotkey manager.

        Args:
            config: Hotkey configuration
        """
        self.config = config
        self.toggle_callback: Optional[Callable[[], None]] = None
        self.start_callback: Optional[Callable[[], None]] = None
        self.stop_callback: Optional[Callable[[], None]] = None

        self.is_active = False
        self.is_listening = False
        self.lock = threading.Lock()

        # For push-to-talk manual tracking
        self.push_to_talk_keys = []
        self.keys_pressed = set()
        self.hook_handle = None

        logger.info(
            f"HotkeyManager initialized: mode={config.mode}, "
            f"toggle_key={config.toggle_key}"
        )

    def register_toggle_callback(self, callback: Callable[[], None]):
        """
        Register callback for toggle mode.

        Args:
            callback: Function to call when hotkey is pressed (toggles recording)
        """
        self.toggle_callback = callback
        logger.debug("Toggle callback registered")

    def register_push_to_talk_callbacks(
        self,
        start_callback: Callable[[], None],
        stop_callback: Callable[[], None]
    ):
        """
        Register callbacks for push-to-talk mode.

        Args:
            start_callback: Function to call when key is pressed (start recording)
            stop_callback: Function to call when key is released (stop recording)
        """
        self.start_callback = start_callback
        self.stop_callback = stop_callback
        logger.debug("Push-to-talk callbacks registered")

    def _on_toggle_hotkey(self):
        """Handler for toggle mode hotkey."""
        with self.lock:
            if self.toggle_callback:
                logger.debug("🔥 Toggle hotkey pressed")
                try:
                    self.toggle_callback()
                except Exception as e:
                    logger.error(f"Error in toggle callback: {e}")
                    logger.exception(e)

    def _on_push_to_talk_press(self):
        """Handler for push-to-talk key press (start recording)."""
        with self.lock:
            if not self.is_listening:
                self.is_listening = True
                if self.start_callback:
                    logger.debug("🔥 Push-to-talk pressed (starting)")
                    try:
                        self.start_callback()
                    except Exception as e:
                        logger.error(f"Error in start callback: {e}")
                        logger.exception(e)

    def _on_push_to_talk_release(self):
        """Handler for push-to-talk key release (stop recording)."""
        with self.lock:
            if self.is_listening:
                self.is_listening = False
                if self.stop_callback:
                    logger.debug("🔥 Push-to-talk released (stopping)")
                    try:
                        self.stop_callback()
                    except Exception as e:
                        logger.error(f"Error in stop callback: {e}")
                        logger.exception(e)

    def _push_to_talk_hook(self, event):
        """
        Manual keyboard hook for push-to-talk.
        Tracks key press/release events to detect when all hotkey keys are pressed/released.

        Args:
            event: Keyboard event from keyboard library
        """
        try:
            # Get the key name (normalize to lowercase)
            key_name = event.name.lower() if hasattr(event, 'name') else str(event.scan_code)

            if event.event_type == 'down':
                # Key pressed
                self.keys_pressed.add(key_name)

                # Check if all push-to-talk keys are now pressed
                if all(k in self.keys_pressed for k in self.push_to_talk_keys):
                    if not self.is_listening:
                        self._on_push_to_talk_press()

            elif event.event_type == 'up':
                # Key released
                if key_name in self.keys_pressed:
                    self.keys_pressed.discard(key_name)

                # Check if any of the push-to-talk keys was released
                if any(k not in self.keys_pressed for k in self.push_to_talk_keys):
                    if self.is_listening:
                        self._on_push_to_talk_release()

        except Exception as e:
            logger.error(f"Error in push-to-talk hook: {e}")

        # Return False to not block the event
        return False

    def start(self):
        """Start listening for hotkeys."""
        if self.is_active:
            logger.warning("Hotkey manager already active")
            return

        try:
            if self.config.mode == "toggle":
                # Register toggle hotkey
                keyboard.add_hotkey(
                    self.config.toggle_key,
                    self._on_toggle_hotkey,
                    suppress=False  # Don't suppress the key event
                )
                logger.info(f"⌨️  Toggle hotkey registered: {self.config.toggle_key}")

            elif self.config.mode == "push_to_talk":
                if not self.config.push_to_talk_key:
                    logger.error("Push-to-talk mode requires push_to_talk_key to be set")
                    return

                # Parse the push-to-talk key combination
                # e.g., "ctrl+shift" -> ["ctrl", "shift"]
                self.push_to_talk_keys = [
                    k.strip().lower()
                    for k in self.config.push_to_talk_key.split('+')
                ]

                # Use keyboard hook for manual press/release tracking
                # This is more reliable than trigger_on_release parameter
                self.hook_handle = keyboard.hook(self._push_to_talk_hook, suppress=False)
                logger.info(f"⌨️  Push-to-talk hotkey registered: {self.config.push_to_talk_key} (manual hook)")

            self.is_active = True

        except Exception as e:
            logger.error(f"Failed to start hotkey manager: {e}")
            raise

    def stop(self):
        """Stop listening for hotkeys."""
        if not self.is_active:
            logger.warning("Hotkey manager not active")
            return

        try:
            if self.config.mode == "toggle":
                keyboard.remove_hotkey(self.config.toggle_key)
                logger.info(f"Toggle hotkey unregistered: {self.config.toggle_key}")

            elif self.config.mode == "push_to_talk":
                if self.hook_handle:
                    keyboard.unhook(self.hook_handle)
                    self.hook_handle = None
                    self.keys_pressed.clear()
                    logger.info(f"Push-to-talk hotkey unregistered: {self.config.push_to_talk_key}")

            self.is_active = False

        except Exception as e:
            logger.error(f"Error stopping hotkey manager: {e}")

    def change_hotkey(self, new_hotkey: str):
        """
        Change the toggle hotkey.

        Args:
            new_hotkey: New hotkey string (e.g., "ctrl+shift+v")
        """
        was_active = self.is_active

        # Stop current hotkey
        if was_active:
            self.stop()

        # Update config
        old_hotkey = self.config.toggle_key
        self.config.toggle_key = new_hotkey

        # Restart if it was active
        if was_active:
            try:
                self.start()
                logger.info(f"Hotkey changed: {old_hotkey} → {new_hotkey}")
            except Exception as e:
                logger.error(f"Failed to register new hotkey: {e}")
                # Try to restore old hotkey
                self.config.toggle_key = old_hotkey
                self.start()
                raise

    def is_hotkey_valid(self, hotkey: str) -> bool:
        """
        Check if a hotkey string is valid.

        Args:
            hotkey: Hotkey string to validate

        Returns:
            True if valid, False otherwise
        """
        try:
            # Try to parse the hotkey
            keyboard.parse_hotkey(hotkey)
            return True
        except Exception:
            return False

    def list_pressed_keys(self) -> list:
        """
        Get list of currently pressed keys.
        Useful for hotkey configuration UI.

        Returns:
            List of currently pressed key names
        """
        return list(keyboard._pressed_events.keys())


if __name__ == "__main__":
    # Test hotkey manager
    from ..utils.logger import setup_logger
    import time

    setup_logger(log_level="INFO")

    logger.info("\n" + "="*60)
    logger.info("HOTKEY MANAGER TEST")
    logger.info("="*60)

    # Test toggle mode
    logger.info("\n1. Testing TOGGLE mode...")
    logger.info("   Hotkey: Ctrl+Shift+V")
    logger.info("   Press Ctrl+Shift+V to toggle")
    logger.info("   Test will run for 10 seconds\n")

    toggle_count = 0

    def on_toggle():
        global toggle_count
        toggle_count += 1
        logger.info(f"🔔 Toggle triggered! (count: {toggle_count})")

    config = HotkeyConfig(
        toggle_key="ctrl+shift+v",
        mode="toggle"
    )

    manager = HotkeyManager(config)
    manager.register_toggle_callback(on_toggle)
    manager.start()

    logger.info("Hotkey manager started. Press Ctrl+Shift+V to test...")

    try:
        time.sleep(10)
    except KeyboardInterrupt:
        pass

    manager.stop()

    logger.info(f"\nToggle test completed. Total toggles: {toggle_count}")

    # Test hotkey validation
    logger.info("\n2. Testing hotkey validation...")
    test_hotkeys = [
        "ctrl+shift+v",
        "alt+space",
        "f12",
        "invalid+key+combo",
        "ctrl+alt+delete",
        "win+d"
    ]

    for hk in test_hotkeys:
        is_valid = manager.is_hotkey_valid(hk)
        status = "✅ Valid" if is_valid else "❌ Invalid"
        logger.info(f"  {hk}: {status}")

    logger.success("\nHotkey manager test completed!")
