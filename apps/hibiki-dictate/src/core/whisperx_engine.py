"""
WhisperX transcription engine with forced alignment for high accuracy.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import os
import time
import numpy as np
import torch
from typing import Optional
from loguru import logger

# Fix for PyTorch 2.8+ weights_only=True default
_original_torch_load = torch.load

def _patched_torch_load(f, *args, **kwargs):
    """Patched torch.load that uses weights_only=False for compatibility."""
    kwargs['weights_only'] = False
    return _original_torch_load(f, *args, **kwargs)

torch.load = _patched_torch_load
logger.info("✅ Patched torch.load for PyTorch 2.8+ compatibility")

# Fix for torchaudio 2.1+ AudioMetaData removal
# pyannote.audio (used by WhisperX) requires torchaudio.AudioMetaData
# which was removed in torchaudio 2.1+
# Create a stub AudioMetaData class that mimics the old API
try:
    import torchaudio
    from dataclasses import dataclass

    if not hasattr(torchaudio, 'AudioMetaData'):
        # Create stub AudioMetaData compatible with pyannote.audio usage
        @dataclass
        class AudioMetaData:
            """Stub AudioMetaData for torchaudio 2.1+ compatibility."""
            sample_rate: int
            num_frames: int
            num_channels: int
            bits_per_sample: int = 16
            encoding: str = "PCM_S"

        # Inject into torchaudio module
        torchaudio.AudioMetaData = AudioMetaData
        logger.info("✅ Patched torchaudio.AudioMetaData for pyannote.audio compatibility")

    # Fix for torchaudio 2.9+ list_audio_backends removal
    # WhisperX/pyannote.audio may call this function which was removed
    if not hasattr(torchaudio, 'list_audio_backends'):
        def list_audio_backends():
            """Stub list_audio_backends for torchaudio 2.9+ compatibility."""
            # Return common backends that may be available
            backends = []
            try:
                import soundfile
                backends.append('soundfile')
            except ImportError:
                pass
            try:
                import sox
                backends.append('sox')
            except ImportError:
                pass
            # ffmpeg is usually available if torchaudio is installed
            backends.append('ffmpeg')
            return backends

        torchaudio.list_audio_backends = list_audio_backends
        logger.info("✅ Patched torchaudio.list_audio_backends for torchaudio 2.9+ compatibility")

except Exception as e:
    logger.warning(f"⚠️ Failed to patch torchaudio: {e}")

from .transcription_provider import TranscriptionProvider, TranscriptionResult


class WhisperXEngine(TranscriptionProvider):
    """WhisperX transcription engine with forced alignment."""

    def __init__(self, config: dict, models_dir: str):
        """
        Initialize WhisperX engine.

        Args:
            config: Configuration dict with model, language, device, compute_type, batch_size
            models_dir: Directory to store models
        """
        self.config = config
        self.models_dir = models_dir
        self.model = None
        self.align_model = None
        self.align_metadata = None
        self.device = None

        self._load_model()

    def _load_model(self):
        """Load WhisperX model and alignment model."""
        try:
            import whisperx

            logger.info(f"🧠 Loading WhisperX model: {self.config['model']}")
            start_time = time.time()

            # Determine device - PRIORITY GPU
            device = self.config.get('device', 'auto')
            if device == 'auto':
                if torch.cuda.is_available():
                    device = 'cuda'
                    logger.success(f"✅ GPU (CUDA) detected and selected - RTX 3060 12GB")
                else:
                    device = 'cpu'
                    logger.warning(f"⚠️ No GPU available, using CPU")

            self.device = device
            logger.info(f"🎯 Using device: {device}")

            # Adjust compute_type based on device
            compute_type = self.config.get('compute_type', 'float16')

            if device == 'cuda':
                # GPU: Use float16 for best performance on RTX 3060
                if compute_type not in ['float16', 'float32']:
                    compute_type = 'float16'
                    logger.info(f"✅ Using float16 for GPU (optimal for RTX 3060)")
            elif device == 'cpu':
                # CPU: Use int8 for compatibility
                if compute_type == 'float16':
                    compute_type = 'int8'
                    logger.warning(f"⚠️ Switched compute_type from float16 to int8 (CPU doesn't support float16)")

            # Load Whisper model
            self.model = whisperx.load_model(
                self.config['model'],
                device=device,
                compute_type=compute_type,
                download_root=self.models_dir
            )

            # Load alignment model
            language = self.config.get('language', 'fr')
            logger.info(f"Loading alignment model for language: {language}")
            self.align_model, self.align_metadata = whisperx.load_align_model(
                language_code=language,
                device=device
            )

            load_time = time.time() - start_time
            logger.info(f"✅ WhisperX model loaded in {load_time:.2f}s")

        except ImportError:
            logger.error("WhisperX not installed. Install with: pip install whisperx")
            raise
        except Exception as e:
            logger.error(f"Failed to load WhisperX model: {e}")
            raise

    def transcribe(
        self,
        audio_data: np.ndarray,
        sample_rate: int = 16000
    ) -> TranscriptionResult:
        """Transcribe audio with WhisperX."""
        import whisperx

        start_time = time.time()

        try:
            # Transcribe with Whisper
            result = self.model.transcribe(
                audio_data,
                batch_size=self.config.get('batch_size', 16),
                language=self.config.get('language', 'fr')
            )

            # Align with forced alignment
            if self.align_model and result.get("segments"):
                try:
                    result = whisperx.align(
                        result["segments"],
                        self.align_model,
                        self.align_metadata,
                        audio_data,
                        device=self.device
                    )
                except Exception as align_error:
                    logger.warning(f"Alignment failed: {align_error}. Continuing with unaligned transcription.")
                    # Keep the original result without alignment

            # Extract text
            segments = result.get("segments", [])
            if not segments:
                logger.warning("No segments found in transcription result")
                return TranscriptionResult(
                    text="",
                    language=self.config.get('language', 'fr'),
                    confidence=0.0,
                    processing_time=time.time() - start_time,
                    provider="whisperx",
                    metadata={}
                )

            text = " ".join([seg.get("text", "").strip() for seg in segments if seg.get("text")])

            # Calculate confidence
            confidences = []
            for seg in segments:
                if "words" in seg:
                    word_scores = [w.get("score", 1.0) for w in seg["words"] if "score" in w]
                    if word_scores:
                        confidences.extend(word_scores)
                elif "score" in seg or "confidence" in seg:
                    confidences.append(seg.get("score", seg.get("confidence", 1.0)))

            avg_confidence = np.mean(confidences) if confidences else 1.0
            processing_time = time.time() - start_time

            return TranscriptionResult(
                text=text.strip(),
                language=result.get("language", self.config.get('language', 'fr')),
                confidence=avg_confidence,
                processing_time=processing_time,
                provider="whisperx",
                metadata={
                    "segments": segments,
                    "word_segments": result.get("word_segments", [])
                }
            )

        except Exception as e:
            logger.error(f"WhisperX transcription failed: {e}")
            logger.exception(e)  # Log full traceback
            raise

    def get_provider_name(self) -> str:
        """Get provider name."""
        return "WhisperX"

    def get_model_info(self) -> dict:
        """Get model information."""
        return {
            "provider": "WhisperX",
            "model": self.config['model'],
            "language": self.config.get('language', 'fr'),
            "device": str(self.device) if self.device else "unknown",
            "features": ["forced_alignment", "word_timestamps", "high_accuracy"]
        }

    def unload(self):
        """Unload models and free memory."""
        del self.model
        del self.align_model
        self.model = None
        self.align_model = None
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("WhisperX model unloaded")
