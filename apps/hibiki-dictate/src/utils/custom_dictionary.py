"""
Custom Dictionary Manager for Voice Dictation.
Allows users to define custom word replacements.
"""

import json
from pathlib import Path
from typing import Dict
from loguru import logger


class CustomDictionary:
    """
    Manages custom word replacements for transcription post-processing.
    """

    def __init__(self, dictionary_file: str = "config/custom_dictionary.json"):
        """
        Initialize custom dictionary.

        Args:
            dictionary_file: Path to JSON file storing dictionary entries
        """
        self.dictionary_file = Path(dictionary_file)
        self.entries: Dict[str, str] = {}
        self._load_dictionary()

    def _load_dictionary(self):
        """Load dictionary from JSON file."""
        if self.dictionary_file.exists():
            try:
                with open(self.dictionary_file, 'r', encoding='utf-8') as f:
                    self.entries = json.load(f)
                logger.info(f"📚 Loaded {len(self.entries)} custom dictionary entries")
            except Exception as e:
                logger.error(f"Failed to load custom dictionary: {e}")
                self.entries = {}
        else:
            # Create default dictionary with examples
            self.entries = {
                "jay": "Jay",
                "ermite": "The Ermite",
                "whisper": "WhisperX"
            }
            self._save_dictionary()
            logger.info("📚 Created default custom dictionary")

    def _save_dictionary(self):
        """Save dictionary to JSON file."""
        try:
            # Ensure directory exists
            self.dictionary_file.parent.mkdir(parents=True, exist_ok=True)

            # Save with nice formatting
            with open(self.dictionary_file, 'w', encoding='utf-8') as f:
                json.dump(self.entries, f, indent=2, ensure_ascii=False)
            logger.info(f"📚 Saved {len(self.entries)} dictionary entries")
        except Exception as e:
            logger.error(f"Failed to save custom dictionary: {e}")

    def add_entry(self, original: str, replacement: str):
        """
        Add or update dictionary entry.

        Args:
            original: Original word/phrase (lowercase)
            replacement: Replacement word/phrase
        """
        self.entries[original.lower()] = replacement
        self._save_dictionary()
        logger.info(f"📚 Added dictionary entry: '{original}' → '{replacement}'")

    def remove_entry(self, original: str):
        """
        Remove dictionary entry.

        Args:
            original: Original word/phrase to remove
        """
        if original.lower() in self.entries:
            del self.entries[original.lower()]
            self._save_dictionary()
            logger.info(f"📚 Removed dictionary entry: '{original}'")

    def get_entries(self) -> Dict[str, str]:
        """
        Get all dictionary entries.

        Returns:
            Dict mapping original words to replacements
        """
        return self.entries.copy()

    def apply_replacements(self, text: str) -> str:
        """
        Apply dictionary replacements to text.

        Uses whole-word matching to avoid partial replacements.

        Args:
            text: Original transcribed text

        Returns:
            Text with replacements applied
        """
        if not self.entries:
            return text

        # Apply replacements (case-insensitive whole-word matching)
        import re

        result = text

        # Sort entries by length (longest first) to avoid partial matches
        sorted_entries = sorted(self.entries.items(), key=lambda x: len(x[0]), reverse=True)

        for original, replacement in sorted_entries:
            # Split text into words, preserving spaces and punctuation
            # Simple approach: match word boundaries more flexibly
            # Pattern: original word surrounded by spaces, start/end, or punctuation
            pattern = r'(?<!\w)' + re.escape(original) + r'(?!\w)'

            # Replace all occurrences (case-insensitive)
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)

        return result

    def clear_all(self):
        """Clear all dictionary entries."""
        self.entries = {}
        self._save_dictionary()
        logger.info("📚 Cleared all dictionary entries")
