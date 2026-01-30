#!/usr/bin/env python3
"""
Pre-commit Hook: Protect Critical Files

Requires extra confirmation when modifying critical infrastructure files.
"""

import sys
from pathlib import Path
from typing import List

# Critical files that require extra caution
CRITICAL_FILES = [
    '.github/workflows/security-scan.yml',
    '.github/workflows/test-templates.yml',
    '.claude/CLAUDE.md',
    'scripts/monitor-projects.py',
    'scripts/sync-methodology.py',
    'scripts/validate-propagation.py',
    'scripts/propagate-all.sh',
    '.pre-commit-config.yaml',
    '.gitleaks.toml',
]

# Warning message
WARNING_MESSAGE = """
⚠️  CRITICAL FILE MODIFICATION DETECTED

You are modifying one or more critical infrastructure files:

{files}

These files are essential to the methodology and require careful review.

Before proceeding:
1. Review your changes thoroughly
2. Ensure you understand the impact
3. Test locally if possible
4. Consider getting a second review

To proceed with this commit, you must explicitly confirm.
"""


def check_critical_files(filenames: List[str]) -> List[str]:
    """Check if any critical files are being modified."""
    modified_critical = []

    for filename in filenames:
        # Normalize path
        normalized = str(Path(filename)).replace('\\', '/')

        for critical_file in CRITICAL_FILES:
            if normalized == critical_file or normalized.endswith(critical_file):
                modified_critical.append(filename)
                break

    return modified_critical


def confirm_modification() -> bool:
    """Ask user to confirm critical file modification."""
    try:
        response = input("\nType 'yes' to confirm and proceed with commit: ").strip().lower()
        return response == 'yes'
    except (EOFError, KeyboardInterrupt):
        print("\n\n❌ Commit aborted by user")
        return False


def main(filenames: List[str]) -> int:
    """Main entry point."""
    if not filenames:
        return 0

    modified_critical = check_critical_files(filenames)

    if not modified_critical:
        return 0

    # Format file list
    file_list = '\n'.join(f"  - {f}" for f in modified_critical)
    print(WARNING_MESSAGE.format(files=file_list))

    # In CI/CD or non-interactive environments, allow the commit
    if not sys.stdin.isatty():
        print("⚠️  Non-interactive environment detected. Allowing commit to proceed.")
        print("   Please review changes carefully in PR review.\n")
        return 0

    # Interactive confirmation
    if confirm_modification():
        print("\n✅ Confirmed. Proceeding with commit.\n")
        return 0
    else:
        print("\n❌ Commit cancelled. No changes were committed.\n")
        return 1


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
