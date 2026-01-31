"""
Abstract base class for transcription providers.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

from abc import ABC, abstractmethod
from typing import Optional
import numpy as np
from dataclasses import dataclass


@dataclass
class TranscriptionResult:
    """Result from transcription."""
    text: str
    language: str
    confidence: float
    processing_time: float
    provider: str
    metadata: dict


class TranscriptionProvider(ABC):
    """Abstract base class for transcription providers."""

    @abstractmethod
    def __init__(self, config: dict, models_dir: str):
        """Initialize the transcription provider."""
        pass

    @abstractmethod
    def transcribe(
        self,
        audio_data: np.ndarray,
        sample_rate: int = 16000
    ) -> TranscriptionResult:
        """Transcribe audio data to text."""
        pass

    @abstractmethod
    def get_provider_name(self) -> str:
        """Get the provider name."""
        pass

    @abstractmethod
    def get_model_info(self) -> dict:
        """Get information about the loaded model."""
        pass

    @abstractmethod
    def unload(self):
        """Unload the model and free resources."""
        pass
