# Coding Standards - [Nom CLI Tool]

> Standards Python + TypeScript pour CLI tools.

---

## 🐍 Python CLI

### Style Guide
**Base** : PEP 8

**Formatter** : Black (line-length=100)
**Linter** : Ruff
**Type Checker** : Mypy

### Conventions Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | snake_case | `api_url`, `is_verbose` |
| Fonctions | snake_case | `deploy_application()` |
| Commands | snake_case | `@click.command('deploy')` |
| Classes | PascalCase | `ConfigManager`, `Deployer` |
| Constantes | SCREAMING_SNAKE_CASE | `DEFAULT_TIMEOUT = 30` |

### Structure Command

```python
import click
from rich.console import Console

console = Console()

@click.command('deploy')
@click.option('--env', required=True, type=click.Choice(['dev', 'staging', 'production']))
@click.option('--dry-run', is_flag=True, help='Simulate deployment')
def deploy_cmd(env: str, dry_run: bool):
    """Deploy application to environment.

    Args:
        env: Target environment
        dry_run: If True, simulate without changes
    """
    try:
        console.print(f"[bold]Deploying to {env}...[/bold]")

        if dry_run:
            console.print("[yellow]DRY RUN mode[/yellow]")
            return

        # Deployment logic
        _run_deployment(env)

        console.print("[green]✔ Success![/green]")

    except Exception as e:
        console.print(f"[red]Error:[/red] {e}")
        raise click.Abort()


def _run_deployment(env: str):
    """Internal deployment logic."""
    pass
```

---

## 🎯 TypeScript CLI

### Style Guide
**Base** : Airbnb TypeScript

**Formatter** : Prettier
**Linter** : ESLint

### Conventions Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | camelCase | `apiUrl`, `isVerbose` |
| Fonctions | camelCase | `deployApplication()` |
| Commands | kebab-case | `.command('deploy')` |
| Classes | PascalCase | `ConfigManager`, `Deployer` |
| Constantes | SCREAMING_SNAKE_CASE | `DEFAULT_TIMEOUT = 30` |

### Structure Command

```typescript
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';

export const deployCmd = new Command('deploy')
  .description('Deploy application to environment')
  .requiredOption('--env <env>', 'Environment (dev, staging, production)')
  .option('--dry-run', 'Simulate deployment')
  .action(async (options) => {
    const spinner = ora('Deploying...').start();

    try {
      if (options.dryRun) {
        spinner.warn('DRY RUN mode');
        return;
      }

      await runDeployment(options.env);

      spinner.succeed(chalk.green('Deployment successful!'));
    } catch (error) {
      spinner.fail(chalk.red(`Error: ${error.message}`));
      process.exit(1);
    }
  });

async function runDeployment(env: string): Promise<void> {
  // Deployment logic
}
```

---

## 🧪 Testing

### Fichiers Tests

```
tests/
├── test_commands.py      # Test commands (Python)
├── test_config.py        # Test config management
└── test_utils.py         # Test utilities
```

### Nommage

```python
def test_deploy_command_with_valid_env_succeeds():
    """Test deploy command with valid environment."""
    pass

def test_init_command_creates_config_file():
    """Test init command creates config file."""
    pass
```

---

## 📝 Docstrings

### Python (Google Style)

```python
def deploy_application(env: str, dry_run: bool = False) -> bool:
    """Deploy application to specified environment.

    Args:
        env: Target environment (dev, staging, production)
        dry_run: If True, simulate deployment without changes

    Returns:
        True if deployment successful, False otherwise

    Raises:
        ValueError: If env is invalid
        DeploymentError: If deployment fails
    """
    pass
```

### TypeScript (JSDoc)

```typescript
/**
 * Deploy application to specified environment.
 *
 * @param env - Target environment (dev, staging, production)
 * @param dryRun - If true, simulate deployment without changes
 * @returns Promise resolving to true if successful
 * @throws {DeploymentError} If deployment fails
 */
async function deployApplication(env: string, dryRun: boolean = false): Promise<boolean> {
  // ...
}
```

---

## 🚨 Error Handling

### Python

```python
import click
from rich.console import Console

console = Console()

class DeploymentError(Exception):
    """Custom deployment error."""
    pass

@click.command()
def deploy():
    try:
        # Logic
        pass
    except DeploymentError as e:
        console.print(f"[red]Deployment failed:[/red] {e}")
        raise click.Abort()
    except Exception as e:
        console.print(f"[red]Unexpected error:[/red] {e}")
        raise
```

### TypeScript

```typescript
class DeploymentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DeploymentError';
  }
}

async function deploy() {
  try {
    // Logic
  } catch (error) {
    if (error instanceof DeploymentError) {
      console.error(chalk.red(`Deployment failed: ${error.message}`));
      process.exit(1);
    }
    throw error;
  }
}
```

---

## 🎨 Output Styling

### Python (Rich)

```python
from rich.console import Console
from rich.table import Table
from rich.progress import Progress

console = Console()

# Colored text
console.print("[bold green]Success![/bold green]")
console.print("[red]Error![/red]")

# Table
table = Table(title="Deployments")
table.add_column("ID", style="cyan")
table.add_column("Env", style="magenta")
table.add_row("1", "production")
console.print(table)

# Progress bar
with Progress() as progress:
    task = progress.add_task("Deploying...", total=100)
    for i in range(100):
        progress.update(task, advance=1)
```

### TypeScript (Chalk + Ora)

```typescript
import chalk from 'chalk';
import ora from 'ora';

// Colored text
console.log(chalk.green('Success!'));
console.log(chalk.red('Error!'));

// Spinner
const spinner = ora('Deploying...').start();
// ...logic
spinner.succeed('Deployment complete!');
```

---

## ✅ Pre-Commit Checklist

- [ ] `ruff check .` (Python linting)
- [ ] `mypy .` (Python type check)
- [ ] `pytest` (Python tests)
- [ ] `npm run lint` (TS linting)
- [ ] `npm run type-check` (TS type check)
- [ ] `npm run test` (TS tests)
- [ ] Help text (`--help`) à jour

---

**Version** : 1.0 | **Maintenu par** : Dev Team
