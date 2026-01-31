#!/usr/bin/env python3
"""
Knowledge Library - Document Ingestion

Ingests documents into the knowledge library with metadata extraction.
"""

import argparse
import json
import re
import shutil
import sys
from datetime import datetime
from pathlib import Path
from typing import Dict, Optional


def extract_frontmatter(content: str) -> tuple[Dict, str]:
    """Extract YAML frontmatter from markdown content."""
    frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n(.*)$'
    match = re.match(frontmatter_pattern, content, re.DOTALL)

    if not match:
        return {}, content

    frontmatter_text = match.group(1)
    body = match.group(2)

    # Simple YAML parsing (key: value format)
    metadata = {}
    for line in frontmatter_text.split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            key = key.strip()
            value = value.strip().strip('"\'')

            # Handle lists
            if value.startswith('[') and value.endswith(']'):
                value = [v.strip().strip('"\'') for v in value[1:-1].split(',')]

            metadata[key] = value

    return metadata, body


def validate_metadata(metadata: Dict, category: str) -> list[str]:
    """Validate required metadata fields."""
    errors = []

    required = ['title', 'created_at']
    for field in required:
        if field not in metadata:
            errors.append(f"Missing required field: {field}")

    # Ensure category is set
    if 'category' not in metadata:
        metadata['category'] = category
    elif metadata['category'] != category:
        errors.append(f"Category mismatch: {metadata['category']} != {category}")

    return errors


def ingest_document(
    source_file: Path,
    category: str,
    knowledge_dir: Path,
    auto_tags: Optional[list[str]] = None
) -> bool:
    """Ingest a single document into knowledge library."""

    if not source_file.exists():
        print(f"❌ Source file not found: {source_file}")
        return False

    # Read content
    try:
        content = source_file.read_text(encoding='utf-8')
    except Exception as e:
        print(f"❌ Error reading file: {e}")
        return False

    # Extract metadata
    metadata, body = extract_frontmatter(content)

    # Add auto tags if provided
    if auto_tags:
        existing_tags = metadata.get('tags', [])
        if isinstance(existing_tags, str):
            existing_tags = [existing_tags]
        metadata['tags'] = list(set(existing_tags + auto_tags))

    # Validate
    errors = validate_metadata(metadata, category)
    if errors:
        print(f"❌ Validation errors:")
        for error in errors:
            print(f"   - {error}")
        return False

    # Determine destination
    category_dir = knowledge_dir / category
    category_dir.mkdir(parents=True, exist_ok=True)

    # Generate filename from title
    title = metadata.get('title', source_file.stem)
    safe_filename = re.sub(r'[^\w\s-]', '', title.lower())
    safe_filename = re.sub(r'[-\s]+', '-', safe_filename)
    dest_file = category_dir / f"{safe_filename}.md"

    # Check if file already exists
    if dest_file.exists():
        print(f"⚠️  File already exists: {dest_file}")
        response = input("Overwrite? (yes/no): ").strip().lower()
        if response != 'yes':
            print("❌ Ingestion cancelled")
            return False

    # Copy/move file
    try:
        shutil.copy2(source_file, dest_file)
        print(f"✅ Ingested: {dest_file.relative_to(knowledge_dir.parent)}")

        # Update index
        update_index(knowledge_dir, metadata, dest_file)

        return True
    except Exception as e:
        print(f"❌ Error ingesting: {e}")
        return False


def update_index(knowledge_dir: Path, metadata: Dict, file_path: Path):
    """Update the knowledge library index."""
    index_file = knowledge_dir / '.index.json'

    # Load existing index
    if index_file.exists():
        try:
            index = json.loads(index_file.read_text())
        except:
            index = {"documents": [], "updated_at": None}
    else:
        index = {"documents": [], "updated_at": None}

    # Add/update document entry
    doc_entry = {
        "title": metadata.get('title'),
        "category": metadata.get('category'),
        "tags": metadata.get('tags', []),
        "file": str(file_path.relative_to(knowledge_dir.parent)),
        "created_at": metadata.get('created_at'),
        "indexed_at": datetime.now().isoformat()
    }

    # Remove old entry if exists
    index["documents"] = [
        d for d in index["documents"]
        if d.get("file") != doc_entry["file"]
    ]

    # Add new entry
    index["documents"].append(doc_entry)
    index["updated_at"] = datetime.now().isoformat()

    # Save index
    index_file.write_text(json.dumps(index, indent=2))
    print(f"📊 Index updated: {len(index['documents'])} documents")


def main():
    parser = argparse.ArgumentParser(
        description='Ingest documents into Knowledge Library'
    )
    parser.add_argument(
        'files',
        nargs='+',
        help='Document files to ingest (.md, .pdf, .docx)'
    )
    parser.add_argument(
        '--category',
        required=True,
        choices=['coaching', 'business', 'technical'],
        help='Document category'
    )
    parser.add_argument(
        '--knowledge-dir',
        type=Path,
        default=Path('.claude/knowledge'),
        help='Knowledge library directory (default: .claude/knowledge)'
    )
    parser.add_argument(
        '--tags',
        nargs='*',
        help='Additional tags to add'
    )

    args = parser.parse_args()

    print(f"\n📚 Knowledge Library Ingestion\n")
    print(f"Category: {args.category}")
    print(f"Files: {len(args.files)}")
    print()

    success_count = 0
    for file_path in args.files:
        source = Path(file_path)
        if ingest_document(source, args.category, args.knowledge_dir, args.tags):
            success_count += 1
        print()

    print(f"{'='*50}")
    print(f"✅ Ingested: {success_count}/{len(args.files)} documents")
    print(f"{'='*50}\n")

    return 0 if success_count == len(args.files) else 1


if __name__ == '__main__':
    sys.exit(main())
