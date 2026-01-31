"""
Quick visual test for UI layout changes.
"""

import customtkinter as ctk
from src.ui.theme import ShinkofaColors
from src.ui.components import EmojiButton, create_language_dropdown


def test_components():
    """Test individual components."""
    root = ctk.CTk()
    root.title("Hibiki UI Test")
    root.geometry("400x500")

    colors = ShinkofaColors.get_colors("light")
    root.configure(fg_color=colors['bg'])

    # Main container
    main = ctk.CTkFrame(root, fg_color=colors['bg'])
    main.pack(fill="both", expand=True, padx=20, pady=20)

    # Test corner buttons (absolute positioning)
    settings_btn = EmojiButton(
        main,
        emoji="⚙️",
        size=44,
        fg_color=colors['primary'],
        hover_color=colors['primary_hover'],
        command=lambda: print("Settings clicked")
    )
    settings_btn.place(x=0, y=0, width=44, height=44)

    theme_btn = EmojiButton(
        main,
        emoji="🌙",
        size=36,
        fg_color="transparent",
        border_width=2,
        border_color=colors['border'],
        command=lambda: print("Theme clicked")
    )
    theme_btn.place(relx=1.0, x=-36, y=0, width=36, height=36)

    logs_btn = EmojiButton(
        main,
        emoji="📋",
        size=28,
        fg_color="transparent",
        border_width=1,
        border_color=colors['border'],
        command=lambda: print("Logs clicked")
    )
    logs_btn.place(relx=1.0, rely=1.0, x=-28, y=-28, width=28, height=28)

    # Title (centered)
    title = ctk.CTkLabel(
        main,
        text="Hibiki",
        font=ctk.CTkFont(size=32, weight="bold"),
        text_color=colors['fg']
    )
    title.pack(pady=(50, 20))

    # Language dropdown test
    lang_frame = ctk.CTkFrame(main, fg_color="transparent")
    lang_frame.pack(pady=10)

    lang_label = ctk.CTkLabel(
        lang_frame,
        text="Langue:",
        font=ctk.CTkFont(size=12),
        text_color=colors['fg']
    )
    lang_label.pack(side="left", padx=(0, 8))

    dropdown = create_language_dropdown(
        lang_frame,
        current_lang="fr",
        available_langs=["fr", "en", "es", "de"],
        colors=colors,
        on_change=lambda lang: print(f"Language changed to: {lang}")
    )
    dropdown.pack(side="left")

    # Bottom buttons (3 equal columns)
    btn_container = ctk.CTkFrame(main, fg_color="transparent")
    btn_container.pack(side="bottom", fill="x", pady=(20, 0))
    btn_container.grid_columnconfigure((0, 1, 2), weight=1)

    for i, (emoji, text) in enumerate([("📜", "Historique"), ("📚", "Dictionnaire"), ("📊", "Stats")]):
        btn = ctk.CTkButton(
            btn_container,
            text=f"{emoji} {text}",
            font=ctk.CTkFont(size=14, weight="bold"),
            height=40,
            corner_radius=8,
            fg_color="transparent",
            border_width=2,
            border_color=colors['border'],
            text_color=colors['fg'],
            hover_color=colors['border'],
            command=lambda t=text: print(f"{t} clicked")
        )
        padx = (0, 4) if i == 0 else (4, 0) if i == 2 else (2, 2)
        btn.grid(row=0, column=i, sticky="ew", padx=padx)

    print("✅ UI Test - Components loaded successfully")
    print("Testing:")
    print("  - Corner buttons (⚙️ top-left, 🌙 top-right, 📋 bottom-right)")
    print("  - Language dropdown with flags")
    print("  - Bottom buttons with emojis")

    root.mainloop()


if __name__ == "__main__":
    test_components()
