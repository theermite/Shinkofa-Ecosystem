# Lessons Learned - Base de Données

> Leçons apprises liées aux bases de données, migrations, schémas.

---

## 📊 Statistiques

**Leçons documentées** : 1
**Dernière mise à jour** : 2026-01-26

---

## Leçons

### [DB] [MIGRATION] Migration Alembic échoue en prod
**Date** : 2026-01-08 | **Projet** : shinkofa-platform | **Sévérité** : 🔴

**Contexte** :
Migration ajoutant colonne NOT NULL sans default.

**Erreur** :
```
ERROR: column "new_column" contains null values
```

**Solution** :
```python
# Migration en 2 étapes:
# 1. Ajouter colonne nullable avec default
op.add_column('users', sa.Column('new_col', sa.String(), nullable=True, server_default=''))

# 2. Après data migration, retirer nullable
op.alter_column('users', 'new_col', nullable=False)
```

**Prévention** :
1. JAMAIS de NOT NULL sans default sur table avec données
2. Toujours tester migration sur copie de prod
3. Avoir un rollback plan testé

**Fichiers/Commandes Clés** :
- `alembic/versions/*.py` - Fichiers migrations
- `alembic upgrade head` - Appliquer migrations
- `alembic downgrade -1` - Rollback dernière migration

---

## 💡 Patterns Communs

### Pattern 1 : Migration Sécurisée Colonne NOT NULL
```python
def upgrade():
    # Étape 1: Ajouter nullable avec default
    op.add_column('table', sa.Column('new_col', sa.String(), nullable=True, server_default=''))

    # Étape 2: Populate data
    op.execute("UPDATE table SET new_col = 'default_value' WHERE new_col IS NULL")

    # Étape 3: Retirer nullable
    op.alter_column('table', 'new_col', nullable=False)

def downgrade():
    op.drop_column('table', 'new_col')
```

### Pattern 2 : Migration avec Foreign Key
```python
def upgrade():
    # 1. Ajouter colonne FK nullable
    op.add_column('child', sa.Column('parent_id', sa.Integer(), nullable=True))

    # 2. Populate FK
    op.execute("UPDATE child SET parent_id = [logic]")

    # 3. Créer contrainte FK
    op.create_foreign_key('fk_child_parent', 'child', 'parent', ['parent_id'], ['id'])

    # 4. Retirer nullable
    op.alter_column('child', 'parent_id', nullable=False)
```

### Pattern 3 : Backup Avant Migration
```bash
# PostgreSQL
pg_dump -U user -d dbname > backup_before_migration_$(date +%Y%m%d_%H%M).sql

# MySQL
mysqldump -u user -p dbname > backup_before_migration_$(date +%Y%m%d_%H%M).sql
```

---

## 🔗 Voir Aussi

- [docker.md](docker.md) - DB dans containers Docker
- [backend.md](backend.md) - API et accès DB
- Infrastructure: [VPS-OVH-SETUP.md](../VPS-OVH-SETUP.md)

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
