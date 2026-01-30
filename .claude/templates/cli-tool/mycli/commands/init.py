"""Initialize command."""

import click
from pathlib import Path
from rich.console import Console
from rich.prompt import Prompt

from mycli.core.config import Config

console = Console()


@click.command("init")
@click.option("--api-url", help="API base URL")
@click.option("--api-key", help="API authentication key")
@click.option("--config-path", type=click.Path(), help="Config file path")
@click.option("--force", is_flag=True, help="Overwrite existing config")
def init_cmd(api_url: str | None, api_key: str | None, config_path: str | None, force: bool) -> None:
    """Initialize MyCLI configuration.

    Example:

        mycli init --api-url https://api.example.com --api-key YOUR_KEY
    """
    console.print("[bold blue]MyCLI Configuration Setup[/bold blue]\n")

    # Config path
    if config_path:
        config_file = Path(config_path)
    else:
        config_file = Path.home() / ".mycli" / "config.yaml"

    # Check existing
    if config_file.exists() and not force:
        console.print(f"[yellow]Config file already exists: {config_file}[/yellow]")
        console.print("[yellow]Use --force to overwrite[/yellow]")
        raise click.Abort()

    # Interactive prompts if not provided
    if not api_url:
        api_url = Prompt.ask("API URL", default="https://api.example.com")

    if not api_key:
        api_key = Prompt.ask("API Key")

    # Create config
    config = Config(api_url=api_url, api_key=api_key)
    config.save(config_file)

    console.print(f"\n[green]✔[/green] Configuration saved to: {config_file}")
    console.print("\n[dim]You can now use MyCLI commands.[/dim]")
