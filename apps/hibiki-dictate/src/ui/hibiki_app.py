"""
Hibiki - Voice Dictation Application
Main UI with Shinkofa design system.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
import threading
import time
import os
import subprocess
from pathlib import Path
from typing import Optional, List
from loguru import logger

import os
from ..models.config import AppSettings, WhisperModel, TranscriptionProvider
from ..core.whisperx_engine import WhisperXEngine
from ..core.groq_whisper_provider import GroqWhisperProvider, GROQ_AVAILABLE
from ..core.audio_capture import AudioCapture, AudioChunk
from ..core.vad_processor import VADProcessor
from ..core.text_injector import TextInjector
from ..core.hotkey_manager import HotkeyManager
from ..utils.auto_updater import get_updater
from ..utils.transcription_history import TranscriptionHistory
from ..utils.custom_dictionary import CustomDictionary
from ..utils.text_formatter import TextFormatter
from ..utils.audio_feedback import AudioFeedback, FeedbackSound
from .logs_window import LogsWindow
from .hotkey_settings_window import HotkeySettingsWindow
from .settings_window import SettingsWindow
from .history_window import HistoryWindow
from .dictionary_window import DictionaryWindow
from .overlay_window import OverlayWindow
from .theme import ShinkofaColors
from .components import EmojiButton, create_language_dropdown, LANGUAGE_FLAGS

# System tray (optional)
try:
    from .system_tray import SystemTray
    SYSTEM_TRAY_AVAILABLE = True
except Exception as e:
    logger.warning(f"System tray not available: {e}")
    SYSTEM_TRAY_AVAILABLE = False


class HibikiApp(ctk.CTk):
    """Hibiki main application window with Shinkofa design."""

    # Version de l'application
    VERSION = "1.0.0"

    def __init__(self, config: AppSettings):
        super().__init__()

        self.config = config
        self.transcription_engine: Optional[WhisperXEngine | GroqWhisperProvider] = None
        self.transcription_provider_name: str = "unknown"
        self.audio_capture: Optional[AudioCapture] = None
        self.vad_processor: Optional[VADProcessor] = None
        self.text_injector: Optional[TextInjector] = None
        self.hotkey_manager: Optional[HotkeyManager] = None

        self.is_recording = False
        self.is_initializing = True
        self.is_hidden = False

        # Segment accumulation for continuous recording
        self.pending_segments: List = []  # Accumulate segments during recording session

        # Auto-updater
        self.updater = get_updater(current_version=self.VERSION)

        # Transcription history
        history_db_path = Path(config.config_file).parent / "transcription_history.db"
        self.transcription_history = TranscriptionHistory(
            db_file=str(history_db_path),
            max_entries=100
        )

        # Custom dictionary
        dictionary_file = Path(config.config_file).parent / "custom_dictionary.json"
        self.custom_dictionary = CustomDictionary(
            dictionary_file=str(dictionary_file)
        )

        # Audio feedback
        self.audio_feedback = AudioFeedback(
            enabled=config.audio_feedback_enabled,
            volume=0.3  # Reduced volume (30%)
        )

        # Text formatter (automatic punctuation and line breaks)
        detected_language = config.groq_whisper.language if config.transcription_provider.value == "groq_whisper" else config.whisperx.language
        self.text_formatter = TextFormatter(
            language=detected_language
        )
        logger.info(f"📝 Text formatter initialized: language={detected_language}, mode=automatic")

        # System tray
        self.system_tray: Optional[SystemTray] = None
        if SYSTEM_TRAY_AVAILABLE and config.minimize_to_tray:
            try:
                icon_path = Path(__file__).parent.parent.parent / "assets" / "icon.png"
                self.system_tray = SystemTray(
                    on_show=self._show_from_tray,
                    on_quit=self._quit_from_tray,
                    icon_path=icon_path if icon_path.exists() else None
                )
                self.system_tray.start()
                logger.info("✅ System tray enabled")
            except Exception as e:
                logger.error(f"Failed to initialize system tray: {e}")
                self.system_tray = None

        # Setup UI theme
        self._setup_theme()

        # Get current theme colors
        self.colors = self._get_theme_colors()

        # Setup window
        self._setup_window()

        # Create UI
        self._create_ui()

        # Initialize components in background
        threading.Thread(target=self._initialize_components, daemon=True).start()

        # Check for updates in background (after 2 seconds delay)
        if getattr(self.config, 'check_updates_on_startup', True):
            threading.Timer(2.0, self._check_for_updates).start()

    def _setup_theme(self):
        """Setup Shinkofa theme."""
        # Set appearance mode based on config
        theme_map = {
            "light": "light",
            "dark": "dark",
            "auto": "system"
        }
        ctk.set_appearance_mode(theme_map.get(self.config.theme_mode, "light"))

        # Set default color theme (we'll override with Shinkofa colors)
        ctk.set_default_color_theme("blue")

    def _get_theme_colors(self):
        """Get colors based on current theme mode."""
        if self.config.theme_mode == "dark":
            return ShinkofaColors.DARK_MODE
        else:
            return ShinkofaColors.LIGHT_MODE

    def _setup_window(self):
        """Setup main window properties."""
        self.title("🎙️ Hibiki - Dictée Vocale")

        # Window size (compact, elegant - Shinkofa design)
        width, height = 500, 650
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Minimum size
        self.minsize(480, 600)

        # Force background color based on theme
        if self.config.theme_mode == "dark":
            self.configure(fg_color="#1e1e1e")

        # Icon
        try:
            icon_path = Path(__file__).parent.parent.parent / "assets" / "icon.ico"
            if icon_path.exists():
                self.iconbitmap(str(icon_path))
            else:
                logger.warning(f"Icon not found at {icon_path}")
        except Exception as e:
            logger.warning(f"Failed to set window icon: {e}")

        # Protocol
        self.protocol("WM_DELETE_WINDOW", self._on_closing)

    def _create_ui(self):
        """Create UI components with Shinkofa design."""
        # Main container with padding
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(0, weight=1)

        main_container = ctk.CTkFrame(self, fg_color="transparent")
        main_container.grid(row=0, column=0, sticky="nsew", padx=24, pady=24)
        main_container.grid_columnconfigure(0, weight=1)

        # Header
        # Corner buttons (absolute positioning) - MODERN TEXT-BASED
        # Settings button - Top left corner
        self.settings_button = ctk.CTkButton(
            main_container,
            text="⚙",
            width=40,
            height=40,
            corner_radius=8,
            font=ctk.CTkFont(size=18, weight="bold"),
            fg_color=self.colors['primary'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            command=self._open_settings
        )
        self.settings_button.place(x=8, y=8)

        # Theme toggle button - Top right corner
        theme_text = "◐" if self.config.theme_mode == "light" else "◑"
        self.theme_button = ctk.CTkButton(
            main_container,
            text=theme_text,
            width=40,
            height=40,
            corner_radius=8,
            font=ctk.CTkFont(size=18, weight="bold"),
            fg_color=self.colors['card_bg'],
            hover_color=self.colors['hover_bg'],
            text_color=self.colors['fg'],
            border_width=1,
            border_color=self.colors['border'],
            command=self._toggle_theme
        )
        self.theme_button.place(relx=1.0, x=-48, y=8)

        # Logs button - Bottom right corner
        self.logs_button = ctk.CTkButton(
            main_container,
            text="▤",
            width=40,
            height=40,
            corner_radius=8,
            font=ctk.CTkFont(size=16, weight="bold"),
            fg_color=self.colors['card_bg'],
            hover_color=self.colors['hover_bg'],
            text_color=self.colors['fg'],
            border_width=1,
            border_color=self.colors['border'],
            command=self._open_logs
        )
        self.logs_button.place(relx=1.0, rely=1.0, x=-48, y=-48)

        # Title - centered and simplified
        title_label = ctk.CTkLabel(
            main_container,
            text="Hibiki",
            font=ctk.CTkFont(size=32, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, pady=(50, 20))

        # Status card - adaptive colors
        status_card = ctk.CTkFrame(
            main_container,
            corner_radius=12,
            border_width=2,
            border_color=self.colors['primary']
        )
        status_card.grid(row=1, column=0, sticky="ew", pady=(0, 20))
        status_card.grid_columnconfigure(0, weight=1)

        # Status label
        self.status_label = ctk.CTkLabel(
            status_card,
            text="Initialisation...",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['fg'],
            height=44
        )
        self.status_label.grid(row=0, column=0, pady=14, padx=16)

        # Quality indicator (based on hardware detection)
        self.quality_label = ctk.CTkLabel(
            status_card,
            text="",
            font=ctk.CTkFont(size=13),
            text_color=self.colors['primary']
        )
        self.quality_label.grid(row=1, column=0, pady=(0, 14), padx=16)

        # Main action button (large, accessible - 44x44px minimum touch target)
        self.record_button = ctk.CTkButton(
            main_container,
            text="ENREGISTRER",
            font=ctk.CTkFont(size=18, weight="bold"),
            height=56,
            corner_radius=10,
            fg_color=self.colors['primary'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            command=self._toggle_recording,
            state="disabled"
        )
        self.record_button.grid(row=2, column=0, sticky="ew", pady=(0, 12))

        # Hotkey hint
        if self.config.hotkey.mode == "push_to_talk":
            hotkey_text = self.config.hotkey.push_to_talk_key.replace("+", " + ").upper()
            hint_text = f"Maintenez : {hotkey_text}"
        else:
            hotkey_text = self.config.hotkey.toggle_key.replace("+", " + ").upper()
            hint_text = f"Raccourci : {hotkey_text}"

        self.hotkey_label = ctk.CTkLabel(
            main_container,
            text=hint_text,
            font=ctk.CTkFont(size=12),
            text_color=self.colors['fg']
        )
        self.hotkey_label.grid(row=3, column=0, pady=(0, 8))

        # Language and Model selectors - MODERN CLEAN DESIGN
        controls_frame = ctk.CTkFrame(main_container, fg_color="transparent")
        controls_frame.grid(row=4, column=0, pady=(0, 12))
        controls_frame.grid_columnconfigure((0, 1), weight=1)

        # Language selector (left)
        lang_container = ctk.CTkFrame(controls_frame, fg_color="transparent")
        lang_container.grid(row=0, column=0, sticky="ew", padx=(0, 4))

        lang_label = ctk.CTkLabel(
            lang_container,
            text="Langue:",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color=self.colors['fg']
        )
        lang_label.pack(side="left", padx=(0, 6))

        # Get available languages
        quick_langs = getattr(self.config, 'quick_languages', ["fr", "en", "es", "de"])
        current_lang = self._get_initial_language()

        lang_names = {
            "fr": "Français",
            "en": "English",
            "es": "Español",
            "de": "Deutsch"
        }
        lang_values = [lang_names.get(lang, lang.upper()) for lang in quick_langs]
        current_name = lang_names.get(current_lang, current_lang.upper())

        self.language_dropdown = ctk.CTkOptionMenu(
            lang_container,
            values=lang_values,
            font=ctk.CTkFont(size=12),
            width=110,
            height=32,
            corner_radius=6,
            fg_color=self.colors['primary'],
            button_color=self.colors['primary_hover'],
            button_hover_color=self.colors['primary'],
            dropdown_fg_color=self.colors['card_bg'],
            dropdown_hover_color=self.colors['primary'],
            dropdown_text_color=self.colors['fg'],
            command=self._on_language_dropdown_changed_simple
        )
        self.language_dropdown.set(current_name)
        self.language_dropdown.pack(side="left")

        # Model selector (right)
        model_container = ctk.CTkFrame(controls_frame, fg_color="transparent")
        model_container.grid(row=0, column=1, sticky="ew", padx=(4, 0))

        model_label = ctk.CTkLabel(
            model_container,
            text="Modèle:",
            font=ctk.CTkFont(size=11, weight="bold"),
            text_color=self.colors['fg']
        )
        model_label.pack(side="left", padx=(0, 6))

        # Model dropdown
        current_provider = self.config.transcription_provider.value
        model_display = "Groq (cloud)" if current_provider == "groq_whisper" else "Local (CPU)"

        self.model_dropdown = ctk.CTkOptionMenu(
            model_container,
            values=["Groq (cloud)", "Local (CPU)"],
            font=ctk.CTkFont(size=12),
            width=110,
            height=32,
            corner_radius=6,
            fg_color=self.colors['accent'],
            button_color=self.colors['accent'],
            button_hover_color=self.colors['primary'],
            dropdown_fg_color=self.colors['card_bg'],
            dropdown_hover_color=self.colors['accent'],
            dropdown_text_color=self.colors['fg'],
            command=self._on_model_changed
        )
        self.model_dropdown.set(model_display)
        self.model_dropdown.pack(side="left")

        # Bottom buttons container - MODERN DESIGN
        buttons_container = ctk.CTkFrame(main_container, fg_color="transparent")
        buttons_container.grid(row=5, column=0, sticky="ew", pady=(12, 0))
        buttons_container.grid_columnconfigure((0, 1, 2), weight=1)

        # Historique
        history_btn = ctk.CTkButton(
            buttons_container,
            text="Historique",
            font=ctk.CTkFont(size=13, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['card_bg'],
            border_width=1,
            border_color=self.colors['border'],
            text_color=self.colors['fg'],
            hover_color=self.colors['hover_bg'],
            command=self._open_history
        )
        history_btn.grid(row=0, column=0, sticky="ew", padx=(0, 4))

        # Dictionnaire
        dict_btn = ctk.CTkButton(
            buttons_container,
            text="Dictionnaire",
            font=ctk.CTkFont(size=13, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['card_bg'],
            border_width=1,
            border_color=self.colors['border'],
            text_color=self.colors['fg'],
            hover_color=self.colors['hover_bg'],
            command=self._open_dictionary
        )
        dict_btn.grid(row=0, column=1, sticky="ew", padx=(2, 2))

        # Stats
        stats_btn = ctk.CTkButton(
            buttons_container,
            text="Statistiques",
            font=ctk.CTkFont(size=13, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['card_bg'],
            border_width=1,
            border_color=self.colors['border'],
            text_color=self.colors['fg'],
            hover_color=self.colors['hover_bg'],
            command=self._open_stats
        )
        stats_btn.grid(row=0, column=2, sticky="ew", padx=(4, 0))

    def _initialize_transcription_engine(self) -> bool:
        """
        Initialize transcription engine based on configuration.
        Returns True if successful, False otherwise.
        """
        provider = self.config.transcription_provider

        # Try Groq first if selected
        if provider == TranscriptionProvider.GROQ_WHISPER:
            logger.info("Attempting to initialize Groq Whisper provider...")

            # Check if Groq SDK is available
            if not GROQ_AVAILABLE:
                logger.warning("Groq SDK not installed. Fallback to WhisperX")
                return self._initialize_whisperx()

            # Check if API key is provided (config or environment)
            api_key = self.config.groq_whisper.api_key.strip()
            if not api_key:
                # Try loading from environment variable
                api_key = os.environ.get("GROQ_API_KEY", "").strip()
                if api_key:
                    logger.info("✅ Loaded Groq API key from environment variable")
                else:
                    logger.warning("Groq API key not provided (config or GROQ_API_KEY env). Fallback to WhisperX")
                    return self._initialize_whisperx()

            # Try initializing Groq provider
            try:
                self.transcription_engine = GroqWhisperProvider(
                    api_key=api_key,
                    model=self.config.groq_whisper.model.value,
                    language=self.config.groq_whisper.language,
                    response_format=self.config.groq_whisper.response_format,
                    temperature=self.config.groq_whisper.temperature
                )
                self.transcription_provider_name = "Groq Whisper"
                logger.success("✅ Groq Whisper provider initialized successfully")
                return True

            except Exception as e:
                logger.error(f"Failed to initialize Groq provider: {e}")
                logger.warning("Falling back to WhisperX local...")
                return self._initialize_whisperx()

        # WhisperX (default or fallback)
        else:
            return self._initialize_whisperx()

    def _initialize_whisperx(self) -> bool:
        """
        Initialize WhisperX engine (local).
        Returns True if successful, False otherwise.
        """
        try:
            logger.info("Initializing WhisperX local engine...")

            whisperx_config = {
                'model': self.config.whisperx.model.value,
                'language': self.config.whisperx.language,
                'device': self.config.whisperx.device,
                'compute_type': self.config.whisperx.compute_type.value,
                'batch_size': self.config.whisperx.batch_size
            }

            self.transcription_engine = WhisperXEngine(
                config=whisperx_config,
                models_dir=str(self.config.models_dir)
            )
            self.transcription_provider_name = "WhisperX Local"
            logger.success("✅ WhisperX engine initialized successfully")
            return True

        except Exception as e:
            logger.error(f"Failed to initialize WhisperX: {e}")
            return False

    def _initialize_components(self):
        """Initialize transcription engine and components in background."""
        try:
            logger.info("Initializing Hibiki components...")

            # Update status
            self.after(0, lambda: self.status_label.configure(
                text="Chargement du modèle..."
            ))

            # Initialize transcription engine (Groq or WhisperX)
            success = self._initialize_transcription_engine()

            if not success:
                raise Exception("Failed to initialize transcription engine")

            # Get model info for quality display
            model_info = self.transcription_engine.get_model_info()
            provider_display = self.transcription_provider_name
            device = model_info.get('device', 'unknown')

            # Determine quality based on provider and device
            if provider_display == "Groq Whisper":
                quality_text = f"⚡ {provider_display} (Cloud)"
                quality_color = self.colors['success']
            elif 'cuda' in device.lower():
                quality_text = f"✨ {provider_display} (GPU)"
                quality_color = self.colors['success']
            else:
                quality_text = f"⭐ {provider_display} (CPU)"
                quality_color = self.colors['warning']

            self.after(0, lambda: self.quality_label.configure(
                text=quality_text,
                text_color=quality_color
            ))

            # Initialize VAD processor (optional - continue without if it fails)
            try:
                self.vad_processor = VADProcessor(self.config.vad)
            except Exception as vad_error:
                logger.warning(f"VAD initialization failed: {vad_error} - continuing without VAD")
                self.vad_processor = None

            # Initialize text injector
            self.text_injector = TextInjector(self.config.text_injection)

            # Initialize audio capture (but don't start yet)
            self.audio_capture = AudioCapture(
                config=self.config.audio,
                callback=self._on_audio_chunk
            )

            # Initialize hotkey manager
            self.hotkey_manager = HotkeyManager(config=self.config.hotkey)

            # Register callbacks based on mode
            if self.config.hotkey.mode == "push_to_talk":
                # Push-to-talk: separate callbacks for press/release
                self.hotkey_manager.register_push_to_talk_callbacks(
                    start_callback=self._start_recording,
                    stop_callback=self._stop_recording
                )
                logger.info("Push-to-talk mode enabled")
            else:
                # Toggle mode: single callback
                self.hotkey_manager.register_toggle_callback(self._hotkey_callback)
                logger.info("Toggle mode enabled")

            self.hotkey_manager.start()

            # Initialization complete
            self.is_initializing = False

            # Update status based on mode
            mode_text = "push-to-talk" if self.config.hotkey.mode == "push_to_talk" else "toggle"
            self.after(0, lambda: self.status_label.configure(
                text=f"Prêt (mode {mode_text})"
            ))
            self.after(0, lambda: self.record_button.configure(
                state="normal" if self.config.hotkey.mode == "toggle" else "disabled",
                text_color="#FFFFFF"  # Force white text in all states
            ))

            logger.info("✅ Hibiki initialized successfully")

            # Create overlay window (always-on-top status display)
            try:
                # Get current language from active provider
                current_lang = self._get_current_language()

                self.overlay = OverlayWindow(
                    self,
                    position=self.config.overlay.position,
                    opacity=self.config.overlay.opacity,
                    current_language=current_lang,
                    quick_languages=self.config.quick_languages,
                    on_language_change=self._change_language_quick
                )
                self.overlay.update_status("🎙️ Prêt")
                logger.info(f"📺 Overlay window created (position={self.config.overlay.position}, opacity={self.config.overlay.opacity}, lang={current_lang})")
            except Exception as overlay_error:
                logger.warning(f"Could not create overlay window: {overlay_error}")
                self.overlay = None

        except Exception as e:
            logger.error(f"Failed to initialize Hibiki: {e}")
            self.after(0, lambda: self.status_label.configure(
                text=f"Erreur : {str(e)}"
            ))
            self.after(0, lambda: self.quality_label.configure(
                text="Vérifiez les logs",
                text_color=self.colors['error']
            ))

    def _get_current_language(self) -> str:
        """Get the current transcription language based on active provider."""
        provider = self.config.transcription_provider
        if provider == TranscriptionProvider.GROQ_WHISPER:
            return self.config.groq_whisper.language
        else:
            return self.config.whisperx.language

    def _change_language_quick(self, lang_code: str):
        """
        Change transcription language quickly without restart.

        Args:
            lang_code: Language code (e.g., "fr", "en", "es")
        """
        logger.info(f"🌐 Quick language change: {lang_code}")

        try:
            # Update config for all providers
            self.config.whisperx.language = lang_code
            self.config.groq_whisper.language = lang_code

            # Update transcription engine if it supports hot-reload
            if self.transcription_engine:
                if hasattr(self.transcription_engine, 'set_language'):
                    self.transcription_engine.set_language(lang_code)
                    logger.info(f"✅ Transcription engine language updated to: {lang_code}")
                elif hasattr(self.transcription_engine, 'language'):
                    self.transcription_engine.language = lang_code
                    logger.info(f"✅ Transcription engine language attribute updated to: {lang_code}")
                else:
                    logger.warning("Transcription engine does not support hot language change")

            # Update text formatter
            if hasattr(self, 'text_formatter'):
                self.text_formatter.update_language(lang_code)
                logger.info(f"✅ Text formatter language updated to: {lang_code}")

            # Update overlay (already done by callback, but ensure sync)
            if hasattr(self, 'overlay') and self.overlay:
                self.overlay.update_language(lang_code)

            # Update main window language dropdown if exists
            if hasattr(self, 'language_dropdown'):
                lang_display = self._get_language_display(lang_code)
                self.language_dropdown.set(lang_display)

            # Save config
            self.config.save()
            logger.success(f"✅ Language changed to: {lang_code}")

        except Exception as e:
            logger.error(f"Error changing language: {e}")

    def _get_language_display(self, lang_code: str) -> str:
        """Get display name for language code."""
        languages = {
            "fr": "Francais",
            "en": "English",
            "es": "Espanol",
            "de": "Deutsch",
            "it": "Italiano",
            "pt": "Portugues",
            "nl": "Nederlands",
            "pl": "Polski",
            "ru": "Russkiy",
        }
        return languages.get(lang_code, lang_code.upper())

    def _get_initial_language(self) -> str:
        """Get initial language from config (before engine is initialized)."""
        provider = self.config.transcription_provider
        if provider == TranscriptionProvider.GROQ_WHISPER:
            return self.config.groq_whisper.language
        else:
            return self.config.whisperx.language

    def _get_language_display_code(self, lang_code: str) -> str:
        """Get short display with flag for language code."""
        flags = {
            "fr": "FR",
            "en": "EN",
            "es": "ES",
            "de": "DE",
            "it": "IT",
            "pt": "PT",
            "nl": "NL",
            "pl": "PL",
            "ru": "RU",
            "zh": "ZH",
            "ja": "JA",
            "ko": "KO",
        }
        return flags.get(lang_code, lang_code.upper()[:2])

    def _get_language_code_from_display(self, display: str) -> str:
        """Get language code from display string."""
        code_map = {
            "FR": "fr",
            "EN": "en",
            "ES": "es",
            "DE": "de",
            "IT": "it",
            "PT": "pt",
            "NL": "nl",
            "PL": "pl",
            "RU": "ru",
            "ZH": "zh",
            "JA": "ja",
            "KO": "ko",
        }
        return code_map.get(display.upper(), display.lower())

    def _on_language_dropdown_changed(self, value: str):
        """Handle language dropdown selection in main window."""
        lang_code = self._get_language_code_from_display(value)
        logger.info(f"Language dropdown changed: {value} -> {lang_code}")
        self._change_language_quick(lang_code)

    def _on_language_changed(self, lang_code: str):
        """Handle language change from new flag dropdown component.

        Args:
            lang_code: Language code (e.g., "fr", "en", "es", "de")
        """
        logger.info(f"Language changed via flag dropdown: {lang_code}")
        self._change_language_quick(lang_code)

    def _on_language_dropdown_changed_simple(self, value: str):
        """Handle language dropdown selection (simple text-based).

        Args:
            value: Language name (e.g., "Français", "English")
        """
        # Map display name to language code
        name_to_code = {
            "Français": "fr",
            "English": "en",
            "Español": "es",
            "Deutsch": "de"
        }
        lang_code = name_to_code.get(value, "fr")
        logger.info(f"Language dropdown changed: {value} -> {lang_code}")
        self._change_language_quick(lang_code)

    def _on_model_changed(self, value: str):
        """Handle model dropdown selection.

        Args:
            value: Model display name (e.g., "Groq (cloud)", "Local (CPU)")
        """
        logger.info(f"Model selection changed: {value}")

        # Map display to provider
        if "Groq" in value:
            new_provider = TranscriptionProvider.GROQ_WHISPER
        else:
            new_provider = TranscriptionProvider.WHISPERX

        # Check if change needed
        if self.config.transcription_provider == new_provider:
            logger.info("Model already selected, no change needed")
            return

        # Update config
        self.config.transcription_provider = new_provider
        self.config.save()

        # Reinitialize engine
        logger.info(f"Switching to {new_provider.value}...")
        self.status_label.configure(text="Changement de modèle...")

        # Stop current engine
        if self.transcription_engine:
            logger.info("Stopping current engine...")
            self.transcription_engine = None

        # Reinitialize in background
        def reinit():
            success = self._initialize_transcription_engine()
            if success:
                self.after(0, lambda: self.status_label.configure(text="Prêt (mode toggle)"))
                logger.success(f"✅ Switched to {new_provider.value}")
            else:
                self.after(0, lambda: self.status_label.configure(text="Erreur changement modèle"))
                logger.error(f"Failed to switch to {new_provider.value}")

        threading.Thread(target=reinit, daemon=True).start()

    def _recreate_overlay(self):
        """Recreate overlay window with updated settings."""
        try:
            # Destroy old overlay if it exists
            if hasattr(self, 'overlay') and self.overlay:
                logger.info("🔄 Destroying old overlay window...")
                self.overlay.destroy()
                self.overlay = None

            # Get current language
            current_lang = self._get_current_language()

            # Create new overlay with current config
            logger.info(f"🔄 Creating new overlay (position={self.config.overlay.position}, opacity={self.config.overlay.opacity})")
            self.overlay = OverlayWindow(
                self,
                position=self.config.overlay.position,
                opacity=self.config.overlay.opacity,
                current_language=current_lang,
                quick_languages=self.config.quick_languages,
                on_language_change=self._change_language_quick
            )
            self.overlay.update_status("🎙️ Prêt")
            logger.success("✅ Overlay recreated successfully")

        except Exception as e:
            logger.error(f"Failed to recreate overlay: {e}")
            self.overlay = None

    def _toggle_recording(self):
        """Toggle recording state."""
        if self.is_recording:
            self._stop_recording()
        else:
            self._start_recording()

    def _start_recording(self):
        """Start recording."""
        if self.is_initializing or not self.audio_capture:
            return

        logger.info("Starting recording...")
        self.is_recording = True

        # Reset pending segments for new recording session
        self.pending_segments = []

        # Reset VAD processor to clear internal state
        if self.vad_processor:
            self.vad_processor.reset()
            logger.info("🔄 VAD processor reset for new recording")

        # Play start sound
        self.audio_feedback.play(FeedbackSound.START)

        # Update UI
        self.status_label.configure(text="Ecoute en cours...")
        self.record_button.configure(
            text="ARRETER",
            fg_color=self.colors['error'],
            text_color="#FFFFFF"
        )

        # Update overlay
        if hasattr(self, 'overlay') and self.overlay:
            self.overlay.update_status("🎤 Écoute en cours...", "#4CAF50")
            self.overlay.update_segments(0)

        # Start audio capture
        self.audio_capture.start()

    def _stop_recording(self):
        """Stop recording."""
        if not self.audio_capture:
            return

        logger.info("Stopping recording...")
        self.is_recording = False

        # Play stop sound
        self.audio_feedback.play(FeedbackSound.STOP)

        # Stop audio capture first
        self.audio_capture.stop()

        # Flush VAD to finalize any active speech segment
        if self.vad_processor:
            final_segment = self.vad_processor.flush()
            if final_segment:
                logger.info(f"🔄 Flushed final segment: {final_segment.duration:.2f}s")
                self.pending_segments.append(final_segment)

        # Process accumulated segments
        if self.pending_segments:
            # Update overlay to transcription state
            if hasattr(self, 'overlay') and self.overlay:
                self.overlay.update_status("✍️ Transcription...", "#FFC107")

            self._transcribe_accumulated_segments()
        else:
            logger.info("No segments to transcribe")

        # Update UI
        self.status_label.configure(text="Pret")
        self.record_button.configure(
            text="ENREGISTRER",
            fg_color=self.colors['primary'],
            text_color="#FFFFFF"
        )

        # Reset overlay
        if hasattr(self, 'overlay') and self.overlay:
            self.overlay.reset()

    def _transcribe_accumulated_segments(self):
        """Transcribe all accumulated segments as one continuous text."""
        if not self.pending_segments or not self.transcription_engine:
            return

        try:
            # Show transcription in progress
            self.status_label.configure(text="✍️ Transcription en cours...")

            # Merge all segments into one audio array
            import numpy as np
            merged_audio = np.concatenate([seg.audio_data for seg in self.pending_segments])
            total_duration = sum(seg.duration for seg in self.pending_segments)
            sample_rate = self.pending_segments[0].sample_rate

            logger.info(f"📝 Transcribing {len(self.pending_segments)} segments ({total_duration:.2f}s total)")

            # Transcribe merged audio
            result = self.transcription_engine.transcribe(
                audio_data=merged_audio,
                sample_rate=sample_rate
            )

            if result.text.strip():
                logger.info(f"Transcribed: {result.text} (processing time: {result.processing_time:.2f}s)")

                # Apply custom dictionary corrections
                corrected_text = self.custom_dictionary.apply_replacements(result.text)
                if corrected_text != result.text:
                    logger.info(f"📚 Dictionary applied: '{result.text}' → '{corrected_text}'")

                # Apply automatic text formatting (punctuation, spacing, capitalization, sentence breaks)
                formatted_text = self.text_formatter.format_text(
                    corrected_text,
                    auto_capitalize=True,
                    add_sentence_breaks=True
                )
                if formatted_text != corrected_text:
                    logger.info(f"📝 Formatting applied: '{corrected_text}' → '{formatted_text}'")

                # Save to history (with formatted text)
                try:
                    self.transcription_history.add_entry(
                        text=formatted_text,
                        confidence=result.confidence,
                        provider=result.provider,
                        duration=total_duration
                    )
                except Exception as e:
                    logger.warning(f"Failed to save transcription to history: {e}")

                # Inject text (formatted)
                if self.text_injector:
                    self.text_injector.inject_text(formatted_text)
                    # Play success sound after successful injection
                    self.audio_feedback.play(FeedbackSound.SUCCESS)

            # Clear accumulated segments
            self.pending_segments = []

        except Exception as e:
            logger.error(f"Transcription error: {e}")
            logger.exception(e)

    def _on_audio_chunk(self, chunk: AudioChunk):
        """Handle audio chunk from capture."""
        if not self.vad_processor or not self.transcription_engine:
            return

        # Calculate audio level for visual feedback
        if self.is_recording:
            import numpy as np
            audio_level = np.sqrt(np.mean(chunk.data ** 2))  # RMS level
            audio_level_normalized = min(1.0, audio_level * 3)  # Normalize and amplify

            # Update overlay audio level
            if hasattr(self, 'overlay') and self.overlay:
                self.overlay.update_audio_level(audio_level_normalized)

        # Process with VAD
        speech_segment = self.vad_processor.process_chunk(chunk)

        # Accumulate speech segments during recording
        if speech_segment and self.is_recording:
            logger.debug(f"📦 Segment accumulated: {speech_segment.duration:.2f}s (total: {len(self.pending_segments) + 1})")
            self.pending_segments.append(speech_segment)

            # Update UI to show accumulation
            self.after(0, lambda: self.status_label.configure(
                text=f"🎤 Segment {len(self.pending_segments)} capturé..."
            ))

            # Update overlay segment count
            if hasattr(self, 'overlay') and self.overlay:
                self.overlay.update_segments(len(self.pending_segments))

    def _hotkey_callback(self):
        """Hotkey pressed callback."""
        logger.info("Hotkey pressed")
        self.after(0, self._toggle_recording)

    def _check_for_updates(self):
        """Check for updates in background."""
        try:
            logger.info("Checking for updates...")
            update_info = self.updater.check_for_updates()

            if update_info:
                # Show update notification on main thread
                self.after(0, lambda: self._show_update_notification(update_info))

        except Exception as e:
            logger.error(f"Error checking for updates: {e}")

    def _show_update_notification(self, update_info: dict):
        """Show update notification dialog."""
        update_window = ctk.CTkToplevel(self)
        update_window.title("Mise à jour disponible")
        update_window.geometry("500x400")
        update_window.resizable(False, False)

        # Center window
        update_window.update_idletasks()
        width = update_window.winfo_width()
        height = update_window.winfo_height()
        x = (update_window.winfo_screenwidth() // 2) - (width // 2)
        y = (update_window.winfo_screenheight() // 2) - (height // 2)
        update_window.geometry(f'{width}x{height}+{x}+{y}')

        # Make it modal
        update_window.transient(self)
        update_window.grab_set()

        # Content frame
        content_frame = ctk.CTkFrame(update_window, fg_color="transparent")
        content_frame.pack(fill="both", expand=True, padx=20, pady=20)

        # Title
        title_label = ctk.CTkLabel(
            content_frame,
            text="🎉 Nouvelle version disponible !",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['primary']
        )
        title_label.pack(pady=(0, 16))

        # Version info
        version_frame = ctk.CTkFrame(content_frame, corner_radius=8)
        version_frame.pack(fill="x", pady=(0, 16))

        current_label = ctk.CTkLabel(
            version_frame,
            text=f"Version actuelle : {self.VERSION}",
            font=ctk.CTkFont(size=14)
        )
        current_label.pack(pady=8)

        new_label = ctk.CTkLabel(
            version_frame,
            text=f"Nouvelle version : {update_info['version']}",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['success']
        )
        new_label.pack(pady=8)

        # Release notes
        notes_label = ctk.CTkLabel(
            content_frame,
            text="Nouveautés :",
            font=ctk.CTkFont(size=14, weight="bold")
        )
        notes_label.pack(anchor="w", pady=(0, 8))

        notes_text = ctk.CTkTextbox(
            content_frame,
            height=150,
            font=ctk.CTkFont(size=12)
        )
        notes_text.pack(fill="both", expand=True, pady=(0, 16))
        notes_text.insert("1.0", update_info['release_notes'])
        notes_text.configure(state="disabled")

        # Buttons frame
        buttons_frame = ctk.CTkFrame(content_frame, fg_color="transparent")
        buttons_frame.pack(fill="x")

        def download_update():
            logger.info("User chose to download update")
            import webbrowser
            webbrowser.open(update_info['download_url'])
            update_window.destroy()

        def remind_later():
            logger.info("User chose to be reminded later")
            update_window.destroy()

        download_btn = ctk.CTkButton(
            buttons_frame,
            text="Télécharger maintenant",
            font=ctk.CTkFont(size=14, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['primary'],
            hover_color=self.colors['primary_hover'],
            command=download_update
        )
        download_btn.pack(side="left", expand=True, fill="x", padx=(0, 8))

        later_btn = ctk.CTkButton(
            buttons_frame,
            text="Plus tard",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['border'],
            text_color=self.colors['fg'],
            hover_color=self.colors['border'],
            command=remind_later
        )
        later_btn.pack(side="right", expand=True, fill="x", padx=(8, 0))

    def _open_settings(self):
        """Open settings dialog (general settings + hotkey configuration)."""
        logger.info("Settings button clicked - Opening general settings")

        def on_settings_save():
            """Callback when general settings are saved."""
            logger.info("General settings saved - overlay will be recreated")
            # Recreate overlay with new position/opacity settings
            self._recreate_overlay()

        def on_hotkey_config():
            """Callback to open hotkey configuration from settings."""
            self._open_hotkey_settings()

        # Open general settings window
        SettingsWindow(
            self,
            config=self.config,
            theme_mode=self.config.theme_mode,
            on_save=on_settings_save,
            on_hotkey_config=on_hotkey_config
        )

    def _open_hotkey_settings(self):
        """Open hotkey configuration window."""
        logger.info("Opening hotkey configuration")

        def on_save(mode, toggle_key, push_to_talk_key):
            """Callback when hotkey settings are saved."""
            logger.info(f"Saving new hotkey settings: mode={mode}, toggle={toggle_key}, ptt={push_to_talk_key}")

            # Update config
            self.config.hotkey.mode = mode
            self.config.hotkey.toggle_key = toggle_key
            self.config.hotkey.push_to_talk_key = push_to_talk_key

            # Add used hotkey to recent history
            if mode == "toggle":
                self.config.hotkey.add_to_recent(toggle_key)
            else:  # push_to_talk
                self.config.hotkey.add_to_recent(push_to_talk_key)

            # Save config to file
            self.config.save()

            # Restart hotkey manager with new settings
            if self.hotkey_manager:
                self.hotkey_manager.stop()

            self.hotkey_manager = HotkeyManager(config=self.config.hotkey)

            # Register callbacks based on new mode
            if mode == "push_to_talk":
                self.hotkey_manager.register_push_to_talk_callbacks(
                    start_callback=self._start_recording,
                    stop_callback=self._stop_recording
                )
                # Update UI
                self.record_button.configure(state="disabled", text_color="#FFFFFF")
                hotkey_text = push_to_talk_key.replace("+", " + ").upper()
                self.hotkey_label.configure(text=f"Maintenez : {hotkey_text}")
                self.status_label.configure(text="Prêt (mode push-to-talk)")
            else:
                self.hotkey_manager.register_toggle_callback(self._hotkey_callback)
                # Update UI
                self.record_button.configure(state="normal", text_color="#FFFFFF")
                hotkey_text = toggle_key.replace("+", " + ").upper()
                self.hotkey_label.configure(text=f"Raccourci : {hotkey_text}")
                self.status_label.configure(text="Prêt (mode toggle)")

            self.hotkey_manager.start()

            logger.success("✅ Hotkey settings updated successfully")

        # Open hotkey settings window
        HotkeySettingsWindow(
            self,
            current_toggle_key=self.config.hotkey.toggle_key,
            current_push_to_talk_key=self.config.hotkey.push_to_talk_key,
            current_mode=self.config.hotkey.mode,
            recent_hotkeys=self.config.hotkey.recent_hotkeys,
            on_save=on_save
        )

    def _open_history(self):
        """Open transcription history window."""
        try:
            logger.info("Opening transcription history window")

            # Callback to reinject text from history
            def reinject_callback(text: str):
                if self.text_injector:
                    logger.info(f"Reinjecting from history: {text[:50]}...")
                    self.text_injector.inject_text(text)
                else:
                    logger.warning("Text injector not available")

            # Open history window
            HistoryWindow(
                self,
                history=self.transcription_history,
                on_reinject=reinject_callback,
                theme_colors=self.colors
            )

        except Exception as e:
            logger.error(f"Failed to open history window: {e}")
            logger.exception(e)

    def _open_dictionary(self):
        """Open custom dictionary window."""
        try:
            logger.info("Opening custom dictionary window")

            # Open dictionary window
            DictionaryWindow(
                self,
                dictionary=self.custom_dictionary,
                theme_colors=self.colors
            )

        except Exception as e:
            logger.error(f"Failed to open dictionary window: {e}")
            logger.exception(e)

    def _open_logs(self):
        """Open logs viewer window with real-time tailing."""
        try:
            logs_dir = Path(__file__).parent.parent.parent / "logs"
            logger.info("Opening logs viewer window")

            # Open logs window
            LogsWindow(self, logs_dir)

        except Exception as e:
            logger.error(f"Failed to open logs window: {e}")

    def _open_stats(self):
        """Open statistics dashboard."""
        try:
            logger.info("Opening statistics dashboard")
            # Import here to avoid circular dependency
            from .stats_window import StatsWindow

            StatsWindow(
                self,
                history=self.transcription_history,
                theme_colors=self.colors
            )
        except Exception as e:
            logger.error(f"Failed to open stats window: {e}")

    def _toggle_theme(self):
        """Toggle between light and dark theme - applies instantly."""
        try:
            # Toggle theme mode
            current_mode = self.config.theme_mode
            new_mode = "dark" if current_mode == "light" else "light"

            # Update config
            self.config.theme_mode = new_mode

            # Apply theme to CTk (this updates most widgets automatically)
            ctk.set_appearance_mode(new_mode)

            # Update our custom colors
            self.colors = self._get_theme_colors()

            # Force window background color
            bg_color = self.colors['bg']
            self.configure(fg_color=bg_color)

            # Update theme toggle button symbol
            theme_text = "◐" if new_mode == "light" else "◑"
            self.theme_button.configure(
                text=theme_text,
                fg_color=self.colors['card_bg'],
                hover_color=self.colors['hover_bg'],
                text_color=self.colors['fg'],
                border_color=self.colors['border']
            )

            # Update all text labels
            self.status_label.configure(text_color=self.colors['fg'])
            self.quality_label.configure(text_color=self.colors['primary'])
            self.hotkey_label.configure(text_color=self.colors['fg'])

            # Update main record button
            if self.is_recording:
                self.record_button.configure(
                    fg_color=self.colors['error'],
                    text_color="#FFFFFF"
                )
            else:
                self.record_button.configure(
                    fg_color=self.colors['primary'],
                    text_color="#FFFFFF"
                )

            # Save config
            self.config.save()

            logger.info(f"Theme changed to: {new_mode}")

        except Exception as e:
            logger.error(f"Failed to toggle theme: {e}")

    def _on_closing(self):
        """Handle window closing - minimize to tray if enabled."""
        if self.system_tray and self.config.minimize_to_tray:
            logger.info("Minimizing to system tray...")
            self.withdraw()  # Hide window
            self.is_hidden = True
        else:
            self._quit_application()

    def _show_from_tray(self):
        """Show window from system tray."""
        logger.info("Showing window from system tray")
        self.deiconify()  # Show window
        self.lift()  # Bring to front
        self.focus_force()  # Give focus
        self.is_hidden = False

    def _quit_from_tray(self):
        """Quit application from system tray."""
        logger.info("Quitting from system tray")
        self._quit_application()

    def _quit_application(self):
        """Actually quit the application."""
        logger.info("Closing Hibiki...")

        # Stop recording if active
        if self.is_recording:
            self._stop_recording()

        # Cleanup overlay window first (critical - prevents orphaned windows)
        if hasattr(self, 'overlay') and self.overlay:
            try:
                self.overlay.destroy()
                logger.info("✅ Overlay window destroyed")
            except Exception as e:
                logger.warning(f"Failed to destroy overlay: {e}")

        # Cleanup other components
        if self.hotkey_manager:
            self.hotkey_manager.stop()

        if self.transcription_engine:
            self.transcription_engine.unload()

        if self.system_tray:
            self.system_tray.stop()

        self.destroy()

    def run(self):
        """Run the application."""
        logger.info("Starting Hibiki UI...")
        self.mainloop()
