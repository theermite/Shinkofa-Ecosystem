"""
Real-time audio capture module using sounddevice.
Captures audio from microphone and streams to a queue for processing.
"""

import sounddevice as sd
import numpy as np
import queue
import time
from typing import Optional, Callable
from dataclasses import dataclass

from loguru import logger
from ..models.config import AudioConfig
from ..utils.threading_utils import BoundedQueue


@dataclass
class AudioChunk:
    """Audio data chunk with metadata."""
    data: np.ndarray  # Audio samples as float32
    timestamp: float  # Time when chunk was captured
    sample_rate: int  # Sample rate in Hz
    channels: int     # Number of channels

    @property
    def duration(self) -> float:
        """Get chunk duration in seconds."""
        return len(self.data) / self.sample_rate

    def to_int16(self) -> np.ndarray:
        """Convert float32 audio to int16."""
        return (self.data * 32767).astype(np.int16)


class AudioCapture:
    """
    Real-time audio capture from microphone.
    Uses sounddevice for low-latency streaming.
    """

    def __init__(
        self,
        config: AudioConfig,
        callback: Optional[Callable[[AudioChunk], None]] = None,
        queue_size: int = 2000  # Support 60s segments (60s / 0.032s = 1875 chunks)
    ):
        """
        Initialize audio capture.

        Args:
            config: Audio configuration
            callback: Optional callback function for each chunk
            queue_size: Maximum size of audio queue
        """
        self.config = config
        self.callback = callback
        self.audio_queue = BoundedQueue(maxsize=queue_size)

        self.stream: Optional[sd.InputStream] = None
        self.is_recording = False
        self.chunks_captured = 0
        self.bytes_captured = 0
        self.start_time: Optional[float] = None

        logger.info(
            f"AudioCapture initialized: {config.sample_rate}Hz, "
            f"{config.channels}ch, {config.chunk_duration_ms}ms chunks"
        )

    def _audio_callback(
        self,
        indata: np.ndarray,
        frames: int,
        time_info,
        status: sd.CallbackFlags
    ):
        """
        Callback function called by sounddevice for each audio chunk.

        Args:
            indata: Input audio data
            frames: Number of frames
            time_info: Timing information
            status: Status flags
        """
        if status:
            logger.warning(f"Audio callback status: {status}")

        # Create audio chunk with metadata
        chunk = AudioChunk(
            data=indata.copy().flatten(),  # Copy and flatten to 1D
            timestamp=time.time(),
            sample_rate=self.config.sample_rate,
            channels=self.config.channels
        )

        # Update statistics
        self.chunks_captured += 1
        self.bytes_captured += indata.nbytes

        # Add to queue
        self.audio_queue.put(chunk)

        # Call user callback if provided
        if self.callback:
            try:
                self.callback(chunk)
            except Exception as e:
                logger.error(f"Error in audio callback: {e}")

    def list_devices(self) -> list:
        """
        List all available audio input devices.

        Returns:
            List of device information dictionaries
        """
        devices = sd.query_devices()
        input_devices = []

        for i, device in enumerate(devices):
            if device['max_input_channels'] > 0:
                input_devices.append({
                    'index': i,
                    'name': device['name'],
                    'channels': device['max_input_channels'],
                    'sample_rate': device['default_samplerate']
                })

        return input_devices

    def print_devices(self):
        """Print all available audio input devices."""
        devices = self.list_devices()
        logger.info("Available audio input devices:")
        for dev in devices:
            logger.info(
                f"  [{dev['index']}] {dev['name']} "
                f"({dev['channels']}ch, {dev['sample_rate']}Hz)"
            )

    def start(self, device_index: Optional[int] = None):
        """
        Start audio capture.

        Args:
            device_index: Optional specific device index to use
        """
        if self.is_recording:
            logger.warning("Audio capture already running")
            return

        try:
            # Use specified device or default from config
            device = device_index if device_index is not None else self.config.device_index

            # If no device specified, get default input device
            if device is None:
                device = sd.default.device[0]  # [0] = input device

            # Create and start stream
            self.stream = sd.InputStream(
                device=device,
                channels=self.config.channels,
                samplerate=self.config.sample_rate,
                blocksize=self.config.chunk_size,
                dtype=np.float32,
                callback=self._audio_callback
            )

            self.stream.start()
            self.is_recording = True
            self.start_time = time.time()
            self.chunks_captured = 0
            self.bytes_captured = 0

            device_info = sd.query_devices(device)
            device_name = device_info.get('name', 'Unknown') if isinstance(device_info, dict) else str(device_info)
            logger.info(
                f"🎤 Audio capture started: {device_name} "
                f"({self.config.sample_rate}Hz, {self.config.channels}ch, "
                f"blocksize={self.config.chunk_size})"
            )

        except Exception as e:
            logger.error(f"Failed to start audio capture: {e}")
            raise

    def stop(self):
        """Stop audio capture."""
        if not self.is_recording:
            logger.warning("Audio capture not running")
            return

        try:
            if self.stream:
                self.stream.stop()
                self.stream.close()
                self.stream = None

            self.is_recording = False

            # Log statistics
            duration = time.time() - self.start_time if self.start_time else 0
            logger.info(
                f"🎤 Audio capture stopped. "
                f"Duration: {duration:.1f}s, "
                f"Chunks: {self.chunks_captured}, "
                f"Data: {self.bytes_captured / 1024 / 1024:.2f}MB"
            )

        except Exception as e:
            logger.error(f"Error stopping audio capture: {e}")

    def get_chunk(self, timeout: float = 1.0) -> Optional[AudioChunk]:
        """
        Get next audio chunk from queue.

        Args:
            timeout: Maximum time to wait for chunk (seconds)

        Returns:
            AudioChunk or None if timeout
        """
        try:
            return self.audio_queue.get(timeout=timeout)
        except queue.Empty:
            return None

    def clear_queue(self):
        """Clear all pending audio chunks from queue."""
        self.audio_queue.clear()
        logger.debug("Audio queue cleared")

    def get_statistics(self) -> dict:
        """
        Get capture statistics.

        Returns:
            Dictionary with capture stats
        """
        duration = time.time() - self.start_time if self.start_time and self.is_recording else 0

        return {
            'is_recording': self.is_recording,
            'duration': duration,
            'chunks_captured': self.chunks_captured,
            'bytes_captured': self.bytes_captured,
            'queue_size': self.audio_queue.qsize(),
            'dropped_chunks': self.audio_queue.dropped_count,
            'sample_rate': self.config.sample_rate,
            'chunk_duration_ms': self.config.chunk_duration_ms
        }

    def __enter__(self):
        """Context manager entry."""
        self.start()
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.stop()


