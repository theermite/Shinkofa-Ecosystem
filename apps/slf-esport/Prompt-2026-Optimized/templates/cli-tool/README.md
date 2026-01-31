# CLI Tool - Command Line Application Template

> Template production-ready pour outils en ligne de commande avec interfaces interactives.

**Stack Options** :
- 🐍 **Python** : Click/Typer + Rich + Questionary
- 📘 **TypeScript** : Commander + Inquirer + Chalk

**Version** : 2.0
**Setup time** : ~5 minutes
**Production-ready** : ✅
**Platforms** : Cross-platform (Windows, macOS, Linux)

---

## 🎯 Features

### CLI Framework

- ✅ Commands + subcommands
- ✅ Arguments + options parsing
- ✅ Interactive prompts
- ✅ Colored output
- ✅ Progress bars
- ✅ Spinners
- ✅ Tables
- ✅ Config file support (YAML/JSON)
- ✅ Environment variables
- ✅ Logging
- ✅ Error handling

### Developer Experience

- ✅ TypeScript / Python type hints
- ✅ Tests (Jest / pytest)
- ✅ Linting (ESLint / Ruff)
- ✅ Auto-completion (shell)
- ✅ Help generation
- ✅ Version management

### Distribution

- ✅ **Python** : PyPI package
- ✅ **TypeScript** : npm package
- ✅ **Binary** : pkg / PyInstaller (optional)

---

## 🚀 Quick Start

### Python Version

```bash
# Clone template
cp -r templates/cli-tool-python ~/my-cli
cd ~/my-cli

# Install (editable)
pip install -e .

# Run
my-cli --help
```

### TypeScript Version

```bash
# Clone template
cp -r templates/cli-tool-ts ~/my-cli
cd ~/my-cli

# Install
npm install

# Link globally
npm link

# Run
my-cli --help
```

---

## 📁 Project Structure

### Python Version

```
cli-tool-python/
├── .claude/                      # Claude Code configuration
├── src/
│   └── my_cli/
│       ├── __init__.py
│       ├── __main__.py           # Entry point
│       ├── cli.py                # CLI definition
│       ├── commands/             # Commands
│       │   ├── __init__.py
│       │   ├── init.py
│       │   ├── build.py
│       │   └── deploy.py
│       ├── core/                 # Core logic
│       │   ├── config.py
│       │   ├── logger.py
│       │   └── utils.py
│       └── ui/                   # UI components
│           ├── prompts.py
│           ├── spinner.py
│           └── table.py
├── tests/                        # Tests
├── docs/                         # Documentation
├── pyproject.toml                # Project config
├── setup.py                      # Setup script
└── README.md
```

### TypeScript Version

```
cli-tool-ts/
├── .claude/                      # Claude Code configuration
├── src/
│   ├── index.ts                  # Entry point
│   ├── cli.ts                    # CLI definition
│   ├── commands/                 # Commands
│   │   ├── init.ts
│   │   ├── build.ts
│   │   └── deploy.ts
│   ├── core/                     # Core logic
│   │   ├── config.ts
│   │   ├── logger.ts
│   │   └── utils.ts
│   └── ui/                       # UI components
│       ├── prompts.ts
│       ├── spinner.ts
│       └── table.ts
├── tests/                        # Tests
├── docs/                         # Documentation
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🐍 Python Implementation

### CLI Definition (Click)

```python
# src/my_cli/cli.py
import click
from rich.console import Console

console = Console()

@click.group()
@click.version_option()
@click.option('--verbose', '-v', is_flag=True, help='Verbose output')
@click.pass_context
def cli(ctx, verbose):
    """My CLI Tool - Description here"""
    ctx.ensure_object(dict)
    ctx.obj['verbose'] = verbose

@cli.command()
@click.option('--name', prompt='Project name', help='Name of the project')
@click.option('--template', type=click.Choice(['basic', 'full']), default='basic')
def init(name, template):
    """Initialize a new project"""
    console.print(f"[green]Initializing project: {name}[/green]")
    # Logic here

