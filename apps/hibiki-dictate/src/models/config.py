"""
Configuration management for Voice Dictation application.
Uses Pydantic for validation and type safety.
"""

from enum import Enum
from pathlib import Path
from typing import Optional, Literal
from pydantic import BaseModel, Field, ConfigDict
from pydantic_settings import BaseSettings
import json


class WhisperModel(str, Enum):
    """Available Whisper models."""
    # Multilingual models (support 90+ languages including French)
    TINY = "tiny"
    BASE = "base"
    SMALL = "small"
    MEDIUM = "medium"
    # English-only models (faster but English only)
    TINY_EN = "tiny.en"
    BASE_EN = "base.en"
    SMALL_EN = "small.en"
    MEDIUM_EN = "medium.en"


class ComputeType(str, Enum):
    """Compute precision types for Whisper."""
    FLOAT32 = "float32"
    FLOAT16 = "float16"
    INT8 = "int8"
    INT8_FLOAT16 = "int8_float16"


class TextInjectionMethod(str, Enum):
    """Methods for injecting transcribed text."""
    CLIPBOARD = "clipboard"  # pyperclip + Ctrl+V
    KEYBOARD = "keyboard"    # Direct typing
    AUTO = "auto"            # Try clipboard first, fallback to keyboard


class LineBreakMode(str, Enum):
    """Line break modes for text formatting."""
    EVERY_SENTENCE = "every_sentence"    # \n after each . ? !
    PARAGRAPHS_ONLY = "paragraphs_only"  # Only on long pause
    SMART = "smart"                      # Hybrid: pause + heuristics


class TranscriptionProvider(str, Enum):
    """Available transcription providers."""
    WHISPERX = "whisperx"
    GROQ_WHISPER = "groq_whisper"
    CANARY_QWEN = "canary_qwen"
    VOXTRAL = "voxtral"


class WhisperXModelSize(str, Enum):
    """WhisperX model sizes."""
    BASE = "base"
    SMALL = "small"
    MEDIUM = "medium"
    LARGE_V3 = "large-v3"


class GroqWhisperModel(str, Enum):
    """Groq Whisper model sizes."""
    LARGE_V3_TURBO = "whisper-large-v3-turbo"
    LARGE_V3 = "whisper-large-v3"
    DISTIL_LARGE_V3_EN = "distil-whisper-large-v3-en"


class CanaryQwenModelSize(str, Enum):
    """Canary Qwen model sizes."""
    MODEL_2_5B = "2.5b"


class VoxtralModelSize(str, Enum):
    """Voxtral model sizes."""
    MINI_3B = "mini-3b"
    SMALL_12B = "small-12b"
    LARGE_24B = "24b"


class WhisperXConfig(BaseModel):
    """WhisperX-specific configuration."""
    model: WhisperXModelSize = Field(
        default=WhisperXModelSize.LARGE_V3,
        description="WhisperX model size"
    )
    device: Literal["cuda", "cpu", "auto"] = Field(
        default="auto",
        description="Device to run model on"
    )
    compute_type: ComputeType = Field(
        default=ComputeType.FLOAT16,
        description="Compute precision"
    )
    language: str = Field(
        default="fr",
        description="Language code (en, fr, es, etc.)"
    )
    batch_size: int = Field(
        default=16,
        ge=1,
        le=32,
        description="Batch size for inference"
    )


class GroqWhisperConfig(BaseModel):
    """Groq Whisper API configuration."""
    api_key: str = Field(
        default="",
        description="Groq API key (get from https://console.groq.com)"
    )
    model: GroqWhisperModel = Field(
        default=GroqWhisperModel.LARGE_V3_TURBO,
        description="Groq Whisper model"
    )
    language: str = Field(
        default="fr",
        description="Language code (en, fr, es, etc.)"
    )
    response_format: Literal["json", "verbose_json", "text"] = Field(
        default="verbose_json",
        description="API response format"
    )
    temperature: float = Field(
        default=0.0,
        ge=0.0,
        le=1.0,
        description="Sampling temperature (0.0 = deterministic)"
    )


