"""
Custom Dictionary Window.
Manage custom word replacements for transcription correction.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from typing import Optional, Dict
from loguru import logger

from ..utils.custom_dictionary import CustomDictionary


class DictionaryWindow(ctk.CTkToplevel):
    """
    Window for managing custom dictionary entries.
    """

    def __init__(
        self,
        parent,
        dictionary: CustomDictionary,
        theme_colors: Optional[Dict[str, str]] = None
    ):
        """
        Initialize dictionary window.

        Args:
            parent: Parent window
            dictionary: CustomDictionary instance
            theme_colors: Color scheme dictionary
        """
        super().__init__(parent)

        self.dictionary = dictionary
        self.colors = theme_colors or self._get_default_colors()

        # Window setup
        self._setup_window()

        # Create UI
        self._create_ui()

        # Load entries
        self._load_entries()

        logger.info("📚 Dictionary window opened")

    def _get_default_colors(self) -> Dict[str, str]:
        """Get default Shinkofa colors (light mode)."""
        return {
            'bg': "#FFFFFF",
            'fg': "#1c3049",
            'primary': "#e08f34",
            'primary_hover': "#1c3049",
            'accent': "#f5cd3e",
            'success': "#2d7a2f",
            'error': "#c62828",
            'warning': "#e65100",
            'border': "#1c3049",
        }

    def _setup_window(self):
        """Setup window properties."""
        self.title("📚 Dictionnaire Personnalisé")

        # Window size
        width, height = 700, 600
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Minimum size
        self.minsize(600, 500)

        # Make window modal
        self.transient(self.master)
        self.grab_set()

    def _create_ui(self):
        """Create UI components."""
        # Main container
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(2, weight=1)

        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent")
        header_frame.grid(row=0, column=0, sticky="ew", padx=20, pady=(20, 10))
        header_frame.grid_columnconfigure(0, weight=1)

        title_label = ctk.CTkLabel(
            header_frame,
            text="📚 Dictionnaire Personnalisé",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color=self.colors['fg']
        )
        title_label.grid(row=0, column=0, sticky="w")

        # Count label
        self.count_label = ctk.CTkLabel(
            header_frame,
            text="Chargement...",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['primary']
        )
        self.count_label.grid(row=1, column=0, sticky="w", pady=(4, 0))

        # Add entry frame
        add_frame = ctk.CTkFrame(self, corner_radius=8, border_width=2, border_color=self.colors['border'])
        add_frame.grid(row=1, column=0, sticky="ew", padx=20, pady=10)
        add_frame.grid_columnconfigure(0, weight=1)
        add_frame.grid_columnconfigure(1, weight=1)

        # Title
        add_title = ctk.CTkLabel(
            add_frame,
            text="➕ Ajouter une entrée",
            font=ctk.CTkFont(size=16, weight="bold"),
            text_color=self.colors['fg']
        )
        add_title.grid(row=0, column=0, columnspan=3, sticky="w", padx=12, pady=(12, 8))

        # Original word input
        original_label = ctk.CTkLabel(
            add_frame,
            text="Mot original :",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['fg']
        )
        original_label.grid(row=1, column=0, sticky="w", padx=12, pady=(0, 8))

        self.original_entry = ctk.CTkEntry(
            add_frame,
            placeholder_text="ex: jay, ermite, shinkofa",
            font=ctk.CTkFont(size=12),
            height=36
        )
        self.original_entry.grid(row=2, column=0, sticky="ew", padx=(12, 6), pady=(0, 12))

        # Replacement word input
        replacement_label = ctk.CTkLabel(
            add_frame,
            text="Remplacement :",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['fg']
        )
        replacement_label.grid(row=1, column=1, sticky="w", padx=12, pady=(0, 8))

        self.replacement_entry = ctk.CTkEntry(
            add_frame,
            placeholder_text="ex: Jay, The Ermite, Shinkofa",
            font=ctk.CTkFont(size=12),
            height=36
        )
        self.replacement_entry.grid(row=2, column=1, sticky="ew", padx=(6, 6), pady=(0, 12))

        # Add button
        add_button = ctk.CTkButton(
            add_frame,
            text="➕ Ajouter",
            font=ctk.CTkFont(size=12, weight="bold"),
            height=36,
            corner_radius=6,
            fg_color=self.colors['success'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            command=self._add_entry
        )
        add_button.grid(row=2, column=2, sticky="ew", padx=(6, 12), pady=(0, 12))

        # Scrollable frame for entries
        self.scrollable_frame = ctk.CTkScrollableFrame(
            self,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['border']
        )
        self.scrollable_frame.grid(row=2, column=0, sticky="nsew", padx=20, pady=10)
        self.scrollable_frame.grid_columnconfigure(0, weight=1)

        # Bottom buttons
        buttons_frame = ctk.CTkFrame(self, fg_color="transparent")
        buttons_frame.grid(row=3, column=0, sticky="ew", padx=20, pady=(10, 20))
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)
        buttons_frame.grid_columnconfigure(2, weight=1)

        # Refresh button
        refresh_button = ctk.CTkButton(
            buttons_frame,
            text="🔄 Actualiser",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['primary'],
            text_color=self.colors['primary'],
            hover_color=self.colors['primary'],
            command=self._load_entries
        )
        refresh_button.grid(row=0, column=0, sticky="ew", padx=(0, 4))

        # Clear all button
        clear_button = ctk.CTkButton(
            buttons_frame,
            text="🗑️ Tout Effacer",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['error'],
            text_color=self.colors['error'],
            hover_color=self.colors['error'],
            command=self._clear_all
        )
        clear_button.grid(row=0, column=1, sticky="ew", padx=4)

        # Close button
        close_button = ctk.CTkButton(
            buttons_frame,
            text="✕ Fermer",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color=self.colors['primary'],
            hover_color=self.colors['primary_hover'],
            text_color="#FFFFFF",
            command=self._on_close
        )
        close_button.grid(row=0, column=2, sticky="ew", padx=(4, 0))

        # Bind Enter key to add entry
        self.original_entry.bind("<Return>", lambda e: self._add_entry())
        self.replacement_entry.bind("<Return>", lambda e: self._add_entry())

    def _load_entries(self):
        """Load and display dictionary entries."""
        try:
            # Clear existing entries
            for widget in self.scrollable_frame.winfo_children():
                widget.destroy()

            # Get entries
            entries = self.dictionary.get_entries()

            if not entries:
                # No entries
                no_entries_label = ctk.CTkLabel(
                    self.scrollable_frame,
                    text="Aucune entrée dans le dictionnaire\nAjoutez des mots pour correction automatique",
                    font=ctk.CTkFont(size=14),
                    text_color=self.colors['fg'],
                    justify="center"
                )
                no_entries_label.grid(row=0, column=0, pady=40)
                self.count_label.configure(text="0 entrée")
                return

            # Update count
            count = len(entries)
            self.count_label.configure(
                text=f"{count} entrée{'s' if count > 1 else ''}"
            )

            # Display entries (sorted alphabetically)
            sorted_entries = sorted(entries.items(), key=lambda x: x[0].lower())
            for idx, (original, replacement) in enumerate(sorted_entries):
                self._create_entry_card(original, replacement, idx)

            logger.info(f"📚 Loaded {count} dictionary entries")

        except Exception as e:
            logger.error(f"Failed to load dictionary entries: {e}")
            logger.exception(e)

    def _create_entry_card(self, original: str, replacement: str, index: int):
        """
        Create a card for a dictionary entry.

        Args:
            original: Original word/phrase
            replacement: Replacement word/phrase
            index: Entry index
        """
        # Entry card
        card = ctk.CTkFrame(
            self.scrollable_frame,
            corner_radius=8,
            border_width=1,
            border_color=self.colors['border']
        )
        card.grid(row=index, column=0, sticky="ew", pady=6)
        card.grid_columnconfigure(0, weight=1)
        card.grid_columnconfigure(1, weight=1)

        # Original word
        original_frame = ctk.CTkFrame(card, fg_color="transparent")
        original_frame.grid(row=0, column=0, sticky="ew", padx=12, pady=12)

        original_label_title = ctk.CTkLabel(
            original_frame,
            text="Original :",
            font=ctk.CTkFont(size=11),
            text_color=self.colors['primary']
        )
        original_label_title.pack(anchor="w")

        original_label = ctk.CTkLabel(
            original_frame,
            text=f'"{original}"',
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['fg']
        )
        original_label.pack(anchor="w", pady=(2, 0))

        # Arrow
        arrow_label = ctk.CTkLabel(
            card,
            text="→",
            font=ctk.CTkFont(size=20, weight="bold"),
            text_color=self.colors['primary']
        )
        arrow_label.grid(row=0, column=1, padx=8)

        # Replacement word
        replacement_frame = ctk.CTkFrame(card, fg_color="transparent")
        replacement_frame.grid(row=0, column=2, sticky="ew", padx=12, pady=12)

        replacement_label_title = ctk.CTkLabel(
            replacement_frame,
            text="Remplacement :",
            font=ctk.CTkFont(size=11),
            text_color=self.colors['success']
        )
        replacement_label_title.pack(anchor="w")

        replacement_label = ctk.CTkLabel(
            replacement_frame,
            text=f'"{replacement}"',
            font=ctk.CTkFont(size=14, weight="bold"),
            text_color=self.colors['fg']
        )
        replacement_label.pack(anchor="w", pady=(2, 0))

        # Edit button
        edit_button = ctk.CTkButton(
            card,
            text="✏️",
            font=ctk.CTkFont(size=16),
            width=40,
            height=40,
            corner_radius=6,
            fg_color="transparent",
            border_width=1,
            border_color=self.colors['primary'],
            text_color=self.colors['primary'],
            hover_color=self.colors['primary'],
            command=lambda o=original, r=replacement: self._edit_entry(o, r)
        )
        edit_button.grid(row=0, column=3, padx=(12, 4))

        # Delete button
        delete_button = ctk.CTkButton(
            card,
            text="🗑️",
            font=ctk.CTkFont(size=16),
            width=40,
            height=40,
            corner_radius=6,
            fg_color="transparent",
            border_width=1,
            border_color=self.colors['error'],
            text_color=self.colors['error'],
            hover_color=self.colors['error'],
            command=lambda o=original: self._delete_entry(o)
        )
        delete_button.grid(row=0, column=4, padx=(4, 12))

    def _add_entry(self):
        """Add new dictionary entry."""
        original = self.original_entry.get().strip()
        replacement = self.replacement_entry.get().strip()

        if not original or not replacement:
            logger.warning("Cannot add entry: original or replacement is empty")
            return

        try:
            self.dictionary.add_entry(original, replacement)
            logger.info(f"📚 Added entry: '{original}' → '{replacement}'")

            # Clear inputs
            self.original_entry.delete(0, "end")
            self.replacement_entry.delete(0, "end")

            # Reload entries
            self._load_entries()

            # Focus original entry for next input
            self.original_entry.focus()

        except Exception as e:
            logger.error(f"Failed to add entry: {e}")

    def _delete_entry(self, original: str):
        """
        Delete dictionary entry.

        Args:
            original: Original word to delete
        """
        try:
            self.dictionary.remove_entry(original)
            logger.info(f"📚 Deleted entry: '{original}'")

            # Reload entries
            self._load_entries()

        except Exception as e:
            logger.error(f"Failed to delete entry: {e}")

    def _edit_entry(self, original: str, replacement: str):
        """
        Edit dictionary entry (loads values into input fields).

        Args:
            original: Original word to edit
            replacement: Current replacement value
        """
        try:
            # Load values into input fields
            self.original_entry.delete(0, "end")
            self.original_entry.insert(0, original)

            self.replacement_entry.delete(0, "end")
            self.replacement_entry.insert(0, replacement)

            # Focus replacement entry (most likely field to modify)
            self.replacement_entry.focus()
            self.replacement_entry.select_range(0, "end")

            logger.info(f"📝 Editing entry: '{original}' → '{replacement}'")

        except Exception as e:
            logger.error(f"Failed to edit entry: {e}")

    def _clear_all(self):
        """Clear all dictionary entries (with confirmation)."""
        # Confirmation dialog
        confirm_window = ctk.CTkToplevel(self)
        confirm_window.title("Confirmation")
        confirm_window.geometry("400x200")
        confirm_window.resizable(False, False)
        confirm_window.transient(self)
        confirm_window.grab_set()

        # Center window
        confirm_window.update_idletasks()
        width = confirm_window.winfo_width()
        height = confirm_window.winfo_height()
        x = (confirm_window.winfo_screenwidth() // 2) - (width // 2)
        y = (confirm_window.winfo_screenheight() // 2) - (height // 2)
        confirm_window.geometry(f'{width}x{height}+{x}+{y}')

        # Content
        content_frame = ctk.CTkFrame(confirm_window, fg_color="transparent")
        content_frame.pack(fill="both", expand=True, padx=20, pady=20)

        warning_label = ctk.CTkLabel(
            content_frame,
            text="⚠️ Confirmer la suppression",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['error']
        )
        warning_label.pack(pady=(0, 16))

        message_label = ctk.CTkLabel(
            content_frame,
            text="Voulez-vous vraiment effacer tout le dictionnaire ?\nCette action est irréversible.",
            font=ctk.CTkFont(size=14),
            text_color=self.colors['fg'],
            justify="center"
        )
        message_label.pack(pady=(0, 24))

        # Buttons
        buttons_frame = ctk.CTkFrame(content_frame, fg_color="transparent")
        buttons_frame.pack(fill="x")

        def do_clear():
            try:
                self.dictionary.clear_all()
                logger.info("📚 Dictionary cleared")
                self._load_entries()
                confirm_window.destroy()
            except Exception as e:
                logger.error(f"Failed to clear dictionary: {e}")

        cancel_button = ctk.CTkButton(
            buttons_frame,
            text="Annuler",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=self.colors['border'],
            text_color=self.colors['fg'],
            hover_color=self.colors['border'],
            command=confirm_window.destroy
        )
        cancel_button.pack(side="left", expand=True, fill="x", padx=(0, 8))

        confirm_button = ctk.CTkButton(
            buttons_frame,
            text="Effacer tout",
            font=ctk.CTkFont(size=14, weight="bold"),
            height=44,
            corner_radius=8,
            fg_color=self.colors['error'],
            hover_color="#a02020",
            text_color="#FFFFFF",
            command=do_clear
        )
        confirm_button.pack(side="right", expand=True, fill="x", padx=(8, 0))

    def _on_close(self):
        """Handle window close."""
        logger.info("📚 Dictionary window closed")
        self.grab_release()
        self.destroy()


if __name__ == "__main__":
    # Test dictionary window
    from ..utils.logger import setup_logger

    setup_logger(log_level="INFO")

    # Create test app
    app = ctk.CTk()
    app.geometry("400x300")
    app.title("Test App")

    # Create test dictionary
    dictionary = CustomDictionary(dictionary_file="test_dictionary.json")

    # Button to open dictionary
    def open_dictionary():
        DictionaryWindow(app, dictionary)

    button = ctk.CTkButton(app, text="Open Dictionary", command=open_dictionary)
    button.pack(pady=20)

    app.mainloop()
