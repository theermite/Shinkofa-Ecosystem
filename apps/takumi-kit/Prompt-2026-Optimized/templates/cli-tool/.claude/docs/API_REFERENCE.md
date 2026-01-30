# API Reference - [Nom CLI Tool]

> Documentation complète des commandes CLI.

**Version** : [VERSION]
**Installation** : `pip install mycli` (Python) ou `npm install -g mycli` (TypeScript)

---

## 🚀 Commandes Disponibles

```bash
mycli --help    # Afficher aide globale
mycli <command> --help    # Aide commande spécifique
```

---

## 📦 Commandes Globales

### `--version`
Afficher version du CLI.

```bash
mycli --version
# Output: mycli version 1.0.0
```

---

### `--verbose` / `-v`
Mode verbose (logs détaillés).

```bash
mycli deploy --env production --verbose
```

---

### `--help` / `-h`
Afficher aide.

```bash
mycli --help
```

---

## 🛠️ Commandes Principales

### `mycli init`
Initialiser configuration CLI.

**Usage** :
```bash
mycli init [OPTIONS]
```

**Options** :
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `--api-url` | string | - | API base URL |
| `--api-key` | string | - | API authentication key |
| `--config-path` | path | `~/.mycli/config.yaml` | Config file location |
| `--force` | flag | false | Overwrite existing config |

**Exemples** :
```bash
# Interactive prompt
mycli init

# Non-interactive
mycli init --api-url https://api.example.com --api-key abc123

# Custom config path
mycli init --config-path ./config.yaml

# Force overwrite
mycli init --force
```

**Output** :
```
✔ Configuration saved to ~/.mycli/config.yaml
```

---

### `mycli deploy`
Déployer application.

**Usage** :
```bash
mycli deploy --env <environment> [OPTIONS]
```

**Options** :
| Option | Type | Required | Description |
|--------|------|----------|-------------|
| `--env` | choice | ✅ | Environment: `dev`, `staging`, `production` |
| `--branch` | string | - | Git branch to deploy (default: current) |
| `--tag` | string | - | Git tag to deploy |
| `--dry-run` | flag | - | Simulate deployment (no changes) |
| `--skip-tests` | flag | - | Skip test execution |
| `--verbose` | flag | - | Detailed logs |

**Exemples** :
```bash
# Deploy to staging
mycli deploy --env staging

# Deploy specific branch to production
mycli deploy --env production --branch release/v1.2

# Dry run
mycli deploy --env production --dry-run

# Skip tests (NOT recommended)
mycli deploy --env dev --skip-tests
```

**Output** :
```
🚀 Deploying to production...
  ✔ Running tests... (120s)
  ✔ Building application... (45s)
  ✔ Pushing to registry... (30s)
  ✔ Updating service... (15s)

✅ Deployment successful!

URL: https://app.example.com
Version: v1.2.3
Deployed at: 2026-01-28 10:30:00
```

---

### `mycli db`
Gestion base de données (groupe de commandes).

#### `mycli db migrate`
Exécuter migrations DB.

**Usage** :
```bash
mycli db migrate [OPTIONS]
```

**Options** :
| Option | Type | Description |
|--------|------|-------------|
| `--to` | string | Target migration version (default: latest) |
| `--rollback` | flag | Rollback previous migration |
| `--list` | flag | List available migrations |

**Exemples** :
```bash
# Migrate to latest
mycli db migrate

# Migrate to specific version
mycli db migrate --to 003_add_users_table

# Rollback last migration
mycli db migrate --rollback

# List migrations
mycli db migrate --list
```

**Output** :
```
📊 Running migrations...
  ✔ 001_initial.sql
  ✔ 002_add_posts.sql
  ✔ 003_add_users_table.sql

✅ Database migrated to version 003
```

---

#### `mycli db seed`
Seed database avec données de test.

**Usage** :
```bash
mycli db seed [OPTIONS]
```

**Options** :
| Option | Type | Description |
|--------|------|-------------|
| `--env` | choice | Environment: `dev`, `staging` (NOT prod) |
| `--truncate` | flag | Truncate tables before seeding |

**Exemples** :
```bash
# Seed dev database
mycli db seed --env dev

# Truncate + seed
mycli db seed --env dev --truncate
```

---

#### `mycli db backup`
Backup database.

**Usage** :
```bash
mycli db backup [OPTIONS]
```

