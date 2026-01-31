"""Main CLI entry point."""

import click
from rich.console import Console

from mycli import __version__
from mycli.commands import deploy, init_cmd
from mycli.commands.db import db_group

console = Console()


@click.group()
@click.version_option(version=__version__)
@click.option("--verbose", "-v", is_flag=True, help="Enable verbose output")
@click.pass_context
def cli(ctx: click.Context, verbose: bool) -> None:
    """MyCLI - Production-ready CLI tool template.

    Example usage:

        mycli init --name my-project

        mycli deploy --env production

        mycli db migrate
    """
    ctx.ensure_object(dict)
    ctx.obj["verbose"] = verbose


# Register commands
cli.add_command(init_cmd)
cli.add_command(deploy.deploy_cmd)
cli.add_command(db_group)


if __name__ == "__main__":
    cli()
