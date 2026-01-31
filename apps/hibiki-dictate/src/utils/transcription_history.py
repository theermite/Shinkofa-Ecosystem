"""
Transcription History Manager.
Stores transcription history in SQLite database.
"""

import sqlite3
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Optional
from loguru import logger


class TranscriptionHistory:
    """
    Manages transcription history with SQLite storage.
    """

    def __init__(self, db_file: str = "config/transcription_history.db", max_entries: int = 100):
        """
        Initialize transcription history.

        Args:
            db_file: Path to SQLite database file
            max_entries: Maximum number of entries to keep (auto-purge oldest)
        """
        self.db_file = Path(db_file)
        self.max_entries = max_entries
        self._init_database()

    def _init_database(self):
        """Initialize SQLite database with schema."""
        # Ensure directory exists
        self.db_file.parent.mkdir(parents=True, exist_ok=True)

        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        # Create table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS transcriptions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                text TEXT NOT NULL,
                confidence REAL,
                provider TEXT,
                duration REAL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Create index on timestamp for faster queries
        cursor.execute("""
            CREATE INDEX IF NOT EXISTS idx_timestamp
            ON transcriptions(timestamp DESC)
        """)

        conn.commit()
        conn.close()
        logger.info(f"📋 Transcription history database initialized: {self.db_file}")

    def add_entry(
        self,
        text: str,
        confidence: Optional[float] = None,
        provider: Optional[str] = None,
        duration: Optional[float] = None
    ):
        """
        Add transcription to history.

        Args:
            text: Transcribed text
            confidence: Confidence score (0-1)
            provider: Transcription provider name
            duration: Audio duration in seconds
        """
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cursor.execute("""
            INSERT INTO transcriptions (timestamp, text, confidence, provider, duration)
            VALUES (?, ?, ?, ?, ?)
        """, (timestamp, text, confidence, provider, duration))

        conn.commit()
        conn.close()

        logger.info(f"📋 Added transcription to history: {text[:50]}...")

        # Auto-purge if exceeded max entries
        self._purge_old_entries()

    def _purge_old_entries(self):
        """Remove oldest entries if count exceeds max_entries."""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        # Get current count
        cursor.execute("SELECT COUNT(*) FROM transcriptions")
        count = cursor.fetchone()[0]

        if count > self.max_entries:
            # Delete oldest entries
            to_delete = count - self.max_entries
            cursor.execute("""
                DELETE FROM transcriptions
                WHERE id IN (
                    SELECT id FROM transcriptions
                    ORDER BY timestamp ASC
                    LIMIT ?
                )
            """, (to_delete,))
            conn.commit()
            logger.info(f"📋 Purged {to_delete} old transcription entries")

        conn.close()

    def get_all(self, limit: int = 100) -> List[Dict]:
        """
        Get all transcriptions (newest first).

        Args:
            limit: Maximum number of entries to return

        Returns:
            List of transcription dicts
        """
        conn = sqlite3.connect(self.db_file)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM transcriptions
            ORDER BY timestamp DESC
            LIMIT ?
        """, (limit,))

        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def search(self, query: str, limit: int = 100) -> List[Dict]:
        """
        Search transcriptions by text content.

        Args:
            query: Search query
            limit: Maximum number of results

        Returns:
            List of matching transcription dicts
        """
        conn = sqlite3.connect(self.db_file)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        cursor.execute("""
            SELECT * FROM transcriptions
            WHERE text LIKE ?
            ORDER BY timestamp DESC
            LIMIT ?
        """, (f"%{query}%", limit))

        rows = cursor.fetchall()
        conn.close()

        return [dict(row) for row in rows]

    def clear_all(self):
        """Clear all transcription history."""
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM transcriptions")
        conn.commit()
        conn.close()
        logger.info("📋 Cleared all transcription history")

    def export_to_text(self, output_file: str):
        """
        Export all transcriptions to text file.

        Args:
            output_file: Path to output file
        """
        entries = self.get_all(limit=1000)  # Get all entries

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n")
            f.write("HISTORIQUE DES TRANSCRIPTIONS\n")
            f.write(f"Exporté le {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write("=" * 80 + "\n\n")

            for entry in entries:
                f.write(f"[{entry['timestamp']}]\n")
                f.write(f"{entry['text']}\n")
                if entry['confidence']:
                    f.write(f"Confiance: {entry['confidence']:.1%} | ")
                if entry['provider']:
                    f.write(f"Moteur: {entry['provider']} | ")
                if entry['duration']:
                    f.write(f"Durée: {entry['duration']:.1f}s")
                f.write("\n")
                f.write("-" * 80 + "\n\n")

        logger.info(f"📋 Exported {len(entries)} transcriptions to {output_file}")

    def export_to_markdown(self, output_file: str):
        """
        Export all transcriptions to markdown file.

        Args:
            output_file: Path to output file
        """
        entries = self.get_all(limit=1000)

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("# Historique des Transcriptions\n\n")
            f.write(f"*Exporté le {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}*\n\n")
            f.write("---\n\n")

            for entry in entries:
                f.write(f"## {entry['timestamp']}\n\n")
                f.write(f"{entry['text']}\n\n")

                metadata = []
                if entry['confidence']:
                    metadata.append(f"Confiance: {entry['confidence']:.1%}")
                if entry['provider']:
                    metadata.append(f"Moteur: {entry['provider']}")
                if entry['duration']:
                    metadata.append(f"Durée: {entry['duration']:.1f}s")

                if metadata:
                    f.write(f"*{' | '.join(metadata)}*\n\n")

                f.write("---\n\n")

        logger.info(f"📋 Exported {len(entries)} transcriptions to {output_file}")

    def get_stats(self) -> Dict:
        """
        Get statistics about transcription history.

        Returns:
            Dict with statistics
        """
        conn = sqlite3.connect(self.db_file)
        cursor = conn.cursor()

        # Total count
        cursor.execute("SELECT COUNT(*) FROM transcriptions")
        total_count = cursor.fetchone()[0]

        # Average confidence
        cursor.execute("SELECT AVG(confidence) FROM transcriptions WHERE confidence IS NOT NULL")
        avg_confidence = cursor.fetchone()[0] or 0.0

        # Total duration
        cursor.execute("SELECT SUM(duration) FROM transcriptions WHERE duration IS NOT NULL")
        total_duration = cursor.fetchone()[0] or 0.0

        # Provider distribution
        cursor.execute("SELECT provider, COUNT(*) FROM transcriptions WHERE provider IS NOT NULL GROUP BY provider")
        providers = dict(cursor.fetchall())

        conn.close()

        return {
            "total_count": total_count,
            "avg_confidence": avg_confidence,
            "total_duration": total_duration,
            "providers": providers
        }
