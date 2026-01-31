"""
Text Formatting and Post-Processing Module.
Handles automatic punctuation, line breaks, and intelligent text formatting.

Copyright (C) 2025 La Voie Shinkofa
Licensed under Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
"""

import re
from typing import Dict, List, Optional, Tuple
from loguru import logger

from ..models.config import FormattingConfig, LineBreakMode


# Non-breaking space for French typography
NBSP = '\u00A0'

# Placeholder for protected content during processing
NUMBER_PLACEHOLDER_PREFIX = '\x00NUM'
NUMBER_PLACEHOLDER_SUFFIX = '\x00'
URL_PLACEHOLDER_PREFIX = '\x00URL'
URL_PLACEHOLDER_SUFFIX = '\x00'


class TextFormatter:
    """
    Formats transcribed text with automatic punctuation and line breaks.
    Fully automatic - no voice commands needed.
    """

    def __init__(self, language: str = "fr", config: Optional[FormattingConfig] = None):
        """
        Initialize text formatter.

        Args:
            language: Language code (fr, en) for language-specific formatting rules
            config: Optional FormattingConfig for advanced settings
        """
        self.language = language
        self.config = config or FormattingConfig()

        # Internal state for content protection
        self._number_map: Dict[str, str] = {}
        self._number_counter = 0
        self._url_map: Dict[str, str] = {}
        self._url_counter = 0

        logger.info(f"TextFormatter initialized: lang={language}, mode=automatic, smart_punctuation={self.config.enable_smart_punctuation}")

    def update_config(self, config: FormattingConfig) -> None:
        """Update formatter configuration."""
        self.config = config
        logger.info(f"TextFormatter config updated: smart_punct={config.enable_smart_punctuation}, line_break_mode={config.line_break_mode.value}")

    def update_language(self, language: str) -> None:
        """Update formatter language."""
        self.language = language
        logger.info(f"TextFormatter language updated: {language}")

    def format_text(
        self,
        text: str,
        auto_capitalize: bool = True,
        add_sentence_breaks: bool = True
    ) -> str:
        """
        Format text with automatic punctuation and improvements.

        Args:
            text: Raw transcribed text
            auto_capitalize: Automatically capitalize after punctuation
            add_sentence_breaks: Add line breaks after each sentence (. ? !)

        Returns:
            Formatted text with proper punctuation, spacing, and capitalization
        """
        if not text or not text.strip():
            return text

        original_text = text
        formatted_text = text

        # Step 0: Protect URLs from being modified (always)
        formatted_text = self._protect_urls(formatted_text)

        # Step 1: Protect numbers from being modified
        if self.config.preserve_numbers:
            formatted_text = self._protect_numbers(formatted_text)

        # Step 2: Fix spacing around punctuation
        formatted_text = self._fix_punctuation_spacing(formatted_text)

        # Step 3: Apply French punctuation rules (nbsp before :;?!)
        if self.config.enable_smart_punctuation and self.config.french_nbsp_rules and self.language == "fr":
            formatted_text = self._fix_french_punctuation(formatted_text)

        # Step 4: Auto-capitalize sentences FIRST (needed for smart line break detection)
        if auto_capitalize:
            formatted_text = self._auto_capitalize(formatted_text)

        # Step 5: Add sentence breaks (after capitalization so we can detect real sentence ends)
        if add_sentence_breaks:
            formatted_text = self._add_sentence_breaks(formatted_text)

        # Step 6: Restore protected numbers
        if self.config.preserve_numbers:
            formatted_text = self._restore_numbers(formatted_text)

        # Step 7: Restore protected URLs
        formatted_text = self._restore_urls(formatted_text)

        # Step 8: Strip leading/trailing whitespace
        formatted_text = formatted_text.strip()

        # Log changes if any
        if formatted_text != original_text:
            logger.debug(f"Text formatted: '{original_text}' -> '{formatted_text}'")

        return formatted_text

    def format_with_segments(
        self,
        segments: List[Dict],
        auto_capitalize: bool = True
    ) -> str:
        """
        Format text using VAD segment timing information for intelligent paragraph breaks.

        Args:
            segments: List of segments with 'text', 'start_time', 'end_time' keys
            auto_capitalize: Automatically capitalize after punctuation

        Returns:
            Formatted text with intelligent paragraph breaks based on pauses
        """
        if not segments:
            return ""

        mode = self.config.line_break_mode
        pause_threshold = self.config.paragraph_pause_threshold_s
        max_sentences = self.config.max_sentences_per_paragraph

        result_parts = []
        sentence_count = 0

        for i, segment in enumerate(segments):
            segment_text = segment.get('text', '').strip()
            if not segment_text:
                continue

            # Format the segment text first
            formatted_segment = self.format_text(
                segment_text,
                auto_capitalize=auto_capitalize,
                add_sentence_breaks=(mode == LineBreakMode.EVERY_SENTENCE)
            )

            # Count sentences in this segment
            sentences_in_segment = len(re.findall(r'[.?!]', formatted_segment))
            sentence_count += sentences_in_segment

            result_parts.append(formatted_segment)

            # Determine separator for next segment
            if i < len(segments) - 1:
                next_segment = segments[i + 1]
                current_end = segment.get('end_time', 0)
                next_start = next_segment.get('start_time', 0)
                pause_duration = next_start - current_end

                # Determine break type based on mode
                if mode == LineBreakMode.PARAGRAPHS_ONLY:
                    # Only paragraph breaks on long pauses
                    if pause_duration >= pause_threshold:
                        result_parts.append("\n\n")
                        sentence_count = 0
                    else:
                        result_parts.append(" ")

                elif mode == LineBreakMode.SMART:
                    # Hybrid: long pause OR max sentences reached
                    if pause_duration >= pause_threshold:
                        result_parts.append("\n\n")
                        sentence_count = 0
                    elif sentence_count >= max_sentences:
                        result_parts.append("\n\n")
                        sentence_count = 0
                    else:
                        result_parts.append(" ")

                else:  # EVERY_SENTENCE (default)
                    # Paragraph break on long pause, otherwise newlines are in formatted text
                    if pause_duration >= pause_threshold:
                        result_parts.append("\n\n")
                        sentence_count = 0
                    else:
                        result_parts.append(" ")

        return "".join(result_parts)

    def _is_abbreviation(self, word: str) -> bool:
        """
        Check if a word is a common abbreviation that shouldn't trigger line breaks.

        Args:
            word: Word to check (e.g., "M.", "Dr.")

        Returns:
            True if the word is a known abbreviation
        """
        # Clean the word
        word_clean = word.strip()

        # Check against configured abbreviations
        for abbr in self.config.common_abbreviations:
            if word_clean.lower() == abbr.lower():
                return True
            # Also check without trailing period
            if word_clean.lower() == abbr.rstrip('.').lower():
                return True

        return False

    def _protect_numbers(self, text: str) -> str:
        """
        Protect numbers and decimals from being modified by punctuation rules.
        Replaces them with placeholders that will be restored later.

        Args:
            text: Input text

        Returns:
            Text with numbers replaced by placeholders
        """
        self._number_map = {}
        self._number_counter = 0

        def replace_number(match):
            num = match.group(0)
            placeholder = f"{NUMBER_PLACEHOLDER_PREFIX}{self._number_counter}{NUMBER_PLACEHOLDER_SUFFIX}"
            self._number_map[placeholder] = num
            self._number_counter += 1
            return placeholder

        # Pattern matches:
        # - Decimal numbers: 3.14, 10.5
        # - Numbers with thousands separator: 10,000 or 10 000
        # - Percentages: 50%, 3.5%
        # - Currency: 10.99 euros, $50.00
        # - Time: 10:30, 14:00:00
        # - Dates: 2025-01-21, 21/01/2025
        patterns = [
            r'\d+[.,]\d+',           # Decimal numbers
            r'\d{1,3}(?:[ ,]\d{3})+', # Thousands separators
            r'\d+%',                  # Percentages
            r'\d+:\d+(?::\d+)?',      # Time
            r'\d{4}[-/]\d{2}[-/]\d{2}', # Date YYYY-MM-DD or YYYY/MM/DD
            r'\d{2}[-/]\d{2}[-/]\d{4}', # Date DD-MM-YYYY or DD/MM/YYYY
        ]

        result = text
        for pattern in patterns:
            result = re.sub(pattern, replace_number, result)

        return result

    def _restore_numbers(self, text: str) -> str:
        """
        Restore protected numbers from placeholders.

        Args:
            text: Text with placeholders

        Returns:
            Text with original numbers restored
        """
        result = text
        for placeholder, original in self._number_map.items():
            result = result.replace(placeholder, original)
        return result

    def _protect_urls(self, text: str) -> str:
        """
        Protect URLs and email addresses from being modified by punctuation rules.
        Replaces them with placeholders that will be restored later.

        Args:
            text: Input text

        Returns:
            Text with URLs replaced by placeholders
        """
        self._url_map = {}
        self._url_counter = 0

        def replace_url(match):
            url = match.group(0)
            placeholder = f"{URL_PLACEHOLDER_PREFIX}{self._url_counter}{URL_PLACEHOLDER_SUFFIX}"
            self._url_map[placeholder] = url
            self._url_counter += 1
            return placeholder

        # Patterns for URLs and related content (order matters - more specific first)
        # Note: We use lookahead to avoid capturing trailing punctuation before space
        patterns = [
            # Full URLs with protocol (don't capture trailing . before space)
            r'https?://[^\s<>"\'\)]+?(?=\.\s|[?!]\s|\s|$)',
            # URLs starting with www (don't capture trailing . before space)
            r'www\.[^\s<>"\'\)]+?(?=\.\s|[?!]\s|\s|$)',
            # Email addresses
            r'\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b',
            # File paths with extensions
            r'\b\w+\.(?:pdf|doc|docx|txt|jpg|jpeg|png|gif|mp3|mp4|zip|rar|exe|py|js|html|css|json|xml)\b',
            # Domain-like patterns without path (e.g., google.com, example.fr)
            r'\b[a-zA-Z0-9][-a-zA-Z0-9]*\.(?:com|org|net|fr|de|uk|io|co|eu|info|biz|gov|edu)\b',
        ]

        result = text
        for pattern in patterns:
            result = re.sub(pattern, replace_url, result, flags=re.IGNORECASE)

        return result

    def _restore_urls(self, text: str) -> str:
        """
        Restore protected URLs from placeholders.

        Args:
            text: Text with placeholders

        Returns:
            Text with original URLs restored
        """
        result = text
        for placeholder, original in self._url_map.items():
            result = result.replace(placeholder, original)
        return result

    def _fix_french_punctuation(self, text: str) -> str:
        """
        Apply French typography rules for punctuation.
        Adds non-breaking space before : ; ? ! and around guillemets.

        Args:
            text: Input text

        Returns:
            Text with French punctuation rules applied
        """
        result = text

        # Add non-breaking space BEFORE : ; ? !
        # Pattern: word followed by punctuation without proper space
        result = re.sub(r'(\S)([;:?!])', rf'\1{NBSP}\2', result)

        # Fix double spaces that might result
        result = re.sub(rf'{NBSP} ', NBSP, result)
        result = re.sub(rf' {NBSP}', NBSP, result)

        # Guillemets francais: espace insecable APRES « et AVANT »
        result = re.sub(r'« *', f'«{NBSP}', result)
        result = re.sub(r' *»', f'{NBSP}»', result)

        return result

    def _fix_punctuation_spacing(self, text: str) -> str:
        """
        Fix spacing around punctuation marks.

        Args:
            text: Input text

        Returns:
            Text with corrected spacing
        """
        result = text

        # Remove spaces before punctuation marks (except for French-specific ones handled separately)
        result = re.sub(r'\s+([.,])', r'\1', result)

        # For non-French, also remove spaces before : ; ? !
        if self.language != "fr" or not self.config.french_nbsp_rules:
            result = re.sub(r'\s+([;:?!])', r'\1', result)

        # Add space after punctuation marks (if not already present and not followed by newline)
        result = re.sub(r'([.,;:?!])([^\s\n\x00])', r'\1 \2', result)

        # Fix multiple spaces
        result = re.sub(r' +', ' ', result)

        return result

    def _add_sentence_breaks(self, text: str) -> str:
        """
        Add line breaks after sentence-ending punctuation.
        Respects abbreviations and requires proper sentence boundaries.

        A real sentence end is:
        - Period followed by space + capital letter
        - ? or ! followed by space + any letter
        - Not after abbreviations followed by lowercase

        Args:
            text: Input text

        Returns:
            Text with line breaks after sentences
        """
        result = text

        # First, let's identify abbreviation patterns that shouldn't get line breaks
        # Create temporary markers for abbreviations
        abbr_marker = '\x01ABBR\x01'
        abbr_map = {}
        abbr_counter = 0

        for abbr in self.config.common_abbreviations:
            # Pattern: abbreviation followed by space (protect from line break)
            pattern = rf'({re.escape(abbr)})(\s+)'
            matches = list(re.finditer(pattern, result, re.IGNORECASE))
            for match in reversed(matches):  # Reverse to preserve indices
                marker = f"{abbr_marker}{abbr_counter}{abbr_marker}"
                replacement = f"{match.group(1)}{marker}"
                result = result[:match.start()] + replacement + result[match.end():]
                abbr_map[marker] = match.group(2)  # Preserve the original space(s)
                abbr_counter += 1

        # Add line break after ? and ! (these are always sentence endings)
        # Pattern: ? or ! followed by space
        result = re.sub(
            r'([?!])(\s+)',
            r'\1\n',
            result
        )

        # Add line break after period ONLY if followed by space + capital letter
        # This is more conservative and avoids breaking mid-sentence
        # Pattern: period + space + capital letter (captures the capital to preserve it)
        result = re.sub(
            r'\.(\s+)([A-ZÀÂÄÉÈÊËÏÎÔÙÛÜŸÇ])',
            r'.\n\2',
            result
        )

        # Restore abbreviation spaces
        for marker, space in abbr_map.items():
            result = result.replace(marker, space)

        # Clean up multiple consecutive newlines (keep max 2)
        result = re.sub(r'\n{3,}', '\n\n', result)

        return result

    def _auto_capitalize(self, text: str) -> str:
        """
        Automatically capitalize first letter of sentences.

        Args:
            text: Input text

        Returns:
            Text with capitalized sentences
        """
        if not text:
            return text

        # Capitalize first character
        result = text[0].upper() + text[1:] if len(text) > 1 else text.upper()

        # Capitalize after sentence-ending punctuation (. ? ! ...)
        # Pattern: punctuation + spaces/newlines + lowercase letter
        result = re.sub(
            r'([.?!]\s+)([a-zàâäéèêëïîôùûüÿç])',
            lambda m: m.group(1) + m.group(2).upper(),
            result
        )

        # Capitalize after line breaks
        result = re.sub(
            r'(\n+)([a-zàâäéèêëïîôùûüÿç])',
            lambda m: m.group(1) + m.group(2).upper(),
            result
        )

        return result

    def add_paragraph_breaks(self, segments: list, min_pause_seconds: float = 2.0) -> str:
        """
        Add paragraph breaks based on pauses between speech segments.
        Legacy method - use format_with_segments for more control.

        Args:
            segments: List of speech segments with timestamps
            min_pause_seconds: Minimum pause duration to add paragraph break

        Returns:
            Text with paragraph breaks
        """
        if not segments:
            return ""

        result_parts = []

        for i, segment in enumerate(segments):
            # Add segment text
            segment_text = segment.get('text', '').strip()
            if segment_text:
                result_parts.append(segment_text)

            # Check pause before next segment
            if i < len(segments) - 1:
                next_segment = segments[i + 1]
                current_end = segment.get('end_time', 0)
                next_start = next_segment.get('start_time', 0)
                pause_duration = next_start - current_end

                # Add paragraph break for long pauses
                if pause_duration >= min_pause_seconds:
                    result_parts.append("\n\n")
                else:
                    result_parts.append(" ")

        return "".join(result_parts)

    def get_statistics(self) -> Dict[str, any]:
        """
        Get formatter statistics.

        Returns:
            Dictionary with stats
        """
        return {
            'language': self.language,
            'formatting_mode': 'automatic',
            'smart_punctuation': self.config.enable_smart_punctuation,
            'french_nbsp_rules': self.config.french_nbsp_rules,
            'line_break_mode': self.config.line_break_mode.value,
        }