class CanaryQwenConfig(BaseModel):
    """Canary Qwen-specific configuration."""
    model: CanaryQwenModelSize = Field(
        default=CanaryQwenModelSize.MODEL_2_5B,
        description="Canary Qwen model size"
    )
    device: Literal["cuda", "cpu", "auto"] = Field(
        default="auto",
        description="Device to run model on"
    )
    compute_type: ComputeType = Field(
        default=ComputeType.FLOAT16,
        description="Compute precision"
    )
    language: str = Field(
        default="fr",
        description="Language code (en, fr, es, etc.)"
    )
    batch_size: int = Field(
        default=16,
        ge=1,
        le=32,
        description="Batch size for inference"
    )


class VoxtralConfig(BaseModel):
    """Voxtral-specific configuration."""
    model: VoxtralModelSize = Field(
        default=VoxtralModelSize.MINI_3B,
        description="Voxtral model size"
    )
    device: Literal["cuda", "cpu", "auto"] = Field(
        default="auto",
        description="Device to run model on"
    )
    language: str = Field(
        default="fr",
        description="Language code (en, fr, es, etc.)"
    )


class TranscriptionConfig(BaseModel):
    """Configuration for transcription engine."""
    provider: TranscriptionProvider = Field(
        default=TranscriptionProvider.WHISPERX,
        description="Transcription provider to use"
    )

    # Provider-specific configs
    whisperx: WhisperXConfig = Field(
        default_factory=WhisperXConfig,
        description="WhisperX configuration"
    )
    groq_whisper: GroqWhisperConfig = Field(
        default_factory=GroqWhisperConfig,
        description="Groq Whisper API configuration"
    )
    canary_qwen: CanaryQwenConfig = Field(
        default_factory=CanaryQwenConfig,
        description="Canary Qwen configuration"
    )
    voxtral: VoxtralConfig = Field(
        default_factory=VoxtralConfig,
        description="Voxtral configuration"
    )

    # Legacy fields (kept for backward compatibility with old TranscriptionEngine)
    model: WhisperModel = Field(
        default=WhisperModel.BASE,
        description="[LEGACY] Whisper model to use (for faster-whisper)"
    )
    device: Literal["cuda", "cpu", "auto"] = Field(
        default="auto",
        description="[LEGACY] Device to run model on"
    )
    compute_type: ComputeType = Field(
        default=ComputeType.FLOAT16,
        description="[LEGACY] Compute precision"
    )
    language: str = Field(
        default="en",
        description="[LEGACY] Language code (en, fr, es, etc.)"
    )
    beam_size: int = Field(
        default=5,
        ge=1,
        le=10,
        description="[LEGACY] Beam size for decoding"
    )
    batch_size: int = Field(
        default=16,
        ge=1,
        le=32,
        description="[LEGACY] Batch size for inference"
    )
    initial_prompt: Optional[str] = Field(
        default=None,
        description="[LEGACY] Optional text to guide Whisper transcription style (improves accuracy)"
    )


class AudioConfig(BaseModel):
    """Configuration for audio capture."""
    sample_rate: int = Field(
        default=16000,
        description="Audio sample rate in Hz"
    )
    channels: int = Field(
        default=1,
        description="Number of audio channels (1=mono)"
    )
    chunk_duration_ms: int = Field(
        default=30,
        ge=10,
        le=100,
        description="Audio chunk duration in milliseconds"
    )
    device_index: Optional[int] = Field(
        default=None,
        description="Audio input device index (None = default)"
    )

    @property
    def chunk_size(self) -> int:
        """Calculate chunk size in samples."""
        return int(self.sample_rate * self.chunk_duration_ms / 1000)


