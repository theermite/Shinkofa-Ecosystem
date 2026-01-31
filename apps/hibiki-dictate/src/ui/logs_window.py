"""
Real-time logs viewer window for Hibiki.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from pathlib import Path
from typing import Optional
import threading
import time
from loguru import logger
from .theme import ShinkofaColors


class LogsWindow(ctk.CTkToplevel):
    """Real-time logs viewer window."""

    def __init__(self, parent, logs_dir: Path):
        super().__init__(parent)

        self.logs_dir = logs_dir
        self.is_tailing = False
        self.tail_thread: Optional[threading.Thread] = None
        self.current_log_file: Optional[Path] = None

        # Setup window
        self._setup_window()
        self._create_ui()

        # Start tailing logs
        self._start_tailing()

    def _setup_window(self):
        """Setup window properties."""
        self.title("📄 Hibiki - Logs en temps réel")

        # Window size
        width, height = 900, 600
        screen_width = self.winfo_screenwidth()
        screen_height = self.winfo_screenheight()
        x = (screen_width - width) // 2
        y = (screen_height - height) // 2
        self.geometry(f"{width}x{height}+{x}+{y}")

        # Minimum size
        self.minsize(700, 400)

        # Make it modal
        self.transient(self.master)
        self.grab_set()

        # Protocol
        self.protocol("WM_DELETE_WINDOW", self._on_closing)

    def _create_ui(self):
        """Create UI components."""
        # Main container
        self.grid_columnconfigure(0, weight=1)
        self.grid_rowconfigure(1, weight=1)

        # Header
        header_frame = ctk.CTkFrame(self, fg_color="transparent", height=60)
        header_frame.grid(row=0, column=0, sticky="ew", padx=20, pady=(20, 10))
        header_frame.grid_columnconfigure(0, weight=1)
        header_frame.grid_propagate(False)

        title_label = ctk.CTkLabel(
            header_frame,
            text="📄 Logs en temps réel",
            font=ctk.CTkFont(size=24, weight="bold"),
            text_color=ShinkofaColors.BLEU_MARINE
        )
        title_label.grid(row=0, column=0, sticky="w")

        # Logs display (dark mode terminal style)
        self.logs_textbox = ctk.CTkTextbox(
            self,
            font=ctk.CTkFont(family="Consolas", size=11),
            fg_color="#0d1420",  # Dark background
            text_color="#e0e0e0",  # Light text
            wrap="word",
            activate_scrollbars=True
        )
        self.logs_textbox.grid(row=1, column=0, sticky="nsew", padx=20, pady=(0, 10))

        # Buttons frame
        buttons_frame = ctk.CTkFrame(self, fg_color="transparent", height=60)
        buttons_frame.grid(row=2, column=0, sticky="ew", padx=20, pady=(0, 20))
        buttons_frame.grid_columnconfigure(0, weight=1)
        buttons_frame.grid_columnconfigure(1, weight=1)
        buttons_frame.grid_columnconfigure(2, weight=1)
        buttons_frame.grid_propagate(False)

        # Clear button
        clear_btn = ctk.CTkButton(
            buttons_frame,
            text="🧹 Effacer",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color=ShinkofaColors.WARNING,
            hover_color=ShinkofaColors.BLEU_MARINE,
            text_color=ShinkofaColors.BLANC,
            command=self._clear_logs
        )
        clear_btn.grid(row=0, column=0, sticky="ew", padx=(0, 8))

        # Refresh button
        refresh_btn = ctk.CTkButton(
            buttons_frame,
            text="🔄 Actualiser",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color=ShinkofaColors.ORANGE_CHALEUR,
            hover_color=ShinkofaColors.BLEU_MARINE,
            text_color=ShinkofaColors.BLANC,
            command=self._refresh_logs
        )
        refresh_btn.grid(row=0, column=1, sticky="ew", padx=(8, 8))

        # Close button
        close_btn = ctk.CTkButton(
            buttons_frame,
            text="✖️ Fermer",
            font=ctk.CTkFont(size=14),
            height=44,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=ShinkofaColors.BLEU_MARINE,
            text_color=ShinkofaColors.BLEU_MARINE,
            hover_color=ShinkofaColors.BLEU_MARINE,
            command=self._on_closing
        )
        close_btn.grid(row=0, column=2, sticky="ew", padx=(8, 0))

    def _find_latest_log_file(self) -> Optional[Path]:
        """Find the most recent log file."""
        try:
            log_files = list(self.logs_dir.glob("hibiki_*.log"))
            if not log_files:
                return None

            # Sort by modification time, get most recent
            latest = max(log_files, key=lambda p: p.stat().st_mtime)
            return latest

        except Exception as e:
            logger.error(f"Error finding log file: {e}")
            return None

    def _start_tailing(self):
        """Start tailing the log file in a background thread."""
        self.current_log_file = self._find_latest_log_file()

        if not self.current_log_file:
            self.logs_textbox.insert("end", "❌ Aucun fichier de log trouvé.\n")
            return

        self.is_tailing = True
        self.tail_thread = threading.Thread(target=self._tail_log_file, daemon=True)
        self.tail_thread.start()

    def _tail_log_file(self):
        """Tail the log file and update the textbox in real-time."""
        try:
            with open(self.current_log_file, 'r', encoding='utf-8') as f:
                # Read existing content
                existing = f.read()
                if existing:
                    self.after(0, lambda: self._append_log(existing))

                # Follow new content
                while self.is_tailing:
                    line = f.readline()
                    if line:
                        self.after(0, lambda l=line: self._append_log(l))
                    else:
                        time.sleep(0.1)  # Wait a bit before checking again

        except Exception as e:
            logger.error(f"Error tailing log file: {e}")
            self.after(0, lambda: self._append_log(f"\n❌ Erreur lors de la lecture du fichier: {e}\n"))

    def _append_log(self, text: str):
        """Append text to the logs textbox (called from main thread)."""
        try:
            self.logs_textbox.insert("end", text)
            self.logs_textbox.see("end")  # Auto-scroll to bottom
        except Exception as e:
            logger.error(f"Error appending log: {e}")

    def _clear_logs(self):
        """Clear the logs display."""
        self.logs_textbox.delete("1.0", "end")
        logger.info("Logs display cleared")

    def _refresh_logs(self):
        """Refresh logs by reloading the file."""
        self._clear_logs()

        # Stop current tailing
        self.is_tailing = False
        if self.tail_thread:
            self.tail_thread.join(timeout=1.0)

        # Restart tailing
        self._start_tailing()

        logger.info("Logs refreshed")

    def _on_closing(self):
        """Handle window closing."""
        self.is_tailing = False
        if self.tail_thread:
            self.tail_thread.join(timeout=1.0)

        self.grab_release()
        self.destroy()


if __name__ == "__main__":
    # Test logs window
    ctk.set_appearance_mode("light")
    ctk.set_default_color_theme("blue")

    app = ctk.CTk()
    app.withdraw()  # Hide main window

    logs_dir = Path(__file__).parent.parent.parent / "logs"
    logs_window = LogsWindow(app, logs_dir)

    app.mainloop()
