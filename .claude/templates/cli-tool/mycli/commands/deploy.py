"""Deploy command."""

import click
from rich.console import Console
from rich.progress import Progress
from rich.prompt import Confirm

console = Console()


@click.command("deploy")
@click.option(
    "--env",
    type=click.Choice(["dev", "staging", "production"]),
    required=True,
    help="Target environment",
)
@click.option("--branch", help="Git branch to deploy (default: current)")
@click.option("--dry-run", is_flag=True, help="Simulate deployment without changes")
@click.option("--skip-tests", is_flag=True, help="Skip test execution (NOT recommended)")
def deploy_cmd(env: str, branch: str | None, dry_run: bool, skip_tests: bool) -> None:
    """Deploy application to specified environment.

    Example:

        mycli deploy --env production

        mycli deploy --env staging --dry-run
    """
    console.print(f"\n[bold]🚀 Deploying to {env}...[/bold]\n")

    # Confirm production
    if env == "production" and not dry_run:
        if not Confirm.ask("[yellow]⚠ Deploy to PRODUCTION?[/yellow]", default=False):
            console.print("[yellow]Aborted[/yellow]")
            raise click.Abort()

    if dry_run:
        console.print("[yellow]DRY RUN mode - no changes will be made[/yellow]\n")

    # Simulate deployment steps
    with Progress() as progress:
        if not skip_tests:
            task = progress.add_task("[cyan]Running tests...", total=100)
            # Simulate test execution
            import time

            for _ in range(100):
                time.sleep(0.01)
                progress.update(task, advance=1)

        task = progress.add_task("[green]Building application...", total=100)
        for _ in range(100):
            time.sleep(0.005)
            progress.update(task, advance=1)

        task = progress.add_task("[blue]Pushing to registry...", total=100)
        for _ in range(100):
            time.sleep(0.003)
            progress.update(task, advance=1)

        if not dry_run:
            task = progress.add_task("[magenta]Updating service...", total=100)
            for _ in range(100):
                time.sleep(0.002)
                progress.update(task, advance=1)

    if dry_run:
        console.print("\n[green]✔[/green] Dry run completed successfully")
    else:
        console.print("\n[green]✔[/green] Deployment successful!")
        console.print(f"\n[dim]Environment: {env}[/dim]")
        if branch:
            console.print(f"[dim]Branch: {branch}[/dim]")
