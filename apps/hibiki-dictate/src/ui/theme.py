"""
Shinkofa Design System - Centralized Theme Management
Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""


class ShinkofaColors:
    """Shinkofa color palette optimized for light AND dark modes with WCAG AAA compliance."""

    # Light mode colors - MODERN & LISIBLE
    LIGHT_MODE = {
        'bg': "#FFFFFF",              # Pure white background
        'fg': "#000000",              # Pure black text - MAXIMUM CONTRAST
        'primary': "#D97706",         # Modern amber/orange
        'primary_hover': "#B45309",   # Darker amber hover
        'accent': "#2563EB",          # Modern blue
        'success': "#16A34A",         # Modern green
        'error': "#DC2626",           # Modern red
        'warning': "#EA580C",         # Modern orange
        'border': "#E5E7EB",          # Very light gray borders (subtle)
        'card_bg': "#F9FAFB",         # Very subtle gray for cards
        'hover_bg': "#F3F4F6",        # Hover state
    }

    # Dark mode colors - MODERN & LISIBLE
    DARK_MODE = {
        'bg': "#111827",              # Deep dark (not pure black)
        'fg': "#F9FAFB",              # Off-white text (softer on eyes)
        'primary': "#F59E0B",         # Bright amber
        'primary_hover': "#FBBF24",   # Lighter amber hover
        'accent': "#3B82F6",          # Bright blue
        'success': "#10B981",         # Bright green
        'error': "#EF4444",           # Bright red
        'warning': "#F97316",         # Bright orange
        'border': "#374151",          # Medium gray borders
        'card_bg': "#1F2937",         # Slightly lighter dark
        'hover_bg': "#374151",        # Hover state
    }

    # Legacy compatibility
    BLEU_MARINE = "#1a1a1a"
    ORANGE_CHALEUR = "#c45a00"
    JAUNE_CLARTE = "#0055aa"
    BLANC = "#FFFFFF"
    BLEU_MARINE_FONCE = "#121212"
    GRIS_CLAIR = "#e0e0e0"
    SUCCESS = "#1b6b1b"
    ERROR = "#b71c1c"
    WARNING = "#8b4000"

    @staticmethod
    def get_colors(theme_mode: str):
        """Get color dictionary for specified theme mode.

        Args:
            theme_mode: "light" or "dark"

        Returns:
            Dictionary of color values
        """
        return ShinkofaColors.DARK_MODE if theme_mode == "dark" else ShinkofaColors.LIGHT_MODE
