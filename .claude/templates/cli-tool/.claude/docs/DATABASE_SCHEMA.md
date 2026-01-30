# Database Schema - [Nom CLI Tool]

> Schéma database si le CLI tool gère une DB locale.

**Note** : Ce fichier est pertinent si votre CLI tool utilise une base de données locale (SQLite, embedded DB, etc.) pour stocker configuration, cache, ou historique.

**Si votre CLI tool n'utilise PAS de database** : Supprimer ce fichier ou documenter fichiers config/cache à la place.

---

## 📊 Database Type

**Type** : SQLite (embedded, pas de serveur requis)
**Location** : `~/.mycli/data.db` (Linux/macOS) ou `%USERPROFILE%\.mycli\data.db` (Windows)

**Raison** : SQLite = zero-config, file-based, parfait pour CLI tools.

---

## 🗂️ Tables

### `config`
Stockage configuration (alternative à config.yaml).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | TEXT | PRIMARY KEY | Config key |
| `value` | TEXT | NOT NULL | Config value (JSON si complexe) |
| `updated_at` | INTEGER | NOT NULL | Timestamp dernière mise à jour |

**Exemples** :
```sql
INSERT INTO config (key, value, updated_at)
VALUES ('api_url', 'https://api.example.com', 1706442000);
```

---

### `deployment_history`
Historique des déploiements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unique |
| `environment` | TEXT | NOT NULL | dev/staging/production |
| `branch` | TEXT | | Git branch déployé |
| `tag` | TEXT | | Git tag déployé |
| `status` | TEXT | NOT NULL | success/failed |
| `duration_seconds` | INTEGER | | Durée déploiement |
| `error_message` | TEXT | | Message erreur si failed |
| `deployed_at` | INTEGER | NOT NULL | Timestamp déploiement |

**Exemples** :
```sql
INSERT INTO deployment_history (environment, branch, status, duration_seconds, deployed_at)
VALUES ('production', 'main', 'success', 120, 1706442000);
```

---

### `cache`
Cache responses API (optionnel, performance).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | TEXT | PRIMARY KEY | Cache key (ex: URL hash) |
| `value` | TEXT | NOT NULL | Cached data (JSON) |
| `expires_at` | INTEGER | NOT NULL | Expiration timestamp |

---

## 🔧 Migrations

### Python (sqlite3 + migration scripts)

**Structure** :
```
mycli/
└── migrations/
    ├── 001_initial.sql
    ├── 002_add_deployment_history.sql
    └── 003_add_cache_table.sql
```

**Exemple migration** (`001_initial.sql`) :
```sql
-- Migration: 001_initial
-- Description: Create config table

CREATE TABLE IF NOT EXISTS config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS schema_version (
    version INTEGER PRIMARY KEY
);

INSERT INTO schema_version (version) VALUES (1);
```

**Migration runner** :
```python
# mycli/core/db.py
import sqlite3
from pathlib import Path

DB_PATH = Path.home() / '.mycli' / 'data.db'
MIGRATIONS_DIR = Path(__file__).parent.parent / 'migrations'

def get_current_version(conn):
    cursor = conn.execute("SELECT version FROM schema_version")
    return cursor.fetchone()[0]

def migrate():
    conn = sqlite3.connect(DB_PATH)

    # Get current version
    try:
        current = get_current_version(conn)
    except sqlite3.OperationalError:
        current = 0

    # Apply pending migrations
    migrations = sorted(MIGRATIONS_DIR.glob('*.sql'))
    for migration_file in migrations:
        version = int(migration_file.stem.split('_')[0])
        if version > current:
            with open(migration_file) as f:
                conn.executescript(f.read())
            print(f"Applied migration: {migration_file.name}")

    conn.commit()
    conn.close()
```

---

## 📝 Alternative : Config Files Only

**Si pas de DB** : Documenter structure fichiers :

```
~/.mycli/
├── config.yaml          # Configuration
├── cache/               # Cache API responses
│   └── api_response_123.json
└── history.json         # Deployment history
```

---

**Maintenu par** : Dev Team
