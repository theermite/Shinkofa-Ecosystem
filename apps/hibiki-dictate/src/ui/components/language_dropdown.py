"""
Language Dropdown Component - Flag-based language selector
Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import customtkinter as ctk
from typing import Callable, List


# Language flags mapping
LANGUAGE_FLAGS = {
    "fr": "🇫🇷",
    "en": "🇬🇧",
    "es": "🇪🇸",
    "de": "🇩🇪",
    "it": "🇮🇹",
    "pt": "🇵🇹",
    "nl": "🇳🇱",
    "pl": "🇵🇱",
    "ru": "🇷🇺",
    "ja": "🇯🇵",
    "zh": "🇨🇳",
    "ko": "🇰🇷",
    "ar": "🇸🇦",
    "hi": "🇮🇳",
    "tr": "🇹🇷",
}

# Language names
LANGUAGE_NAMES = {
    "fr": "Français",
    "en": "English",
    "es": "Español",
    "de": "Deutsch",
    "it": "Italiano",
    "pt": "Português",
    "nl": "Nederlands",
    "pl": "Polski",
    "ru": "Русский",
    "ja": "日本語",
    "zh": "中文",
    "ko": "한국어",
    "ar": "العربية",
    "hi": "हिन्दी",
    "tr": "Türkçe",
}


def create_language_dropdown(
    parent,
    current_lang: str,
    available_langs: List[str],
    colors: dict,
    on_change: Callable[[str], None]
) -> ctk.CTkOptionMenu:
    """Create language dropdown with flag emojis.

    Args:
        parent: Parent widget
        current_lang: Current language code (e.g., "fr")
        available_langs: List of available language codes
        colors: Color dictionary from ShinkofaColors
        on_change: Callback function called when language changes

    Returns:
        CTkOptionMenu configured with language options

    Usage:
        dropdown = create_language_dropdown(
            parent=main_frame,
            current_lang="fr",
            available_langs=["fr", "en", "es", "de"],
            colors=ShinkofaColors.get_colors("light"),
            on_change=lambda lang: print(f"Changed to {lang}")
        )
    """
    # Build options: "🇫🇷 Français", "🇬🇧 English", etc.
    options = []
    for lang in available_langs:
        flag = LANGUAGE_FLAGS.get(lang, "🌐")
        name = LANGUAGE_NAMES.get(lang, lang.upper())
        options.append(f"{flag} {name}")

    # Find current selection
    current_flag = LANGUAGE_FLAGS.get(current_lang, "🌐")
    current_name = LANGUAGE_NAMES.get(current_lang, current_lang.upper())
    current_value = f"{current_flag} {current_name}"

    # Create wrapper callback that extracts language code
    def _on_change_wrapper(selection: str):
        """Extract language code from selection and call user callback."""
        # Extract flag emoji (first character)
        flag_emoji = selection.split()[0]

        # Reverse lookup to get language code
        lang_code = None
        for code, flag in LANGUAGE_FLAGS.items():
            if flag == flag_emoji:
                lang_code = code
                break

        # Fallback to current lang if not found
        if lang_code is None:
            lang_code = current_lang

        on_change(lang_code)

    # Create dropdown
    dropdown = ctk.CTkOptionMenu(
        parent,
        values=options,
        font=ctk.CTkFont(size=12),
        width=140,
        height=32,
        corner_radius=6,
        fg_color=colors['primary'],
        button_color=colors['primary_hover'],
        button_hover_color=colors['primary'],
        dropdown_fg_color=colors['card_bg'],
        dropdown_hover_color=colors['primary'],
        dropdown_text_color=colors['fg'],
        command=_on_change_wrapper
    )

    # Set initial value
    if current_value in options:
        dropdown.set(current_value)

    return dropdown


def get_language_display(lang_code: str) -> str:
    """Get display string for language code.

    Args:
        lang_code: Language code (e.g., "fr")

    Returns:
        Display string (e.g., "🇫🇷 Français")
    """
    flag = LANGUAGE_FLAGS.get(lang_code, "🌐")
    name = LANGUAGE_NAMES.get(lang_code, lang_code.upper())
    return f"{flag} {name}"