**Options** :
| Option | Type | Description |
|--------|------|-------------|
| `--output` | path | Output file path (default: `backup_YYYYMMDD_HHMMSS.sql`) |
| `--compress` | flag | Compress backup (gzip) |

**Exemples** :
```bash
# Backup to default location
mycli db backup

# Custom output path
mycli db backup --output ~/backups/db.sql

# Compressed backup
mycli db backup --compress
```

---

### `mycli config`
Gérer configuration CLI.

#### `mycli config show`
Afficher configuration actuelle.

```bash
mycli config show

# Output:
# api_url: https://api.example.com
# api_key: abc*** (hidden)
# log_level: INFO
```

---

#### `mycli config set`
Modifier valeur configuration.

**Usage** :
```bash
mycli config set <key> <value>
```

**Exemples** :
```bash
mycli config set api_url https://new-api.example.com
mycli config set log_level DEBUG
```

---

#### `mycli config get`
Récupérer valeur configuration.

**Usage** :
```bash
mycli config get <key>
```

**Exemples** :
```bash
mycli config get api_url
# Output: https://api.example.com
```

---

### `mycli logs`
Afficher logs application.

**Usage** :
```bash
mycli logs [OPTIONS]
```

**Options** :
| Option | Type | Description |
|--------|------|-------------|
| `--env` | choice | Environment |
| `--tail` | int | Number of lines (default: 100) |
| `--follow` / `-f` | flag | Follow logs (realtime) |
| `--level` | choice | Filter by level: `INFO`, `WARNING`, `ERROR` |

**Exemples** :
```bash
# Last 100 lines
mycli logs --env production

# Follow logs (realtime)
mycli logs --env production --follow

# Last 500 lines, errors only
mycli logs --env production --tail 500 --level ERROR
```

---

## 🚨 Exit Codes

| Code | Signification |
|------|---------------|
| 0 | Success |
| 1 | General error |
| 2 | Invalid arguments |
| 3 | Configuration error |
| 4 | API error |
| 5 | Deployment failed |

**Usage dans scripts** :
```bash
#!/bin/bash

mycli deploy --env production
if [ $? -ne 0 ]; then
  echo "Deployment failed!"
  exit 1
fi
```

---

## 🔧 Configuration File

### Location
- **Linux/macOS** : `~/.mycli/config.yaml`
- **Windows** : `%USERPROFILE%\.mycli\config.yaml`

### Format

```yaml
# Required
api_url: https://api.example.com
api_key: your_api_key_here

# Optional
log_level: INFO  # DEBUG, INFO, WARNING, ERROR
timeout: 30      # API request timeout (seconds)

# Environment-specific (optionnel)
environments:
  dev:
    api_url: http://localhost:8000
    log_level: DEBUG
  staging:
    api_url: https://staging-api.example.com
  production:
    api_url: https://api.example.com
    log_level: WARNING
```

---

## 🔐 Authentication

### API Key

**Option 1** : Config file (recommandé)
```yaml
# ~/.mycli/config.yaml
api_key: your_api_key_here
```

**Option 2** : Environment variable
```bash
export MYCLI_API_KEY=your_api_key_here
mycli deploy --env production
```

**Option 3** : Command-line argument (⚠️ NOT recommended, visible in history)
```bash
mycli deploy --env production --api-key your_api_key_here
```

**Priorité** : CLI arg > Env var > Config file

---

## 📊 Output Formats

### Table Output

```bash
mycli list --format table

# Output:
# ┌────┬──────────┬────────────┬───────────┐
# │ ID │ Name     │ Status     │ Created   │
# ├────┼──────────┼────────────┼───────────┤
# │ 1  │ Project1 │ active     │ 2026-01-20│
# │ 2  │ Project2 │ archived   │ 2026-01-15│
# └────┴──────────┴────────────┴───────────┘
```

### JSON Output

```bash
mycli list --format json

# Output:
# [
#   {"id": 1, "name": "Project1", "status": "active", "created": "2026-01-20"},
#   {"id": 2, "name": "Project2", "status": "archived", "created": "2026-01-15"}
# ]
```

---

## 🐛 Debug Mode

```bash
# Enable debug logs
mycli --verbose deploy --env production

# Or set log level in config
mycli config set log_level DEBUG
```

---

**Version** : 1.0 | **Maintenu par** : Dev Team
