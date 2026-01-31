"""
Voice Activity Detection (VAD) processor using Silero VAD.
Detects speech segments in audio stream to optimize transcription.
"""

import numpy as np
import torch
import time
from typing import Optional, List
from dataclasses import dataclass
from enum import Enum

from loguru import logger
from ..models.config import VADConfig
from .audio_capture import AudioChunk


class SpeechState(Enum):
    """Speech detection states."""
    SILENCE = "silence"
    SPEECH = "speech"
    UNKNOWN = "unknown"


@dataclass
class SpeechSegment:
    """Speech segment with audio data and metadata."""
    audio_data: np.ndarray  # Concatenated audio samples
    start_time: float       # Start timestamp
    end_time: float         # End timestamp
    sample_rate: int        # Sample rate
    confidence: float       # Average VAD confidence

    @property
    def duration(self) -> float:
        """Get segment duration in seconds."""
        return self.end_time - self.start_time


class VADProcessor:
    """
    Voice Activity Detection processor using Silero VAD.
    Accumulates speech segments for transcription.
    """

    def __init__(self, config: VADConfig, sample_rate: int = 16000):
        """
        Initialize VAD processor.

        Args:
            config: VAD configuration
            sample_rate: Audio sample rate (must be 8000 or 16000 for Silero)
        """
        self.config = config
        self.sample_rate = sample_rate

        if sample_rate not in [8000, 16000]:
            logger.warning(
                f"Silero VAD works best with 8000 or 16000 Hz. "
                f"Got {sample_rate} Hz - may affect accuracy"
            )

        # Load Silero VAD model
        self.model = None
        self.utils = None
        self._load_model()

        # Speech tracking
        self.current_state = SpeechState.SILENCE
        self.speech_buffer: List[np.ndarray] = []
        self.speech_start_time: Optional[float] = None
        self.speech_confidences: List[float] = []

        # Statistics
        self.chunks_processed = 0
        self.speech_segments_detected = 0
        self.total_speech_duration = 0.0

        logger.info(
            f"VAD Processor initialized: threshold={config.threshold}, "
            f"min_speech={config.min_speech_duration_ms}ms"
        )

    def _load_model(self):
        """Load Silero VAD model from torch hub."""
        try:
            logger.info("Loading Silero VAD model...")
            start_time = time.time()

            # Fix for PyTorch 2.6+ torch.hub issues
            import sys
            import io

            # Backup stdout/stderr in case they are None (can happen in some GUI contexts)
            original_stdout = sys.stdout
            original_stderr = sys.stderr

            if sys.stdout is None:
                sys.stdout = io.StringIO()
            if sys.stderr is None:
                sys.stderr = io.StringIO()

            try:
                # Load model from torch hub
                self.model, self.utils = torch.hub.load(
                    repo_or_dir='snakers4/silero-vad',
                    model='silero_vad',
                    force_reload=False,
                    onnx=False,
                    trust_repo=True
                )
            finally:
                # Restore stdout/stderr
                sys.stdout = original_stdout
                sys.stderr = original_stderr

            # Extract utility functions
            (get_speech_timestamps, save_audio, read_audio,
             VADIterator, collect_chunks) = self.utils

            self.get_speech_timestamps = get_speech_timestamps
            self.VADIterator = VADIterator

            load_time = time.time() - start_time
            logger.info(f"✅ Silero VAD model loaded in {load_time:.2f}s")

        except Exception as e:
            logger.error(f"Failed to load Silero VAD model: {e}")
            raise

    def get_speech_probability(self, audio_chunk: np.ndarray) -> float:
        """
        Get speech probability for audio chunk.
        Handles chunks of any size by processing in 512-sample windows.

        Args:
            audio_chunk: Audio data as numpy array (float32, [-1, 1])

        Returns:
            Speech probability (0.0 to 1.0) - max probability across all windows
        """
        # Silero VAD requires exactly 512 samples at 16kHz (or 256 at 8kHz)
        required_samples = 512 if self.sample_rate == 16000 else 256

        # If chunk is smaller than required, pad it
        if len(audio_chunk) < required_samples:
            audio_chunk = np.pad(audio_chunk, (0, required_samples - len(audio_chunk)))

        # If chunk is exactly the required size, process directly
        if len(audio_chunk) == required_samples:
            audio_tensor = torch.from_numpy(audio_chunk).float()
            with torch.no_grad():
                return self.model(audio_tensor, self.sample_rate).item()

        # For larger chunks, process in windows and return max probability
        # This ensures we don't miss speech in any part of the chunk
        max_prob = 0.0
        for i in range(0, len(audio_chunk) - required_samples + 1, required_samples):
            window = audio_chunk[i:i + required_samples]
            audio_tensor = torch.from_numpy(window).float()
            with torch.no_grad():
                prob = self.model(audio_tensor, self.sample_rate).item()
                max_prob = max(max_prob, prob)

        return max_prob

    def process_chunk(self, chunk: AudioChunk) -> Optional[SpeechSegment]:
        """
        Process audio chunk and detect speech.

        Args:
            chunk: Audio chunk to process

        Returns:
            SpeechSegment if a complete speech segment is detected, None otherwise
        """
        self.chunks_processed += 1

        # Get speech probability
        speech_prob = self.get_speech_probability(chunk.data)
        is_speech = speech_prob >= self.config.threshold

        # Log periodically (every 10 chunks for better debugging)
        if self.chunks_processed % 10 == 0:
            logger.info(
                f"🎤 VAD: {speech_prob:.3f} | Threshold: {self.config.threshold} | "
                f"{'🗣️ SPEECH' if is_speech else '🔇 silence'} | State: {self.current_state.value}"
            )

        # State machine for speech detection
        if is_speech:
            if self.current_state == SpeechState.SILENCE:
                # Speech started
                self._start_speech_segment(chunk, speech_prob)

            elif self.current_state == SpeechState.SPEECH:
                # Continue speech
                self._continue_speech_segment(chunk, speech_prob)

                # Check if segment is too long
                current_duration = chunk.timestamp - self.speech_start_time
                if current_duration >= self.config.max_speech_duration_s:
                    logger.debug(
                        f"Speech segment reached max duration "
                        f"({current_duration:.1f}s), finalizing"
                    )
                    return self._finalize_speech_segment(chunk.timestamp)

        else:  # Silence
            if self.current_state == SpeechState.SPEECH:
                # Potential end of speech
                self._continue_speech_segment(chunk, speech_prob)

                # Check if we've had enough silence
                silence_duration = (chunk.timestamp - self.speech_start_time -
                                   self._get_current_segment_duration())

                if silence_duration * 1000 >= self.config.min_silence_duration_ms:
                    # Speech ended
                    segment = self._finalize_speech_segment(chunk.timestamp)

                    # Check minimum duration
                    if segment.duration * 1000 >= self.config.min_speech_duration_ms:
                        return segment
                    else:
                        logger.debug(
                            f"Speech segment too short ({segment.duration*1000:.0f}ms), "
                            "ignoring"
                        )

        return None

    def _start_speech_segment(self, chunk: AudioChunk, confidence: float):
        """Start accumulating a new speech segment."""
        self.current_state = SpeechState.SPEECH
        self.speech_start_time = chunk.timestamp
        self.speech_buffer = [chunk.data]
        self.speech_confidences = [confidence]
        logger.debug(f"🎤 Speech started at {chunk.timestamp:.2f}s")

    def _continue_speech_segment(self, chunk: AudioChunk, confidence: float):
        """Continue accumulating current speech segment."""
        self.speech_buffer.append(chunk.data)
        self.speech_confidences.append(confidence)

    def flush(self) -> Optional[SpeechSegment]:
        """
        Force finalize current speech segment if one is active.
        Useful when stopping recording to get the final segment.

        Returns:
            SpeechSegment if there was an active segment, None otherwise
        """
        if self.current_state == SpeechState.SPEECH and self.speech_buffer:
            logger.info("🔄 Flushing active speech segment")
            segment = self._finalize_speech_segment(time.time())

            # Check minimum duration
            if segment.duration * 1000 >= self.config.min_speech_duration_ms:
                return segment
            else:
                logger.debug(
                    f"Flushed segment too short ({segment.duration*1000:.0f}ms), "
                    "ignoring"
                )
        return None

    def _finalize_speech_segment(self, end_time: float) -> SpeechSegment:
        """
        Finalize current speech segment.

        Args:
            end_time: End timestamp of segment

        Returns:
            Complete SpeechSegment
        """
        # Concatenate audio data
        audio_data = np.concatenate(self.speech_buffer)

        # Calculate average confidence
        avg_confidence = np.mean(self.speech_confidences) if self.speech_confidences else 0.0

        # Create segment
        segment = SpeechSegment(
            audio_data=audio_data,
            start_time=self.speech_start_time,
            end_time=end_time,
            sample_rate=self.sample_rate,
            confidence=avg_confidence
        )

        # Update statistics
        self.speech_segments_detected += 1
        self.total_speech_duration += segment.duration

        logger.info(
            f"✅ Speech segment #{self.speech_segments_detected}: "
            f"{segment.duration:.2f}s, confidence={avg_confidence:.3f}"
        )

        # Reset state
        self.current_state = SpeechState.SILENCE
        self.speech_buffer = []
        self.speech_confidences = []
        self.speech_start_time = None

        return segment

    def _get_current_segment_duration(self) -> float:
        """Get duration of audio currently in buffer."""
        if not self.speech_buffer:
            return 0.0
        total_samples = sum(len(chunk) for chunk in self.speech_buffer)
        return total_samples / self.sample_rate

    def reset(self):
        """Reset VAD state and Silero model internal state."""
        self.current_state = SpeechState.SILENCE
        self.speech_buffer = []
        self.speech_confidences = []
        self.speech_start_time = None

        # Reset Silero VAD model internal state (RNN)
        if self.model is not None:
            try:
                # Silero VAD models have internal state that needs resetting
                # Force reset by calling model with empty tensor
                with torch.no_grad():
                    _ = self.model(torch.zeros(512), self.sample_rate)
                logger.debug("✅ VAD state and model reset")
            except Exception as e:
                logger.warning(f"Could not reset VAD model state: {e}")
        else:
            logger.debug("VAD state reset")

    def get_statistics(self) -> dict:
        """
        Get VAD statistics.

        Returns:
            Dictionary with VAD stats
        """
        return {
            'chunks_processed': self.chunks_processed,
            'segments_detected': self.speech_segments_detected,
            'total_speech_duration': self.total_speech_duration,
            'current_state': self.current_state.value,
            'current_segment_duration': self._get_current_segment_duration()
        }


