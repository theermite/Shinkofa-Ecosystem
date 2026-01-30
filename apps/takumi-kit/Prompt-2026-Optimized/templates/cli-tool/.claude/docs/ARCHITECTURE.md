# Architecture - [Nom CLI Tool]

> Vue d'ensemble architecture CLI tool.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🏗️ Vue d'Ensemble

### Type de Projet
**CLI Tool** (Command-Line Interface)

### Stack Technique

| Composant | Technologie | Version | Raison |
|-----------|-------------|---------|--------|
| **Langage** | Python / TypeScript | 3.11+ / 5.x | Selon use case (Python data/ops, TS web-related) |
| **CLI Framework** | Click (Python) / Commander (TS) | 8.x / 11.x | Args parsing, help auto, subcommands |
| **Config** | YAML / TOML | - | Human-readable config files |
| **Logs** | Rich (Python) / Chalk (TS) | - | Colored output, progress bars, tables |
| **Tests** | pytest (Python) / Vitest (TS) | - | Unit + integration tests |
| **Package** | pip (PyPI) / npm (npmjs) | - | Distribution publique |

---

## 📐 Architecture CLI

### Structure Commandes

```
mycli <command> [subcommand] [options] [arguments]

Exemples:
  mycli init                      # Initialize config
  mycli deploy --env production   # Deploy with option
  mycli db migrate                # Subcommand
  mycli --version                 # Global option
```

---

## 🐍 Python CLI (Click)

### Structure Projet

```
cli-tool/
├── mycli/
│   ├── __init__.py
│   ├── __main__.py        # Entry point (python -m mycli)
│   ├── cli.py             # Click group + commands
│   ├── commands/
│   │   ├── __init__.py
│   │   ├── init.py        # mycli init
│   │   ├── deploy.py      # mycli deploy
│   │   └── db.py          # mycli db (group)
│   ├── core/
│   │   ├── config.py      # Config management
│   │   ├── logger.py      # Rich logger
│   │   └── utils.py       # Helpers
│   └── version.py         # __version__
├── tests/
├── pyproject.toml
└── README.md
```

---

### Entry Point (`cli.py`)

```python
# mycli/cli.py
import click
from rich.console import Console

from mycli.commands import init, deploy, db
from mycli.version import __version__

console = Console()

@click.group()
@click.version_option(version=__version__)
@click.pass_context
def cli(ctx):
    """MyCLI - Description du CLI tool."""
    ctx.ensure_object(dict)

# Register commands
cli.add_command(init.init_cmd)
cli.add_command(deploy.deploy_cmd)
cli.add_command(db.db_group)

if __name__ == '__main__':
    cli()
```

---

### Command Exemple (`commands/deploy.py`)

```python
# mycli/commands/deploy.py
import click
from rich.console import Console

console = Console()

@click.command('deploy')
@click.option('--env', type=click.Choice(['dev', 'staging', 'production']), required=True)
@click.option('--dry-run', is_flag=True, help='Simulate deployment')
@click.pass_context
def deploy_cmd(ctx, env, dry_run):
    """Deploy application to specified environment."""
    try:
        console.print(f"[bold blue]Deploying to {env}...[/bold blue]")

        if dry_run:
            console.print("[yellow]DRY RUN mode - no changes made[/yellow]")
            return

        # Deployment logic...
        console.print("[green]✔[/green] Deployment successful!")

    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")
        raise click.Abort()
```

---

### Subcommands (Group) (`commands/db.py`)

```python
# mycli/commands/db.py
import click

@click.group('db')
def db_group():
    """Database management commands."""
    pass

@db_group.command('migrate')
@click.option('--to', help='Target migration version')
def migrate(to):
    """Run database migrations."""
    click.echo(f"Migrating to version: {to or 'latest'}")

@db_group.command('seed')
def seed():
    """Seed database with sample data."""
    click.echo("Seeding database...")
```

**Usage** :
```bash
mycli db migrate --to 003
mycli db seed
```

