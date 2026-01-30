# Testing Guide - [Nom CLI Tool]

> Stratégie tests pour CLI tools (Python pytest / TypeScript Vitest).

---

## 🎯 Stratégie Tests

### Types Tests CLI

```
      /\
     /E2E\       (20%) - Tests end-to-end (CLI invocation)
    /------\
   /Integ. \     (30%) - Tests commandes (with mocks)
  /----------\
 /   Unit     \  (50%) - Tests utils + logic isolée
/--------------\
```

**Objectif Coverage** : 70% minimum (CLI tools moins critique que libs)

---

## 🐍 Python (pytest + Click Testing)

### Setup

**Installation** :
```bash
pip install pytest pytest-cov click
```

**Config** (`pytest.ini`) :
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
```

---

### Tests Commands (Click CliRunner)

```python
# tests/test_commands.py
from click.testing import CliRunner
from mycli.cli import cli

def test_deploy_command_with_valid_env_succeeds():
    """Test deploy command with valid environment."""
    runner = CliRunner()
    result = runner.invoke(cli, ['deploy', '--env', 'dev', '--dry-run'])

    assert result.exit_code == 0
    assert 'DRY RUN mode' in result.output


def test_deploy_command_without_env_fails():
    """Test deploy command fails without --env."""
    runner = CliRunner()
    result = runner.invoke(cli, ['deploy'])

    assert result.exit_code != 0
    assert 'Missing option' in result.output


def test_init_command_creates_config_file(tmp_path):
    """Test init command creates config file."""
    runner = CliRunner()
    config_path = tmp_path / 'config.yaml'

    result = runner.invoke(cli, ['init', '--config-path', str(config_path), '--api-url', 'https://api.example.com'])

    assert result.exit_code == 0
    assert config_path.exists()
```

---

### Tests Utils

```python
# tests/test_utils.py
from mycli.core.utils import validate_url, parse_version

def test_validate_url_with_valid_url_returns_true():
    """Test URL validation with valid URL."""
    assert validate_url('https://example.com') is True


def test_validate_url_with_invalid_url_returns_false():
    """Test URL validation with invalid URL."""
    assert validate_url('not-a-url') is False


def test_parse_version_with_valid_version_returns_tuple():
    """Test version parsing."""
    assert parse_version('1.2.3') == (1, 2, 3)
```

---

### Mocking API Calls

```python
# tests/test_deploy.py
from unittest.mock import patch, MagicMock
from mycli.commands.deploy import _run_deployment

@patch('mycli.commands.deploy.requests.post')
def test_run_deployment_calls_api(mock_post):
    """Test deployment calls API correctly."""
    mock_post.return_value = MagicMock(status_code=200, json=lambda: {'success': True})

    result = _run_deployment('production')

    assert result is True
    mock_post.assert_called_once()
```

---

## 🎯 TypeScript (Vitest)

### Setup

**Installation** :
```bash
npm install -D vitest @types/node
```

**Config** (`vitest.config.ts`) :
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
  },
});
```

---

### Tests Commands

```typescript
// tests/commands.test.ts
import { describe, it, expect, vi } from 'vitest';
import { execSync } from 'child_process';

describe('deploy command', () => {
  it('should succeed with valid environment', () => {
    const output = execSync('node dist/index.js deploy --env dev --dry-run', {
      encoding: 'utf-8',
    });

    expect(output).toContain('DRY RUN mode');
  });

  it('should fail without --env', () => {
    expect(() => {
      execSync('node dist/index.js deploy', { encoding: 'utf-8' });
    }).toThrow();
  });
});
```

---

### Tests Utils

```typescript
// tests/utils.test.ts
import { describe, it, expect } from 'vitest';
import { validateUrl, parseVersion } from '../src/core/utils';

describe('validateUrl', () => {
  it('should return true for valid URL', () => {
    expect(validateUrl('https://example.com')).toBe(true);
  });

  it('should return false for invalid URL', () => {
    expect(validateUrl('not-a-url')).toBe(false);
  });
});

describe('parseVersion', () => {
  it('should parse semantic version', () => {
    expect(parseVersion('1.2.3')).toEqual([1, 2, 3]);
  });
});
```

