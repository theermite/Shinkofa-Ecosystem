"""
Pytest configuration for Hibiki-Dictate tests.
"""

import sys
from pathlib import Path

import pytest

# Add src to path for imports
src_path = Path(__file__).parent.parent / "src"
sys.path.insert(0, str(src_path))


@pytest.fixture
def test_config():
    """Provide test configuration."""
    return {
        "audio": {
            "sample_rate": 16000,
            "channels": 1,
            "chunk_duration": 0.5,
        },
        "transcription": {
            "model": "tiny",
            "language": "fr",
        },
    }


@pytest.fixture
def mock_audio_data():
    """Provide mock audio data for testing."""
    import numpy as np

    # Generate 1 second of silence at 16kHz
    return np.zeros(16000, dtype=np.float32)
