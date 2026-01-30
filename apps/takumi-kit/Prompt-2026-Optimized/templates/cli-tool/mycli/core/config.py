"""Configuration management."""

from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Any

import yaml


@dataclass
class Config:
    """CLI configuration."""

    api_url: str
    api_key: str
    log_level: str = "INFO"
    timeout: int = 30

    @classmethod
    def load(cls, path: Path | None = None) -> "Config":
        """Load configuration from file.

        Args:
            path: Config file path (default: ~/.mycli/config.yaml)

        Returns:
            Config instance

        Raises:
            FileNotFoundError: If config file doesn't exist
        """
        if path is None:
            path = Path.home() / ".mycli" / "config.yaml"

        if not path.exists():
            raise FileNotFoundError(f"Config file not found: {path}")

        with open(path) as f:
            data = yaml.safe_load(f)

        return cls(**data)

    def save(self, path: Path | None = None) -> None:
        """Save configuration to file.

        Args:
            path: Config file path (default: ~/.mycli/config.yaml)
        """
        if path is None:
            path = Path.home() / ".mycli" / "config.yaml"

        path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, "w") as f:
            yaml.dump(asdict(self), f, default_flow_style=False)

    def get(self, key: str, default: Any = None) -> Any:
        """Get config value.

        Args:
            key: Config key
            default: Default value if key not found

        Returns:
            Config value or default
        """
        return getattr(self, key, default)

    def set(self, key: str, value: Any) -> None:
        """Set config value.

        Args:
            key: Config key
            value: Value to set
        """
        setattr(self, key, value)
