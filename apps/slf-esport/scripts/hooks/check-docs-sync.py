#!/usr/bin/env python3
"""
Pre-commit Hook: Check Documentation Sync

Ensures critical documentation files are in sync when code changes.
"""

import sys
import subprocess
from pathlib import Path
from typing import List, Tuple

# Mapping: code pattern -> required docs
DOC_REQUIREMENTS = {
    'Prompt-2026-Optimized/agents/': [
        'Prompt-2026-Optimized/agents/README.md',
    ],
    'Prompt-2026-Optimized/templates/': [
        'Prompt-2026-Optimized/templates/README.md',
    ],
    '.claude/commands/': [
        '.claude/CLAUDE.md',
    ],
    'scripts/': [
        'scripts/README.md',
    ],
}


def get_modified_files() -> List[str]:
    """Get list of staged files."""
    result = subprocess.run(
        ['git', 'diff', '--cached', '--name-only'],
        capture_output=True,
        text=True,
        check=False
    )

    if result.returncode != 0:
        return []

    return [line.strip() for line in result.stdout.split('\n') if line.strip()]


def check_doc_sync(modified_files: List[str]) -> Tuple[bool, List[str]]:
    """Check if required docs are staged when code changes."""
    warnings = []
    critical_missing = []

    for pattern, required_docs in DOC_REQUIREMENTS.items():
        # Check if any modified file matches this pattern
        pattern_matched = any(pattern in f for f in modified_files)

        if not pattern_matched:
            continue

        # Check if required docs are also staged
        for doc in required_docs:
            if doc not in modified_files:
                # Check if doc file exists and might need updating
                doc_path = Path(doc)
                if doc_path.exists():
                    warnings.append(
                        f"⚠️  Modified files in '{pattern}' but '{doc}' not staged.\n"
                        f"   Consider updating documentation if needed."
                    )
                else:
                    critical_missing.append(
                        f"❌ Modified files in '{pattern}' but required '{doc}' is missing!"
                    )

    return len(critical_missing) == 0, warnings + critical_missing


def main() -> int:
    """Main entry point."""
    modified_files = get_modified_files()

    if not modified_files:
        # No staged files, nothing to check
        return 0

    success, messages = check_doc_sync(modified_files)

    if messages:
        print("\n📚 Documentation Sync Check\n")
        for msg in messages:
            print(msg)
        print()

    if not success:
        print("💡 Tip: Create or update the missing documentation before committing.\n")
        return 1

    if not success or messages:
        # Warnings only - don't block commit
        print("💡 Review warnings above, but commit is allowed to proceed.\n")

    return 0


if __name__ == '__main__':
    sys.exit(main())