def save_audio_to_wav(chunks: list[AudioChunk], filename: str):
    """
    Save audio chunks to WAV file.

    Args:
        chunks: List of audio chunks
        filename: Output WAV filename
    """
    import wave

    if not chunks:
        logger.warning("No audio chunks to save")
        return

    # Concatenate all chunks
    audio_data = np.concatenate([chunk.data for chunk in chunks])

    # Convert to int16
    audio_int16 = (audio_data * 32767).astype(np.int16)

    # Write WAV file
    with wave.open(filename, 'wb') as wf:
        wf.setnchannels(chunks[0].channels)
        wf.setsampwidth(2)  # 16-bit
        wf.setframerate(chunks[0].sample_rate)
        wf.writeframes(audio_int16.tobytes())

    duration = sum(chunk.duration for chunk in chunks)
    logger.info(f"Saved {len(chunks)} chunks ({duration:.2f}s) to {filename}")


if __name__ == "__main__":
    # Test audio capture
    from ..utils.logger import setup_logger

    setup_logger(log_level="DEBUG")

    # Create config
    config = AudioConfig(
        sample_rate=16000,
        channels=1,
        chunk_duration_ms=30
    )

    # List devices
    capture = AudioCapture(config)
    capture.print_devices()

    # Test recording
    logger.info("\nStarting 5-second recording test...")
    logger.info("Speak into your microphone...")

    chunks = []

    def collect_chunk(chunk: AudioChunk):
        chunks.append(chunk)
        if len(chunks) % 10 == 0:
            logger.info(f"Captured {len(chunks)} chunks...")

    with AudioCapture(config, callback=collect_chunk) as cap:
        time.sleep(5)

    # Save to file
    save_audio_to_wav(chunks, "test_recording.wav")

    # Print stats
    stats = capture.get_statistics()
    logger.info(f"\nCapture statistics: {stats}")

    logger.success("Audio capture test completed!")