@cli.command()
@click.argument('files', nargs=-1, type=click.Path(exists=True))
@click.option('--output', '-o', help='Output directory')
def build(files, output):
    """Build project files"""
    from rich.progress import track

    for file in track(files, description="Building..."):
        # Process file
        pass

if __name__ == '__main__':
    cli()
```

### Interactive Prompts

```python
# src/my_cli/ui/prompts.py
from rich.prompt import Prompt, Confirm
from questionary import select, checkbox, password

def ask_project_config():
    """Interactive project configuration"""
    config = {}

    # Simple input
    config['name'] = Prompt.ask("Project name")

    # With validation
    config['port'] = Prompt.ask(
        "Port",
        default="8000",
        show_default=True
    )

    # Confirm
    config['git'] = Confirm.ask("Initialize git?", default=True)

    # Select
    config['template'] = select(
        "Choose template:",
        choices=['basic', 'advanced', 'custom']
    ).ask()

    # Multi-select
    config['features'] = checkbox(
        "Select features:",
        choices=['auth', 'api', 'database', 'docker']
    ).ask()

    # Password
    config['password'] = password("Enter password:").ask()

    return config
```

### Styled Output

```python
# src/my_cli/ui/output.py
from rich.console import Console
from rich.table import Table
from rich.panel import Panel
from rich.progress import Progress
from rich import print as rprint

console = Console()

def show_table(data):
    """Display data as table"""
    table = Table(title="Results")
    table.add_column("Name", style="cyan")
    table.add_column("Status", style="magenta")
    table.add_column("Value", justify="right", style="green")

    for row in data:
        table.add_row(row['name'], row['status'], str(row['value']))

    console.print(table)

def show_panel(title, content):
    """Display content in panel"""
    panel = Panel(content, title=title, border_style="blue")
    console.print(panel)

def show_progress(tasks):
    """Display progress bars"""
    with Progress() as progress:
        task = progress.add_task("[cyan]Processing...", total=len(tasks))

        for t in tasks:
            # Do work
            process_task(t)
            progress.update(task, advance=1)
```

### Config Management

```python
# src/my_cli/core/config.py
from pathlib import Path
import yaml
from typing import Dict, Any

CONFIG_FILE = Path.home() / '.my-cli' / 'config.yml'

def load_config() -> Dict[str, Any]:
    """Load configuration from file"""
    if not CONFIG_FILE.exists():
        return {}

    with open(CONFIG_FILE) as f:
        return yaml.safe_load(f) or {}

def save_config(config: Dict[str, Any]):
    """Save configuration to file"""
    CONFIG_FILE.parent.mkdir(parents=True, exist_ok=True)

    with open(CONFIG_FILE, 'w') as f:
        yaml.dump(config, f)

def get(key: str, default: Any = None) -> Any:
    """Get config value"""
    config = load_config()
    return config.get(key, default)

def set(key: str, value: Any):
    """Set config value"""
    config = load_config()
    config[key] = value
    save_config(config)