if __name__ == "__main__":
    # Test VAD processor
    from ..utils.logger import setup_logger
    from ..models.config import AudioConfig

    setup_logger(log_level="DEBUG")

    # Create configs
    audio_config = AudioConfig(sample_rate=16000, channels=1, chunk_duration_ms=30)
    vad_config = VADConfig(
        threshold=0.5,
        min_speech_duration_ms=250,
        max_speech_duration_s=3.0,
        min_silence_duration_ms=300
    )

    # Create VAD processor
    vad = VADProcessor(vad_config, sample_rate=audio_config.sample_rate)

    logger.info("\nVAD initialized successfully!")
    logger.info(f"Threshold: {vad_config.threshold}")
    logger.info(f"Sample rate: {audio_config.sample_rate}Hz")

    # Test with synthetic audio (sine wave = speech, silence = zeros)
    logger.info("\nTesting with synthetic audio...")

    def generate_sine_chunk(duration_s: float, freq: float = 440.0) -> AudioChunk:
        """Generate sine wave chunk (simulates speech)."""
        samples = int(audio_config.sample_rate * duration_s)
        t = np.linspace(0, duration_s, samples)
        data = 0.3 * np.sin(2 * np.pi * freq * t).astype(np.float32)
        return AudioChunk(
            data=data,
            timestamp=time.time(),
            sample_rate=audio_config.sample_rate,
            channels=1
        )

    def generate_silence_chunk(duration_s: float) -> AudioChunk:
        """Generate silence chunk."""
        samples = int(audio_config.sample_rate * duration_s)
        data = np.zeros(samples, dtype=np.float32)
        return AudioChunk(
            data=data,
            timestamp=time.time(),
            sample_rate=audio_config.sample_rate,
            channels=1
        )

    # Simulate: 0.5s silence, 1s speech, 0.5s silence
    test_chunks = []
    test_chunks.extend([generate_silence_chunk(0.1) for _ in range(5)])  # 0.5s silence
    test_chunks.extend([generate_sine_chunk(0.1) for _ in range(10)])    # 1.0s speech
    test_chunks.extend([generate_silence_chunk(0.1) for _ in range(5)])  # 0.5s silence

    logger.info(f"Processing {len(test_chunks)} test chunks...")

    segments = []
    for i, chunk in enumerate(test_chunks):
        chunk.timestamp = i * 0.1  # Simulate timestamps
        segment = vad.process_chunk(chunk)
        if segment:
            segments.append(segment)
            logger.info(f"Detected speech segment: {segment.duration:.2f}s")

    # Print statistics
    stats = vad.get_statistics()
    logger.info(f"\nVAD Statistics: {stats}")

    if segments:
        logger.success(f"VAD test completed! Detected {len(segments)} speech segment(s)")
    else:
        logger.warning("No speech segments detected (this is expected with synthetic audio)")

    logger.success("VAD processor test completed!")
