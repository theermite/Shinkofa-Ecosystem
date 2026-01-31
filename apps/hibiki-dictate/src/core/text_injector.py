"""
Text injection module for inserting transcribed text into active applications.
Supports clipboard-based injection and direct keyboard typing.
"""

import time
import pyperclip
import keyboard
from typing import Optional
from enum import Enum

from loguru import logger
from ..models.config import TextInjectionMethod, TextInjectionConfig


class InjectionStatus(Enum):
    """Text injection status."""
    SUCCESS = "success"
    FAILED = "failed"
    PARTIAL = "partial"


class TextInjector:
    """
    Injects transcribed text into active applications.
    Supports multiple injection methods with fallback.
    """

    def __init__(self, config: TextInjectionConfig):
        """
        Initialize text injector.

        Args:
            config: Text injection configuration
        """
        self.config = config
        self.injections_count = 0
        self.failures_count = 0
        self.saved_clipboard: Optional[str] = None

        logger.info(
            f"TextInjector initialized: method={config.default_method.value}, "
            f"preserve_clipboard={config.preserve_clipboard}"
        )

    def inject_text(
        self,
        text: str,
        method: Optional[TextInjectionMethod] = None
    ) -> InjectionStatus:
        """
        Inject text into active application.

        Args:
            text: Text to inject
            method: Optional injection method (uses default if None)

        Returns:
            InjectionStatus indicating success/failure
        """
        if not text or not text.strip():
            logger.warning("Attempted to inject empty text")
            return InjectionStatus.FAILED

        # Use specified method or default
        injection_method = method or self.config.default_method

        # Add space before if configured
        if self.config.add_space_before and not text.startswith(' '):
            text = ' ' + text

        logger.info(f"💬 Injecting text ({injection_method.value}): '{text}'")

        try:
            # Try injection method
            if injection_method == TextInjectionMethod.CLIPBOARD:
                status = self._inject_via_clipboard(text)

            elif injection_method == TextInjectionMethod.KEYBOARD:
                status = self._inject_via_keyboard(text)

            elif injection_method == TextInjectionMethod.AUTO:
                # Try clipboard first, fallback to keyboard
                status = self._inject_via_clipboard(text)
                if status == InjectionStatus.FAILED:
                    logger.warning("Clipboard injection failed, trying keyboard...")
                    status = self._inject_via_keyboard(text)

            else:
                logger.error(f"Unknown injection method: {injection_method}")
                status = InjectionStatus.FAILED

            # Update statistics
            if status == InjectionStatus.SUCCESS:
                self.injections_count += 1
            else:
                self.failures_count += 1

            return status

        except Exception as e:
            logger.error(f"Text injection failed: {e}")
            logger.exception(e)
            self.failures_count += 1
            return InjectionStatus.FAILED

    def _inject_via_clipboard(self, text: str) -> InjectionStatus:
        """
        Inject text via clipboard + Ctrl+V.

        Args:
            text: Text to inject

        Returns:
            InjectionStatus
        """
        try:
            # Save current clipboard if configured
            if self.config.preserve_clipboard:
                try:
                    self.saved_clipboard = pyperclip.paste()
                    logger.info(f"📋 Saved current clipboard ({len(self.saved_clipboard) if self.saved_clipboard else 0} chars)")
                except Exception as e:
                    logger.warning(f"Failed to save clipboard: {e}")
                    self.saved_clipboard = None

            # Clear clipboard first to avoid race conditions
            # This ensures old content doesn't interfere
            try:
                pyperclip.copy('')
                time.sleep(0.05)
                logger.debug("📋 Clipboard cleared")
            except Exception as e:
                logger.warning(f"Failed to clear clipboard: {e}")

            # Copy text to clipboard
            pyperclip.copy(text)
            logger.info(f"📋 Text copied to clipboard: '{text}' ({len(text)} chars)")

            # Wait LONGER for clipboard to be fully ready (was 0.05s, now 0.3s)
            # Windows clipboard can be slow to update, especially in some apps
            time.sleep(0.3)

            # Simulate Ctrl+V with proper timing
            logger.info(f"⌨️  Simulating Ctrl+V...")
            keyboard.press('ctrl')
            time.sleep(0.02)
            keyboard.press('v')
            time.sleep(0.05)
            keyboard.release('v')
            time.sleep(0.02)
            keyboard.release('ctrl')
            logger.info(f"⌨️  Ctrl+V sent successfully")

            # Wait LONGER before restoring clipboard (was 0.1s → 1.5s → now 2.5s)
            # This ensures the target application has time to process Ctrl+V
            # Increased to 2.5s for compatibility with slower apps (Obsidian, Word, etc.)
            time.sleep(2.5)

            # Restore clipboard if we saved it
            if self.config.preserve_clipboard and self.saved_clipboard is not None:
                try:
                    pyperclip.copy(self.saved_clipboard)
                    logger.info(f"📋 Clipboard restored")
                except Exception as e:
                    logger.warning(f"Failed to restore clipboard: {e}")

            logger.info(f"✅ Text injected via clipboard: {len(text)} chars")
            return InjectionStatus.SUCCESS

        except Exception as e:
            logger.error(f"Clipboard injection failed: {e}")
            return InjectionStatus.FAILED

    def _inject_via_keyboard(self, text: str) -> InjectionStatus:
        """
        Inject text via direct keyboard simulation.

        Args:
            text: Text to inject

        Returns:
            InjectionStatus
        """
        try:
            # Calculate delay between characters based on typing speed
            # config.typing_speed_cps is characters per second
            char_delay = 1.0 / self.config.typing_speed_cps if self.config.typing_speed_cps > 0 else 0.01

            # Type the text
            keyboard.write(text, delay=char_delay)

            logger.info(f"✅ Text injected via keyboard: {len(text)} chars")
            return InjectionStatus.SUCCESS

        except Exception as e:
            logger.error(f"Keyboard injection failed: {e}")
            return InjectionStatus.FAILED

    def inject_backspace(self, count: int = 1):
        """
        Inject backspace key presses (useful for corrections).

        Args:
            count: Number of backspaces to inject
        """
        try:
            for _ in range(count):
                keyboard.press('backspace')
                keyboard.release('backspace')
                time.sleep(0.01)

            logger.debug(f"Injected {count} backspaces")

        except Exception as e:
            logger.error(f"Backspace injection failed: {e}")

    def inject_newline(self, count: int = 1):
        """
        Inject newline/enter key presses.

        Args:
            count: Number of newlines to inject
        """
        try:
            for _ in range(count):
                keyboard.press('enter')
                keyboard.release('enter')
                time.sleep(0.01)

            logger.debug(f"Injected {count} newlines")

        except Exception as e:
            logger.error(f"Newline injection failed: {e}")

    def test_injection(self) -> bool:
        """
        Test text injection functionality.

        Returns:
            True if injection works, False otherwise
        """
        logger.info("Testing text injection...")
        logger.info("Please focus a text editor and wait 3 seconds...")

        time.sleep(3)

        test_text = "This is a test from Voice Dictation"
        status = self.inject_text(test_text)

        if status == InjectionStatus.SUCCESS:
            logger.success("✅ Text injection test passed!")
            return True
        else:
            logger.error("❌ Text injection test failed!")
            return False

    def get_statistics(self) -> dict:
        """
        Get injection statistics.

        Returns:
            Dictionary with injection stats
        """
        return {
            'injections_count': self.injections_count,
            'failures_count': self.failures_count,
            'success_rate': (
                self.injections_count / (self.injections_count + self.failures_count)
                if (self.injections_count + self.failures_count) > 0
                else 0.0
            ),
            'method': self.config.default_method.value,
            'preserve_clipboard': self.config.preserve_clipboard
        }


if __name__ == "__main__":
    # Test text injector
    from ..utils.logger import setup_logger

    setup_logger(log_level="INFO")

    # Create config
    config = TextInjectionConfig(
        default_method=TextInjectionMethod.CLIPBOARD,
        typing_speed_cps=100,
        preserve_clipboard=True,
        add_space_before=True
    )

    # Create injector
    injector = TextInjector(config)

    # Test injection
    logger.info("\n" + "="*60)
    logger.info("TEXT INJECTION TEST")
    logger.info("="*60)
    logger.info("\nThis will test text injection in 3 seconds.")
    logger.info("Please open a text editor (Notepad, Word, etc.) and focus it.")
    logger.info("\nThe following text will be typed:")
    logger.info("  'This is a test from Voice Dictation'")
    logger.info("\nStarting test in 3 seconds...")

    success = injector.test_injection()

    # Print statistics
    stats = injector.get_statistics()
    logger.info(f"\nInjection Statistics:")
    for key, value in stats.items():
        logger.info(f"  {key}: {value}")

    if success:
        logger.success("\nText injector test completed successfully!")
    else:
        logger.error("\nText injector test failed!")
