# /db-health

Effectue un check santé complet de la database et génère un rapport avec recommandations.

## Description

Cette commande analyse l'état de la database (PostgreSQL, MySQL, SQLite) et identifie :
- Slow queries (queries lentes)
- Missing indexes (indexes manquants)
- Table bloat (fragmentation)
- Orphaned foreign keys
- Backup status
- Connection pool health

## Usage

```bash
/db-health [--db-type <postgres|mysql|sqlite>] [--connection-string <url>]
```

**Options** :
- `--db-type` : Type database (défaut : auto-détecté depuis config)
- `--connection-string` : Connection string (défaut : depuis `.env`)
- `--fix-indexes` : Génère migration SQL pour indexes manquants
- `--verbose` : Output détaillé avec queries SQL

## Comportement

### 1. **Connection & Basic Info**

```sql
-- PostgreSQL
SELECT version();
SELECT pg_database_size(current_database()) AS size;
SELECT count(*) FROM pg_stat_activity WHERE state = 'active' AS active_connections;
```

Output :
```
PostgreSQL 15.3
Database size: 245 MB
Active connections: 8/20 (40% pool utilization)
```

### 2. **Slow Queries Analysis**

**PostgreSQL** (requires `pg_stat_statements` extension) :

```sql
-- Enable extension if not exists
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Top 10 slow queries
SELECT
  query,
  calls,
  mean_exec_time,
  total_exec_time,
  (total_exec_time / sum(total_exec_time) OVER()) * 100 AS pct_total_time
FROM pg_stat_statements
WHERE mean_exec_time > 100  -- > 100ms
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**MySQL** :

```sql
-- Enable slow query log
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.1;  -- 100ms

-- Analyze slow query log
SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;
```

Pour chaque slow query :
1. **EXPLAIN ANALYZE** pour comprendre plan exécution
2. Identifier cause (missing index, table scan, join inefficace)
3. Proposer fix

### 3. **Missing Indexes Detection**

**Heuristiques** :

1. **Foreign keys sans index** :
```sql
-- PostgreSQL
SELECT
  tc.table_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
      AND indexdef LIKE '%' || kcu.column_name || '%'
  );
```

2. **Colonnes fréquemment utilisées dans WHERE** :
Analyse `pg_stat_statements` pour patterns `WHERE column =`

3. **Colonnes dans ORDER BY sans index** :
Cherche queries avec `ORDER BY` sur colonnes non-indexées

### 4. **Table Bloat Analysis**

**PostgreSQL** :

```sql
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS bloat
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Bloat > 20%** : VACUUM FULL recommandé

### 5. **Unused Indexes**

```sql
-- PostgreSQL
SELECT
  schemaname,
  tablename,
  indexname,
  idx_scan,  -- Number of index scans
  pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0  -- Never used
  AND indexrelname NOT LIKE '%_pkey'  -- Exclude primary keys
ORDER BY pg_relation_size(indexrelid) DESC;
```

**Recommandation** : Drop unused indexes pour économiser espace + améliorer INSERT/UPDATE perf

### 6. **Orphaned Foreign Keys**

```sql
-- Find foreign key violations (orphaned records)
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table,
  ccu.column_name AS foreign_column,
  count(*) AS orphaned_count
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
GROUP BY tc.table_name, kcu.column_name, ccu.table_name, ccu.column_name
HAVING count(*) > 0;
```

### 7. **Backup Status**

Check dernier backup :
- **PostgreSQL** : `pg_dump` timestamp dans `/backups`
- **MySQL** : `mysqldump` timestamp
- **S3/Backblaze** : Dernier backup off-site

**Warnings** :
- ❌ Pas de backup > 7 jours
- ⚠️  Pas de backup > 24h
- ✅ Backup < 24h

### 8. **Connection Pool Health**

**SQLAlchemy example** :

