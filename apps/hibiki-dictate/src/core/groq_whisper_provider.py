"""
Groq Whisper API Provider.
Uses Groq's ultra-fast Whisper API for speech-to-text transcription.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import io
import time
import numpy as np
from pathlib import Path
from typing import Optional, Dict, Any
from loguru import logger

try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    logger.warning("Groq SDK not installed. Install with: pip install groq")
    GROQ_AVAILABLE = False

from .transcription_provider import TranscriptionResult


class GroqWhisperProvider:
    """
    Groq Whisper API provider for audio transcription.

    Supports Whisper Large v3 Turbo (216x real-time speed).
    Requires internet connection and Groq API key.
    """

    def __init__(
        self,
        api_key: str,
        model: str = "whisper-large-v3-turbo",
        language: str = "fr",
        response_format: str = "verbose_json",
        temperature: float = 0.0
    ):
        """
        Initialize Groq Whisper provider.

        Args:
            api_key: Groq API key (get from https://console.groq.com)
            model: Whisper model to use (whisper-large-v3-turbo, whisper-large-v3)
            language: Language code (fr, en, es, etc.)
            response_format: Response format (json, verbose_json, text)
            temperature: Sampling temperature (0.0 = deterministic)
        """
        if not GROQ_AVAILABLE:
            raise ImportError("Groq SDK not installed. Install with: pip install groq")

        if not api_key or api_key.strip() == "":
            raise ValueError("Groq API key is required")

        self.api_key = api_key
        self.model = model
        self.language = language
        self.response_format = response_format
        self.temperature = temperature

        # Initialize Groq client
        try:
            self.client = Groq(api_key=api_key)
            logger.info(f"🚀 Groq Whisper provider initialized (model: {model})")
        except Exception as e:
            logger.error(f"Failed to initialize Groq client: {e}")
            raise

    def transcribe(
        self,
        audio_data: np.ndarray,
        sample_rate: int
    ) -> TranscriptionResult:
        """
        Transcribe audio using Groq Whisper API.

        Args:
            audio_data: Audio data as numpy array (float32, -1.0 to 1.0)
            sample_rate: Audio sample rate (Hz)

        Returns:
            TranscriptionResult with transcribed text

        Raises:
            Exception: If transcription fails
        """
        try:
            start_time = time.time()

            # Convert numpy array to WAV bytes
            audio_bytes = self._numpy_to_wav(audio_data, sample_rate)

            logger.debug(f"Transcribing {len(audio_data)/sample_rate:.2f}s audio with Groq API...")

            # Create file-like object from bytes
            audio_file = io.BytesIO(audio_bytes)
            audio_file.name = "audio.wav"  # Required by Groq API

            # Call Groq Whisper API
            response = self.client.audio.transcriptions.create(
                file=audio_file,
                model=self.model,
                language=self.language,
                response_format=self.response_format,
                temperature=self.temperature
            )

            processing_time = time.time() - start_time

            # Parse response
            if self.response_format == "verbose_json":
                text = response.text
                detected_language = getattr(response, 'language', self.language)
                segments = getattr(response, 'segments', [])
                confidence = self._calculate_confidence(segments)
                duration = getattr(response, 'duration', len(audio_data) / sample_rate)
            else:
                # text format
                text = str(response)
                detected_language = self.language  # Fallback to configured language
                confidence = 1.0
                duration = len(audio_data) / sample_rate

            logger.info(f"✅ Groq transcription complete: '{text}' ({processing_time:.2f}s, lang={detected_language})")

            return TranscriptionResult(
                text=text,
                language=detected_language,
                confidence=confidence,
                processing_time=processing_time,
                provider="groq_whisper",
                metadata={
                    "model": self.model,
                    "detected_language": detected_language,
                    "audio_duration": duration
                }
            )

        except Exception as e:
            logger.error(f"Groq transcription failed: {e}")
            raise

    def _numpy_to_wav(self, audio_data: np.ndarray, sample_rate: int) -> bytes:
        """
        Convert numpy audio array to WAV bytes.

        Args:
            audio_data: Audio data (float32, -1.0 to 1.0)
            sample_rate: Sample rate in Hz

        Returns:
            WAV file bytes
        """
        import wave
        import struct

        # Convert float32 to int16
        audio_int16 = (audio_data * 32767).astype(np.int16)

        # Create WAV in memory
        wav_buffer = io.BytesIO()
        with wave.open(wav_buffer, 'wb') as wav_file:
            wav_file.setnchannels(1)  # Mono
            wav_file.setsampwidth(2)  # 16-bit
            wav_file.setframerate(sample_rate)
            wav_file.writeframes(audio_int16.tobytes())

        return wav_buffer.getvalue()

    def _calculate_confidence(self, segments: list) -> float:
        """
        Calculate average confidence from segments.

        Args:
            segments: List of segment dictionaries

        Returns:
            Average confidence score (0.0 to 1.0)
        """
        if not segments:
            return 1.0

        # Extract confidence scores if available
        confidences = []
        for segment in segments:
            if isinstance(segment, dict) and 'avg_logprob' in segment:
                # Convert log probability to confidence (0-1 range)
                # avg_logprob is typically negative, closer to 0 is better
                logprob = segment['avg_logprob']
                confidence = np.exp(logprob)  # Convert to probability
                confidences.append(confidence)

        if confidences:
            return float(np.mean(confidences))
        else:
            return 1.0  # Default if no confidence data

    def get_model_info(self) -> Dict[str, Any]:
        """
        Get information about the current Groq Whisper model.

        Returns:
            Dictionary with model information
        """
        return {
            "provider": "groq_whisper",
            "model": self.model,
            "language": self.language,
            "device": "cloud",
            "compute_type": "optimized",
            "online": True,
            "speed_factor": "216x real-time (advertised)"
        }

    def unload(self):
        """
        Cleanup resources (Groq API doesn't need explicit cleanup).
        """
        logger.info("🚀 Groq Whisper provider unloaded")
        self.client = None


def test_groq_provider():
    """Test Groq Whisper provider with sample audio."""
    from ..utils.logger import setup_logger
    import os

    setup_logger(log_level="INFO")

    # Check for API key
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        logger.error("GROQ_API_KEY environment variable not set")
        logger.info("Get your API key from: https://console.groq.com")
        return

    try:
        # Initialize provider
        provider = GroqWhisperProvider(
            api_key=api_key,
            model="whisper-large-v3-turbo",
            language="fr"
        )

        # Get model info
        info = provider.get_model_info()
        logger.info(f"Model info: {info}")

        # Create test audio (1 second sine wave)
        sample_rate = 16000
        duration = 1.0
        frequency = 440  # A4 note

        t = np.linspace(0, duration, int(sample_rate * duration))
        audio_data = np.sin(2 * np.pi * frequency * t).astype(np.float32)

        logger.info("Testing with sine wave (this will fail gracefully as it's not speech)")

        # Transcribe
        result = provider.transcribe(audio_data, sample_rate)

        logger.info(f"✅ Test complete!")
        logger.info(f"Text: {result.text}")
        logger.info(f"Confidence: {result.confidence:.2f}")
        logger.info(f"Processing time: {result.processing_time:.2f}s")

        # Cleanup
        provider.unload()

    except Exception as e:
        logger.error(f"Test failed: {e}")
        logger.exception(e)


if __name__ == "__main__":
    test_groq_provider()
