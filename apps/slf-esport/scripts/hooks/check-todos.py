#!/usr/bin/env python3
"""
Pre-commit Hook: Check for Unresolved TODOs

Warns about TODO comments in production code.
"""

import re
import sys
from pathlib import Path
from typing import List, Tuple


def check_file_todos(file_path: str) -> List[Tuple[int, str]]:
    """Check a file for TODO comments."""
    todos = []
    path = Path(file_path)

    if not path.exists():
        return todos

    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line_num, line in enumerate(f, start=1):
                # Match TODO comments
                # Patterns: TODO:, TODO(name):, FIXME:, XXX:, HACK:
                match = re.search(
                    r'(?:TODO|FIXME|XXX|HACK)(?:\([^)]+\))?:\s*(.+)',
                    line,
                    re.IGNORECASE
                )
                if match:
                    todos.append((line_num, match.group(0).strip()))
    except Exception:
        # Ignore binary files or encoding errors
        pass

    return todos


def main(filenames: List[str]) -> int:
    """Main entry point."""
    if not filenames:
        return 0

    total_todos = 0
    files_with_todos = []

    for filename in filenames:
        todos = check_file_todos(filename)
        if todos:
            total_todos += len(todos)
            files_with_todos.append((filename, todos))

    if files_with_todos:
        print("\n⚠️  TODO Comments Found\n")
        print("The following files contain TODO/FIXME comments:\n")

        for filename, todos in files_with_todos:
            print(f"📄 {filename}")
            for line_num, todo_text in todos[:3]:  # Show max 3 per file
                print(f"   Line {line_num}: {todo_text}")
            if len(todos) > 3:
                print(f"   ... and {len(todos) - 3} more")
            print()

        print(f"Total: {total_todos} TODO(s) found\n")
        print("💡 This is a warning only. Consider resolving TODOs before committing.\n")

    return 0  # Don't block commit, just warn


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
