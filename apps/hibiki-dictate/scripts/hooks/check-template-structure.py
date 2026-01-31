#!/usr/bin/env python3
"""
Pre-commit Hook: Validate Template Structure

Ensures template directories have required files and structure.
"""

import sys
import subprocess
from pathlib import Path
from typing import Dict, List, Tuple

# Required files for each template type
TEMPLATE_REQUIREMENTS = {
    'fastapi-react': {
        'required': [
            'README.md',
            'docker-compose.yml',
            'backend/pyproject.toml',
            'backend/main.py',
            'frontend/package.json',
            'frontend/src/App.tsx',
            '.env.example',
        ],
        'docs': [
            '.claude/docs/ARCHITECTURE.md',
            '.claude/docs/API_REFERENCE.md',
            '.claude/docs/DATABASE_SCHEMA.md',
        ]
    },
    'nextjs-app': {
        'required': [
            'README.md',
            'package.json',
            'next.config.js',
            'src/app/page.tsx',
            '.env.example',
        ],
        'docs': [
            '.claude/docs/ARCHITECTURE.md',
        ]
    },
    'electron-app': {
        'required': [
            'README.md',
            'package.json',
            'src/main.ts',
            'src/renderer/App.tsx',
            '.env.example',
        ],
        'docs': [
            '.claude/docs/ARCHITECTURE.md',
        ]
    },
    'cli-tool': {
        'required': [
            'README.md',
            'python-variant/pyproject.toml',
            'typescript-variant/package.json',
        ],
        'docs': [
            '.claude/docs/ARCHITECTURE.md',
        ]
    },
}


def get_modified_templates() -> List[Path]:
    """Get list of modified template directories."""
    result = subprocess.run(
        ['git', 'diff', '--cached', '--name-only'],
        capture_output=True,
        text=True,
        check=False
    )

    if result.returncode != 0:
        return []

    modified_files = [line.strip() for line in result.stdout.split('\n') if line.strip()]

    # Extract unique template directories
    templates = set()
    templates_base = Path('Prompt-2026-Optimized/templates')

    for file in modified_files:
        file_path = Path(file)
        if templates_base in file_path.parents:
            # Find the template directory (first level under templates/)
            for parent in file_path.parents:
                if parent.parent == templates_base:
                    templates.add(parent)
                    break

    return sorted(templates)


def validate_template(template_path: Path) -> Tuple[bool, List[str]]:
    """Validate a single template structure."""
    template_name = template_path.name
    issues = []

    requirements = TEMPLATE_REQUIREMENTS.get(template_name)
    if not requirements:
        # Unknown template, skip validation
        return True, []

    # Check required files
    for required_file in requirements['required']:
        file_path = template_path / required_file
        if not file_path.exists():
            issues.append(f"❌ Missing required file: {required_file}")

    # Check documentation files (warning only)
    missing_docs = []
    for doc_file in requirements.get('docs', []):
        file_path = template_path / doc_file
        if not file_path.exists():
            missing_docs.append(f"⚠️  Missing documentation: {doc_file}")

    issues.extend(missing_docs)

    return len(issues) == 0 or all('⚠️' in i for i in issues), issues


def main() -> int:
    """Main entry point."""
    modified_templates = get_modified_templates()

    if not modified_templates:
        # No templates modified
        return 0

    print("\n🏗️  Template Structure Validation\n")

    all_valid = True
    for template_path in modified_templates:
        valid, issues = validate_template(template_path)

        if issues:
            print(f"Template: {template_path.name}")
            for issue in issues:
                print(f"  {issue}")
            print()

        if not valid:
            all_valid = False

    if not all_valid:
        print("💡 Fix the missing required files before committing.\n")
        return 1

    return 0


if __name__ == '__main__':
    sys.exit(main())
