"""
Audio Feedback System.
Provides audio cues for recording events (start, stop, success).

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import platform
from enum import Enum
from typing import Optional
from loguru import logger


class FeedbackSound(Enum):
    """Audio feedback sound types."""
    START = "start"
    STOP = "stop"
    SUCCESS = "success"


class AudioFeedback:
    """
    Audio feedback manager for recording events.
    Uses native system sounds (zero dependencies).
    """

    def __init__(self, enabled: bool = True, volume: float = 0.3):
        """
        Initialize audio feedback manager.

        Args:
            enabled: Whether audio feedback is enabled
            volume: Volume level (0.0 to 1.0) - affects duration/intensity
        """
        self.enabled = enabled
        self.volume = max(0.1, min(1.0, volume))  # Clamp between 0.1 and 1.0
        self.platform = platform.system()

        # Import platform-specific modules
        if self.platform == "Windows":
            try:
                import winsound
                self.winsound = winsound
                self._play_method = self._play_windows
                logger.info("🔊 Audio feedback initialized (Windows native)")
            except ImportError:
                logger.warning("winsound not available on Windows")
                self.enabled = False
                self._play_method = self._play_dummy
        elif self.platform == "Linux":
            try:
                import subprocess
                self.subprocess = subprocess
                self._play_method = self._play_linux
                logger.info("🔊 Audio feedback initialized (Linux paplay)")
            except ImportError:
                logger.warning("subprocess not available on Linux")
                self.enabled = False
                self._play_method = self._play_dummy
        else:
            logger.warning(f"Audio feedback not supported on platform: {self.platform}")
            self.enabled = False
            self._play_method = self._play_dummy

    def play(self, sound_type: FeedbackSound):
        """
        Play feedback sound.

        Args:
            sound_type: Type of feedback sound to play
        """
        if not self.enabled:
            return

        try:
            self._play_method(sound_type)
        except Exception as e:
            logger.warning(f"Failed to play audio feedback: {e}")

    def _play_windows(self, sound_type: FeedbackSound):
        """
        Play sound on Windows using winsound (native).

        Args:
            sound_type: Type of feedback sound to play
        """
        # Soft beep tones with volume-adjusted duration
        base_duration = 80  # Base duration in ms
        duration = int(base_duration * self.volume)  # Scale duration by volume

        sound_map = {
            FeedbackSound.START: (800, duration),     # Low frequency, soft
            FeedbackSound.STOP: (600, duration),      # Lower frequency, distinct
            FeedbackSound.SUCCESS: (1000, duration)   # Higher frequency, positive
        }

        frequency, dur = sound_map.get(sound_type, (750, duration))
        try:
            self.winsound.Beep(frequency, dur)
            logger.debug(f"🔊 Played feedback: {sound_type.value} (vol={self.volume:.1f})")
        except Exception as e:
            # Fallback to MessageBeep if Beep fails
            logger.debug(f"Beep failed, using MessageBeep: {e}")
            self.winsound.MessageBeep(self.winsound.MB_OK)

    def _play_linux(self, sound_type: FeedbackSound):
        """
        Play sound on Linux using paplay (PulseAudio).

        Args:
            sound_type: Type of feedback sound to play
        """
        # Linux system sounds (freedesktop sound theme)
        sound_map = {
            FeedbackSound.START: "message-new-instant",
            FeedbackSound.STOP: "dialog-information",
            FeedbackSound.SUCCESS: "complete"
        }

        sound_name = sound_map.get(sound_type, "dialog-information")

        # Try paplay (PulseAudio)
        try:
            self.subprocess.run(
                ["paplay", f"/usr/share/sounds/freedesktop/stereo/{sound_name}.oga"],
                stdout=self.subprocess.DEVNULL,
                stderr=self.subprocess.DEVNULL,
                timeout=1
            )
            logger.debug(f"🔊 Played feedback: {sound_type.value}")
        except Exception as e:
            logger.debug(f"Failed to play Linux sound: {e}")

    def _play_dummy(self, sound_type: FeedbackSound):
        """
        Dummy play method (does nothing).
        Used when audio feedback is disabled or not supported.

        Args:
            sound_type: Type of feedback sound (ignored)
        """
        pass

    def set_enabled(self, enabled: bool):
        """
        Enable or disable audio feedback.

        Args:
            enabled: Whether to enable audio feedback
        """
        self.enabled = enabled
        logger.info(f"🔊 Audio feedback {'enabled' if enabled else 'disabled'}")

    def is_enabled(self) -> bool:
        """
        Check if audio feedback is enabled.

        Returns:
            True if audio feedback is enabled, False otherwise
        """
        return self.enabled


if __name__ == "__main__":
    # Test audio feedback
    from ..utils.logger import setup_logger
    import time

    setup_logger(log_level="INFO")

    print("Testing audio feedback...")
    feedback = AudioFeedback(enabled=True)

    print("\n🔴 Testing START sound...")
    feedback.play(FeedbackSound.START)
    time.sleep(1)

    print("\n⏹️ Testing STOP sound...")
    feedback.play(FeedbackSound.STOP)
    time.sleep(1)

    print("\n✅ Testing SUCCESS sound...")
    feedback.play(FeedbackSound.SUCCESS)
    time.sleep(1)

    print("\nDisabling audio feedback...")
    feedback.set_enabled(False)

    print("Trying to play (should be silent)...")
    feedback.play(FeedbackSound.START)

    print("\n✅ Audio feedback test complete!")
