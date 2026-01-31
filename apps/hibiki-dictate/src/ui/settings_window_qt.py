"""Settings Window Qt6 - Modern configuration interface.

Copyright (C) 2025 La Voie Shinkofa
"""
from typing import Callable, Optional
import torch
from pathlib import Path

from PySide6.QtWidgets import (
    QDialog, QTabWidget, QVBoxLayout, QHBoxLayout, QFormLayout,
    QLabel, QComboBox, QCheckBox, QSpinBox, QDoubleSpinBox,
    QPushButton, QWidget, QGroupBox, QScrollArea
)
from PySide6.QtCore import Qt
from loguru import logger

from ..utils.windows_startup import (
    is_startup_enabled,
    sync_startup_setting,
    is_available as is_startup_available
)


class SettingsWindowQt(QDialog):
    """Settings dialog with tabs for different configuration sections."""

    def __init__(
        self,
        parent,
        config,
        on_settings_changed: Optional[Callable] = None,
        on_device_changed: Optional[Callable] = None
    ):
        super().__init__(parent)
        self.config = config
        self.on_settings_changed = on_settings_changed
        self.on_device_changed = on_device_changed

        self._setup_window()
        self._create_ui()

    def _setup_window(self):
        """Setup window properties."""
        self.setWindowTitle("⚙️ Paramètres")
        self.setMinimumSize(800, 650)
        self.resize(850, 700)  # Default size
        self.setModal(True)

    def _create_ui(self):
        """Create UI components."""
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(16)

        # Title
        title = QLabel("Paramètres")
        title.setObjectName("title")
        title.setAlignment(Qt.AlignCenter)
        layout.addWidget(title)

        # Tab widget
        self.tabs = QTabWidget()
        self.tabs.addTab(self._create_audio_tab(), "🎤 Audio")
        self.tabs.addTab(self._create_transcription_tab(), "✍️ Transcription")
        self.tabs.addTab(self._create_vad_tab(), "🔊 Détection Vocale")
        self.tabs.addTab(self._create_behavior_tab(), "⚙️ Comportement")
        self.tabs.addTab(self._create_advanced_tab(), "🔧 Avancé")
        layout.addWidget(self.tabs)

        # Buttons
        buttons_layout = QHBoxLayout()
        buttons_layout.addStretch()

        save_btn = QPushButton("💾 Sauvegarder")
        save_btn.clicked.connect(self._save_settings)
        buttons_layout.addWidget(save_btn)

        cancel_btn = QPushButton("Annuler")
        cancel_btn.setObjectName("secondaryButton")
        cancel_btn.clicked.connect(self.reject)
        buttons_layout.addWidget(cancel_btn)

        layout.addLayout(buttons_layout)
        self.setLayout(layout)

    def _create_audio_tab(self) -> QWidget:
        """Create audio settings tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(16)

        # Audio capture settings
        capture_group = QGroupBox("Capture Audio")
        capture_layout = QFormLayout()

        # Sample rate
        self.sample_rate_combo = QComboBox()
        self.sample_rate_combo.addItems(["8000", "16000", "22050", "44100", "48000"])
        self.sample_rate_combo.setCurrentText(str(self.config.audio.sample_rate))
        self._add_tooltip(self.sample_rate_combo, "Fréquence d'échantillonnage (16000 Hz recommandé)")
        capture_layout.addRow("Sample Rate (Hz):", self.sample_rate_combo)

        # Chunk duration
        self.chunk_duration_spin = QSpinBox()
        self.chunk_duration_spin.setRange(10, 100)
        self.chunk_duration_spin.setValue(self.config.audio.chunk_duration_ms)
        self.chunk_duration_spin.setSuffix(" ms")
        self._add_tooltip(self.chunk_duration_spin, "Durée de chaque chunk audio (30ms recommandé)")
        capture_layout.addRow("Chunk Duration:", self.chunk_duration_spin)

        capture_group.setLayout(capture_layout)
        layout.addWidget(capture_group)

        # Audio feedback
        feedback_group = QGroupBox("Retour Audio")
        feedback_layout = QVBoxLayout()

        self.audio_feedback_check = QCheckBox("Activer les sons de feedback")
        self.audio_feedback_check.setChecked(self.config.audio_feedback_enabled)
        self._add_tooltip(self.audio_feedback_check, "Sons lors du démarrage/arrêt de l'enregistrement")
        feedback_layout.addWidget(self.audio_feedback_check)

        feedback_group.setLayout(feedback_layout)
        layout.addWidget(feedback_group)

        layout.addStretch()
        widget.setLayout(layout)
        return widget

    def _create_transcription_tab(self) -> QWidget:
        """Create transcription settings tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(16)

        # Provider selection
        provider_group = QGroupBox("Fournisseur de Transcription")
        provider_layout = QFormLayout()

        self.provider_combo = QComboBox()
        self.provider_combo.addItems(["WhisperX (Local)", "Groq Whisper (Cloud)"])
        current_provider = "Groq Whisper (Cloud)" if self.config.transcription_provider.value == "groq_whisper" else "WhisperX (Local)"
        self.provider_combo.setCurrentText(current_provider)
        self.provider_combo.currentTextChanged.connect(self._on_provider_changed)
        provider_layout.addRow("Provider:", self.provider_combo)

        provider_group.setLayout(provider_layout)
        layout.addWidget(provider_group)

        # WhisperX settings
        self.whisperx_group = QGroupBox("WhisperX (Local)")
        whisperx_layout = QFormLayout()

        self.whisperx_model_combo = QComboBox()
        self.whisperx_model_combo.addItems([
            "tiny", "base", "small", "medium", "large-v2", "large-v3"
        ])
        self.whisperx_model_combo.setCurrentText(self.config.whisperx.model.value)
        whisperx_layout.addRow("Modèle:", self.whisperx_model_combo)

        self.whisperx_device_combo = QComboBox()
        self.whisperx_device_combo.addItems(["cpu", "cuda"])
        self.whisperx_device_combo.setCurrentText(self.config.whisperx.device)
        whisperx_layout.addRow("Device:", self.whisperx_device_combo)

        self.whisperx_compute_combo = QComboBox()
        self.whisperx_compute_combo.addItems(["int8", "float16", "float32"])
        self.whisperx_compute_combo.setCurrentText(self.config.whisperx.compute_type)
        whisperx_layout.addRow("Compute Type:", self.whisperx_compute_combo)

        self.whisperx_batch_spin = QSpinBox()
        self.whisperx_batch_spin.setRange(1, 32)
        self.whisperx_batch_spin.setValue(self.config.whisperx.batch_size)
        whisperx_layout.addRow("Batch Size:", self.whisperx_batch_spin)

        self.whisperx_group.setLayout(whisperx_layout)
        layout.addWidget(self.whisperx_group)

        # Groq settings
        self.groq_group = QGroupBox("Groq Whisper (Cloud)")
        groq_layout = QFormLayout()

        self.groq_model_combo = QComboBox()
        self.groq_model_combo.addItems([
            "whisper-large-v3", "whisper-large-v3-turbo", "distil-whisper-large-v3-en"
        ])
        self.groq_model_combo.setCurrentText(self.config.groq_whisper.model)
        groq_layout.addRow("Modèle:", self.groq_model_combo)

        self.groq_lang_combo = QComboBox()
        self.groq_lang_combo.addItems(["fr", "en", "es", "de", "it"])
        self.groq_lang_combo.setCurrentText(self.config.groq_whisper.language)
        groq_layout.addRow("Langue:", self.groq_lang_combo)

        self.groq_group.setLayout(groq_layout)
        layout.addWidget(self.groq_group)

        # Update visibility
        self._on_provider_changed(self.provider_combo.currentText())

        layout.addStretch()
        widget.setLayout(layout)
        return widget

    def _create_vad_tab(self) -> QWidget:
        """Create VAD settings tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(16)

        vad_group = QGroupBox("Voice Activity Detection")
        vad_layout = QFormLayout()

        # Threshold
        self.vad_threshold_spin = QDoubleSpinBox()
        self.vad_threshold_spin.setRange(0.0, 1.0)
        self.vad_threshold_spin.setSingleStep(0.05)
        self.vad_threshold_spin.setDecimals(2)
        self.vad_threshold_spin.setValue(self.config.vad.threshold)
        self._add_tooltip(self.vad_threshold_spin, "Seuil de détection (0.4 recommandé)")
        vad_layout.addRow("Seuil:", self.vad_threshold_spin)

        # Min speech duration
        self.min_speech_spin = QSpinBox()
        self.min_speech_spin.setRange(100, 5000)
        self.min_speech_spin.setSingleStep(50)
        self.min_speech_spin.setValue(self.config.vad.min_speech_duration_ms)
        self.min_speech_spin.setSuffix(" ms")
        self._add_tooltip(self.min_speech_spin, "Durée minimale de parole")
        vad_layout.addRow("Durée minimale:", self.min_speech_spin)

        # Min silence duration
        self.min_silence_spin = QSpinBox()
        self.min_silence_spin.setRange(100, 5000)
        self.min_silence_spin.setSingleStep(50)
        self.min_silence_spin.setValue(self.config.vad.min_silence_duration_ms)
        self.min_silence_spin.setSuffix(" ms")
        self._add_tooltip(self.min_silence_spin, "Durée minimale de silence pour finaliser un segment")
        vad_layout.addRow("Durée silence:", self.min_silence_spin)

        # Speech pad
        self.speech_pad_spin = QSpinBox()
        self.speech_pad_spin.setRange(0, 1000)
        self.speech_pad_spin.setSingleStep(10)
        self.speech_pad_spin.setValue(self.config.vad.speech_pad_ms)
        self.speech_pad_spin.setSuffix(" ms")
        self._add_tooltip(self.speech_pad_spin, "Padding ajouté avant/après la parole")
        vad_layout.addRow("Speech Padding:", self.speech_pad_spin)

        vad_group.setLayout(vad_layout)
        layout.addWidget(vad_group)

        layout.addStretch()
        widget.setLayout(layout)
        return widget

    def _create_behavior_tab(self) -> QWidget:
        """Create behavior settings tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(16)

        # Hotkeys
        hotkey_group = QGroupBox("Raccourcis Clavier")
        hotkey_layout = QVBoxLayout()

        hotkey_info = QLabel("⚠️ Configuration des raccourcis disponible dans la fenêtre principale")
        hotkey_info.setObjectName("hint")
        hotkey_info.setWordWrap(True)
        hotkey_layout.addWidget(hotkey_info)

        hotkey_group.setLayout(hotkey_layout)
        layout.addWidget(hotkey_group)

        # Text injection
        injection_group = QGroupBox("Injection de Texte")
        injection_layout = QFormLayout()

        self.injection_method_combo = QComboBox()
        self.injection_method_combo.addItems(["clipboard", "keyboard"])
        self.injection_method_combo.setCurrentText(self.config.text_injection.default_method.value)
        self._add_tooltip(self.injection_method_combo, "Méthode d'injection du texte transcrit")
        injection_layout.addRow("Méthode:", self.injection_method_combo)

        self.preserve_clipboard_check = QCheckBox("Préserver le presse-papiers")
        self.preserve_clipboard_check.setChecked(self.config.text_injection.preserve_clipboard)
        injection_layout.addRow("", self.preserve_clipboard_check)

        injection_group.setLayout(injection_layout)
        layout.addWidget(injection_group)

        layout.addStretch()
        widget.setLayout(layout)
        return widget

    def _create_advanced_tab(self) -> QWidget:
        """Create advanced settings tab."""
        widget = QWidget()
        layout = QVBoxLayout()
        layout.setSpacing(16)

        # System
        system_group = QGroupBox("Système")
        system_layout = QVBoxLayout()

        self.minimize_tray_check = QCheckBox("Minimiser dans la barre système")
        self.minimize_tray_check.setChecked(self.config.minimize_to_tray)
        system_layout.addWidget(self.minimize_tray_check)

        self.check_updates_check = QCheckBox("Vérifier les mises à jour au démarrage")
        self.check_updates_check.setChecked(getattr(self.config, 'check_updates_on_startup', True))
        system_layout.addWidget(self.check_updates_check)

        # Windows startup
        if is_startup_available():
            self.startup_check = QCheckBox("Démarrer avec Windows")
            self.startup_check.setChecked(is_startup_enabled())
            system_layout.addWidget(self.startup_check)
        else:
            self.startup_check = None

        system_group.setLayout(system_layout)
        layout.addWidget(system_group)

        # Theme
        theme_group = QGroupBox("Apparence")
        theme_layout = QFormLayout()

        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["light", "dark", "auto"])
        self.theme_combo.setCurrentText(self.config.theme_mode)
        theme_layout.addRow("Thème:", self.theme_combo)

        theme_group.setLayout(theme_layout)
        layout.addWidget(theme_group)

        # GPU info
        gpu_group = QGroupBox("Informations GPU")
        gpu_layout = QVBoxLayout()

        gpu_available = torch.cuda.is_available()
        if gpu_available:
            gpu_name = torch.cuda.get_device_name(0)
            gpu_memory = torch.cuda.get_device_properties(0).total_memory / 1024**3
            gpu_info = f"✅ GPU détecté: {gpu_name}\n💾 Mémoire: {gpu_memory:.1f} GB"
        else:
            gpu_info = "❌ Aucun GPU CUDA détecté\n🖥️ Utilisation du CPU"

        gpu_label = QLabel(gpu_info)
        gpu_label.setObjectName("hint")
        gpu_layout.addWidget(gpu_label)

        gpu_group.setLayout(gpu_layout)
        layout.addWidget(gpu_group)

        layout.addStretch()
        widget.setLayout(layout)
        return widget

    def _on_provider_changed(self, provider_text: str):
        """Handle provider change."""
        is_groq = "Groq" in provider_text
        self.whisperx_group.setVisible(not is_groq)
        self.groq_group.setVisible(is_groq)

    def _add_tooltip(self, widget, text: str):
        """Add tooltip to widget."""
        widget.setToolTip(text)

    def _save_settings(self):
        """Save settings and close."""
        try:
            # Audio settings
            self.config.audio.sample_rate = int(self.sample_rate_combo.currentText())
            self.config.audio.chunk_duration_ms = self.chunk_duration_spin.value()
            self.config.audio_feedback_enabled = self.audio_feedback_check.isChecked()

            # Transcription provider
            provider_text = self.provider_combo.currentText()
            if "Groq" in provider_text:
                from ..models.config import TranscriptionProvider
                self.config.transcription_provider = TranscriptionProvider.GROQ_WHISPER
                self.config.groq_whisper.model = self.groq_model_combo.currentText()
                self.config.groq_whisper.language = self.groq_lang_combo.currentText()
            else:
                from ..models.config import TranscriptionProvider, WhisperModel
                self.config.transcription_provider = TranscriptionProvider.WHISPERX
                self.config.whisperx.model = WhisperModel(self.whisperx_model_combo.currentText())
                self.config.whisperx.device = self.whisperx_device_combo.currentText()
                self.config.whisperx.compute_type = self.whisperx_compute_combo.currentText()
                self.config.whisperx.batch_size = self.whisperx_batch_spin.value()

            # VAD settings
            self.config.vad.threshold = self.vad_threshold_spin.value()
            self.config.vad.min_speech_duration_ms = self.min_speech_spin.value()
            self.config.vad.min_silence_duration_ms = self.min_silence_spin.value()
            self.config.vad.speech_pad_ms = self.speech_pad_spin.value()

            # Text injection
            from ..models.config import TextInjectionMethod
            method_text = self.injection_method_combo.currentText()
            self.config.text_injection.default_method = (
                TextInjectionMethod.CLIPBOARD if method_text == "clipboard"
                else TextInjectionMethod.KEYBOARD
            )
            self.config.text_injection.preserve_clipboard = self.preserve_clipboard_check.isChecked()

            # Advanced
            self.config.minimize_to_tray = self.minimize_tray_check.isChecked()
            self.config.check_updates_on_startup = self.check_updates_check.isChecked()
            self.config.theme_mode = self.theme_combo.currentText()

            # Windows startup
            if self.startup_check:
                sync_startup_setting(self.startup_check.isChecked())

            # Save config
            self.config.save()
            logger.info("Settings saved successfully")

            # Notify callbacks
            if self.on_settings_changed:
                self.on_settings_changed()

            self.accept()

        except Exception as e:
            logger.error(f"Failed to save settings: {e}")
            import traceback
            traceback.print_exc()