---

### Config Management (`core/config.py`)

```python
# mycli/core/config.py
import yaml
from pathlib import Path
from dataclasses import dataclass

@dataclass
class Config:
    """CLI configuration."""
    api_url: str
    api_key: str
    log_level: str = 'INFO'

    @classmethod
    def load(cls, path: Path = Path.home() / '.mycli' / 'config.yaml') -> 'Config':
        """Load config from YAML file."""
        if not path.exists():
            raise FileNotFoundError(f"Config not found: {path}")

        with open(path) as f:
            data = yaml.safe_load(f)

        return cls(**data)

    def save(self, path: Path = Path.home() / '.mycli' / 'config.yaml'):
        """Save config to YAML file."""
        path.parent.mkdir(parents=True, exist_ok=True)

        with open(path, 'w') as f:
            yaml.dump(self.__dict__, f)
```

---

### Rich Output (`core/logger.py`)

```python
# mycli/core/logger.py
from rich.console import Console
from rich.table import Table
from rich.progress import Progress

console = Console()

def print_table(data: list[dict], title: str = None):
    """Print data as formatted table."""
    table = Table(title=title, show_header=True)

    # Add columns
    for key in data[0].keys():
        table.add_column(key.capitalize())

    # Add rows
    for row in data:
        table.add_row(*[str(v) for v in row.values()])

    console.print(table)

def progress_bar(items: list, description: str = "Processing"):
    """Show progress bar for list processing."""
    with Progress() as progress:
        task = progress.add_task(description, total=len(items))

        for item in items:
            # Process item...
            progress.update(task, advance=1)
```

---

## 🎯 TypeScript CLI (Commander)

### Structure Projet

```
cli-tool/
├── src/
│   ├── index.ts           # Entry point
│   ├── cli.ts             # Commander setup
│   ├── commands/
│   │   ├── init.ts
│   │   ├── deploy.ts
│   │   └── db.ts
│   ├── core/
│   │   ├── config.ts
│   │   └── logger.ts
│   └── types.ts
├── tests/
├── package.json
└── README.md
```

---

### Entry Point (`cli.ts`)

```typescript
// src/cli.ts
import { Command } from 'commander';
import chalk from 'chalk';

import { initCmd } from './commands/init';
import { deployCmd } from './commands/deploy';
import { dbCmd } from './commands/db';

const program = new Command();

program
  .name('mycli')
  .description('MyCLI - Description du CLI tool')
  .version('1.0.0');

// Commands
program.addCommand(initCmd);
program.addCommand(deployCmd);
program.addCommand(dbCmd);

// Error handling
program.exitOverride((err) => {
  if (err.exitCode !== 0) {
    console.error(chalk.red('Error:'), err.message);
  }
  process.exit(err.exitCode);
});

export { program };
```

---

### Command Exemple (`commands/deploy.ts`)

```typescript
// src/commands/deploy.ts
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const deployCmd = new Command('deploy')
  .description('Deploy application to specified environment')
  .requiredOption('--env <env>', 'Environment (dev, staging, production)')
  .option('--dry-run', 'Simulate deployment')
  .action(async (options) => {
    const spinner = ora('Deploying...').start();

    try {
      if (options.dryRun) {
        spinner.warn('DRY RUN mode - no changes made');
        return;
      }

      // Deployment logic...
      await new Promise(resolve => setTimeout(resolve, 2000));

      spinner.succeed(chalk.green('Deployment successful!'));
    } catch (error) {
      spinner.fail(chalk.red(`Deployment failed: ${error.message}`));
      process.exit(1);
    }
  });
```

---

### Subcommands (Group) (`commands/db.ts`)

```typescript
// src/commands/db.ts
import { Command } from 'commander';

export const dbCmd = new Command('db')
  .description('Database management commands');

dbCmd
  .command('migrate')
  .option('--to <version>', 'Target migration version')
  .action(async (options) => {
    console.log(`Migrating to version: ${options.to || 'latest'}`);
  });

dbCmd
  .command('seed')
  .action(async () => {
    console.log('Seeding database...');
  });
```