---

### Mocking API Calls

```typescript
// tests/deploy.test.ts
import { describe, it, expect, vi } from 'vitest';
import { runDeployment } from '../src/commands/deploy';

vi.mock('axios');

describe('runDeployment', () => {
  it('should call API correctly', async () => {
    const axios = await import('axios');
    const mockPost = vi.mocked(axios.default.post);
    mockPost.mockResolvedValue({ data: { success: true } });

    const result = await runDeployment('production');

    expect(result).toBe(true);
    expect(mockPost).toHaveBeenCalledOnce();
  });
});
```

---

## 🎭 E2E Tests (Integration)

### Python (subprocess)

```python
# tests/test_e2e.py
import subprocess
import pytest

def test_cli_help_displays_commands():
    """Test CLI --help displays available commands."""
    result = subprocess.run(['mycli', '--help'], capture_output=True, text=True)

    assert result.returncode == 0
    assert 'deploy' in result.stdout
    assert 'init' in result.stdout


def test_full_deployment_workflow(tmp_path):
    """Test full deployment workflow (init → deploy)."""
    config_path = tmp_path / 'config.yaml'

    # Init
    result_init = subprocess.run([
        'mycli', 'init',
        '--config-path', str(config_path),
        '--api-url', 'https://api.example.com'
    ], capture_output=True, text=True)
    assert result_init.returncode == 0

    # Deploy (dry-run)
    result_deploy = subprocess.run([
        'mycli', 'deploy',
        '--env', 'dev',
        '--dry-run'
    ], capture_output=True, text=True)
    assert result_deploy.returncode == 0
    assert 'DRY RUN' in result_deploy.stdout
```

---

### TypeScript (execSync)

```typescript
// tests/e2e.test.ts
import { describe, it, expect } from 'vitest';
import { execSync } from 'child_process';

describe('E2E: CLI', () => {
  it('should display help', () => {
    const output = execSync('node dist/index.js --help', { encoding: 'utf-8' });

    expect(output).toContain('deploy');
    expect(output).toContain('init');
  });

  it('should complete init → deploy workflow', () => {
    // Init
    execSync('node dist/index.js init --api-url https://api.example.com --force');

    // Deploy
    const output = execSync('node dist/index.js deploy --env dev --dry-run', {
      encoding: 'utf-8',
    });

    expect(output).toContain('DRY RUN');
  });
});
```

---

## 🧪 Best Practices

### Fixtures (Python)

```python
# tests/conftest.py
import pytest
from pathlib import Path

@pytest.fixture
def temp_config(tmp_path):
    """Temporary config file."""
    config_path = tmp_path / 'config.yaml'
    config_path.write_text("""
    api_url: https://api.example.com
    api_key: test_key
    """)
    return config_path


@pytest.fixture
def cli_runner():
    """Click CLI runner."""
    from click.testing import CliRunner
    return CliRunner()
```

---

### Test Isolation

- Chaque test indépendant
- Utiliser `tmp_path` (pytest) pour fichiers temporaires
- Mock API calls (pas de requêtes réelles)

---

### Nommage Tests

**Format** : `test_<command>_<action>_<expected>`

```python
test_deploy_command_with_valid_env_succeeds()
test_init_command_creates_config_file()
test_config_get_nonexistent_key_returns_error()
```

---

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test-python:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
        with:
          python-version: '3.11'

      - run: pip install -e .[dev]
      - run: pytest --cov=mycli --cov-report=xml

      - uses: codecov/codecov-action@v3

  test-typescript:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - run: npm ci
      - run: npm run test:coverage

      - uses: codecov/codecov-action@v3
```

---

**Version** : 1.0 | **Maintenu par** : QA Team
