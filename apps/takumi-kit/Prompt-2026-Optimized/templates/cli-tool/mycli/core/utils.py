"""Utility functions."""

from typing import Any


def validate_url(url: str) -> bool:
    """Validate URL format.

    Args:
        url: URL to validate

    Returns:
        True if valid, False otherwise
    """
    return url.startswith(("http://", "https://"))


def parse_version(version: str) -> tuple[int, int, int]:
    """Parse semantic version string.

    Args:
        version: Version string (e.g., "1.2.3")

    Returns:
        Tuple of (major, minor, patch)

    Raises:
        ValueError: If version format is invalid
    """
    try:
        parts = version.split(".")
        return (int(parts[0]), int(parts[1]), int(parts[2]))
    except (IndexError, ValueError) as e:
        raise ValueError(f"Invalid version format: {version}") from e
