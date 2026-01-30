# Database Schema - [Nom Projet]

> Schéma PostgreSQL complet avec relations.

**Database** : PostgreSQL 15+
**ORM** : SQLAlchemy 2.x (async)
**Migrations** : Alembic

---

## 📊 Tables

### users
Table principale utilisateurs.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-increment |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email unique |
| `hashed_password` | VARCHAR(255) | NOT NULL | Bcrypt hash |
| `name` | VARCHAR(255) | NOT NULL | Nom complet |
| `role` | VARCHAR(50) | NOT NULL, DEFAULT 'user' | admin/user/guest |
| `is_active` | BOOLEAN | DEFAULT TRUE | Compte actif |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Email vérifié |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière MAJ |

**Indexes** :
- `idx_users_email` (email) - Lookup rapide
- `idx_users_role` (role) - Filtrage par rôle

---

### refresh_tokens
Tokens JWT refresh pour auth.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-increment |
| `user_id` | INTEGER | FK → users.id | User owner |
| `token` | VARCHAR(255) | UNIQUE, NOT NULL | Token hash |
| `expires_at` | TIMESTAMP | NOT NULL | Expiration |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date création |

**Indexes** :
- `idx_refresh_tokens_token` (token) - Validation token
- `idx_refresh_tokens_user_id` (user_id) - Tokens par user

**Foreign Keys** :
- `user_id` → `users.id` ON DELETE CASCADE

---

### [Autres Tables]

### [resource_name]
Description table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | INTEGER | PRIMARY KEY | Auto-increment |
| `user_id` | INTEGER | FK → users.id | Owner |
| `title` | VARCHAR(255) | NOT NULL | Titre |
| `content` | TEXT | | Contenu |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Date création |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Dernière MAJ |

**Relations** :
- `user_id` → `users.id` (many-to-one)

---

## 🔗 Relations

```
users (1) ──────< refresh_tokens (N)
  │
  └──────< [resource_name] (N)
```

---

## 🚀 Migrations

**Créer migration** :
```bash
# Auto-generate depuis models SQLAlchemy
alembic revision --autogenerate -m "Description"

# Review migration dans alembic/versions/
# Apply migration
alembic upgrade head
```

**Rollback** :
```bash
alembic downgrade -1  # Previous version
alembic downgrade base  # Tout rollback
```

**Current version** :
```bash
alembic current
```

---

## 📝 Conventions

- **Noms tables** : snake_case, pluriel (`users`, `refresh_tokens`)
- **Noms colonnes** : snake_case (`created_at`, `user_id`)
- **Primary keys** : `id` INTEGER auto-increment
- **Foreign keys** : `[table_singulier]_id` (ex: `user_id`)
- **Timestamps** : `created_at`, `updated_at` sur toutes tables
- **Soft deletes** : `deleted_at` TIMESTAMP NULL (si applicable)

---

## 🔒 Sécurité

- ✅ Passwords **JAMAIS** en clair (bcrypt hash)
- ✅ Tokens refresh hashed
- ✅ CASCADE deletes sur foreign keys critiques
- ✅ Constraints UNIQUE sur emails, tokens

---

**Maintenu par** : Backend Team
**Revue recommandée** : À chaque migration
