"""
Hotkey settings configuration window for Hibiki.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from typing import Callable, Optional, List
from loguru import logger
from .key_recorder_dialog import KeyRecorderDialog
from .theme import ShinkofaColors


def get_theme_colors():
    """Get colors based on current theme."""
    is_dark = ctk.get_appearance_mode() == "Dark"

    if is_dark:
        return {
            'text': "#ffffff",           # White text
            'text_secondary': "#cccccc", # Light gray
            'primary': "#ff9800",        # Orange
            'accent': "#64b5f6",         # Light blue
            'success': "#4caf50",        # Green
            'error': "#f44336",          # Red
            'border': "#ffffff",         # White borders
            'bg_card': "#2d2d2d",        # Card background
        }
    else:
        return {
            'text': "#1a1a1a",           # Near black text
            'text_secondary': "#555555", # Dark gray
            'primary': "#c45a00",        # Dark orange
            'accent': "#0055aa",         # Dark blue
            'success': "#1b6b1b",        # Dark green
            'error': "#b71c1c",          # Dark red
            'border': "#333333",         # Dark borders
            'bg_card': "#f5f5f5",        # Card background
        }

class HotkeySettingsWindow(ctk.CTkToplevel):
    """Window for configuring hotkey settings."""

    def __init__(
        self,
        parent,
        current_toggle_key: str,
        current_push_to_talk_key: str,
        current_mode: str,
        recent_hotkeys: Optional[List[str]] = None,
        on_save: Optional[Callable] = None
    ):
        super().__init__(parent)

        self.current_toggle_key = current_toggle_key
        self.current_push_to_talk_key = current_push_to_talk_key or "ctrl+shift"  # Default if None
        self.current_mode = current_mode
        self.recent_hotkeys = recent_hotkeys or []
        self.on_save_callback = on_save

        # Get theme colors
        self.colors = get_theme_colors()

        # New values (edited by user)
        self.new_toggle_key = current_toggle_key
        self.new_push_to_talk_key = current_push_to_talk_key or "ctrl+shift"  # Default if None
        self.new_mode = current_mode

        # Setup window
        self._setup_window()
        self._create_ui()

    def _setup_window(self):
        """Setup window properties."""
        self.title("Configuration des Raccourcis")

        # Window size (increased for both configs visible)
        width, height = 550, 750
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Allow resize for scrolling if needed
        self.resizable(True, True)
        self.minsize(500, 600)

        # Make it modal
        self.transient(self.master)
        self.grab_set()

        # Protocol
        self.protocol("WM_DELETE_WINDOW", self._on_cancel)

    def _create_ui(self):
        """Create UI components."""
        # Main scrollable container
        main_container = ctk.CTkScrollableFrame(self, fg_color="transparent")
        main_container.pack(fill="both", expand=True, padx=20, pady=20)
        main_container.grid_columnconfigure(0, weight=1)

        # Title
        title_label = ctk.CTkLabel(
            main_container,
            text="⌨️ Configuration des Raccourcis Clavier",
            font=ctk.CTkFont(size=22, weight="bold"),
            text_color=self.colors['text']
        )
        title_label.grid(row=0, column=0, pady=(0, 10))

        # Instructions
        instructions = ctk.CTkLabel(
            main_container,
            text="Configurez vos raccourcis pour l'enregistrement vocal.\n"
                 "Choisissez entre le mode Toggle (appuyer pour démarrer/arrêter)\n"
                 "ou Push-to-Talk (maintenir pour enregistrer).",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['text'],
            wraplength=500,
            justify="center"
        )
        instructions.grid(row=1, column=0, pady=(0, 20))

        # Mode selection
        mode_frame = ctk.CTkFrame(main_container, corner_radius=12, border_width=2, border_color=self.colors['primary'])
        mode_frame.grid(row=2, column=0, sticky="ew", pady=(0, 20))
        mode_frame.grid_columnconfigure(0, weight=1)

        mode_title = ctk.CTkLabel(
            mode_frame,
            text="Mode d'enregistrement",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['text']
        )
        mode_title.grid(row=0, column=0, pady=(15, 10), padx=20)

        self.mode_var = ctk.StringVar(value=self.current_mode)
        self.mode_var.trace_add("write", self._on_mode_changed)

        toggle_radio = ctk.CTkRadioButton(
            mode_frame,
            text="Toggle (Appuyer pour démarrer/arrêter)",
            variable=self.mode_var,
            value="toggle",
            font=ctk.CTkFont(size=14),
            text_color=self.colors['text'],
            fg_color=self.colors['primary'],
            hover_color=self.colors['border']
        )
        toggle_radio.grid(row=1, column=0, sticky="w", padx=30, pady=5)

        push_to_talk_radio = ctk.CTkRadioButton(
            mode_frame,
            text="Push-to-Talk (Maintenir pour enregistrer)",
            variable=self.mode_var,
            value="push_to_talk",
            font=ctk.CTkFont(size=14),
            text_color=self.colors['text'],
            fg_color=self.colors['primary'],
            hover_color=self.colors['border']
        )
        push_to_talk_radio.grid(row=2, column=0, sticky="w", padx=30, pady=(5, 15))

        # Toggle key configuration
        self.toggle_frame = ctk.CTkFrame(main_container, corner_radius=12)
        self.toggle_frame.grid(row=3, column=0, sticky="ew", pady=(0, 15))
        self.toggle_frame.grid_columnconfigure(0, weight=1)

        toggle_label = ctk.CTkLabel(
            self.toggle_frame,
            text="Raccourci Toggle",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text']
        )
        toggle_label.grid(row=0, column=0, pady=(15, 10), padx=20)

        self.toggle_display = ctk.CTkLabel(
            self.toggle_frame,
            text=self._format_hotkey(self.current_toggle_key),
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['success'],
            fg_color=self.colors['bg_card'],
            corner_radius=8,
            height=50
        )
        self.toggle_display.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 10))

        # Toggle presets
        toggle_presets = [
            ("Alt + Shift + D (Défaut)", "alt+shift+d"),
            ("Ctrl + Shift + D", "ctrl+shift+d"),
            ("Ctrl + Alt + D", "ctrl+alt+d"),
        ]

        for i, (label, hotkey) in enumerate(toggle_presets):
            btn = ctk.CTkButton(
                self.toggle_frame,
                text=label,
                font=ctk.CTkFont(size=12),
                height=36,
                corner_radius=6,
                fg_color="transparent",
                border_width=1,
                border_color=self.colors['border'],
                text_color=self.colors['text'],
                hover_color=self.colors['accent'],
                command=lambda h=hotkey: self._set_toggle_key(h)
            )
            btn.grid(row=2+i, column=0, sticky="ew", padx=20, pady=3)

        # Separator
        separator = ctk.CTkLabel(
            self.toggle_frame,
            text="──────────────── OU ─────────────────",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        )
        separator.grid(row=5, column=0, pady=8)

        # Custom recorder button
        custom_btn = ctk.CTkButton(
            self.toggle_frame,
            text="🎹 Enregistrer un raccourci personnalisé",
            font=ctk.CTkFont(size=13, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['primary'],
            hover_color=self.colors['border'],
            text_color="#FFFFFF",
            command=lambda: self._open_key_recorder("toggle")
        )
        custom_btn.grid(row=6, column=0, sticky="ew", padx=20, pady=8)

        # Recent hotkeys section (if any)
        if self.recent_hotkeys:
            recent_label = ctk.CTkLabel(
                self.toggle_frame,
                text="Raccourcis récents:",
                font=ctk.CTkFont(size=11),
                text_color=self.colors['text']
            )
            recent_label.grid(row=7, column=0, sticky="w", padx=20, pady=(10, 5))

            for i, hotkey in enumerate(self.recent_hotkeys[:3]):  # Show max 3 recent
                recent_btn = ctk.CTkButton(
                    self.toggle_frame,
                    text=f"• {self._format_hotkey(hotkey)}",
                    font=ctk.CTkFont(size=11),
                    height=32,
                    corner_radius=6,
                    fg_color="transparent",
                    border_width=1,
                    border_color=self.colors['text_secondary'],
                    text_color=self.colors['text'],
                    hover_color=self.colors['accent'],
                    command=lambda h=hotkey: self._set_toggle_key(h)
                )
                recent_btn.grid(row=8+i, column=0, sticky="ew", padx=20, pady=2)

        ctk.CTkLabel(self.toggle_frame, text="", height=5).grid(row=20, column=0)  # Spacer

        # Push-to-Talk key configuration
        self.ptt_frame = ctk.CTkFrame(main_container, corner_radius=12)
        self.ptt_frame.grid(row=4, column=0, sticky="ew", pady=(0, 20))
        self.ptt_frame.grid_columnconfigure(0, weight=1)

        ptt_label = ctk.CTkLabel(
            self.ptt_frame,
            text="Raccourci Push-to-Talk",
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['text']
        )
        ptt_label.grid(row=0, column=0, pady=(15, 10), padx=20)

        self.ptt_display = ctk.CTkLabel(
            self.ptt_frame,
            text=self._format_hotkey(self.current_push_to_talk_key),
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['success'],
            fg_color=self.colors['bg_card'],
            corner_radius=8,
            height=50
        )
        self.ptt_display.grid(row=1, column=0, sticky="ew", padx=20, pady=(0, 10))

        # PTT presets
        ptt_presets = [
            ("Alt + Shift + D (Défaut)", "alt+shift+d"),
            ("Ctrl + Shift", "ctrl+shift"),
            ("Ctrl + Alt", "ctrl+alt"),
        ]

        for i, (label, hotkey) in enumerate(ptt_presets):
            btn = ctk.CTkButton(
                self.ptt_frame,
                text=label,
                font=ctk.CTkFont(size=12),
                height=36,
                corner_radius=6,
                fg_color="transparent",
                border_width=1,
                border_color=self.colors['border'],
                text_color=self.colors['text'],
                hover_color=self.colors['accent'],
                command=lambda h=hotkey: self._set_ptt_key(h)
            )
            btn.grid(row=2+i, column=0, sticky="ew", padx=20, pady=3)

        # Separator
        separator_ptt = ctk.CTkLabel(
            self.ptt_frame,
            text="──────────────── OU ─────────────────",
            font=ctk.CTkFont(size=10),
            text_color=self.colors['text_secondary']
        )
        separator_ptt.grid(row=5, column=0, pady=8)

        # Custom recorder button
        custom_ptt_btn = ctk.CTkButton(
            self.ptt_frame,
            text="🎹 Enregistrer un raccourci personnalisé",
            font=ctk.CTkFont(size=13, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['primary'],
            hover_color=self.colors['border'],
            text_color="#FFFFFF",
            command=lambda: self._open_key_recorder("push_to_talk")
        )
        custom_ptt_btn.grid(row=6, column=0, sticky="ew", padx=20, pady=8)

        # Recent hotkeys section (if any)
        if self.recent_hotkeys:
            recent_ptt_label = ctk.CTkLabel(
                self.ptt_frame,
                text="Raccourcis récents:",
                font=ctk.CTkFont(size=11),
                text_color=self.colors['text']
            )
            recent_ptt_label.grid(row=7, column=0, sticky="w", padx=20, pady=(10, 5))

            for i, hotkey in enumerate(self.recent_hotkeys[:3]):  # Show max 3 recent
                recent_ptt_btn = ctk.CTkButton(
                    self.ptt_frame,
                    text=f"• {self._format_hotkey(hotkey)}",
                    font=ctk.CTkFont(size=11),
                    height=32,
                    corner_radius=6,
                    fg_color="transparent",
                    border_width=1,
                    border_color=self.colors['text_secondary'],
                    text_color=self.colors['text'],
                    hover_color=self.colors['accent'],
                    command=lambda h=hotkey: self._set_ptt_key(h)
                )
                recent_ptt_btn.grid(row=8+i, column=0, sticky="ew", padx=20, pady=2)

        ctk.CTkLabel(self.ptt_frame, text="", height=5).grid(row=20, column=0)  # Spacer

        # Update visibility based on current mode
        self._update_mode_visibility()

        # Buttons
        buttons_frame = ctk.CTkFrame(main_container, fg_color="transparent")
        buttons_frame.grid(row=5, column=0, sticky="ew")
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)

        cancel_btn = ctk.CTkButton(
            buttons_frame,
            text="Annuler",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['error'],
            text_color=self.colors['error'],
            hover_color=self.colors['error'],
            command=self._on_cancel
        )
        cancel_btn.grid(row=0, column=0, sticky="ew", padx=(0, 8))

        save_btn = ctk.CTkButton(
            buttons_frame,
            text="✅ Enregistrer",
            font=ctk.CTkFont(size=14, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['success'],
            hover_color=self.colors['border'],
            text_color="#FFFFFF",
            command=self._on_save
        )
        save_btn.grid(row=0, column=1, sticky="ew", padx=(8, 0))

    def _format_hotkey(self, hotkey: str) -> str:
        """Format hotkey for display."""
        return hotkey.upper().replace("+", " + ")

    def _set_toggle_key(self, hotkey: str):
        """Set toggle hotkey."""
        self.new_toggle_key = hotkey
        self.toggle_display.configure(text=self._format_hotkey(hotkey))
        logger.info(f"Toggle key set to: {hotkey}")

    def _set_ptt_key(self, hotkey: str):
        """Set push-to-talk hotkey."""
        self.new_push_to_talk_key = hotkey
        self.ptt_display.configure(text=self._format_hotkey(hotkey))
        logger.info(f"Push-to-talk key set to: {hotkey}")

    def _on_mode_changed(self, *args):
        """Handle mode change."""
        self.new_mode = self.mode_var.get()
        self._update_mode_visibility()
        logger.info(f"Mode changed to: {self.new_mode}")

    def _update_mode_visibility(self):
        """Update visibility - now always shows both configs."""
        # Always show both frames
        self.toggle_frame.grid()
        self.ptt_frame.grid()

    def _on_save(self):
        """Save settings and close."""
        logger.info(f"Saving hotkey settings - Mode: {self.new_mode}, Toggle: {self.new_toggle_key}, PTT: {self.new_push_to_talk_key}")

        # Call callback if provided
        if self.on_save_callback:
            self.on_save_callback(
                mode=self.new_mode,
                toggle_key=self.new_toggle_key,
                push_to_talk_key=self.new_push_to_talk_key
            )

        self.grab_release()
        self.destroy()

    def _open_key_recorder(self, mode: str):
        """
        Open key recorder dialog to record a custom hotkey.

        Args:
            mode: "toggle" or "push_to_talk"
        """
        logger.info(f"Opening key recorder for {mode}")

        def on_record(hotkey: str):
            """Handle recorded hotkey."""
            logger.info(f"Hotkey recorded: {hotkey} for {mode}")
            if mode == "toggle":
                self._set_toggle_key(hotkey)
            else:  # push_to_talk
                self._set_ptt_key(hotkey)

        # Open key recorder dialog
        KeyRecorderDialog(
            self,
            on_record=on_record,
            title=f"🎹 Enregistrer un Raccourci ({mode.replace('_', ' ').title()})"
        )

    def _on_cancel(self):
        """Cancel and close without saving."""
        logger.info("Hotkey settings cancelled")
        self.grab_release()
        self.destroy()


if __name__ == "__main__":
    # Test hotkey settings window
    ctk.set_appearance_mode("light")
    ctk.set_default_color_theme("blue")

    def on_save(mode, toggle_key, push_to_talk_key):
        print(f"Saved: mode={mode}, toggle={toggle_key}, ptt={push_to_talk_key}")

    app = ctk.CTk()
    app.withdraw()

    hotkey_window = HotkeySettingsWindow(
        app,
        current_toggle_key="alt+shift+d",
        current_push_to_talk_key="alt+shift+d",
        current_mode="toggle",
        on_save=on_save
    )

    app.mainloop()
