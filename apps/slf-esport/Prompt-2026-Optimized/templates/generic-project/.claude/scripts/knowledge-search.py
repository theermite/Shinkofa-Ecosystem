#!/usr/bin/env python3
"""
Knowledge Library - Search Script

Search documents in the Knowledge Library.
"""

import argparse
import json
from pathlib import Path
from typing import List, Dict
import re


def simple_tokenize(text: str) -> List[str]:
    """Simple tokenization for search."""
    return re.findall(r'\w+', text.lower())


def compute_relevance(query_tokens: List[str], doc: Dict) -> float:
    """Compute relevance score for document."""
    score = 0.0

    # Title matches (weight: 3.0)
    title_tokens = simple_tokenize(doc.get('title', ''))
    for token in query_tokens:
        if token in title_tokens:
            score += 3.0

    # Tags matches (weight: 2.0)
    tags = [t.lower() for t in doc.get('tags', [])]
    for token in query_tokens:
        if token in tags:
            score += 2.0

    # Category match (weight: 1.0)
    category_tokens = simple_tokenize(doc.get('category', ''))
    for token in query_tokens:
        if token in category_tokens:
            score += 1.0

    # Normalize by query length
    if query_tokens:
        score /= len(query_tokens)

    return score


def search_knowledge(
    query: str,
    category: str = None,
    tags: List[str] = None,
    limit: int = 10,
    threshold: float = 0.5
) -> List[Dict]:
    """
    Search Knowledge Library.

    Returns:
        List of matching documents with scores
    """
    knowledge_dir = Path('.claude/knowledge')
    index_file = knowledge_dir / 'index.json'

    if not index_file.exists():
        print("❌ Index not found. Run /knowledge init first.")
        return []

    with open(index_file) as f:
        index = json.load(f)

    query_tokens = simple_tokenize(query)
    results = []

    for doc in index.get('documents', []):
        # Filter by category
        if category and doc.get('category') != category:
            continue

        # Filter by tags
        if tags:
            doc_tags = [t.lower() for t in doc.get('tags', [])]
            if not any(t.lower() in doc_tags for t in tags):
                continue

        # Compute relevance
        score = compute_relevance(query_tokens, doc)

        if score >= threshold:
            results.append({
                'doc': doc,
                'score': score
            })

    # Sort by score (descending)
    results.sort(key=lambda x: x['score'], reverse=True)

    return results[:limit]


def format_result(result: Dict, index: int) -> str:
    """Format search result for display."""
    doc = result['doc']
    score = result['score']

    output = f"\n{index}. {doc.get('title', 'Untitled')} [{doc.get('path', 'N/A')}]\n"
    output += f"   Category: {doc.get('category', 'N/A')}\n"

    if doc.get('tags'):
        output += f"   Tags: {', '.join(doc['tags'])}\n"

    output += f"   Date: {doc.get('date', 'N/A')}\n"
    output += f"   Score: {score:.2f}\n"

    return output


def main():
    parser = argparse.ArgumentParser(description='Search Knowledge Library')
    parser.add_argument('query', help='Search query')
    parser.add_argument('--category', choices=['coaching', 'business', 'technical'],
                        help='Filter by category')
    parser.add_argument('--tags', nargs='*', help='Filter by tags')
    parser.add_argument('--limit', type=int, default=10, help='Max results')
    parser.add_argument('--threshold', type=float, default=0.5, help='Relevance threshold')

    args = parser.parse_args()

    results = search_knowledge(
        query=args.query,
        category=args.category,
        tags=args.tags,
        limit=args.limit,
        threshold=args.threshold
    )

    if not results:
        print(f"❌ No results found for: {args.query}")
        return 1

    print(f"\n🔍 Found {len(results)} result(s) for: \"{args.query}\"\n")
    print("=" * 60)

    for i, result in enumerate(results, 1):
        print(format_result(result, i))

    return 0


if __name__ == '__main__':
    exit(main())