def test_text_formatter():
    """Test text formatter with examples."""
    from ..utils.logger import setup_logger

    setup_logger(log_level="INFO")

    logger.info("="*60)
    logger.info("TEXT FORMATTER TEST - Smart Punctuation & Line Breaks")
    logger.info("="*60)

    # Test French automatic formatting with smart punctuation
    logger.info("\n Testing French smart punctuation...")
    config = FormattingConfig(
        enable_smart_punctuation=True,
        french_nbsp_rules=True,
        preserve_numbers=True
    )
    formatter_fr = TextFormatter(language="fr", config=config)

    test_cases_fr = [
        ("bonjour tout le monde. comment allez-vous? je suis Jay.", "Basic sentences"),
        ("Le prix est de 3.14 euros. Merci!", "Number preservation"),
        ("M. Dupont est arrive. Il va bien.", "Abbreviation handling"),
        ("Pourquoi ? Parce que ! C'est comme ca.", "French punctuation"),
        ("Voici un exemple : une liste ; des elements ? oui !", "French nbsp rules"),
    ]

    for test_text, description in test_cases_fr:
        result = formatter_fr.format_text(test_text, add_sentence_breaks=True)
        logger.info(f"\n[{description}]")
        logger.info(f"Input:  '{test_text}'")
        logger.info(f"Output:\n{result}")
        logger.info(f"(repr: {repr(result)})")

    # Test different line break modes
    logger.info("\n Testing line break modes...")

    segments = [
        {'text': 'Premiere phrase.', 'start_time': 0.0, 'end_time': 2.0},
        {'text': 'Deuxieme phrase.', 'start_time': 2.5, 'end_time': 4.0},
        {'text': 'Troisieme phrase.', 'start_time': 4.2, 'end_time': 6.0},
        {'text': 'Apres une pause.', 'start_time': 9.0, 'end_time': 11.0},  # 3s pause
    ]

    for mode in LineBreakMode:
        config = FormattingConfig(line_break_mode=mode, paragraph_pause_threshold_s=2.0)
        formatter = TextFormatter(language="fr", config=config)
        result = formatter.format_with_segments(segments)
        logger.info(f"\n[Mode: {mode.value}]")
        logger.info(f"Result:\n{result}")

    logger.success("\n Text formatter test completed!")


if __name__ == "__main__":
    test_text_formatter()