```

### Distribution (PyPI)

```toml
# pyproject.toml
[build-system]
requires = ["setuptools>=65.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-cli"
version = "1.0.0"
description = "My CLI Tool"
authors = [{name = "Your Name", email = "you@example.com"}]
readme = "README.md"
requires-python = ">=3.11"
dependencies = [
    "click>=8.1.0",
    "rich>=13.0.0",
    "questionary>=2.0.0",
    "pyyaml>=6.0",
]

[project.scripts]
my-cli = "my_cli.cli:cli"

[project.optional-dependencies]
dev = [
    "pytest>=7.0.0",
    "pytest-cov>=4.0.0",
    "ruff>=0.1.0",
    "mypy>=1.0.0",
]
```

```bash
# Install from PyPI
pip install my-cli

# Develop locally
pip install -e ".[dev]"

# Publish
python -m build
twine upload dist/*
```

---

## 📘 TypeScript Implementation

### CLI Definition (Commander)

```typescript
// src/cli.ts
import { Command } from 'commander'
import chalk from 'chalk'
import { version } from '../package.json'

const program = new Command()

program
  .name('my-cli')
  .description('My CLI Tool - Description here')
  .version(version)

program
  .command('init')
  .description('Initialize a new project')
  .option('-n, --name <name>', 'Project name')
  .option('-t, --template <template>', 'Template type', 'basic')
  .action(async (options) => {
    console.log(chalk.green(`Initializing project: ${options.name}`))
    // Logic here
  })

program
  .command('build')
  .description('Build project files')
  .argument('[files...]', 'Files to build')
  .option('-o, --output <dir>', 'Output directory')
  .action(async (files, options) => {
    console.log(chalk.blue('Building...'))
    // Logic here
  })

program.parse()
```

### Interactive Prompts

```typescript
// src/ui/prompts.ts
import inquirer from 'inquirer'
import { input, select, checkbox, confirm, password } from '@inquirer/prompts'

export async function askProjectConfig() {
  const config = {
    // Simple input
    name: await input({
      message: 'Project name:',
    }),

    // With validation
    port: await input({
      message: 'Port:',
      default: '8000',
      validate: (value) => {
        const port = parseInt(value)
        return port > 0 && port < 65536 || 'Invalid port'
      },
    }),

    // Confirm
    git: await confirm({
      message: 'Initialize git?',
      default: true,
    }),

    // Select
    template: await select({
      message: 'Choose template:',
      choices: [
        { value: 'basic', name: 'Basic' },
        { value: 'advanced', name: 'Advanced' },
        { value: 'custom', name: 'Custom' },
      ],
    }),

    // Multi-select
    features: await checkbox({
      message: 'Select features:',
      choices: [
        { value: 'auth', name: 'Authentication' },
        { value: 'api', name: 'API' },
        { value: 'database', name: 'Database' },
        { value: 'docker', name: 'Docker' },
      ],
    }),

    // Password
    password: await password({ message: 'Enter password:' }),
  }

  return config
}
```

### Styled Output

```typescript
// src/ui/output.ts
import chalk from 'chalk'
import ora from 'ora'
import Table from 'cli-table3'
import boxen from 'boxen'

export function showTable(data: any[]) {
  const table = new Table({
    head: [
      chalk.cyan('Name'),
      chalk.magenta('Status'),
      chalk.green('Value'),
    ],
    colWidths: [20, 15, 15],
  })

  data.forEach((row) => {
    table.push([row.name, row.status, row.value])
  })

  console.log(table.toString())
}

export function showPanel(title: string, content: string) {
  console.log(
    boxen(content, {
      title,
      padding: 1,
      borderColor: 'blue',
      borderStyle: 'round',
    })
  )
}

export async function showProgress(tasks: any[]) {
  const spinner = ora('Processing...').start()

  for (const task of tasks) {
    spinner.text = `Processing ${task.name}`
    await processTask(task)
  }

  spinner.succeed('Done!')
}

export function success(message: string) {
  console.log(chalk.green('✓'), message)
}

export function error(message: string) {
  console.log(chalk.red('✗'), message)
}

export function warning(message: string) {
  console.log(chalk.yellow('⚠'), message)
}

export function info(message: string) {
  console.log(chalk.blue('ℹ'), message)
}
```

### Config Management

```typescript
// src/core/config.ts
import fs from 'fs'
import path from 'path'
import os from 'os'
import yaml from 'js-yaml'

const CONFIG_FILE = path.join(os.homedir(), '.my-cli', 'config.yml')

export function loadConfig(): Record<string, any> {
  if (!fs.existsSync(CONFIG_FILE)) {
    return {}
  }

  const content = fs.readFileSync(CONFIG_FILE, 'utf8')
  return yaml.load(content) as Record<string, any>
}

export function saveConfig(config: Record<string, any>) {
  const dir = path.dirname(CONFIG_FILE)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const content = yaml.dump(config)
  fs.writeFileSync(CONFIG_FILE, content, 'utf8')
}

export function get(key: string, defaultValue?: any): any {
  const config = loadConfig()
  return config[key] ?? defaultValue
}

export function set(key: string, value: any) {
  const config = loadConfig()
  config[key] = value
  saveConfig(config)
}
```

### Distribution (npm)

```json
// package.json
{
  "name": "my-cli",
  "version": "1.0.0",
  "description": "My CLI Tool",
  "main": "dist/index.js",
  "bin": {
    "my-cli": "dist/index.js"
  },
  "scripts": {
    "build": "tsc",
    "dev": "tsx src/index.ts",
    "test": "jest",
    "prepublishOnly": "npm run build"
  },
  "keywords": ["cli", "tool"],
  "author": "Your Name",
  "license": "MIT",
  "dependencies": {
    "commander": "^11.0.0",
    "chalk": "^5.3.0",
    "@inquirer/prompts": "^3.0.0",
    "ora": "^7.0.0",
    "cli-table3": "^0.6.3",
    "boxen": "^7.1.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tsx": "^4.0.0",
    "jest": "^29.0.0",
    "@types/node": "^20.0.0"
  }
}
```

```bash
# Install from npm
npm install -g my-cli

# Develop locally
npm link

# Publish
npm publish
```

---

## 🧪 Testing

### Python

```python
# tests/test_cli.py
from click.testing import CliRunner
from my_cli.cli import cli

def test_init_command():
    runner = CliRunner()
    result = runner.invoke(cli, ['init', '--name', 'test-project'])

    assert result.exit_code == 0
    assert 'Initializing project: test-project' in result.output
```

### TypeScript

```typescript
// tests/cli.test.ts
import { execSync } from 'child_process'

test('init command', () => {
  const output = execSync('my-cli init --name test-project', {
    encoding: 'utf-8',
  })

  expect(output).toContain('Initializing project: test-project')
})
```

---

## 🎨 Examples

### Full Example Command

```python
# Python
@cli.command()
@click.option('--force', is_flag=True, help='Force operation')
@click.pass_context
def deploy(ctx, force):
    """Deploy application"""
    from rich.console import Console
    from rich.progress import Progress

    console = Console()

    # Confirm
    if not force:
        from rich.prompt import Confirm
        if not Confirm.ask("Deploy to production?"):
            console.print("[yellow]Aborted[/yellow]")
            return

    # Progress
    with Progress() as progress:
        task1 = progress.add_task("[cyan]Building...", total=100)
        # Build
        progress.update(task1, advance=100)

        task2 = progress.add_task("[green]Deploying...", total=100)
        # Deploy
        progress.update(task2, advance=100)

    console.print("[green]✓ Deployed successfully![/green]")
```

```typescript
// TypeScript
program
  .command('deploy')
  .option('-f, --force', 'Force operation')
  .action(async (options) => {
    const ora = require('ora')
    const chalk = require('chalk')

    // Confirm
    if (!options.force) {
      const { confirm } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirm',
          message: 'Deploy to production?',
          default: false,
        },
      ])

      if (!confirm) {
        console.log(chalk.yellow('Aborted'))
        return
      }
    }

    // Build
    let spinner = ora('Building...').start()
    await build()
    spinner.succeed('Built')

    // Deploy
    spinner = ora('Deploying...').start()
    await deploy()
    spinner.succeed('Deployed successfully!')
  })
```

---

## 📖 Learn More

### Python

- [Click Documentation](https://click.palletsprojects.com/)
- [Rich Documentation](https://rich.readthedocs.io/)
- [Questionary](https://github.com/tmbo/questionary)

### TypeScript

- [Commander.js](https://github.com/tj/commander.js)
- [Inquirer](https://github.com/SBoudrias/Inquirer.js)
- [Chalk](https://github.com/chalk/chalk)
- [Ora](https://github.com/sindresorhus/ora)

---

**Created by** : Jay The Ermite
**Template Version** : 2.0
**Last Updated** : 2026-01-26
