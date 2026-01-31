"""Tests for CLI commands."""

from click.testing import CliRunner
import pytest

from mycli.cli import cli


@pytest.fixture
def runner():
    """Click CLI runner."""
    return CliRunner()


def test_cli_help(runner):
    """Test CLI help output."""
    result = runner.invoke(cli, ["--help"])
    assert result.exit_code == 0
    assert "MyCLI" in result.output


def test_cli_version(runner):
    """Test CLI version command."""
    result = runner.invoke(cli, ["--version"])
    assert result.exit_code == 0
    assert "1.0.0" in result.output


def test_deploy_command_requires_env(runner):
    """Test deploy command requires --env."""
    result = runner.invoke(cli, ["deploy"])
    assert result.exit_code != 0
    assert "Missing option" in result.output


def test_deploy_command_dry_run(runner):
    """Test deploy command with --dry-run."""
    result = runner.invoke(cli, ["deploy", "--env", "dev", "--dry-run"])
    assert result.exit_code == 0
    assert "DRY RUN" in result.output


def test_db_migrate_command(runner):
    """Test db migrate command."""
    result = runner.invoke(cli, ["db", "migrate"])
    assert result.exit_code == 0
    assert "migrations" in result.output.lower()


def test_db_seed_command(runner):
    """Test db seed command."""
    result = runner.invoke(cli, ["db", "seed", "--env", "dev"])
    assert result.exit_code == 0
    assert "seed" in result.output.lower()
