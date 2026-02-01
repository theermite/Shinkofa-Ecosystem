"""Hibiki Qt6 Main Window - Modern UI with PySide6.

Migration from CustomTkinter to Qt6 for modern design capabilities.
Copyright (C) 2025 La Voie Shinkofa
"""
import sys
import threading
import time
from pathlib import Path
from typing import Optional, List

import numpy as np
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
    QPushButton, QLabel, QFrame, QComboBox, QApplication
)
from PySide6.QtCore import Qt, Signal, QTimer, Slot
from PySide6.QtGui import QIcon, QCloseEvent
from loguru import logger

from ..models.config import AppSettings, WhisperModel, TranscriptionProvider
from ..core.whisperx_engine import WhisperXEngine
from ..core.groq_whisper_provider import GroqWhisperProvider, GROQ_AVAILABLE
from ..core.audio_capture import AudioCapture, AudioChunk
from ..core.vad_processor import VADProcessor
from ..core.text_injector import TextInjector
from ..core.hotkey_manager import HotkeyManager
from ..utils.transcription_history import TranscriptionHistory
from ..utils.custom_dictionary import CustomDictionary
from ..utils.text_formatter import TextFormatter
from ..utils.audio_feedback import AudioFeedback, FeedbackSound
from .theme_qt import Qt6Theme

# Import Qt6 dialogs
from .settings_window_qt import SettingsWindowQt
from .history_window_qt import HistoryWindowQt
from .dictionary_window_qt import DictionaryWindowQt
from .stats_window_qt import StatsWindowQt
from .logs_window_qt import LogsWindowQt
from .overlay_window_qt import OverlayWindowQt
from .system_tray_qt import SystemTrayQt