class VADConfig(BaseModel):
    """Configuration for Voice Activity Detection."""
    threshold: float = Field(
        default=0.4,
        ge=0.0,
        le=1.0,
        description="VAD confidence threshold (0-1)"
    )
    min_speech_duration_ms: int = Field(
        default=250,
        ge=100,
        le=1000,
        description="Minimum speech duration to process"
    )
    max_speech_duration_s: float = Field(
        default=60.0,
        ge=1.0,
        le=120.0,
        description="Maximum speech segment duration"
    )
    min_silence_duration_ms: int = Field(
        default=5000,
        ge=100,
        le=10000,
        description="Silence duration to mark end of speech"
    )
    speech_pad_ms: int = Field(
        default=30,
        ge=0,
        le=200,
        description="Padding around speech segments"
    )


class HotkeyConfig(BaseModel):
    """Configuration for global hotkeys."""
    toggle_key: str = Field(
        default="ctrl+shift+space",
        description="Hotkey to toggle dictation on/off"
    )
    push_to_talk_key: Optional[str] = Field(
        default=None,
        description="Push-to-talk key (hold to record)"
    )
    mode: Literal["toggle", "push_to_talk"] = Field(
        default="toggle",
        description="Hotkey mode"
    )
    recent_hotkeys: list[str] = Field(
        default_factory=list,
        description="Recently used custom hotkeys (max 5)"
    )

    def add_to_recent(self, hotkey: str, max_recent: int = 5) -> None:
        """
        Add a hotkey to recent history.

        Args:
            hotkey: Hotkey string to add
            max_recent: Maximum number of recent hotkeys to keep
        """
        # Remove if already exists (to move to top)
        if hotkey in self.recent_hotkeys:
            self.recent_hotkeys.remove(hotkey)

        # Add to beginning
        self.recent_hotkeys.insert(0, hotkey)

        # Limit to max_recent
        if len(self.recent_hotkeys) > max_recent:
            self.recent_hotkeys = self.recent_hotkeys[:max_recent]


class TextInjectionConfig(BaseModel):
    """Configuration for text injection."""
    default_method: TextInjectionMethod = Field(
        default=TextInjectionMethod.CLIPBOARD,
        description="Default injection method"
    )
    typing_speed_cps: int = Field(
        default=100,
        ge=10,
        le=500,
        description="Typing speed in characters per second"
    )
    preserve_clipboard: bool = Field(
        default=True,
        description="Save and restore clipboard content"
    )
    add_space_before: bool = Field(
        default=False,
        description="Add space before injected text"
    )


class FormattingConfig(BaseModel):
    """Configuration for smart text formatting."""
    enable_smart_punctuation: bool = Field(
        default=True,
        description="Enable smart punctuation formatting"
    )
    french_nbsp_rules: bool = Field(
        default=True,
        description="Use French non-breaking space rules before : ; ? !"
    )
    preserve_numbers: bool = Field(
        default=True,
        description="Don't break numbers like 3.14 or 10,000"
    )
    common_abbreviations: list[str] = Field(
        default_factory=lambda: ["M.", "Mme.", "Mlle.", "Dr.", "Pr.", "Me.", "etc.", "cf.", "ex.", "fig.", "vol.", "p.", "pp."],
        description="Common abbreviations that shouldn't trigger line breaks"
    )
    line_break_mode: LineBreakMode = Field(
        default=LineBreakMode.EVERY_SENTENCE,
        description="Mode for line breaks"
    )
    paragraph_pause_threshold_s: float = Field(
        default=2.0,
        ge=0.5,
        le=10.0,
        description="Pause duration in seconds to trigger paragraph break"
    )
    max_sentences_per_paragraph: int = Field(
        default=5,
        ge=1,
        le=20,
        description="Maximum sentences before forcing paragraph break in SMART mode"
    )


class OverlayConfig(BaseModel):
    """Configuration for overlay window."""
    position: Literal[
        "bottom_left", "bottom_center", "bottom_right",
        "top_left", "top_center", "top_right",
        "center_left", "center_right", "center"
    ] = Field(
        default="bottom_left",
        description="Position of overlay window on screen"
    )
    opacity: float = Field(
        default=0.85,
        ge=0.3,
        le=1.0,
        description="Overlay window opacity (0.3-1.0, higher = more visible)"
    )


