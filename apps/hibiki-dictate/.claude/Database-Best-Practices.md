# Database Best Practices

**Contexte d'usage** : Consulter si travail base de données, migrations, optimisation queries, ou problèmes DB.

---

## 🔄 Migrations (Alembic/Prisma/Knex)

### Développement
- [ ] Toujours tester migration down : `alembic downgrade -1` doit fonctionner
- [ ] Jamais modifier migration déployée : Créer nouvelle migration pour corriger
- [ ] Migrations atomiques : 1 migration = 1 changement logique
- [ ] Nommer migrations descriptif : `add_user_email_index` pas `migration_123`

### Production
- [ ] Backup DB AVANT migration : Automatique ou manuel
- [ ] Tester migration sur staging : Copie production data sur staging d'abord
- [ ] Migrations réversibles : Toujours avoir `downgrade()` fonctionnel
- [ ] Zero-downtime migrations : Pour apps critiques, éviter `ALTER TABLE` bloquant

---

## 📐 Schema Design

### Bonnes Pratiques
- [ ] Primary keys : Toujours `id SERIAL PRIMARY KEY` ou `UUID`
- [ ] Foreign keys : Avec `ON DELETE CASCADE` / `SET NULL` approprié
- [ ] UNIQUE constraints : Sur colonnes business-unique (email, username)
- [ ] NOT NULL : Par défaut NOT NULL, NULL uniquement si vraiment optionnel
- [ ] Default values : Pour colonnes avec valeur logique par défaut
- [ ] Timestamps : `created_at`, `updated_at` sur toutes tables (auto-update trigger)

### Indexes
- [ ] Colonnes WHERE fréquentes : `WHERE user_id = X` → index sur `user_id`
- [ ] Colonnes JOIN : Foreign keys auto-indexées, vérifier quand même
- [ ] Colonnes ORDER BY : Si `ORDER BY created_at DESC` fréquent → index
- [ ] Composite indexes : Pour queries multi-colonnes (`WHERE user_id = X AND status = Y`)
- [ ] Pas d'over-indexing : Indexes ralentissent INSERTs/UPDATEs

---

## 🔍 Queries

### Sécurité
✅ **TOUJOURS parameterized queries** : JAMAIS string concatenation

```python
# ❌ DANGEREUX
query = f"SELECT * FROM users WHERE id = {user_id}"

# ✅ SECURE
query = "SELECT * FROM users WHERE id = ?"
cursor.execute(query, (user_id,))
```

### Performance
- [ ] Éviter SELECT * : Sélectionner colonnes nécessaires uniquement
- [ ] EXPLAIN ANALYZE : Sur queries lentes (> 100ms)
- [ ] Avoid OR in WHERE : Utiliser `IN` ou `UNION` si possible
- [ ] Limit results : Toujours `LIMIT` pour queries exploratoires

---

## 💾 Backups

### Stratégie
- [ ] Backup quotidien automatique : Cron job `pg_dump` ou équivalent
- [ ] Retention policy : 30 jours minimum, 1 an pour backups mensuels
- [ ] Backup off-site : Stocker backups hors serveur principal (S3, Backblaze)
- [ ] Test restore mensuel : Vérifier que restore fonctionne effectivement
- [ ] Point-in-time recovery : Si critique (PostgreSQL WAL archiving)

### Script Backup Example (PostgreSQL)
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump -U postgres db_name | gzip > /backups/db_$DATE.sql.gz
# Cleanup old backups (keep 30 days)
find /backups -name "db_*.sql.gz" -mtime +30 -delete
```

---

## 🔧 Command Slash Disponible

- `/db-health` : Check santé database

---

**Retour vers** : `CLAUDE.md` pour workflow principal
