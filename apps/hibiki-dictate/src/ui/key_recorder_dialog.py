"""
Key Recorder Dialog for custom keyboard shortcuts configuration.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
import keyboard
import threading
from typing import Optional, Callable, Set
from loguru import logger
from .theme import ShinkofaColors


# Windows system shortcuts that might conflict
WINDOWS_RESERVED_SHORTCUTS = {
    "win+d": "Afficher/masquer le bureau",
    "win+l": "Verrouiller la session",
    "win+e": "Ouvrir l'explorateur de fichiers",
    "win+r": "Ouvrir Exécuter",
    "win+i": "Ouvrir Paramètres",
    "win+x": "Menu Lien rapide",
    "win+tab": "Vue des tâches",
    "win+shift+s": "Capture d'écran (Snipping Tool)",
    "ctrl+alt+delete": "Écran de sécurité Windows",
    "ctrl+shift+esc": "Gestionnaire des tâches",
    "alt+tab": "Basculer entre les fenêtres",
    "alt+f4": "Fermer la fenêtre active",
    "win+printscreen": "Capture d'écran complète",
    "win+v": "Historique du presse-papiers",
    "win+h": "Dictée vocale Windows",
    "win+ctrl+d": "Créer un nouveau bureau virtuel",
    "win+ctrl+left": "Basculer vers le bureau virtuel précédent",
    "win+ctrl+right": "Basculer vers le bureau virtuel suivant",
}


class KeyRecorderDialog(ctk.CTkToplevel):
    """
    Dialog for recording custom keyboard shortcuts.

    Features:
    - Real-time key combination display
    - Visual feedback during recording
    - Conflict detection with Windows shortcuts
    - Cancel with Escape key
    """

    def __init__(
        self,
        parent,
        on_record: Optional[Callable[[str], None]] = None,
        title: str = "🎹 Enregistrer un Raccourci"
    ):
        """
        Initialize key recorder dialog.

        Args:
            parent: Parent window
            on_record: Callback function called when a valid shortcut is recorded
            title: Dialog window title
        """
        super().__init__(parent)

        self.on_record_callback = on_record
        self.recorded_hotkey: Optional[str] = None
        self.pressed_keys: Set[str] = set()
        self.is_recording = False
        self.hook_handle = None
        self.lock = threading.Lock()

        # Setup window
        self._setup_window(title)
        self._create_ui()

        # Start recording after UI is ready
        self.after(100, self._start_recording)

    def _setup_window(self, title: str):
        """Setup window properties."""
        self.title(title)

        # Window size
        width, height = 500, 400
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Non-resizable
        self.resizable(False, False)

        # Modal
        self.transient(self.master)
        self.grab_set()

        # Focus
        self.focus_force()

        # Protocol
        self.protocol("WM_DELETE_WINDOW", self._on_cancel)

    def _create_ui(self):
        """Create UI components."""
        # Main container
        main_container = ctk.CTkFrame(self, fg_color="transparent")
        main_container.pack(fill="both", expand=True, padx=30, pady=30)
        main_container.grid_rowconfigure(2, weight=1)

        # Title
        title_label = ctk.CTkLabel(
            main_container,
            text="🎹 Pressez la combinaison de touches",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=ShinkofaColors.BLEU_MARINE
        )
        title_label.pack(pady=(0, 10))

        # Instructions
        instructions = ctk.CTkLabel(
            main_container,
            text="Maintenez les touches souhaitées, puis relâchez.\n"
                 "La combinaison sera enregistrée au relâchement.",
            font=ctk.CTkFont(size=12),
            text_color=ShinkofaColors.BLEU_MARINE,
            wraplength=400,
            justify="center"
        )
        instructions.pack(pady=(0, 20))

        # Recording indicator (animated)
        self.recording_indicator = ctk.CTkLabel(
            main_container,
            text="● Enregistrement en cours...",
            font=ctk.CTkFont(size=13),
            text_color=ShinkofaColors.ERROR
        )
        self.recording_indicator.pack(pady=(0, 15))

        # Key display frame
        display_frame = ctk.CTkFrame(
            main_container,
            corner_radius=12,
            fg_color=ShinkofaColors.JAUNE_CLARTE,
            border_width=3,
            border_color=ShinkofaColors.ORANGE_CHALEUR,
            height=100
        )
        display_frame.pack(fill="x", pady=(0, 20))
        display_frame.pack_propagate(False)

        self.key_display = ctk.CTkLabel(
            display_frame,
            text="...",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color=ShinkofaColors.BLEU_MARINE_FONCE
        )
        self.key_display.pack(expand=True)

        # Warning label (hidden by default)
        self.warning_label = ctk.CTkLabel(
            main_container,
            text="",
            font=ctk.CTkFont(size=11),
            text_color=ShinkofaColors.WARNING,
            wraplength=400,
            justify="center"
        )
        self.warning_label.pack(pady=(0, 10))

        # Conflict info label (hidden by default)
        self.conflict_label = ctk.CTkLabel(
            main_container,
            text="",
            font=ctk.CTkFont(size=10),
            text_color=ShinkofaColors.BLEU_MARINE,
            wraplength=400,
            justify="center"
        )
        self.conflict_label.pack(pady=(0, 15))

        # Buttons
        buttons_frame = ctk.CTkFrame(main_container, fg_color="transparent")
        buttons_frame.pack(fill="x")
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)

        self.cancel_btn = ctk.CTkButton(
            buttons_frame,
            text="Annuler (Esc)",
            font=ctk.CTkFont(size=12),
            height=40,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=ShinkofaColors.ERROR,
            text_color=ShinkofaColors.ERROR,
            hover_color=ShinkofaColors.ERROR,
            command=self._on_cancel
        )
        self.cancel_btn.grid(row=0, column=0, sticky="ew", padx=(0, 5))

        self.confirm_btn = ctk.CTkButton(
            buttons_frame,
            text="✅ Valider",
            font=ctk.CTkFont(size=12, weight="bold"),
            height=40,
            corner_radius=8,
            fg_color=ShinkofaColors.SUCCESS,
            hover_color=ShinkofaColors.BLEU_MARINE,
            text_color=ShinkofaColors.BLANC,
            command=self._on_confirm,
            state="disabled"  # Disabled until a key is recorded
        )
        self.confirm_btn.grid(row=0, column=1, sticky="ew", padx=(5, 0))

        # Tip
        tip_label = ctk.CTkLabel(
            main_container,
            text="💡 Astuce: Pressez Échap pour annuler",
            font=ctk.CTkFont(size=10),
            text_color=ShinkofaColors.GRIS_CLAIR
        )
        tip_label.pack(side="bottom", pady=(15, 0))

    def _start_recording(self):
        """Start recording keyboard input."""
        self.is_recording = True
        self.hook_handle = keyboard.hook(self._on_keyboard_event, suppress=False)
        logger.info("Key recorder started")
        self._animate_recording_indicator()

    def _animate_recording_indicator(self):
        """Animate the recording indicator."""
        if not self.is_recording:
            return

        current_text = self.recording_indicator.cget("text")
        if current_text.startswith("●"):
            self.recording_indicator.configure(text="○ Enregistrement en cours...")
        else:
            self.recording_indicator.configure(text="● Enregistrement en cours...")

        self.after(500, self._animate_recording_indicator)

    def _on_keyboard_event(self, event):
        """
        Handle keyboard events during recording.

        Args:
            event: Keyboard event from keyboard library
        """
        try:
            with self.lock:
                # Normalize key name
                key_name = event.name.lower() if hasattr(event, 'name') else str(event.scan_code)

                # Handle Escape key to cancel
                if key_name == "esc" or key_name == "escape":
                    if event.event_type == 'up':
                        self.after(0, self._on_cancel)
                    return False

                if event.event_type == 'down':
                    # Key pressed
                    self.pressed_keys.add(key_name)
                    self._update_display()

                elif event.event_type == 'up':
                    # Key released
                    if key_name in self.pressed_keys:
                        self.pressed_keys.discard(key_name)

                        # If all keys are released and we had keys pressed, record the combination
                        if not self.pressed_keys and self.recorded_hotkey:
                            self.after(0, self._enable_confirm_button)

        except Exception as e:
            logger.error(f"Error in keyboard event handler: {e}")

        return False  # Don't suppress the event

    def _update_display(self):
        """Update the key combination display."""
        if not self.pressed_keys:
            self.key_display.configure(text="...")
            self.recorded_hotkey = None
            self.warning_label.configure(text="")
            self.conflict_label.configure(text="")
            return

        # Sort keys for consistent display (modifiers first)
        modifier_order = {"ctrl": 0, "shift": 1, "alt": 2, "win": 3}
        sorted_keys = sorted(
            self.pressed_keys,
            key=lambda k: (modifier_order.get(k, 999), k)
        )

        # Format for display
        display_text = " + ".join(k.upper() for k in sorted_keys)
        self.key_display.configure(text=display_text)

        # Store as hotkey string (lowercase with +)
        self.recorded_hotkey = "+".join(sorted_keys)

        # Check for conflicts
        self._check_conflicts()

    def _check_conflicts(self):
        """Check if the recorded hotkey conflicts with Windows shortcuts."""
        if not self.recorded_hotkey:
            return

        # Normalize for comparison
        normalized = self.recorded_hotkey.lower().replace("windows", "win")

        if normalized in WINDOWS_RESERVED_SHORTCUTS:
            conflict_desc = WINDOWS_RESERVED_SHORTCUTS[normalized]
            self.warning_label.configure(
                text=f"⚠️ Attention: Ce raccourci est utilisé par Windows"
            )
            self.conflict_label.configure(
                text=f"Action Windows: {conflict_desc}\n"
                     "Il pourrait ne pas fonctionner comme prévu."
            )
        else:
            self.warning_label.configure(text="✅ Aucun conflit détecté")
            self.conflict_label.configure(text="")

    def _enable_confirm_button(self):
        """Enable the confirm button after recording."""
        if self.recorded_hotkey:
            self.confirm_btn.configure(state="normal")
            self.recording_indicator.configure(
                text="✓ Combinaison enregistrée",
                text_color=ShinkofaColors.SUCCESS
            )

    def _stop_recording(self):
        """Stop recording keyboard input."""
        if self.hook_handle:
            keyboard.unhook(self.hook_handle)
            self.hook_handle = None
        self.is_recording = False
        logger.info("Key recorder stopped")

    def _on_confirm(self):
        """Confirm and return the recorded hotkey."""
        if not self.recorded_hotkey:
            logger.warning("No hotkey recorded, cannot confirm")
            return

        self._stop_recording()

        logger.info(f"Hotkey recorded and confirmed: {self.recorded_hotkey}")

        # Call callback
        if self.on_record_callback:
            self.on_record_callback(self.recorded_hotkey)

        self.grab_release()
        self.destroy()

    def _on_cancel(self):
        """Cancel recording and close dialog."""
        self._stop_recording()
        logger.info("Key recording cancelled")
        self.grab_release()
        self.destroy()


if __name__ == "__main__":
    # Test key recorder dialog
    from loguru import logger

    ctk.set_appearance_mode("light")

    def on_record(hotkey: str):
        print(f"✅ Recorded hotkey: {hotkey}")

    app = ctk.CTk()
    app.withdraw()

    dialog = KeyRecorderDialog(app, on_record=on_record)

    app.mainloop()
