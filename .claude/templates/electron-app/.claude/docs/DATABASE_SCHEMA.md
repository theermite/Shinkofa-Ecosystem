# Database Schema - [Nom Electron App]

> Schéma SQLite local (embedded database).

**Database** : SQLite 3
**Library** : better-sqlite3 (Node.js native bindings)
**Location** : `%APPDATA%\YourApp\database.db` (Windows) ou `~/.config/YourApp/database.db` (Linux)

---

## 📊 Tables

### users
Table utilisateurs exemple.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | ID unique |
| `name` | TEXT | NOT NULL | Nom complet |
| `email` | TEXT | UNIQUE, NOT NULL | Email unique |
| `avatar` | TEXT | | Path avatar local |
| `created_at` | INTEGER | DEFAULT (strftime('%s', 'now')) | Timestamp création |
| `updated_at` | INTEGER | DEFAULT (strftime('%s', 'now')) | Dernière MAJ |

**Indexes** :
```sql
CREATE INDEX idx_users_email ON users(email);
```

---

### settings
Configuration application (key-value store).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `key` | TEXT | PRIMARY KEY | Setting key |
| `value` | TEXT | NOT NULL | Setting value (JSON si complexe) |
| `updated_at` | INTEGER | DEFAULT (strftime('%s', 'now')) | Dernière MAJ |

**Exemples** :
```sql
INSERT INTO settings (key, value) VALUES ('theme', 'dark');
INSERT INTO settings (key, value) VALUES ('language', 'en');
```

---

### [Autres Tables]

Documenter tables spécifiques à votre application.

---

## 🔧 Migrations

### Structure

```
src/main/db/
├── sqlite.ts           # DB connection
└── migrations/
    ├── 001_initial.sql
    ├── 002_add_users.sql
    └── 003_add_settings.sql
```

---

### Migration Runner

```typescript
// src/main/db/sqlite.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'database.db');
export const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Migrations
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

function getCurrentVersion(): number {
  try {
    const row = db.prepare('SELECT version FROM schema_version').get() as { version: number };
    return row.version;
  } catch {
    return 0;
  }
}

function setVersion(version: number) {
  db.prepare('CREATE TABLE IF NOT EXISTS schema_version (version INTEGER)').run();
  db.prepare('DELETE FROM schema_version').run();
  db.prepare('INSERT INTO schema_version (version) VALUES (?)').run(version);
}

export function runMigrations() {
  const currentVersion = getCurrentVersion();
  const migrations = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of migrations) {
    const version = parseInt(file.split('_')[0]);
    if (version > currentVersion) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
      db.exec(sql);
      setVersion(version);
      console.log(`Applied migration: ${file}`);
    }
  }
}
```

---

### Exemple Migration

**001_initial.sql** :
```sql
-- Migration 001: Initial schema

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    avatar TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Default settings
INSERT INTO settings (key, value) VALUES ('theme', 'light');
INSERT INTO settings (key, value) VALUES ('language', 'en');
```

---

## 📝 Conventions

- **Tables** : snake_case, pluriel (`users`, `settings`)
- **Colonnes** : snake_case (`created_at`, `user_id`)
- **Primary keys** : `id` INTEGER AUTOINCREMENT
- **Timestamps** : INTEGER (Unix timestamp seconds)
- **Foreign keys** : `[table_singular]_id` (ex: `user_id`)

---

## 🔒 Sécurité

- ✅ Database file permissions (read/write owner only)
- ✅ Input validation (SQL injection prevention via prepared statements)
- ✅ Foreign keys enabled (`PRAGMA foreign_keys = ON`)

---

## 🛠️ CRUD Operations

### Read

```typescript
export function getUsers() {
  return db.prepare('SELECT * FROM users ORDER BY created_at DESC').all();
}

export function getUserById(id: number) {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id);
}
```

---

### Create

```typescript
export function createUser(data: { name: string; email: string }) {
  const result = db
    .prepare('INSERT INTO users (name, email) VALUES (?, ?)')
    .run(data.name, data.email);

  return { id: result.lastInsertRowid };
}
```

---

### Update

```typescript
export function updateUser(id: number, data: Partial<{ name: string; email: string }>) {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), id];

  db.prepare(`UPDATE users SET ${fields}, updated_at = strftime('%s', 'now') WHERE id = ?`).run(...values);
}
```

---

### Delete

```typescript
export function deleteUser(id: number) {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}
```

---

**Maintenu par** : Backend Team