class HibikiMainWindow(QMainWindow):
    """Hibiki Qt6 main window with modern UI."""

    # Qt Signals for thread-safe UI updates
    status_updated = Signal(str)
    recording_state_changed = Signal(bool)
    segment_detected = Signal(int)
    quality_updated = Signal(str)

    # Version
    VERSION = "1.0.0-qt6"

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
        self.pending_segments: List = []

        # History
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
            volume=0.3
        )

        # Text formatter
        detected_language = (
            config.groq_whisper.language
            if config.transcription_provider.value == "groq_whisper"
            else config.whisperx.language
        )
        self.text_formatter = TextFormatter(language=detected_language)
        logger.info(f"📝 Text formatter initialized: language={detected_language}")

        # Overlay window (optional)
        self.overlay: Optional[OverlayWindowQt] = None
        if getattr(config, 'show_overlay', False):
            try:
                self.overlay = OverlayWindowQt(theme_mode=config.theme_mode)
                self.overlay.show()
                logger.info("✅ Overlay window created")
            except Exception as e:
                logger.warning(f"Failed to create overlay: {e}")

        # System tray (optional)
        self.system_tray: Optional[SystemTrayQt] = None
        if config.minimize_to_tray:
            try:
                icon_path = Path(__file__).parent.parent.parent / "assets" / "icon.png"
                self.system_tray = SystemTrayQt(
                    parent=self,
                    on_show=self._show_from_tray,
                    on_quit=self._quit_from_tray,
                    icon_path=icon_path if icon_path.exists() else None
                )
                logger.info("✅ System tray enabled")
            except Exception as e:
                logger.warning(f"Failed to initialize system tray: {e}")

        # Connect signals
        self.status_updated.connect(self._update_status_label)
        self.recording_state_changed.connect(self._update_recording_ui)
        self.segment_detected.connect(self._update_segment_count)
        self.quality_updated.connect(self._update_quality_label)

        # Setup UI
        self._setup_window()
        self._create_ui()

        # Apply theme AFTER all widgets are created (inline styles + QSS for dialogs)
        self._apply_theme()

        # Reposition absolute buttons after window is shown
        QTimer.singleShot(0, self._refresh_button_positions)

        # Initialize backend in background
        QTimer.singleShot(100, self._initialize_components_threaded)

    def _setup_window(self):
        """Setup main window properties."""
        self.setWindowTitle("🎙️ Hibiki - Dictée Vocale (Qt6)")

        # Window size
        width, height = 500, 650
        screen = QApplication.primaryScreen().geometry()
        x = (screen.width() - width) // 2
        y = (screen.height() - height) // 2
        self.setGeometry(x, y, width, height)
        self.setMinimumSize(480, 600)

        # Window icon
        try:
            icon_path = Path(__file__).parent.parent.parent / "assets" / "icon.png"
            if icon_path.exists():
                self.setWindowIcon(QIcon(str(icon_path)))
        except Exception as e:
            logger.warning(f"Failed to set window icon: {e}")

    def _create_ui(self):
        """Create UI components."""
        # Central widget
        central = QWidget()
        self.setCentralWidget(central)

        # Store reference for later style application
        self.central_widget = central

        # Main layout with padding
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(24, 24, 24, 24)
        main_layout.setSpacing(20)
        central.setLayout(main_layout)

        # === HEADER BUTTONS (Absolute positioned) ===
        # Settings button (top-left)
        self.settings_button = QPushButton("⚙")
        self.settings_button.setObjectName("iconButton")
        self.settings_button.setFixedSize(40, 40)
        self.settings_button.clicked.connect(self._open_settings)
        self.settings_button.setParent(central)
        self.settings_button.move(8, 8)
        self.settings_button.raise_()
        self.settings_button.show()

        # Theme toggle button (top-right)
        theme_text = "◐" if self.config.theme_mode == "light" else "◑"
        self.theme_button = QPushButton(theme_text)
        self.theme_button.setObjectName("iconButton")
        self.theme_button.setFixedSize(40, 40)
        self.theme_button.clicked.connect(self._toggle_theme)
        self.theme_button.setParent(central)
        self.theme_button.move(self.width() - 72, 32)
        self.theme_button.raise_()
        self.theme_button.show()

        # Logs button (bottom-right)
        self.logs_button = QPushButton("▤")
        self.logs_button.setObjectName("iconButton")
        self.logs_button.setFixedSize(40, 40)
        self.logs_button.clicked.connect(self._open_logs)
        self.logs_button.setParent(central)
        self.logs_button.move(self.width() - 72, self.height() - 72)
        self.logs_button.raise_()
        self.logs_button.show()

        # === TITLE ===
        self.title_label = QLabel("Hibiki")
        self.title_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(self.title_label)

        # === STATUS CARD ===
        self.status_frame = QFrame()
        status_layout = QVBoxLayout()
        status_layout.setSpacing(8)

        self.status_label = QLabel("Initialisation...")
        self.status_label.setAlignment(Qt.AlignCenter)
        self.status_label.setWordWrap(True)
        status_layout.addWidget(self.status_label)

        self.quality_label = QLabel("")
        self.quality_label.setAlignment(Qt.AlignCenter)
        status_layout.addWidget(self.quality_label)

        self.status_frame.setLayout(status_layout)
        main_layout.addWidget(self.status_frame)

        # === RECORD BUTTON ===
        self.record_button = QPushButton("ENREGISTRER")
        self.record_button.setMinimumHeight(56)
        self.record_button.setEnabled(False)
        self.record_button.clicked.connect(self._toggle_recording)
        main_layout.addWidget(self.record_button)

        # === HOTKEY HINT ===
        hotkey_text = (
            self.config.hotkey.push_to_talk_key
            if self.config.hotkey.mode == "push_to_talk"
            else self.config.hotkey.toggle_key
        )
        self.hotkey_label = QLabel(f"Raccourci : {hotkey_text.upper()}")
        self.hotkey_label.setAlignment(Qt.AlignCenter)
        main_layout.addWidget(self.hotkey_label)

        # === LANGUAGE & MODEL SELECTORS ===
        controls_layout = QHBoxLayout()
        controls_layout.setSpacing(16)

        # Language selector
        lang_container = QVBoxLayout()
        self.lang_label = QLabel("Langue")
        self.language_combo = QComboBox()
        self.language_combo.addItems(["Français", "English", "Español", "Deutsch", "Italiano"])
        self.language_combo.currentTextChanged.connect(self._on_language_changed)
        lang_container.addWidget(self.lang_label)
        lang_container.addWidget(self.language_combo)

        # Model selector
        model_container = QVBoxLayout()
        self.model_label = QLabel("Modèle")
        self.model_combo = QComboBox()
        if GROQ_AVAILABLE:
            self.model_combo.addItems(["Groq (cloud)", "Local (CPU)"])
        else:
            self.model_combo.addItems(["Local (CPU)"])
        self.model_combo.currentTextChanged.connect(self._on_model_changed)
        model_container.addWidget(self.model_label)
        model_container.addWidget(self.model_combo)

        controls_layout.addLayout(lang_container)
        controls_layout.addLayout(model_container)
        main_layout.addLayout(controls_layout)

        # === BOTTOM BUTTONS ===
        buttons_layout = QHBoxLayout()
        buttons_layout.setSpacing(12)

        self.history_btn = QPushButton("Historique")
        self.history_btn.clicked.connect(self._open_history)
        buttons_layout.addWidget(self.history_btn)

        self.dict_btn = QPushButton("Dictionnaire")
        self.dict_btn.clicked.connect(self._open_dictionary)
        buttons_layout.addWidget(self.dict_btn)

        self.stats_btn = QPushButton("Statistiques")
        self.stats_btn.clicked.connect(self._open_stats)
        buttons_layout.addWidget(self.stats_btn)

        main_layout.addLayout(buttons_layout)

        # Spacer
        main_layout.addStretch()

    def _apply_theme(self):
        """Apply theme with inline styles (main window) and QSS (dialogs)."""
        mode = self.config.theme_mode

        # Apply QSS globally for dialogs (Settings, History, etc.)
        qss = Qt6Theme.get_stylesheet(mode)
        app = QApplication.instance()
        if app:
            app.setStyleSheet(qss)
            logger.info(f"QSS applied globally for dialogs: {mode} mode ({len(qss)} chars)")

        # Apply inline styles to all main window widgets
        self._apply_all_inline_styles(mode)
        logger.info(f"Inline styles applied to main window: {mode} mode")

    def _apply_all_inline_styles(self, mode: str):
        """Apply inline styles to ALL main window widgets systematically.

        This ensures all widgets have explicit styles that work regardless of QSS cascade.
        Supports both light and dark modes.
        """
        # Main window background
        self.setStyleSheet(Qt6Theme.get_main_window_style(mode))

        # Central widget background
        if hasattr(self, 'central_widget'):
            self.central_widget.setStyleSheet(Qt6Theme.get_central_widget_style(mode))

        # Icon buttons (absolute positioned)
        icon_style = Qt6Theme.get_icon_button_style(mode)
        if hasattr(self, 'settings_button'):
            self.settings_button.setStyleSheet(icon_style)
        if hasattr(self, 'theme_button'):
            self.theme_button.setStyleSheet(icon_style)
        if hasattr(self, 'logs_button'):
            self.logs_button.setStyleSheet(icon_style)

        # Title label
        if hasattr(self, 'title_label'):
            self.title_label.setStyleSheet(Qt6Theme.get_title_label_style(mode))

        # Status card and labels
        if hasattr(self, 'status_frame'):
            self.status_frame.setStyleSheet(Qt6Theme.get_status_card_style(mode))
        if hasattr(self, 'status_label'):
            self.status_label.setStyleSheet(Qt6Theme.get_status_label_style(mode))
        if hasattr(self, 'quality_label'):
            self.quality_label.setStyleSheet(Qt6Theme.get_quality_label_style(mode))

        # Record button (changes based on recording state)
        if hasattr(self, 'record_button'):
            is_recording = self.is_recording if hasattr(self, 'is_recording') else False
            self.record_button.setStyleSheet(Qt6Theme.get_record_button_style(mode, is_recording))

        # Hint labels
        hint_style = Qt6Theme.get_hint_label_style(mode)
        if hasattr(self, 'hotkey_label'):
            self.hotkey_label.setStyleSheet(hint_style)
        if hasattr(self, 'lang_label'):
            self.lang_label.setStyleSheet(hint_style)
        if hasattr(self, 'model_label'):
            self.model_label.setStyleSheet(hint_style)

        # ComboBoxes
        combobox_style = Qt6Theme.get_combobox_style(mode)
        if hasattr(self, 'language_combo'):
            self.language_combo.setStyleSheet(combobox_style)
        if hasattr(self, 'model_combo'):
            self.model_combo.setStyleSheet(combobox_style)

        # Bottom buttons (secondary style)
        secondary_style = Qt6Theme.get_secondary_button_style(mode)
        if hasattr(self, 'history_btn'):
            self.history_btn.setStyleSheet(secondary_style)
        if hasattr(self, 'dict_btn'):
            self.dict_btn.setStyleSheet(secondary_style)
        if hasattr(self, 'stats_btn'):
            self.stats_btn.setStyleSheet(secondary_style)

        # Force repaint
        self.update()

    def _refresh_button_positions(self):
        """Refresh absolute button positions and visibility."""
        # Reposition buttons
        self.theme_button.move(self.width() - 72, 32)
        self.logs_button.move(self.width() - 72, self.height() - 72)

        # Make sure they're visible
        self.settings_button.show()
        self.settings_button.raise_()
        self.theme_button.show()
        self.theme_button.raise_()
        self.logs_button.show()
        self.logs_button.raise_()

        # Force repaint
        self.settings_button.repaint()
        self.theme_button.repaint()
        self.logs_button.repaint()

        logger.info(f"Buttons repositioned: Settings@(8,8), Theme@({self.width()-72},32), Logs@({self.width()-72},{self.height()-72})")

    def _initialize_components_threaded(self):
        """Initialize backend components in background thread."""
        threading.Thread(target=self._initialize_components, daemon=True).start()

    def _initialize_components(self):
        """Initialize transcription engine and audio components."""
        try:
            logger.info("Initializing backend components...")
            self.status_updated.emit("Chargement du modèle...")

            # Initialize transcription engine
            if self.config.transcription_provider == TranscriptionProvider.GROQ_WHISPER and GROQ_AVAILABLE:
                logger.info("Initializing Groq Whisper provider...")
                self.transcription_engine = GroqWhisperProvider(self.config.groq_whisper)
                self.transcription_provider_name = "Groq Whisper (cloud)"
            else:
                logger.info("Initializing WhisperX engine (local)...")
                whisperx_config = {
                    'model': self.config.whisperx.model.value,
                    'language': self.config.whisperx.language,
                    'device': self.config.whisperx.device,
                    'compute_type': self.config.whisperx.compute_type,
                    'batch_size': self.config.whisperx.batch_size
                }
                self.transcription_engine = WhisperXEngine(
                    config=whisperx_config,
                    models_dir=str(self.config.models_dir)
                )
                # Model is automatically loaded in __init__
                self.transcription_provider_name = "WhisperX (local)"

            # Initialize VAD
            logger.info("Initializing VAD processor...")
            self.vad_processor = VADProcessor(self.config.vad)

            # Initialize audio capture
            logger.info("Initializing audio capture...")
            self.audio_capture = AudioCapture(
                config=self.config.audio,
                callback=self._on_audio_chunk
            )

            # Initialize text injector
            self.text_injector = TextInjector(self.config.text_injection)

            # Initialize hotkeys
            logger.info("Initializing hotkeys...")
            self.hotkey_manager = HotkeyManager(config=self.config.hotkey)
            if self.config.hotkey.mode == "push_to_talk":
                self.hotkey_manager.register_push_to_talk_callbacks(
                    start_callback=self._start_recording,
                    stop_callback=self._stop_recording
                )
            else:
                self.hotkey_manager.register_toggle_callback(self._hotkey_callback)
            self.hotkey_manager.start()

            self.is_initializing = False
            self.status_updated.emit("Prêt")
            self.quality_updated.emit(f"📡 {self.transcription_provider_name}")

            # Enable record button directly (we're already emitting signals, so Qt thread-safety is handled)
            self.record_button.setEnabled(True)
            logger.info("Record button enabled")

            logger.success("✅ Qt6 backend initialized successfully")

        except Exception as e:
            logger.error(f"Backend initialization failed: {e}")
            import traceback
            traceback.print_exc()
            self.status_updated.emit(f"Erreur : {str(e)[:50]}")

    @Slot(str)
    def _update_status_label(self, text: str):
        """Update status label (thread-safe)."""
        self.status_label.setText(text)

    @Slot(str)
    def _update_quality_label(self, text: str):
        """Update quality label (thread-safe)."""
        self.quality_label.setText(text)

    @Slot(bool)
    def _update_recording_ui(self, is_recording: bool):
        """Update recording UI state (thread-safe)."""
        if is_recording:
            self.record_button.setText("ARRÊTER")
            # Apply red style when recording
            self.record_button.setStyleSheet(Qt6Theme.get_record_button_style(self.config.theme_mode, is_recording=True))
        else:
            self.record_button.setText("ENREGISTRER")
            # Apply orange style when not recording
            self.record_button.setStyleSheet(Qt6Theme.get_record_button_style(self.config.theme_mode, is_recording=False))

    @Slot(int)
    def _update_segment_count(self, count: int):
        """Update segment count display (thread-safe)."""
        self.status_label.setText(f"🎤 Segment {count} capturé")

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

        logger.info("Starting recording (Qt6)...")
        self.is_recording = True
        self.pending_segments = []

        # Reset VAD
        if self.vad_processor:
            self.vad_processor.reset()
            logger.info("🔄 VAD processor reset")

        # Audio feedback
        self.audio_feedback.play(FeedbackSound.START)

        # Update UI
        self.status_updated.emit("Écoute en cours...")
        self.recording_state_changed.emit(True)

        # Update overlay
        if self.overlay:
            self.overlay.update_status("🎤 Écoute en cours...", "#10B981")
            self.overlay.update_segments(0)

        # Start capture
        self.audio_capture.start()

    def _stop_recording(self):
        """Stop recording."""
        if not self.audio_capture:
            return

        logger.info("Stopping recording (Qt6)...")
        self.is_recording = False

        # Audio feedback
        self.audio_feedback.play(FeedbackSound.STOP)

        # Stop capture
        self.audio_capture.stop()

        # Flush VAD
        if self.vad_processor:
            final_segment = self.vad_processor.flush()
            if final_segment:
                logger.info(f"🔄 Flushed final segment: {final_segment.duration:.2f}s")
                self.pending_segments.append(final_segment)

        # Transcribe
        if self.pending_segments:
            self.status_updated.emit("✍️ Transcription en cours...")
            if self.overlay:
                self.overlay.update_status("✍️ Transcription...", "#FFC107")
            threading.Thread(target=self._transcribe_accumulated_segments, daemon=True).start()
        else:
            logger.info("No segments to transcribe")
            self.status_updated.emit("Prêt")
            self.recording_state_changed.emit(False)
            if self.overlay:
                self.overlay.reset()

    def _on_audio_chunk(self, chunk: AudioChunk):
        """Handle audio chunk from capture."""
        if self.vad_processor and self.is_recording:
            segment = self.vad_processor.process_chunk(chunk)
            if segment:
                self.pending_segments.append(segment)
                logger.info(f"✅ Speech segment: {segment.duration:.2f}s")
                self.segment_detected.emit(len(self.pending_segments))
                if self.overlay:
                    self.overlay.update_segments(len(self.pending_segments))

    def _transcribe_accumulated_segments(self):
        """Transcribe all accumulated segments."""
        if not self.pending_segments or not self.transcription_engine:
            self.status_updated.emit("Prêt")
            self.recording_state_changed.emit(False)
            return

        try:
            # Merge audio segments
            merged_audio = np.concatenate([seg.audio_data for seg in self.pending_segments])
            total_duration = sum(seg.duration for seg in self.pending_segments)
            sample_rate = self.pending_segments[0].sample_rate

            logger.info(f"📝 Transcribing {len(self.pending_segments)} segments ({total_duration:.2f}s)")

            # Transcribe
            result = self.transcription_engine.transcribe(
                audio_data=merged_audio,
                sample_rate=sample_rate
            )

            if result.text.strip():
                logger.info(f"Transcribed: {result.text}")

                # Apply dictionary
                corrected_text = self.custom_dictionary.apply_replacements(result.text)
                if corrected_text != result.text:
                    logger.info(f"📚 Dictionary applied: '{result.text}' → '{corrected_text}'")

                # Apply formatting
                formatted_text = self.text_formatter.format_text(
                    corrected_text,
                    auto_capitalize=True,
                    auto_punctuation=True,
                    add_spacing=True
                )

                # Inject text
                if self.text_injector:
                    self.text_injector.inject_text(formatted_text)
                    logger.info(f"✅ Text injected: {formatted_text}")

                # Save to history
                self.transcription_history.add_entry(
                    original_text=result.text,
                    formatted_text=formatted_text,
                    language=result.language,
                    duration=total_duration,
                    provider=self.transcription_provider_name
                )

                self.status_updated.emit("✅ Transcription terminée")
            else:
                logger.info("Empty transcription result")
                self.status_updated.emit("Aucun texte détecté")

        except Exception as e:
            logger.error(f"Transcription error: {e}")
            import traceback
            traceback.print_exc()
            self.status_updated.emit("❌ Erreur transcription")

        finally:
            # Reset UI
            QTimer.singleShot(1500, lambda: self.status_updated.emit("Prêt"))
            self.recording_state_changed.emit(False)
            if self.overlay:
                QTimer.singleShot(1500, lambda: self.overlay.reset())

    def _hotkey_callback(self):
        """Hotkey pressed (toggle mode)."""
        self._toggle_recording()

    def _on_language_changed(self, lang_name: str):
        """Handle language change."""
        lang_map = {
            "Français": "fr",
            "English": "en",
            "Español": "es",
            "Deutsch": "de",
            "Italiano": "it"
        }
        lang_code = lang_map.get(lang_name, "fr")
        logger.info(f"Language changed: {lang_code}")
        # TODO: Reinitialize engine with new language

    def _on_model_changed(self, model_name: str):
        """Handle model change."""
        logger.info(f"Model changed: {model_name}")
        # TODO: Reinitialize engine with new model

    def _toggle_theme(self):
        """Toggle theme mode and reapply all styles."""
        new_mode = "light" if self.config.theme_mode == "dark" else "dark"
        self.config.theme_mode = new_mode
        self.config.save()

        # Update theme button icon
        theme_text = "◐" if new_mode == "light" else "◑"
        self.theme_button.setText(theme_text)

        # Reapply ALL styles with new theme
        self._apply_theme()

        # Update overlay theme if exists
        if self.overlay:
            self.overlay.set_theme(new_mode)

        logger.info(f"Theme toggled to {new_mode} - all styles reapplied")

    def _open_settings(self):
        """Open settings window."""
        try:
            dialog = SettingsWindowQt(
                parent=self,
                config=self.config,
                on_settings_changed=self._on_settings_changed,
                on_device_changed=self._on_device_changed
            )
            dialog.exec()
        except Exception as e:
            logger.error(f"Failed to open settings window: {e}")

    def _open_history(self):
        """Open history window."""
        try:
            dialog = HistoryWindowQt(
                parent=self,
                transcription_history=self.transcription_history
            )
            dialog.show()
        except Exception as e:
            logger.error(f"Failed to open history window: {e}")

    def _open_dictionary(self):
        """Open dictionary window."""
        try:
            dialog = DictionaryWindowQt(
                parent=self,
                custom_dictionary=self.custom_dictionary
            )
            dialog.show()
        except Exception as e:
            logger.error(f"Failed to open dictionary window: {e}")

    def _open_stats(self):
        """Open stats window."""
        try:
            dialog = StatsWindowQt(
                parent=self,
                transcription_history=self.transcription_history
            )
            dialog.show()
        except Exception as e:
            logger.error(f"Failed to open stats window: {e}")

    def _open_logs(self):
        """Open logs window."""
        try:
            dialog = LogsWindowQt(parent=self, theme_mode=self.config.theme_mode)
            dialog.show()
        except Exception as e:
            logger.error(f"Failed to open logs window: {e}")

    def _on_settings_changed(self):
        """Handle settings changed callback."""
        logger.info("Settings changed - reload config")
        # Reload config and apply theme
        self.config = AppSettings.load()
        self._apply_theme()

    def _on_device_changed(self):
        """Handle device changed callback."""
        logger.info("Device changed - reinitialize engine")
        # TODO: Reinitialize transcription engine

    def _show_from_tray(self):
        """Show window from system tray."""
        self.show()
        self.activateWindow()
        # Restore overlay if it was hidden
        if self.overlay and self.config.show_overlay:
            self.overlay.show()
        logger.info("Window shown from tray")

    def _quit_from_tray(self):
        """Quit application from system tray."""
        logger.info("Quit from system tray")
        self._force_quit = True
        self.close()

    def resizeEvent(self, event):
        """Handle window resize (reposition absolute buttons)."""
        super().resizeEvent(event)
        # Reposition logs button (bottom-right)
        self.logs_button.move(self.width() - 72, self.height() - 72)
        # Reposition theme button (top-right)
        self.theme_button.move(self.width() - 72, 32)

    def closeEvent(self, event: QCloseEvent):
        """Handle window close."""
        from PySide6.QtWidgets import QMessageBox

        logger.info("Closing Qt6 window...")

        # If system tray is enabled, ask user what to do
        if self.config.minimize_to_tray and self.system_tray and not hasattr(self, '_force_quit'):
            # Create custom dialog with proper button labels
            msg_box = QMessageBox(self)
            msg_box.setWindowTitle("Fermer Hibiki")
            msg_box.setText("Que voulez-vous faire ?")
            msg_box.setIcon(QMessageBox.Question)

            # Custom buttons with clear labels
            minimize_btn = msg_box.addButton("Minimiser", QMessageBox.ActionRole)
            quit_btn = msg_box.addButton("Quitter", QMessageBox.DestructiveRole)
            msg_box.setDefaultButton(minimize_btn)

            msg_box.exec()
            clicked_button = msg_box.clickedButton()

            if clicked_button == minimize_btn:
                # Minimize to tray
                logger.info("Minimizing to system tray...")
                self.hide()
                # Hide overlay when minimizing
                if self.overlay:
                    self.overlay.hide()
                if self.system_tray:
                    self.system_tray.show_message(
                        "Hibiki",
                        "Application minimisée dans la barre système",
                        duration=2000
                    )
                event.ignore()
                return

        # Full quit
        logger.info("Quitting application...")
        self._force_quit = True

        # Stop hotkeys
        if self.hotkey_manager:
            self.hotkey_manager.stop()

        # Stop recording
        if self.is_recording and self.audio_capture:
            self.audio_capture.stop()

        # Unload engine
        if self.transcription_engine:
            if isinstance(self.transcription_engine, WhisperXEngine):
                self.transcription_engine.unload()

        # Close and destroy overlay
        if self.overlay:
            self.overlay.hide()
            self.overlay.close()
            self.overlay.deleteLater()
            self.overlay = None
            logger.info("Overlay destroyed")

        # Hide and destroy system tray
        if self.system_tray:
            self.system_tray.hide()
            self.system_tray.tray_icon.deleteLater()
            self.system_tray = None
            logger.info("System tray destroyed")

        event.accept()
        QApplication.instance().quit()