class AppSettings(BaseSettings):
    """Main application settings."""

    # Transcription provider selection
    transcription_provider: TranscriptionProvider = Field(
        default=TranscriptionProvider.WHISPERX,
        description="Active transcription provider"
    )

    # Configuration sections (direct access for compatibility)
    whisperx: WhisperXConfig = Field(
        default_factory=WhisperXConfig,
        description="WhisperX configuration"
    )
    groq_whisper: GroqWhisperConfig = Field(
        default_factory=GroqWhisperConfig,
        description="Groq Whisper API configuration"
    )
    audio: AudioConfig = Field(
        default_factory=AudioConfig
    )
    vad: VADConfig = Field(
        default_factory=VADConfig
    )
    hotkey: HotkeyConfig = Field(
        default_factory=HotkeyConfig
    )
    text_injection: TextInjectionConfig = Field(
        default_factory=TextInjectionConfig
    )
    overlay: OverlayConfig = Field(
        default_factory=OverlayConfig,
        description="Overlay window configuration"
    )
    formatting: FormattingConfig = Field(
        default_factory=FormattingConfig,
        description="Text formatting configuration"
    )

    # Application settings
    auto_start: bool = Field(
        default=False,
        description="Start dictation automatically on app launch"
    )
    start_with_windows: bool = Field(
        default=False,
        description="Start Hibiki when Windows starts"
    )
    quick_languages: list[str] = Field(
        default_factory=lambda: ["fr", "en", "es", "de"],
        description="Quick-access languages for fast switching"
    )
    minimize_to_tray: bool = Field(
        default=True,
        description="Minimize to system tray instead of closing"
    )
    show_notifications: bool = Field(
        default=True,
        description="Show desktop notifications"
    )
    audio_feedback_enabled: bool = Field(
        default=True,
        description="Enable audio feedback sounds (start/stop/success)"
    )
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(
        default="INFO",
        description="Logging level"
    )
    theme_mode: Literal["light", "dark", "auto"] = Field(
        default="light",
        description="UI theme mode"
    )
    check_updates_on_startup: bool = Field(
        default=True,
        description="Check for updates when app starts"
    )

    # Paths
    models_dir: Path = Field(
        default=Path("models"),
        description="Directory to store downloaded models"
    )
    logs_dir: Path = Field(
        default=Path("logs"),
        description="Directory to store logs"
    )
    config_file: Path = Field(
        default=Path("config/hibiki_preferences.json"),
        description="User configuration file path"
    )

    class Config:
        env_prefix = "VOICE_DICT_"
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Ignore extra environment variables like GROQ_API_KEY

    def save(self, path: Optional[Path] = None) -> None:
        """Save settings to JSON file."""
        save_path = path or self.config_file
        save_path.parent.mkdir(parents=True, exist_ok=True)

        with open(save_path, 'w', encoding='utf-8') as f:
            json.dump(
                self.model_dump(mode='json'),
                f,
                indent=2,
                ensure_ascii=False
            )

    @classmethod
    def load(cls, path: Optional[Path] = None) -> 'AppSettings':
        """Load settings from JSON file."""
        load_path = path or Path("config/user_preferences.json")

        if not load_path.exists():
            return cls()

        with open(load_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        return cls(**data)


# Default configuration instance
def get_default_config() -> AppSettings:
    """Get default application configuration."""
    return AppSettings()


if __name__ == "__main__":
    # Example usage and testing
    config = get_default_config()
    print("Default Configuration:")
    print(f"Model: {config.transcription.model}")
    print(f"Device: {config.transcription.device}")
    print(f"Sample Rate: {config.audio.sample_rate}Hz")
    print(f"Chunk Size: {config.audio.chunk_size} samples")
    print(f"VAD Threshold: {config.vad.threshold}")
    print(f"Hotkey: {config.hotkey.toggle_key}")

    # Save example config
    config.save(Path("config/default_config.json"))
    print("\nConfiguration saved to config/default_config.json")
