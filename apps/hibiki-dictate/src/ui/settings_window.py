"""
Advanced settings window for Hibiki - Device, Model, and general configuration.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
import torch
from typing import Callable, Optional
from loguru import logger
from pathlib import Path

from ..utils.windows_startup import (
    is_startup_enabled,
    sync_startup_setting,
    is_available as is_startup_available
)
from .theme import ShinkofaColors


class Tooltip:
    """Tooltip widget for hover explanations."""

    def __init__(self, widget, text: str, delay: int = 500):
        """
        Create tooltip for widget.

        Args:
            widget: Widget to attach tooltip to
            text: Tooltip text
            delay: Delay in ms before showing tooltip
        """
        self.widget = widget
        self.text = text
        self.delay = delay
        self.tooltip_window = None
        self.after_id = None

        # Bind events
        widget.bind("<Enter>", self._on_enter)
        widget.bind("<Leave>", self._on_leave)

    def _on_enter(self, event=None):
        """Show tooltip after delay."""
        if self.after_id:
            self.widget.after_cancel(self.after_id)
        self.after_id = self.widget.after(self.delay, self._show_tooltip)

    def _on_leave(self, event=None):
        """Hide tooltip."""
        if self.after_id:
            self.widget.after_cancel(self.after_id)
            self.after_id = None
        self._hide_tooltip()

    def _show_tooltip(self):
        """Display tooltip window."""
        if self.tooltip_window:
            return

        # Get widget position
        x = self.widget.winfo_rootx() + 20
        y = self.widget.winfo_rooty() + self.widget.winfo_height() + 5

        # Create tooltip window
        self.tooltip_window = ctk.CTkToplevel(self.widget)
        self.tooltip_window.wm_overrideredirect(True)
        self.tooltip_window.wm_geometry(f"+{x}+{y}")
        self.tooltip_window.attributes("-topmost", True)

        # Tooltip content
        label = ctk.CTkLabel(
            self.tooltip_window,
            text=self.text,
            fg_color="#2d2d2d",
            text_color="#ffffff",
            corner_radius=6,
            padx=12,
            pady=8,
            wraplength=300,
            justify="left",
            font=ctk.CTkFont(size=12)
        )
        label.pack()

    def _hide_tooltip(self):
        """Hide tooltip window."""
        if self.tooltip_window:
            self.tooltip_window.destroy()
            self.tooltip_window = None


class SettingsWindow(ctk.CTkToplevel):
    """Advanced settings window with device, model, and configuration options."""

    def __init__(
        self,
        parent,
        config,
        theme_mode: str = "light",
        on_save: Optional[Callable] = None,
        on_hotkey_config: Optional[Callable] = None
    ):
        super().__init__(parent)

        self.config = config
        self.theme_mode = theme_mode
        self.colors = ShinkofaColors.get_colors(theme_mode)
        self.on_save_callback = on_save
        self.on_hotkey_config_callback = on_hotkey_config

        # Current values (loaded from config)
        self.current_device = config.whisperx.device
        self.current_model = config.whisperx.model.value
        self.current_language = config.whisperx.language
        self.current_compute_type = config.whisperx.compute_type.value
        self.current_overlay_position = config.overlay.position
        self.current_overlay_opacity = config.overlay.opacity
        self.current_start_with_windows = getattr(config, 'start_with_windows', False)

        # New values (edited by user)
        self.new_device = self.current_device
        self.new_model = self.current_model
        self.new_language = self.current_language
        self.new_compute_type = self.current_compute_type
        self.new_overlay_position = self.current_overlay_position
        self.new_overlay_opacity = self.current_overlay_opacity
        self.new_start_with_windows = self.current_start_with_windows

        # Preview overlay window
        self.preview_overlay = None

        # Validation warnings
        self.warnings = []

        # Setup window
        self._setup_window()
        self._create_ui()

        # Bind keyboard shortcuts
        self.bind("<Control-s>", lambda e: self._on_save())
        self.bind("<Escape>", lambda e: self._on_cancel())

        # Initial validation
        self._update_validation_warnings()

    def _setup_window(self):
        """Setup window properties."""
        self.title("⚙️ Paramètres Hibiki")

        # Window size
        width, height = 700, 800
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Minimum size
        self.minsize(650, 700)

        # Make it modal
        self.transient(self.master)
        self.grab_set()

        # Protocol
        self.protocol("WM_DELETE_WINDOW", self._on_cancel)

    def _create_ui(self):
        """Create UI components with tabbed interface."""
        # Main container
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Header
        header_frame = ctk.CTkFrame(self, fg_color=self.colors['card_bg'], height=80)
        header_frame.grid(row=0, column=0, sticky="ew", padx=0, pady=0)
        header_frame.grid_columnconfigure(0, weight=1)
        header_frame.grid_propagate(False)

        title_label = ctk.CTkLabel(
            header_frame,
            text="⚙️ Paramètres Hibiki",
            font=ctk.CTkFont(size=26, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, pady=20)

        # Keyboard shortcuts hint
        shortcuts_label = ctk.CTkLabel(
            header_frame,
            text="💡 Raccourcis : Ctrl+S pour sauvegarder, Échap pour annuler",
            font=ctk.CTkFont(size=11),
            text_color=self.colors['fg'],
            fg_color="transparent"
        )
        shortcuts_label.place(relx=0.5, rely=0.8, anchor="center")

        # Tabbed interface
        self.tabview = ctk.CTkTabview(
            self,
            fg_color="transparent",
            segmented_button_fg_color=self.colors['card_bg'],
            segmented_button_selected_color=self.colors['primary'],
            segmented_button_selected_hover_color=self.colors['primary_hover'],
            text_color=self.colors['fg']
        )
        self.tabview.grid(row=1, column=0, sticky="nsew", padx=20, pady=(10, 0))

        # Add tabs
        tab1 = self.tabview.add("🎙️ Transcription")
        tab2 = self.tabview.add("🎨 Interface")
        tab3 = self.tabview.add("⚙️ Avancé")

        # Configure tab grids
        tab1.grid_columnconfigure(0, weight=1)
        tab2.grid_columnconfigure(0, weight=1)
        tab3.grid_columnconfigure(0, weight=1)

        # Populate tabs
        self._create_transcription_tab(tab1)
        self._create_interface_tab(tab2)
        self._create_advanced_tab(tab3)

        # Validation warnings frame
        self.warnings_frame = ctk.CTkFrame(self, fg_color="transparent", height=40)
        self.warnings_frame.grid(row=2, column=0, sticky="ew", padx=20, pady=(10, 0))
        self.warnings_frame.grid_columnconfigure(0, weight=1)

        self.warnings_label = ctk.CTkLabel(
            self.warnings_frame,
            text="",
            font=ctk.CTkFont(size=11),
            text_color=self.colors['warning'],
            wraplength=650,
            justify="left"
        )
        self.warnings_label.grid(row=0, column=0, sticky="w")

        # Buttons
        buttons_frame = ctk.CTkFrame(self, fg_color="transparent", height=70)
        buttons_frame.grid(row=3, column=0, sticky="ew", padx=20, pady=(10, 20))
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)
        buttons_frame.grid_columnconfigure(2, weight=1)
        buttons_frame.grid_propagate(False)

        # Reset button
        reset_btn = ctk.CTkButton(
            buttons_frame,
            text="🔄 Réinitialiser",
            font=ctk.CTkFont(size=13),
            height=48,
            corner_radius=10,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['warning'],
            text_color=self.colors['warning'],
            hover_color=self.colors['card_bg'],
            command=self._on_reset
        )
        reset_btn.grid(row=0, column=0, sticky="ew", padx=(0, 8))
        Tooltip(reset_btn, "Remettre tous les paramètres aux valeurs par défaut")

        cancel_btn = ctk.CTkButton(
            buttons_frame,
            text="Annuler (Échap)",
            font=ctk.CTkFont(size=13),
            height=48,
            corner_radius=10,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['error'],
            text_color=self.colors['error'],
            hover_color=self.colors['error'],
            command=self._on_cancel
        )
        cancel_btn.grid(row=0, column=1, sticky="ew", padx=4)

        save_btn = ctk.CTkButton(
            buttons_frame,
            text="✅ Enregistrer (Ctrl+S)",
            font=ctk.CTkFont(size=14, weight="bold"),
            height=48,
            corner_radius=10,
            fg_color=self.colors['success'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            command=self._on_save
        )
        save_btn.grid(row=0, column=2, sticky="ew", padx=(8, 0))

    def _create_transcription_tab(self, parent):
        """Create transcription settings tab."""
        # Scrollable container
        scroll_frame = ctk.CTkScrollableFrame(parent, fg_color="transparent")
        scroll_frame.grid(row=0, column=0, sticky="nsew", padx=0, pady=10)
        scroll_frame.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(0, weight=1)

        # Device section
        self._create_device_section(scroll_frame, row=0)

        # Model section
        self._create_model_section(scroll_frame, row=1)

        # Language section
        self._create_language_section(scroll_frame, row=2)

    def _create_interface_tab(self, parent):
        """Create interface settings tab."""
        # Scrollable container
        scroll_frame = ctk.CTkScrollableFrame(parent, fg_color="transparent")
        scroll_frame.grid(row=0, column=0, sticky="nsew", padx=0, pady=10)
        scroll_frame.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(0, weight=1)

        # Overlay section with live preview
        self._create_overlay_section(scroll_frame, row=0)

    def _create_advanced_tab(self, parent):
        """Create advanced settings tab."""
        # Scrollable container
        scroll_frame = ctk.CTkScrollableFrame(parent, fg_color="transparent")
        scroll_frame.grid(row=0, column=0, sticky="nsew", padx=0, pady=10)
        scroll_frame.grid_columnconfigure(0, weight=1)
        parent.grid_rowconfigure(0, weight=1)

        # Hotkey section
        self._create_hotkey_section(scroll_frame, row=0)

        # Windows startup section
        self._create_startup_section(scroll_frame, row=1)

    def _create_device_section(self, parent, row):
        """Create device selection section."""
        section_frame = ctk.CTkFrame(parent, corner_radius=12, border_width=2, border_color=self.colors['primary'])
        section_frame.grid(row=row, column=0, sticky="ew", pady=(0, 20))
        section_frame.grid_columnconfigure(0, weight=1)

        # Section title
        title_label = ctk.CTkLabel(
            section_frame,
            text="🖥️ Périphérique de Calcul (GPU/CPU)",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, pady=(20, 10), padx=20)

        # Info text
        info_text = ctk.CTkLabel(
            section_frame,
            text="GPU (CUDA) est FORTEMENT recommandé pour de meilleures performances.\n"
                 "CPU fonctionne mais avec latence élevée (5-15s vs <1s avec GPU).",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['fg'],
            wraplength=600,
            justify="center"
        )
        info_text.grid(row=1, column=0, pady=(0, 15), padx=20)

        # GPU detection status
        cuda_available = torch.cuda.is_available()
        if cuda_available:
            try:
                gpu_name = torch.cuda.get_device_name(0)
                status_text = f"✅ GPU détecté: {gpu_name}"
                status_color = self.colors['success']
            except:
                status_text = "✅ GPU (CUDA) disponible"
                status_color = self.colors['success']
        else:
            status_text = "⚠️ Aucun GPU détecté - CPU uniquement"
            status_color = self.colors['warning']

        status_label = ctk.CTkLabel(
            section_frame,
            text=status_text,
            font=ctk.CTkFont(size=13, weight="bold"),
            text_color=status_color,
            fg_color=self.colors['card_bg'],
            corner_radius=8,
            height=40
        )
        status_label.grid(row=2, column=0, sticky="ew", pady=(0, 15), padx=20)

        # Device selection radio buttons
        self.device_var = ctk.StringVar(value=self.current_device)

        devices = [
            ("Auto (GPU prioritaire si disponible)", "auto", "Détecte automatiquement le meilleur périphérique", "Hibiki choisira automatiquement le GPU si disponible, sinon CPU"),
            ("GPU (CUDA)", "cuda", "Force l'utilisation du GPU NVIDIA" + (" - Recommandé ⭐" if cuda_available else " - Non disponible"),
             "Utilise votre carte NVIDIA pour transcription ultra-rapide (<1s). Nécessite CUDA compatible."),
            ("CPU", "cpu", "Force l'utilisation du CPU - Latence élevée",
             "Utilise le processeur pour transcription (5-15s de latence). Pas recommandé sauf si GPU indisponible.")
        ]

        for i, (label, value, description, tooltip) in enumerate(devices):
            # Radio button
            radio = ctk.CTkRadioButton(
                section_frame,
                text=label,
                variable=self.device_var,
                value=value,
                font=ctk.CTkFont(size=14, weight="bold"),
                text_color=self.colors['fg'],
                fg_color=self.colors['primary'],
                hover_color=self.colors['primary_hover'],
                command=lambda v=value: self._on_device_changed(v),
                state="normal" if (value != "cuda" or cuda_available) else "disabled"
            )
            radio.grid(row=3+i*2, column=0, sticky="w", padx=40, pady=(5, 0))

            # Tooltip
            Tooltip(radio, tooltip)

            # Description
            desc_label = ctk.CTkLabel(
                section_frame,
                text=description,
                font=ctk.CTkFont(size=11),
                text_color=self.colors['fg'],
                anchor="w"
            )
            desc_label.grid(row=4+i*2, column=0, sticky="w", padx=70, pady=(0, 10))

        # Spacer
        ctk.CTkLabel(section_frame, text="", height=10).grid(row=20, column=0)

    def _create_model_section(self, parent, row):
        """Create model selection section."""
        section_frame = ctk.CTkFrame(parent, corner_radius=12, border_width=2, border_color=self.colors['accent'])
        section_frame.grid(row=row, column=0, sticky="ew", pady=(0, 20))
        section_frame.grid_columnconfigure(0, weight=1)

        # Section title
        title_label = ctk.CTkLabel(
            section_frame,
            text="🧠 Modèle WhisperX",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, pady=(20, 10), padx=20)

        # Info text
        info_text = ctk.CTkLabel(
            section_frame,
            text="Choisissez entre précision et vitesse. Modèles plus grands = plus précis mais plus lents.",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['fg'],
            wraplength=600,
            justify="center"
        )
        info_text.grid(row=1, column=0, pady=(0, 15), padx=20)

        # Model selection
        self.model_var = ctk.StringVar(value=self.current_model)

        models = [
            ("base", "Base", "Léger et rapide (74M paramètres) - Recommandé ⭐",
             "Idéal pour usage quotidien. Bonne précision, latence faible (~0.5s sur GPU)."),
            ("small", "Small", "Équilibré (244M paramètres)",
             "Meilleure précision que Base, latence modérée (~1s sur GPU)."),
            ("medium", "Medium", "Précis (769M paramètres)",
             "Haute précision pour transcriptions professionnelles, latence moyenne (~2s sur GPU)."),
            ("large-v3", "Large-v3", "Maximum précision (1550M paramètres) - Nécessite GPU puissant",
             "Précision maximale pour domaines spécialisés. VRAM 6GB+ recommandé, latence élevée (~3-5s)."),
        ]

        for value, label, description, tooltip in models:
            radio = ctk.CTkRadioButton(
                section_frame,
                text=label,
                variable=self.model_var,
                value=value,
                font=ctk.CTkFont(size=14, weight="bold"),
                text_color=self.colors['fg'],
                fg_color=self.colors['accent'],
                hover_color=self.colors['primary_hover'],
                command=lambda v=value: self._on_model_changed(v)
            )
            radio.grid(row=2+models.index((value, label, description, tooltip))*2, column=0, sticky="w", padx=40, pady=(5, 0))

            # Tooltip
            Tooltip(radio, tooltip)

            desc_label = ctk.CTkLabel(
                section_frame,
                text=description,
                font=ctk.CTkFont(size=11),
                text_color=self.colors['fg'],
                anchor="w"
            )
            desc_label.grid(row=3+models.index((value, label, description, tooltip))*2, column=0, sticky="w", padx=70, pady=(0, 10))

        # Spacer
        ctk.CTkLabel(section_frame, text="", height=10).grid(row=20, column=0)

    def _create_language_section(self, parent, row):
        """Create language selection section."""
        section_frame = ctk.CTkFrame(parent, corner_radius=12)
        section_frame.grid(row=row, column=0, sticky="ew", pady=(0, 20))
        section_frame.grid_columnconfigure(0, weight=1)

        # Section title
        title_label = ctk.CTkLabel(
            section_frame,
            text="🌐 Langue de Transcription",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, pady=(20, 15), padx=20)

        # Language dropdown
        languages = {
            "fr": "🇫🇷 Français",
            "en": "🇬🇧 English",
            "es": "🇪🇸 Español",
            "de": "🇩🇪 Deutsch",
            "it": "🇮🇹 Italiano",
            "pt": "🇵🇹 Português",
            "nl": "🇳🇱 Nederlands",
            "pl": "🇵🇱 Polski",
            "ru": "🇷🇺 Русский",
        }

        self.language_menu = ctk.CTkOptionMenu(
            section_frame,
            values=list(languages.values()),
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color=self.colors['primary'],
            button_color=self.colors['primary_hover'],
            button_hover_color=self.colors['primary'],
            command=self._on_language_changed
        )
        # Set current language
        current_lang_display = languages.get(self.current_language, "🇫🇷 Français")
        self.language_menu.set(current_lang_display)
        self.language_menu.grid(row=1, column=0, sticky="ew", pady=(0, 20), padx=40)

        # Tooltip
        Tooltip(self.language_menu, "Sélectionnez la langue de transcription. WhisperX supporte 90+ langues avec haute précision.")

        # Store language map
        self.language_map = {v: k for k, v in languages.items()}

    def _create_hotkey_section(self, parent, row):
        """Create hotkey configuration button section."""
        section_frame = ctk.CTkFrame(parent, corner_radius=12, fg_color="transparent")
        section_frame.grid(row=row, column=0, sticky="ew", pady=(0, 20))
        section_frame.grid_columnconfigure(0, weight=1)

        hotkey_btn = ctk.CTkButton(
            section_frame,
            text="⌨️ Configurer les Raccourcis Clavier",
            font=ctk.CTkFont(size=16, weight="bold"),
            height=54,
            corner_radius=10,
            fg_color=self.colors['primary'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            border_width=2,
            border_color=self.colors['border'],
            command=self._open_hotkey_config
        )
        hotkey_btn.grid(row=0, column=0, sticky="ew", padx=20, pady=10)

        # Tooltip
        Tooltip(hotkey_btn, "Personnalisez vos raccourcis clavier pour démarrer/arrêter la dictée. Modes Toggle et Push-to-Talk disponibles.")

    def _on_device_changed(self, value):
        """Handle device selection change."""
        self.new_device = value
        logger.info(f"Device changed to: {value}")

        # Auto-adjust compute type based on device
        if value == "cuda" or (value == "auto" and torch.cuda.is_available()):
            self.new_compute_type = "float16"
        elif value == "cpu":
            self.new_compute_type = "int8"

        # Update validation warnings
        self._update_validation_warnings()

    def _on_model_changed(self, value):
        """Handle model selection change."""
        self.new_model = value
        logger.info(f"Model changed to: {value}")

        # Update validation warnings
        self._update_validation_warnings()

    def _on_language_changed(self, value):
        """Handle language selection change."""
        # Convert display value to language code
        lang_code = self.language_map.get(value, "fr")
        self.new_language = lang_code
        logger.info(f"Language changed to: {lang_code}")

        # Update preview if active
        if self.preview_overlay and self.preview_overlay.winfo_exists():
            self.preview_overlay.update_language(lang_code)

    def _open_hotkey_config(self):
        """Open hotkey configuration window."""
        if self.on_hotkey_config_callback:
            self.on_hotkey_config_callback()

    def _create_overlay_section(self, parent, row):
        """Create overlay configuration section."""
        section_frame = ctk.CTkFrame(parent, corner_radius=12, border_width=2, border_color=self.colors['success'])
        section_frame.grid(row=row, column=0, sticky="ew", pady=(0, 20))
        section_frame.grid_columnconfigure(0, weight=1)

        # Section title
        title_label = ctk.CTkLabel(
            section_frame,
            text="📺 Configuration de l'Overlay",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, pady=(20, 10), padx=20)

        # Info text
        info_text = ctk.CTkLabel(
            section_frame,
            text="L'overlay est une petite fenêtre toujours visible qui affiche le statut d'enregistrement.",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['fg'],
            wraplength=600,
            justify="center"
        )
        info_text.grid(row=1, column=0, pady=(0, 15), padx=20)

        # Position selection
        position_label = ctk.CTkLabel(
            section_frame,
            text="Position de l'overlay :",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['fg']
        )
        position_label.grid(row=2, column=0, sticky="w", pady=(5, 5), padx=40)

        positions = {
            "bottom_left": "⬋ Bas à gauche",
            "bottom_center": "⬇ Bas au centre",
            "bottom_right": "⬊ Bas à droite",
            "center_left": "⬅ Centre gauche",
            "center": "⊙ Centre de l'écran",
            "center_right": "➡ Centre droite",
            "top_left": "⬉ Haut à gauche",
            "top_center": "⬆ Haut au centre",
            "top_right": "⬈ Haut à droite",
        }

        self.overlay_position_menu = ctk.CTkOptionMenu(
            section_frame,
            values=list(positions.values()),
            font=ctk.CTkFont(size=13),
            height=40,
            corner_radius=8,
            fg_color=self.colors['success'],
            button_color=self.colors['primary_hover'],
            button_hover_color=self.colors['success'],
            command=self._on_overlay_position_changed
        )
        # Set current position
        current_pos_display = positions.get(self.current_overlay_position, "⬋ Bas à gauche")
        self.overlay_position_menu.set(current_pos_display)
        self.overlay_position_menu.grid(row=3, column=0, sticky="ew", pady=(0, 15), padx=40)

        # Tooltip
        Tooltip(self.overlay_position_menu, "Choisissez où afficher l'overlay sur votre écran. Utilisez l'aperçu pour tester.")

        # Store position map
        self.overlay_position_map = {v: k for k, v in positions.items()}

        # Opacity slider
        opacity_label = ctk.CTkLabel(
            section_frame,
            text=f"Transparence de l'overlay : {int(self.current_overlay_opacity * 100)}%",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['fg']
        )
        opacity_label.grid(row=4, column=0, sticky="w", pady=(10, 5), padx=40)

        self.opacity_label = opacity_label  # Store reference to update text

        opacity_info = ctk.CTkLabel(
            section_frame,
            text="(Valeur plus élevée = plus visible, moins transparent)",
            font=ctk.CTkFont(size=11),
            text_color=self.colors['fg']
        )
        opacity_info.grid(row=5, column=0, sticky="w", pady=(0, 5), padx=70)

        self.overlay_opacity_slider = ctk.CTkSlider(
            section_frame,
            from_=0.3,
            to=1.0,
            number_of_steps=14,  # Steps of 0.05
            height=20,
            button_color=self.colors['success'],
            button_hover_color=self.colors['primary_hover'],
            progress_color=self.colors['success'],
            command=self._on_overlay_opacity_changed
        )
        self.overlay_opacity_slider.set(self.current_overlay_opacity)
        self.overlay_opacity_slider.grid(row=6, column=0, sticky="ew", pady=(0, 15), padx=40)

        # Tooltip
        Tooltip(self.overlay_opacity_slider, "Ajustez la visibilité de l'overlay. 100% = complètement opaque, 30% = très transparent.")

        # Live preview button
        preview_btn_frame = ctk.CTkFrame(section_frame, fg_color="transparent")
        preview_btn_frame.grid(row=7, column=0, sticky="ew", pady=(5, 20), padx=40)

        self.preview_btn = ctk.CTkButton(
            preview_btn_frame,
            text="👁️ Aperçu en direct",
            font=ctk.CTkFont(size=14, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['accent'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            command=self._toggle_overlay_preview
        )
        self.preview_btn.pack(fill="x")
        Tooltip(self.preview_btn, "Afficher/masquer un aperçu de l'overlay avec les paramètres actuels")

        # Preview status label
        self.preview_status_label = ctk.CTkLabel(
            section_frame,
            text="",
            font=ctk.CTkFont(size=11),
            text_color=self.colors['success']
        )
        self.preview_status_label.grid(row=8, column=0, pady=(0, 10))

        # Spacer
        ctk.CTkLabel(section_frame, text="", height=10).grid(row=20, column=0)

    def _create_startup_section(self, parent, row):
        """Create Windows startup configuration section."""
        section_frame = ctk.CTkFrame(parent, corner_radius=12, border_width=2, border_color=self.colors['warning'])
        section_frame.grid(row=row, column=0, sticky="ew", pady=(0, 20))
        section_frame.grid_columnconfigure(0, weight=1)

        # Section title
        title_label = ctk.CTkLabel(
            section_frame,
            text="Lancement Automatique",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, pady=(20, 10), padx=20)

        # Check if Windows startup is available
        if not is_startup_available():
            unavailable_label = ctk.CTkLabel(
                section_frame,
                text="Non disponible sur cette plateforme",
                font=ctk.CTkFont(size=12),
                text_color=self.colors['warning']
            )
            unavailable_label.grid(row=1, column=0, pady=(0, 20), padx=20)
            return

        # Info text
        info_text = ctk.CTkLabel(
            section_frame,
            text="Hibiki demarrera automatiquement au demarrage de Windows.",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['fg'],
            wraplength=600,
            justify="center"
        )
        info_text.grid(row=1, column=0, pady=(0, 15), padx=20)

        # Current status indicator
        current_status = is_startup_enabled()
        status_text = "Actuellement active" if current_status else "Actuellement desactive"
        status_color = self.colors['success'] if current_status else self.colors['fg']

        self.startup_status_label = ctk.CTkLabel(
            section_frame,
            text=status_text,
            font=ctk.CTkFont(size=11),
            text_color=status_color
        )
        self.startup_status_label.grid(row=2, column=0, pady=(0, 10), padx=20)

        # Toggle switch
        self.startup_var = ctk.BooleanVar(value=self.current_start_with_windows)

        startup_switch_frame = ctk.CTkFrame(section_frame, fg_color="transparent")
        startup_switch_frame.grid(row=3, column=0, pady=(0, 20), padx=40)

        startup_label = ctk.CTkLabel(
            startup_switch_frame,
            text="Lancer au demarrage Windows",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['fg']
        )
        startup_label.pack(side="left", padx=(0, 16))

        self.startup_switch = ctk.CTkSwitch(
            startup_switch_frame,
            text="",
            variable=self.startup_var,
            onvalue=True,
            offvalue=False,
            button_color=self.colors['success'],
            button_hover_color=self.colors['primary_hover'],
            progress_color=self.colors['success'],
            command=self._on_startup_changed
        )
        self.startup_switch.pack(side="left")

        # Tooltip
        Tooltip(self.startup_switch, "Active cette option pour que Hibiki démarre automatiquement avec Windows.")

        # Spacer
        ctk.CTkLabel(section_frame, text="", height=10).grid(row=20, column=0)

    def _on_startup_changed(self):
        """Handle startup toggle change."""
        self.new_start_with_windows = self.startup_var.get()
        logger.info(f"Start with Windows changed to: {self.new_start_with_windows}")

        # Update status label preview
        if hasattr(self, 'startup_status_label'):
            if self.new_start_with_windows:
                self.startup_status_label.configure(
                    text="Sera active apres sauvegarde",
                    text_color=self.colors['success']
                )
            else:
                self.startup_status_label.configure(
                    text="Sera desactive apres sauvegarde",
                    text_color=self.colors['fg']
                )

    def _on_overlay_position_changed(self, value):
        """Handle overlay position selection change."""
        # Convert display value to position code
        pos_code = self.overlay_position_map.get(value, "bottom_left")
        self.new_overlay_position = pos_code
        logger.info(f"Overlay position changed to: {pos_code}")

        # Update preview if active
        if self.preview_overlay and self.preview_overlay.winfo_exists():
            self._update_preview_overlay()

    def _on_overlay_opacity_changed(self, value):
        """Handle overlay opacity slider change."""
        self.new_overlay_opacity = float(value)
        # Update label text
        self.opacity_label.configure(text=f"Transparence de l'overlay : {int(value * 100)}%")
        logger.info(f"Overlay opacity changed to: {value:.2f}")

        # Update preview if active
        if self.preview_overlay and self.preview_overlay.winfo_exists():
            self._update_preview_overlay()

    def _toggle_overlay_preview(self):
        """Toggle overlay preview window."""
        if self.preview_overlay and self.preview_overlay.winfo_exists():
            # Close preview
            self.preview_overlay.destroy()
            self.preview_overlay = None
            self.preview_btn.configure(text="👁️ Aperçu en direct")
            self.preview_status_label.configure(text="")
            logger.info("Overlay preview closed")
        else:
            # Show preview
            self._create_preview_overlay()
            self.preview_btn.configure(text="✖️ Fermer l'aperçu")
            self.preview_status_label.configure(text="✅ Aperçu actif - Ajustez les paramètres pour voir les changements")
            logger.info("Overlay preview opened")

    def _create_preview_overlay(self):
        """Create preview overlay window."""
        from .overlay_window import OverlayWindow

        try:
            self.preview_overlay = OverlayWindow(
                self,
                position=self.new_overlay_position,
                opacity=self.new_overlay_opacity,
                current_language=self.new_language
            )
            self.preview_overlay.update_status("🎙️ Aperçu")
            self.preview_overlay.update_audio_level(0.3)  # Show some activity
        except Exception as e:
            logger.error(f"Failed to create preview overlay: {e}")
            self.preview_status_label.configure(
                text="❌ Erreur lors de la création de l'aperçu",
                text_color=self.colors['error']
            )

    def _update_preview_overlay(self):
        """Update preview overlay with current settings."""
        if not self.preview_overlay or not self.preview_overlay.winfo_exists():
            return

        # Destroy and recreate (simpler than updating position)
        self.preview_overlay.destroy()
        self._create_preview_overlay()

    def _update_validation_warnings(self):
        """Update validation warnings based on current settings."""
        self.warnings = []

        # Check GPU selection
        if self.new_device == "cuda" and not torch.cuda.is_available():
            self.warnings.append("⚠️ GPU (CUDA) sélectionné mais non disponible - L'application utilisera le CPU")

        # Check CPU performance
        if self.new_device == "cpu":
            self.warnings.append("⚠️ CPU sélectionné - Attendez-vous à une latence élevée (5-15s)")

        # Check large model on CPU
        if self.new_device == "cpu" and self.new_model in ["large-v3", "medium"]:
            self.warnings.append("⚠️ Modèle large sur CPU - Latence très élevée possible (>20s)")

        # Update warnings label
        if self.warnings:
            warning_text = "\n".join(self.warnings)
            self.warnings_label.configure(text=warning_text)
        else:
            self.warnings_label.configure(text="")

    def _on_reset(self):
        """Reset all settings to defaults."""
        from tkinter import messagebox

        # Confirm reset
        if not messagebox.askyesno(
            "Confirmer la réinitialisation",
            "Êtes-vous sûr de vouloir réinitialiser tous les paramètres aux valeurs par défaut ?",
            parent=self
        ):
            return

        # Reset to defaults
        self.new_device = "auto"
        self.new_model = "base"
        self.new_language = "fr"
        self.new_compute_type = "float16"
        self.new_overlay_position = "bottom_left"
        self.new_overlay_opacity = 0.85
        self.new_start_with_windows = False

        # Update UI
        self.device_var.set(self.new_device)
        self.model_var.set(self.new_model)
        self.language_menu.set("🇫🇷 Français")
        self.overlay_position_menu.set("⬋ Bas à gauche")
        self.overlay_opacity_slider.set(self.new_overlay_opacity)
        self.opacity_label.configure(text=f"Transparence de l'overlay : {int(self.new_overlay_opacity * 100)}%")

        if hasattr(self, 'startup_var'):
            self.startup_var.set(self.new_start_with_windows)

        # Update validation
        self._update_validation_warnings()

        # Update preview if active
        if self.preview_overlay and self.preview_overlay.winfo_exists():
            self._update_preview_overlay()

        logger.info("Settings reset to defaults")

    def _on_save(self):
        """Save settings and close."""
        # Close preview if open
        if self.preview_overlay and self.preview_overlay.winfo_exists():
            self.preview_overlay.destroy()
            self.preview_overlay = None

        logger.info(
            f"Saving settings - Device: {self.new_device}, Model: {self.new_model}, "
            f"Language: {self.new_language}, Compute: {self.new_compute_type}, "
            f"Overlay Position: {self.new_overlay_position}, Overlay Opacity: {self.new_overlay_opacity:.2f}, "
            f"Start with Windows: {self.new_start_with_windows}"
        )

        # Update config
        self.config.whisperx.device = self.new_device
        self.config.whisperx.model = self.new_model
        self.config.whisperx.language = self.new_language
        self.config.whisperx.compute_type = self.new_compute_type
        self.config.overlay.position = self.new_overlay_position
        self.config.overlay.opacity = self.new_overlay_opacity
        self.config.start_with_windows = self.new_start_with_windows

        # Sync Windows startup setting with registry
        if is_startup_available():
            success = sync_startup_setting(self.new_start_with_windows)
            if success:
                logger.success(f"Windows startup {'enabled' if self.new_start_with_windows else 'disabled'}")
            else:
                logger.warning("Failed to update Windows startup setting")

        # Save to file
        self.config.save()

        # Call callback if provided
        if self.on_save_callback:
            self.on_save_callback()

        # Show warning about restart
        from tkinter import messagebox
        messagebox.showinfo(
            "Redémarrage requis",
            "Les paramètres ont été enregistrés.\n\n"
            "Veuillez redémarrer Hibiki pour appliquer les changements.",
            parent=self
        )

        self.grab_release()
        self.destroy()

    def _on_cancel(self):
        """Cancel and close without saving."""
        # Close preview if open
        if self.preview_overlay and self.preview_overlay.winfo_exists():
            self.preview_overlay.destroy()
            self.preview_overlay = None

        logger.info("Settings cancelled")
        self.grab_release()
        self.destroy()


if __name__ == "__main__":
    # Test settings window
    from ..models.config import AppSettings

    ctk.set_appearance_mode("light")
    ctk.set_default_color_theme("blue")

    config = AppSettings()

    def on_save():
        print("Settings saved!")

    app = ctk.CTk()
    app.withdraw()

    settings_window = SettingsWindow(
        app,
        config=config,
        theme_mode="light",
        on_save=on_save
    )

    app.mainloop()
