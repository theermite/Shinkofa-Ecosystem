# Database Schema - [Nom Projet]

> Schéma complet de la base de données avec tables, relations, indexes.

**SGBD** : [PostgreSQL / MySQL / MongoDB]
**Version** : [version]
**Dernière mise à jour** : [DATE]

---

## 🗄️ Vue d'Ensemble

### Statistiques

| Métrique | Valeur |
|----------|--------|
| **Tables** | [nombre] |
| **Relations** | [nombre] |
| **Indexes** | [nombre] |
| **Triggers** | [nombre] |
| **Taille estimée** | [taille] |

### Diagramme ER (Entity-Relationship)

```
┌─────────────┐       ┌─────────────┐
│    users    │──────<│   posts     │
│             │  1:N  │             │
└─────────────┘       └─────────────┘
       │                     │
       │ 1:N                 │ N:M
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│  profiles   │       │    tags     │
└─────────────┘       └─────────────┘
```

---

## 📊 Tables

### `users`

Table centrale stockant les utilisateurs.

**Colonnes** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email utilisateur |
| `password_hash` | VARCHAR(255) | NOT NULL | Hash bcrypt password |
| `name` | VARCHAR(255) | NOT NULL | Nom complet |
| `role` | ENUM('admin', 'user', 'guest') | NOT NULL, DEFAULT 'user' | Rôle utilisateur |
| `is_active` | BOOLEAN | NOT NULL, DEFAULT true | Compte actif |
| `email_verified` | BOOLEAN | NOT NULL, DEFAULT false | Email vérifié |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date création |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date dernière MAJ |

**Indexes** :
- PRIMARY KEY (`id`)
- UNIQUE INDEX (`email`)
- INDEX (`role`)
- INDEX (`created_at`)

**SQL** :
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'user',
  is_active BOOLEAN NOT NULL DEFAULT true,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_created_at ON users(created_at);
```

---

### `profiles`

Informations complémentaires utilisateur (relation 1:1 avec `users`).

**Colonnes** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | UNIQUE, NOT NULL, FK | Référence users.id |
| `bio` | TEXT | NULL | Biographie |
| `avatar_url` | VARCHAR(500) | NULL | URL avatar |
| `phone` | VARCHAR(20) | NULL | Téléphone |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date création |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date MAJ |

**Relations** :
- `user_id` → `users.id` (ON DELETE CASCADE)

**SQL** :
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bio TEXT,
  avatar_url VARCHAR(500),
  phone VARCHAR(20),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### `posts`

Articles/posts créés par utilisateurs (relation N:1 avec `users`).

**Colonnes** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `user_id` | UUID | NOT NULL, FK | Auteur du post |
| `title` | VARCHAR(255) | NOT NULL | Titre |
| `content` | TEXT | NOT NULL | Contenu |
| `status` | ENUM('draft', 'published') | NOT NULL, DEFAULT 'draft' | Statut |
| `published_at` | TIMESTAMP | NULL | Date publication |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date création |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date MAJ |

**Relations** :
- `user_id` → `users.id` (ON DELETE CASCADE)

**Indexes** :
- PRIMARY KEY (`id`)
- INDEX (`user_id`)
- INDEX (`status`)
- INDEX (`published_at`)

**SQL** :
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_published_at ON posts(published_at);
```

---

### `tags`

Tags pour catégoriser posts (relation N:M via `post_tags`).

**Colonnes** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Identifiant unique |
| `name` | VARCHAR(50) | UNIQUE, NOT NULL | Nom du tag |
| `slug` | VARCHAR(50) | UNIQUE, NOT NULL | Slug URL |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date création |

**SQL** :
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

---

### `post_tags`

Table de jointure posts ↔ tags (relation N:M).

**Colonnes** :

| Colonne | Type | Contraintes | Description |
|---------|------|-------------|-------------|
| `post_id` | UUID | NOT NULL, FK | Référence posts.id |
| `tag_id` | UUID | NOT NULL, FK | Référence tags.id |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Date création |

**Relations** :
- `post_id` → `posts.id` (ON DELETE CASCADE)
- `tag_id` → `tags.id` (ON DELETE CASCADE)

**Contraintes** :
- PRIMARY KEY (`post_id`, `tag_id`)

**SQL** :
```sql
CREATE TABLE post_tags (
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, tag_id)
);

CREATE INDEX idx_post_tags_post_id ON post_tags(post_id);
CREATE INDEX idx_post_tags_tag_id ON post_tags(tag_id);
```

---

## 🔗 Relations

### users → profiles (1:1)
Un utilisateur a exactement un profil.

### users → posts (1:N)
Un utilisateur peut avoir plusieurs posts.

### posts ↔ tags (N:M)
Un post peut avoir plusieurs tags, un tag peut être sur plusieurs posts.

---

## 📈 Migrations

### Outil
[Alembic / Prisma / TypeORM / Django migrations]

### Commandes

```bash
# Créer migration
[commande create migration]

# Appliquer migrations
[commande migrate]

# Rollback dernière migration
[commande rollback]

# Statut migrations
[commande status]
```

### Historique

| Version | Date | Description |
|---------|------|-------------|
| `001` | 2026-01-15 | Tables initiales (users, profiles) |
| `002` | 2026-01-20 | Ajout posts et tags |
| `003` | 2026-01-25 | Ajout indexes performance |

---

## 🎯 Indexes Stratégiques

### Performance Queries Fréquentes

| Query | Index Utilisé | Performance |
|-------|---------------|-------------|
| `SELECT * FROM users WHERE email = ?` | `users(email)` UNIQUE | O(1) |
| `SELECT * FROM posts WHERE user_id = ?` | `idx_posts_user_id` | O(log n) |
| `SELECT * FROM posts WHERE status = 'published'` | `idx_posts_status` | O(log n) |

### Indexes à Ajouter (Futur)

- [ ] Full-text search sur `posts.content`
- [ ] Composite index `posts(user_id, status)`

---

## 🔒 Sécurité

### Données Sensibles

| Table | Colonne | Protection |
|-------|---------|------------|
| `users` | `password_hash` | Bcrypt hash (cost 12) |
| `users` | `email` | Chiffrement au repos (optionnel) |
| `profiles` | `phone` | Masquage dans logs |

### Row-Level Security (RLS)

```sql
-- PostgreSQL RLS example
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY posts_select_policy ON posts
  FOR SELECT
  USING (
    status = 'published'
    OR user_id = current_user_id()
  );
```

---

## 📊 Seed Data

### Données de Test

```sql
-- Admin user
INSERT INTO users (email, password_hash, name, role)
VALUES ('admin@example.com', '$2b$12$...', 'Admin User', 'admin');

-- Regular user
INSERT INTO users (email, password_hash, name, role)
VALUES ('user@example.com', '$2b$12$...', 'Regular User', 'user');
```

---

## 🔗 Voir Aussi

- [API_REFERENCE.md](API_REFERENCE.md) - Endpoints utilisant ces tables
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture globale
- Migrations : `[chemin/vers/migrations]`

---

**Maintenu par** : [Équipe]
**Revue recommandée** : À chaque changement schéma
