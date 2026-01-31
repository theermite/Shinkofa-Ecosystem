# Database Migrations

Ce dossier contient les migrations de base de données pour le projet SLF-Esport.

## Structure

- `*.sql` : Fichiers de migration SQL
- `run_migration.py` : Script Python pour exécuter les migrations

## Comment exécuter une migration

### Méthode 1: Utiliser le script Python (Recommandé)

```bash
# Depuis le dossier backend/migrations/
cd backend/migrations

# Exécuter la migration par défaut (001_add_super_admin_role.sql)
python run_migration.py

# Ou spécifier un fichier de migration
python run_migration.py 001_add_super_admin_role.sql
```

### Méthode 2: Exécuter manuellement via psql

```bash
# Se connecter à la base de données
psql -h localhost -U slf_user -d slf_esport

# Exécuter le fichier de migration
\i backend/migrations/001_add_super_admin_role.sql

# Ou via ligne de commande
psql -h localhost -U slf_user -d slf_esport -f backend/migrations/001_add_super_admin_role.sql
```

### Méthode 3: Via Docker (si backend en container)

```bash
# Copier le fichier de migration dans le container
docker cp backend/migrations/001_add_super_admin_role.sql slf-backend:/tmp/

# Se connecter au container et exécuter
docker exec -it slf-backend psql -U slf_user -d slf_esport -f /tmp/001_add_super_admin_role.sql
```

## Migrations disponibles

### 001_add_super_admin_role.sql

**Date**: 2025-12-12

**Description**: Ajoute le rôle SUPER_ADMIN au système et promeut le compte de Jay (jaygonc@gmail.com) en Super Admin.

**Changements**:
1. Ajoute la valeur `super_admin` à l'enum `user_role_enum`
2. Met à jour le compte `jaygonc@gmail.com` avec le rôle `super_admin`

**Rollback**:
```sql
-- Pour revenir au rôle coach uniquement (ne supprime pas l'enum)
UPDATE users SET role = 'coach' WHERE email = 'jaygonc@gmail.com';
```

## Vérification post-migration

Après avoir exécuté la migration, vérifiez que tout s'est bien passé :

```sql
-- Vérifier que l'enum contient super_admin
SELECT enum_range(NULL::user_role_enum);

-- Vérifier le compte de Jay
SELECT id, email, username, role FROM users WHERE email = 'jaygonc@gmail.com';
```

Résultat attendu :
- L'enum doit contenir : `{joueur,coach,manager,super_admin}`
- Le compte de Jay doit avoir `role = super_admin`

## Bonnes pratiques

1. **Toujours tester sur un environnement de dev d'abord**
2. **Faire un backup de la base avant migration en production**
3. **Documenter chaque migration dans ce README**
4. **Numéroter les migrations séquentiellement** (001_, 002_, etc.)
5. **Inclure des instructions de rollback dans chaque migration**

## Troubleshooting

### Erreur: "type user_role_enum does not exist"

La migration attend que l'enum `user_role_enum` existe déjà. Si ce n'est pas le cas, créez-le d'abord :

```sql
CREATE TYPE user_role_enum AS ENUM ('joueur', 'coach', 'manager');
```

### Erreur: "cannot add value to enum in transaction block"

PostgreSQL 12+ ne permet pas d'ajouter des valeurs à un enum dans un bloc de transaction. Exécutez la commande `ALTER TYPE` séparément :

```sql
-- Exécuter en dehors d'une transaction
ALTER TYPE user_role_enum ADD VALUE 'super_admin';

-- Puis mettre à jour les utilisateurs
UPDATE users SET role = 'super_admin' WHERE email = 'jaygonc@gmail.com';
```

### Erreur: "user not found"

Si le compte `jaygonc@gmail.com` n'existe pas, créez-le d'abord ou modifiez l'email dans la migration SQL.