---

## 📦 Distribution

### Python (PyPI)

**pyproject.toml** :
```toml
[project]
name = "mycli"
version = "1.0.0"
description = "Description du CLI tool"
dependencies = [
    "click>=8.0",
    "rich>=13.0",
    "pyyaml>=6.0",
]

[project.scripts]
mycli = "mycli.cli:cli"

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"
```

**Publier** :
```bash
# Build
python -m build

# Upload (PyPI)
twine upload dist/*
```

**Installation utilisateur** :
```bash
pip install mycli
mycli --version
```

---

### TypeScript (npm)

**package.json** :
```json
{
  "name": "mycli",
  "version": "1.0.0",
  "description": "Description du CLI tool",
  "bin": {
    "mycli": "./dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^5.0.0",
    "ora": "^6.0.0"
  }
}
```

**Publier** :
```bash
# Build
npm run build

# Login npm
npm login

# Publish
npm publish
```

**Installation utilisateur** :
```bash
npm install -g mycli
mycli --version
```

---

## 🔧 Configuration

### Config File Locations (Convention)

| OS | Path |
|----|------|
| **Linux/macOS** | `~/.mycli/config.yaml` |
| **Windows** | `%USERPROFILE%\.mycli\config.yaml` |

**Exemple config.yaml** :
```yaml
# ~/.mycli/config.yaml
api_url: https://api.example.com
api_key: your_api_key_here
log_level: INFO

# Environment-specific (optionnel)
environments:
  dev:
    api_url: http://localhost:8000
  production:
    api_url: https://api.example.com
```

---

## 🔐 Sécurité

### API Keys / Secrets

- ✅ **JAMAIS** hardcoder secrets dans code
- ✅ Stocker dans config file (`~/.mycli/config.yaml`)
- ✅ Permissions restrictives (chmod 600)
- ✅ Ou : Variables environnement (`MYCLI_API_KEY`)
- ✅ Ou : Keyring system (Python `keyring` lib)

**Exemple avec keyring** :
```python
import keyring

# Store secret
keyring.set_password('mycli', 'api_key', 'secret_key_value')

# Retrieve secret
api_key = keyring.get_password('mycli', 'api_key')
```

---

## 📊 Logging

### Best Practices

- ✅ Logs structurés (timestamp, level, message)
- ✅ Niveaux : DEBUG, INFO, WARNING, ERROR
- ✅ Colored output (Rich/Chalk) pour lisibilité
- ✅ Verbose mode (`--verbose` flag)

**Exemple** :
```python
import logging
from rich.logging import RichHandler

logging.basicConfig(
    level=logging.INFO,
    format='%(message)s',
    handlers=[RichHandler(rich_tracebacks=True)]
)

logger = logging.getLogger('mycli')
logger.info('Starting deployment...')
logger.error('Deployment failed!')
```

---

## 📝 Décisions Architecture (ADR)

### ADR-001 : Click vs Typer (Python)
**Date** : [DATE]
**Décision** : Click
**Raison** : Maturité, communauté large, battle-tested
**Alternatives** : Typer (moderne, type hints first), argparse (stdlib, verbose)
**Conséquences** : Pas de type hints auto, mais stable

### ADR-002 : Commander vs Yargs (TypeScript)
**Date** : [DATE]
**Décision** : Commander
**Raison** : API simple, bien documenté, large adoption
**Alternatives** : Yargs (features avancées, complexe), oclif (Heroku, overhead)
**Conséquences** : Moins de features avancées (middleware, etc.)

---

## 🔗 Voir Aussi

- [API_REFERENCE.md](API_REFERENCE.md) - Documentation commands
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - Standards Python/TS
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Tests CLI

---

**Maintenu par** : [Équipe] | **Revue recommandée** : À chaque changement architecture majeur