```python
from sqlalchemy import create_engine

engine = create_engine(DATABASE_URL, pool_size=10, max_overflow=20)

# Check pool stats
pool = engine.pool
print(f"Pool size: {pool.size()}")
print(f"Checked out: {pool.checked_out_connections()}")
print(f"Overflow: {pool.overflow()}")
print(f"Num connections: {pool.num_connections()}")
```

**Recommandations** :
- Pool size trop petit : Augmenter si `overflow` fréquent
- Pool size trop grand : Réduire si sous-utilisé (< 50%)

---

## Exemple Output

```
🗄️  Database Health Check - 2026-01-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔌 CONNECTION INFO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Database       : PostgreSQL 15.3
Size           : 245 MB
Active conns   : 8/20 (40% utilization) ✅
Uptime         : 15 days 7 hours

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  SLOW QUERIES (> 100ms)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ❌ CRITICAL (avg: 856ms, 145 calls, 21% total time)
   Query:
   SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC

   EXPLAIN ANALYZE:
   Seq Scan on posts  (cost=0.00..2834.56 rows=1245 width=256) (actual time=0.045..842.123 rows=1245 loops=1)
     Filter: (user_id = 42)

   📊 Issues:
   - ❌ Missing index on posts(user_id)
   - ❌ SELECT * fetching all columns (use specific columns)
   - ❌ Seq Scan (table scan - slow for large tables)

   💡 Fix:
   ```sql
   CREATE INDEX idx_posts_user_id ON posts(user_id);
   ```

   Estimated improvement: 856ms → 15ms (98% faster)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. ⚠️  MEDIUM (avg: 234ms, 67 calls, 8% total time)
   Query:
   SELECT * FROM comments WHERE post_id IN ($1, $2, ...)

   📊 Issues:
   - ⚠️  N+1 query pattern detected
   - ❌ Missing index on comments(post_id)

   💡 Fix:
   ```sql
   CREATE INDEX idx_comments_post_id ON comments(post_id);
   ```

   Estimated improvement: 234ms → 25ms (89% faster)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 MISSING INDEXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. posts.user_id (foreign key, used in WHERE)
2. comments.post_id (foreign key, used in WHERE)
3. users.email (used in WHERE frequently)

💾 Total space needed: ~15 MB

🚀 Estimated performance gain:
  - Slow queries: -85% average response time
  - INSERT/UPDATE: -2% (small overhead acceptable)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 TABLE BLOAT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Table        | Size    | Bloat   | Bloat %
-------------|---------|---------|--------
posts        | 120 MB  | 28 MB   | 23% ⚠️
users        | 45 MB   | 3 MB    | 7% ✅
comments     | 67 MB   | 15 MB   | 22% ⚠️

💡 Recommendations:
  - VACUUM FULL posts; (reclaim 28 MB)
  - VACUUM FULL comments; (reclaim 15 MB)
  - Schedule weekly VACUUM (prevent future bloat)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🗑️  UNUSED INDEXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Index               | Table | Size  | Scans
--------------------|-------|-------|------
users_legacy_idx    | users | 5 MB  | 0
posts_old_created   | posts | 8 MB  | 0

💡 Safe to drop (total space: 13 MB):
  ```sql
  DROP INDEX users_legacy_idx;
  DROP INDEX posts_old_created;
  ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⛓️  ORPHANED FOREIGN KEYS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ No orphaned records found

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💾 BACKUP STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Last backup : 18 hours ago ✅
Location    : /backups/db-2026-01-02-21-00.sql.gz
Size        : 87 MB (compressed)
Off-site    : S3 (synced) ✅

Next backup : 6 hours (cron: daily 03:00)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏊 CONNECTION POOL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Pool size      : 10
Max overflow   : 20
Currently used : 8 (80% of pool)
Peak usage     : 15 (50% of total capacity)

⚠️  Pool frequently near capacity (consider increasing pool size to 15)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall Health: ⚠️  NEEDS ATTENTION

