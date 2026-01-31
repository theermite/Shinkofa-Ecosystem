#!/usr/bin/env python3
"""
Knowledge Library - Search

Search documents in the knowledge library by query, tags, or category.
"""

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Dict, List


def load_index(knowledge_dir: Path) -> Dict:
    """Load the knowledge library index."""
    index_file = knowledge_dir / '.index.json'

    if not index_file.exists():
        return {"documents": [], "updated_at": None}

    try:
        return json.loads(index_file.read_text())
    except:
        return {"documents": [], "updated_at": None}


def search_documents(
    query: str,
    category: str = None,
    tags: List[str] = None,
    knowledge_dir: Path = Path('.claude/knowledge')
) -> List[Dict]:
    """Search documents matching query and filters."""

    index = load_index(knowledge_dir)
    results = []

    query_lower = query.lower() if query else None

    for doc in index["documents"]:
        # Filter by category
        if category and doc.get("category") != category:
            continue

        # Filter by tags
        if tags:
            doc_tags = doc.get("tags", [])
            if isinstance(doc_tags, str):
                doc_tags = [doc_tags]
            if not any(tag in doc_tags for tag in tags):
                continue

        # Search in title and tags
        if query_lower:
            title = doc.get("title", "").lower()
            doc_tags = " ".join(doc.get("tags", [])).lower()

            if query_lower not in title and query_lower not in doc_tags:
                # Search in content
                file_path = knowledge_dir.parent / doc.get("file", "")
                if file_path.exists():
                    try:
                        content = file_path.read_text(encoding='utf-8').lower()
                        if query_lower not in content:
                            continue
                    except:
                        continue
                else:
                    continue

        # Calculate relevance score
        score = 0
        if query_lower:
            title = doc.get("title", "").lower()
            if query_lower in title:
                score += 10
            if query_lower in " ".join(doc.get("tags", [])).lower():
                score += 5

        doc["relevance_score"] = score
        results.append(doc)

    # Sort by relevance
    results.sort(key=lambda x: x.get("relevance_score", 0), reverse=True)

    return results


def display_results(results: List[Dict], max_results: int = 10, verbose: bool = False):
    """Display search results."""

    if not results:
        print("❌ No documents found matching your query.\n")
        return

    print(f"📚 Found {len(results)} document(s)\n")

    for i, doc in enumerate(results[:max_results], 1):
        print(f"{i}. {doc.get('title')}")
        print(f"   Category: {doc.get('category')}")

        tags = doc.get('tags', [])
        if tags:
            print(f"   Tags: {', '.join(tags)}")

        print(f"   File: {doc.get('file')}")

        if verbose:
            print(f"   Created: {doc.get('created_at')}")
            print(f"   Score: {doc.get('relevance_score', 0)}")

        print()

    if len(results) > max_results:
        print(f"... and {len(results) - max_results} more results")
        print(f"Use --max-results to see more\n")


def main():
    parser = argparse.ArgumentParser(
        description='Search Knowledge Library'
    )
    parser.add_argument(
        'query',
        nargs='?',
        help='Search query (optional if using filters)'
    )
    parser.add_argument(
        '--category',
        choices=['coaching', 'business', 'technical'],
        help='Filter by category'
    )
    parser.add_argument(
        '--tags',
        nargs='*',
        help='Filter by tags'
    )
    parser.add_argument(
        '--knowledge-dir',
        type=Path,
        default=Path('.claude/knowledge'),
        help='Knowledge library directory'
    )
    parser.add_argument(
        '--max-results',
        type=int,
        default=10,
        help='Maximum results to display (default: 10)'
    )
    parser.add_argument(
        '--verbose',
        action='store_true',
        help='Show detailed information'
    )
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show library statistics'
    )

    args = parser.parse_args()

    if args.stats:
        # Show statistics
        index = load_index(args.knowledge_dir)
        docs = index.get("documents", [])

        print(f"\n📊 Knowledge Library Statistics\n")
        print(f"Total documents: {len(docs)}")

        # Count by category
        categories = {}
        for doc in docs:
            cat = doc.get("category", "unknown")
            categories[cat] = categories.get(cat, 0) + 1

        print(f"\nBy category:")
        for cat, count in sorted(categories.items()):
            print(f"  {cat}: {count}")

        print(f"\nLast updated: {index.get('updated_at', 'Never')}\n")
        return 0

    if not args.query and not args.category and not args.tags:
        parser.print_help()
        return 1

    print(f"\n🔍 Searching Knowledge Library\n")

    results = search_documents(
        query=args.query or "",
        category=args.category,
        tags=args.tags,
        knowledge_dir=args.knowledge_dir
    )

    display_results(results, args.max_results, args.verbose)

    return 0


if __name__ == '__main__':
    sys.exit(main())
