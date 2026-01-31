#!/usr/bin/env python3
"""
Knowledge Library - Ingestion Script

Ingests documents into the Knowledge Library with metadata extraction.
"""

import argparse
import json
import hashlib
from pathlib import Path
from typing import Dict, List, Optional
from datetime import datetime

def extract_metadata_from_markdown(content: str) -> Dict:
    """Extract YAML frontmatter from markdown."""
    if not content.startswith('---'):
        return {}

    try:
        parts = content.split('---', 2)
        if len(parts) < 3:
            return {}

        import yaml
        metadata = yaml.safe_load(parts[1])
        return metadata if isinstance(metadata, dict) else {}
    except Exception as e:
        print(f"Warning: Could not parse frontmatter: {e}")
        return {}


def chunk_content(content: str, chunk_size: int = 800, overlap: int = 100) -> List[str]:
    """Chunk content into overlapping segments."""
    chunks = []
    start = 0

    while start < len(content):
        end = start + chunk_size
        chunk = content[start:end]

        # Try to end at sentence boundary
        if end < len(content):
            last_period = chunk.rfind('.')
            last_newline = chunk.rfind('\n')
            boundary = max(last_period, last_newline)
            if boundary > chunk_size // 2:
                end = start + boundary + 1
                chunk = content[start:end]

        chunks.append(chunk.strip())
        start = end - overlap

    return chunks


def compute_file_hash(file_path: Path) -> str:
    """Compute SHA256 hash of file."""
    sha256 = hashlib.sha256()
    with open(file_path, 'rb') as f:
        for block in iter(lambda: f.read(4096), b''):
            sha256.update(block)
    return sha256.hexdigest()


def ingest_document(
    file_path: Path,
    category: str,
    tags: Optional[List[str]] = None,
    author: Optional[str] = None,
    dry_run: bool = False
) -> Dict:
    """
    Ingest a single document.

    Returns:
        Document metadata dict
    """
    if not file_path.exists():
        raise FileNotFoundError(f"File not found: {file_path}")

    # Read content
    content = file_path.read_text(encoding='utf-8')

    # Extract metadata
    metadata = extract_metadata_from_markdown(content) if file_path.suffix == '.md' else {}

    # Build document record
    doc = {
        'id': f"{category}/{file_path.stem}",
        'title': metadata.get('title', file_path.stem.replace('-', ' ').title()),
        'category': category,
        'tags': tags or metadata.get('tags', []),
        'author': author or metadata.get('author', 'Unknown'),
        'date': metadata.get('date', datetime.now().isoformat()),
        'source': metadata.get('source', str(file_path)),
        'version': metadata.get('version', '1.0'),
        'path': str(file_path.relative_to(Path.cwd())),
        'file_hash': compute_file_hash(file_path),
        'word_count': len(content.split()),
        'last_modified': datetime.fromtimestamp(file_path.stat().st_mtime).isoformat(),
    }

    # Chunk content
    doc['content_chunks'] = chunk_content(content)
    doc['chunks_count'] = len(doc['content_chunks'])

    if dry_run:
        print("DRY RUN - Would ingest:")
        print(json.dumps({k: v for k, v in doc.items() if k != 'content_chunks'}, indent=2))
        return doc

    # Update index
    knowledge_dir = Path('.claude/knowledge')
    index_file = knowledge_dir / 'index.json'

    if index_file.exists():
        with open(index_file) as f:
            index = json.load(f)
    else:
        index = {'version': '2.0.0', 'documents': [], 'last_updated': None}

    # Check for existing document
    existing_idx = next((i for i, d in enumerate(index['documents']) if d['id'] == doc['id']), None)

    if existing_idx is not None:
        # Update existing
        old_version = index['documents'][existing_idx].get('version', '1.0')
        doc['version'] = f"{float(old_version) + 0.1:.1f}"
        index['documents'][existing_idx] = {k: v for k, v in doc.items() if k != 'content_chunks'}
        print(f"✅ Updated: {doc['id']} (v{doc['version']})")
    else:
        # Add new
        index['documents'].append({k: v for k, v in doc.items() if k != 'content_chunks'})
        print(f"✅ Ingested: {doc['id']}")

    index['last_updated'] = datetime.now().isoformat()

    # Write index
    with open(index_file, 'w') as f:
        json.dump(index, f, indent=2)

    return doc


def main():
    parser = argparse.ArgumentParser(description='Ingest documents into Knowledge Library')
    parser.add_argument('file', type=Path, help='File to ingest')
    parser.add_argument('--category', required=True, choices=['coaching', 'business', 'technical'],
                        help='Document category')
    parser.add_argument('--tags', nargs='*', help='Tags for the document')
    parser.add_argument('--author', help='Document author')
    parser.add_argument('--dry-run', action='store_true', help='Show what would be done without doing it')

    args = parser.parse_args()

    try:
        ingest_document(
            file_path=args.file,
            category=args.category,
            tags=args.tags,
            author=args.author,
            dry_run=args.dry_run
        )
    except Exception as e:
        print(f"❌ Error: {e}")
        return 1

    return 0


if __name__ == '__main__':
    exit(main())