Issues Found:
  🔴 Critical : 1 (slow query > 500ms)
  🟠 High     : 2 (missing indexes)
  🟡 Medium   : 3 (table bloat, pool size)
  ✅ Good     : 3 (backups, no orphans, conn pool)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDED ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Priority 1 - Critical (Do Now):
  1. Add missing indexes (3 indexes)
     → /db-health --fix-indexes  # Generates migration

Priority 2 - High (This Week):
  2. Vacuum bloated tables
     → VACUUM FULL posts, comments;

  3. Increase connection pool size
     → Change DATABASE_POOL_SIZE from 10 to 15

Priority 3 - Medium (This Month):
  4. Drop unused indexes
     → DROP INDEX users_legacy_idx, posts_old_created;

  5. Schedule weekly VACUUM
     → Add cron job: 0 2 * * 0 VACUUM ANALYZE;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📄 GENERATED FILES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ migrations/add_missing_indexes.sql
✅ db-health-report-2026-01-03.md
```

## Auto-Fix Indexes

Avec flag `--fix-indexes` :

```bash
/db-health --fix-indexes
```

Génère fichier migration SQL :

```sql
-- migrations/add_missing_indexes_2026_01_03.sql
-- Generated by /db-health on 2026-01-03

-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_posts_user_id ON posts(user_id);
CREATE INDEX CONCURRENTLY idx_comments_post_id ON comments(post_id);
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);

-- CONCURRENTLY prevents table locking (safe for production)
-- Estimated space: 15 MB
-- Estimated query improvement: 85% faster average
```

**Apply migration** :
```bash
psql -U postgres -d dbname -f migrations/add_missing_indexes_2026_01_03.sql
```

Ou avec Alembic :
```python
# Generated Alembic migration
def upgrade():
    op.create_index('idx_posts_user_id', 'posts', ['user_id'], concurrent=True)
    op.create_index('idx_comments_post_id', 'comments', ['post_id'], concurrent=True)
    op.create_index('idx_users_email', 'users', ['email'], concurrent=True)

def downgrade():
    op.drop_index('idx_posts_user_id', 'posts')
    op.drop_index('idx_comments_post_id', 'comments')
    op.drop_index('idx_users_email', 'users')
```

## Scheduled Health Checks

Recommandé : Exécuter `/db-health` hebdomadairement via cron :

```bash
# Cron job (every Sunday 03:00)
0 3 * * 0 cd /var/www/app && claude db-health --verbose > logs/db-health-$(date +\%Y-\%m-\%d).log 2>&1
```

Envoyer alerte si score < 70% :

```bash
#!/bin/bash
SCORE=$(claude db-health --json | jq '.overall_score')
if [ "$SCORE" -lt 70 ]; then
  # Send alert (email, Slack, etc.)
  curl -X POST https://hooks.slack.com/... -d "{\"text\": \"⚠️ DB Health Score: $SCORE%\"}"
fi
```

## Quand Utiliser

- **Avant release production** : Validation santé DB
- **Performance dégradée** : Identifier cause slow queries
- **Après migration majeure** : Vérifier integrity
- **Régulier (hebdo/mensuel)** : Maintenance préventive
- **Avant backup/restore** : Vérifier état pre-operation

## Configuration

Fichier `.db-health-config.yaml` (optionnel) :

```yaml
postgres:
  slow_query_threshold_ms: 100
  bloat_threshold_pct: 20
  backup_max_age_hours: 24

checks:
  - slow_queries
  - missing_indexes
  - table_bloat
  - orphaned_fks
  - backup_status
  - connection_pool

notifications:
  slack_webhook: https://hooks.slack.com/...
  email: admin@example.com
  threshold_score: 70  # Alert if < 70%
```

## Notes

- **Read-only safe** : Aucune modification DB (sauf si `--fix-indexes`)
- **Production safe** : Utilise `CREATE INDEX CONCURRENTLY` (no locking)
- **Overhead minimal** : Queries système, pas de full table scans
- **Works offline** : Peut analyser dump SQL si DB inaccessible
