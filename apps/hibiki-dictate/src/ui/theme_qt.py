"""Qt6 Theme - Inline Style Functions with Dark/Light Mode Support.

Provides centralized style functions for all widgets with theme mode support.
Each function returns the appropriate inline stylesheet based on theme mode.

Copyright (C) 2025 La Voie Shinkofa
"""
from typing import Dict


class Qt6Theme:
    """Centralized theme system with inline styles for light/dark modes."""

    # ==================== COLOR PALETTES ====================

    COLORS_LIGHT = {
        # Backgrounds
        'bg_primary': '#FFFFFF',
        'bg_secondary': '#F9FAFB',
        'bg_tertiary': '#F3F4F6',

        # Text
        'text_primary': '#000000',
        'text_secondary': '#374151',
        'text_tertiary': '#6B7280',
        'text_disabled': '#9CA3AF',

        # Borders
        'border_primary': '#E5E7EB',
        'border_secondary': '#D1D5DB',
        'border_hover': '#9CA3AF',

        # Brand colors (Shinkofa Orange)
        'brand_primary': '#D97706',
        'brand_hover': '#B45309',
        'brand_pressed': '#92400E',

        # Semantic colors
        'success': '#10B981',
        'error': '#DC2626',
        'warning': '#FFC107',
    }

    COLORS_DARK = {
        # Backgrounds
        'bg_primary': '#111827',
        'bg_secondary': '#1F2937',
        'bg_tertiary': '#374151',

        # Text
        'text_primary': '#F9FAFB',
        'text_secondary': '#E5E7EB',
        'text_tertiary': '#9CA3AF',
        'text_disabled': '#6B7280',

        # Borders
        'border_primary': '#374151',
        'border_secondary': '#4B5563',
        'border_hover': '#6B7280',

        # Brand colors (Lighter for dark mode)
        'brand_primary': '#F59E0B',
        'brand_hover': '#FBBF24',
        'brand_pressed': '#D97706',

        # Semantic colors
        'success': '#10B981',
        'error': '#EF4444',
        'warning': '#FFC107',
    }

    @staticmethod
    def _get_colors(mode: str) -> Dict[str, str]:
        """Get color palette for theme mode."""
        return Qt6Theme.COLORS_DARK if mode == "dark" else Qt6Theme.COLORS_LIGHT

    # ==================== WIDGET STYLES ====================

    @staticmethod
    def get_main_window_style(mode: str) -> str:
        """Main window background style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QMainWindow {{
                background-color: {c['bg_primary']};
            }}
        """

    @staticmethod
    def get_central_widget_style(mode: str) -> str:
        """Central widget background style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QWidget {{
                background-color: {c['bg_primary']};
            }}
        """

    @staticmethod
    def get_title_label_style(mode: str) -> str:
        """Title label (Hibiki) style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QLabel {{
                font-size: 32px;
                font-weight: bold;
                color: {c['text_primary']};
                background-color: transparent;
            }}
        """

    @staticmethod
    def get_status_card_style(mode: str) -> str:
        """Status card frame style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QFrame {{
                background-color: {c['bg_secondary']};
                border: 1px solid {c['border_primary']};
                border-radius: 12px;
                padding: 20px;
            }}
        """

    @staticmethod
    def get_status_label_style(mode: str) -> str:
        """Status label (main text) style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QLabel {{
                font-size: 18px;
                font-weight: 600;
                color: {c['text_secondary']};
                background-color: transparent;
            }}
        """

    @staticmethod
    def get_quality_label_style(mode: str) -> str:
        """Quality/provider label (small text) style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QLabel {{
                font-size: 12px;
                color: {c['text_tertiary']};
                background-color: transparent;
            }}
        """

    @staticmethod
    def get_record_button_style(mode: str, is_recording: bool = False) -> str:
        """Record button style (orange or red when recording)."""
        c = Qt6Theme._get_colors(mode)

        if is_recording:
            bg = c['error']
            hover = '#B91C1C' if mode == 'light' else '#DC2626'
            pressed = '#991B1B' if mode == 'light' else '#B91C1C'
        else:
            bg = c['brand_primary']
            hover = c['brand_hover']
            pressed = c['brand_pressed']

        return f"""
            QPushButton {{
                background-color: {bg};
                color: {c['text_primary'] if mode == 'dark' else '#FFFFFF'};
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 16px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {hover};
            }}
            QPushButton:pressed {{
                background-color: {pressed};
            }}
            QPushButton:disabled {{
                background-color: {c['bg_tertiary']};
                color: {c['text_disabled']};
            }}
        """

    @staticmethod
    def get_icon_button_style(mode: str) -> str:
        """Icon buttons (⚙, ◐/◑, ▤) style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QPushButton {{
                background-color: {c['bg_tertiary']};
                color: {c['text_secondary']};
                border: none;
                border-radius: 8px;
                font-size: 18px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {c['border_primary']};
            }}
            QPushButton:pressed {{
                background-color: {c['border_secondary']};
            }}
        """

    @staticmethod
    def get_secondary_button_style(mode: str) -> str:
        """Secondary buttons (Historique, Dictionnaire, etc.) style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QPushButton {{
                background-color: {c['bg_tertiary']};
                color: {c['text_secondary']};
                border: none;
                border-radius: 8px;
                padding: 12px 24px;
                font-size: 14px;
                font-weight: bold;
            }}
            QPushButton:hover {{
                background-color: {c['border_primary']};
            }}
            QPushButton:pressed {{
                background-color: {c['border_secondary']};
            }}
        """

    @staticmethod
    def get_hint_label_style(mode: str) -> str:
        """Hint labels (Raccourci, Langue, Modèle) style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QLabel {{
                font-size: 12px;
                color: {c['text_tertiary']};
                font-weight: 600;
                background-color: transparent;
            }}
        """

    @staticmethod
    def get_combobox_style(mode: str) -> str:
        """ComboBox style."""
        c = Qt6Theme._get_colors(mode)
        return f"""
            QComboBox {{
                background-color: {c['bg_primary']};
                color: {c['text_primary']};
                border: 1px solid {c['border_secondary']};
                border-radius: 6px;
                padding: 8px 12px;
                font-size: 14px;
            }}
            QComboBox:hover {{
                border-color: {c['border_hover']};
            }}
            QComboBox:focus {{
                border-color: {c['brand_primary']};
            }}
            QComboBox::drop-down {{
                border: none;
                width: 20px;
            }}
            QComboBox::down-arrow {{
                image: none;
                border-left: 4px solid transparent;
                border-right: 4px solid transparent;
                border-top: 5px solid {c['text_tertiary']};
                margin-right: 8px;
            }}
            QComboBox QAbstractItemView {{
                background-color: {c['bg_primary']};
                color: {c['text_primary']};
                border: 1px solid {c['border_primary']};
                selection-background-color: {c['brand_primary']};
                selection-color: {c['text_primary'] if mode == 'dark' else '#FFFFFF'};
            }}
        """

    # ==================== LEGACY QSS (for dialogs) ====================

    @staticmethod
    def get_stylesheet(theme_mode: str) -> str:
        """Get complete QSS stylesheet for dialogs (Settings, etc.).

        Main window uses inline styles, but dialogs still use global QSS.
        """
        if theme_mode == "dark":
            return Qt6Theme._get_dark_qss()
        else:
            return Qt6Theme._get_light_qss()

    @staticmethod
    def _get_light_qss() -> str:
        """Light mode QSS stylesheet (for dialogs)."""
        return """
/* === GLOBAL === */
QDialog {
    background-color: #FFFFFF;
}

QWidget {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 14px;
    color: #000000;
}

/* === LABELS === */
QLabel {
    color: #000000;
    background-color: transparent;
}

/* === CUSTOM CLASSES (objectName selectors) === */
QLabel#title {
    font-size: 24px;
    font-weight: bold;
    color: #111827;
    padding: 8px 0;
}

QLabel#hint {
    font-size: 12px;
    color: #6B7280;
    font-weight: normal;
}

QPushButton#secondaryButton {
    background-color: #F3F4F6;
    color: #374151;
    border: 1px solid #E5E7EB;
}

QPushButton#secondaryButton:hover {
    background-color: #E5E7EB;
    border-color: #D1D5DB;
}

QPushButton#secondaryButton:pressed {
    background-color: #D1D5DB;
}

QFrame#statusCard {
    background-color: #F9FAFB;
    border: 1px solid #E5E7EB;
    border-radius: 12px;
    padding: 16px;
}

QPushButton#iconButton {
    background-color: #E5E7EB;
    color: #374151;
    border: 1px solid #D1D5DB;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
}

QPushButton#iconButton:hover {
    background-color: #D1D5DB;
    border-color: #9CA3AF;
}

QPushButton#iconButton:pressed {
    background-color: #9CA3AF;
}

/* === BUTTONS === */
QPushButton {
    background-color: #D97706;
    color: #FFFFFF;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: bold;
}

QPushButton:hover {
    background-color: #B45309;
}

QPushButton:pressed {
    background-color: #92400E;
}

QPushButton:disabled {
    background-color: #E5E7EB;
    color: #9CA3AF;
}

/* === TABS === */
QTabWidget::pane {
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    background-color: #FFFFFF;
}

QTabBar::tab {
    background-color: #F3F4F6;
    color: #6B7280;
    border: none;
    padding: 12px 24px;
    margin-right: 4px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}

QTabBar::tab:selected {
    background-color: #D97706;
    color: #FFFFFF;
}

QTabBar::tab:hover {
    background-color: #E5E7EB;
}

/* === INPUTS === */
QLineEdit {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

QLineEdit:focus {
    border-color: #D97706;
}

QTextEdit {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    padding: 8px;
    font-size: 14px;
}

/* === SPINBOX === */
QSpinBox, QDoubleSpinBox {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

QSpinBox:focus, QDoubleSpinBox:focus {
    border-color: #D97706;
}

QSpinBox::up-button, QDoubleSpinBox::up-button {
    background-color: #F3F4F6;
    border: none;
    border-top-right-radius: 6px;
}

QSpinBox::down-button, QDoubleSpinBox::down-button {
    background-color: #F3F4F6;
    border: none;
    border-bottom-right-radius: 6px;
}

/* === COMBOBOX === */
QComboBox {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #D1D5DB;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

QComboBox:hover {
    border-color: #9CA3AF;
}

QComboBox::drop-down {
    border: none;
}

/* === CHECKBOX === */
QCheckBox {
    color: #000000;
    spacing: 8px;
}

QCheckBox::indicator {
    width: 20px;
    height: 20px;
    border: 2px solid #D1D5DB;
    border-radius: 4px;
    background-color: #FFFFFF;
}

QCheckBox::indicator:checked {
    background-color: #D97706;
    border-color: #D97706;
}

/* === SCROLLBAR === */
QScrollBar:vertical {
    background-color: #F3F4F6;
    width: 12px;
    border-radius: 6px;
}

QScrollBar::handle:vertical {
    background-color: #D1D5DB;
    border-radius: 6px;
    min-height: 20px;
}

QScrollBar::handle:vertical:hover {
    background-color: #9CA3AF;
}

/* === TABLES === */
QTableWidget {
    background-color: #FFFFFF;
    color: #000000;
    border: 1px solid #E5E7EB;
    border-radius: 8px;
    gridline-color: #E5E7EB;
}

QHeaderView::section {
    background-color: #F9FAFB;
    color: #374151;
    border: none;
    padding: 8px;
    font-weight: bold;
}
"""

    @staticmethod
    def _get_dark_qss() -> str:
        """Dark mode QSS stylesheet (for dialogs)."""
        return """
/* === GLOBAL === */
QDialog {
    background-color: #111827;
}

QWidget {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 14px;
    color: #F9FAFB;
}

/* === LABELS === */
QLabel {
    color: #F9FAFB;
    background-color: transparent;
}

/* === CUSTOM CLASSES (objectName selectors) === */
QLabel#title {
    font-size: 24px;
    font-weight: bold;
    color: #F9FAFB;
    padding: 8px 0;
}

QLabel#hint {
    font-size: 12px;
    color: #9CA3AF;
    font-weight: normal;
}

QPushButton#secondaryButton {
    background-color: #374151;
    color: #E5E7EB;
    border: 1px solid #4B5563;
}

QPushButton#secondaryButton:hover {
    background-color: #4B5563;
    border-color: #6B7280;
}

QPushButton#secondaryButton:pressed {
    background-color: #6B7280;
}

QFrame#statusCard {
    background-color: #1F2937;
    border: 1px solid #374151;
    border-radius: 12px;
    padding: 16px;
}

QPushButton#iconButton {
    background-color: #374151;
    color: #E5E7EB;
    border: 1px solid #4B5563;
    border-radius: 8px;
    font-size: 18px;
    font-weight: bold;
}

QPushButton#iconButton:hover {
    background-color: #4B5563;
    border-color: #6B7280;
}

QPushButton#iconButton:pressed {
    background-color: #6B7280;
}

/* === BUTTONS === */
QPushButton {
    background-color: #F59E0B;
    color: #000000;
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    font-size: 14px;
    font-weight: bold;
}

QPushButton:hover {
    background-color: #FBBF24;
}

QPushButton:pressed {
    background-color: #D97706;
}

QPushButton:disabled {
    background-color: #374151;
    color: #6B7280;
}

/* === TABS === */
QTabWidget::pane {
    border: 1px solid #374151;
    border-radius: 8px;
    background-color: #111827;
}

QTabBar::tab {
    background-color: #374151;
    color: #9CA3AF;
    border: none;
    padding: 12px 24px;
    margin-right: 4px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
}

QTabBar::tab:selected {
    background-color: #F59E0B;
    color: #000000;
}

QTabBar::tab:hover {
    background-color: #4B5563;
}

/* === INPUTS === */
QLineEdit {
    background-color: #1F2937;
    color: #F9FAFB;
    border: 1px solid #4B5563;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

QLineEdit:focus {
    border-color: #F59E0B;
}

QTextEdit {
    background-color: #1F2937;
    color: #F9FAFB;
    border: 1px solid #4B5563;
    border-radius: 6px;
    padding: 8px;
    font-size: 14px;
}

/* === SPINBOX === */
QSpinBox, QDoubleSpinBox {
    background-color: #1F2937;
    color: #F9FAFB;
    border: 1px solid #4B5563;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

QSpinBox:focus, QDoubleSpinBox:focus {
    border-color: #F59E0B;
}

QSpinBox::up-button, QDoubleSpinBox::up-button {
    background-color: #374151;
    border: none;
    border-top-right-radius: 6px;
}

QSpinBox::down-button, QDoubleSpinBox::down-button {
    background-color: #374151;
    border: none;
    border-bottom-right-radius: 6px;
}

/* === COMBOBOX === */
QComboBox {
    background-color: #1F2937;
    color: #F9FAFB;
    border: 1px solid #4B5563;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
}

QComboBox:hover {
    border-color: #6B7280;
}

QComboBox::drop-down {
    border: none;
}

/* === CHECKBOX === */
QCheckBox {
    color: #F9FAFB;
    spacing: 8px;
}

QCheckBox::indicator {
    width: 20px;
    height: 20px;
    border: 2px solid #4B5563;
    border-radius: 4px;
    background-color: #1F2937;
}

QCheckBox::indicator:checked {
    background-color: #F59E0B;
    border-color: #F59E0B;
}

/* === SCROLLBAR === */
QScrollBar:vertical {
    background-color: #1F2937;
    width: 12px;
    border-radius: 6px;
}

QScrollBar::handle:vertical {
    background-color: #4B5563;
    border-radius: 6px;
    min-height: 20px;
}

QScrollBar::handle:vertical:hover {
    background-color: #6B7280;
}

/* === TABLES === */
QTableWidget {
    background-color: #1F2937;
    color: #F9FAFB;
    border: 1px solid #374151;
    border-radius: 8px;
    gridline-color: #374151;
}

QHeaderView::section {
    background-color: #111827;
    color: #E5E7EB;
    border: none;
    padding: 8px;
    font-weight: bold;
}
"""
