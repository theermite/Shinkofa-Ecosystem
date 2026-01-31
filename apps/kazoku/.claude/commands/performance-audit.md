# /performance-audit

Lance un audit performance complet frontend et backend avec recommandations d'optimisation.

## Description

Cette commande exécute une batterie de tests performance et génère un rapport détaillé avec :
- Métriques frontend (Lighthouse, bundle size, Core Web Vitals)
- Métriques backend (response times, slow queries, N+1 queries)
- Recommandations priorisées par impact

## Usage

```bash
/performance-audit [--frontend] [--backend] [--url <url>]
```

**Options** :
- `--frontend` : Audit frontend uniquement
- `--backend` : Audit backend uniquement
- `--url <url>` : URL à auditer (défaut : http://localhost:3000)
- Sans option : Audit complet (frontend + backend)

## Comportement

### **Frontend Audit**

#### 1. **Lighthouse Audit**

```bash
lighthouse <url> \
  --preset=desktop \
  --output=json \
  --output-path=./lighthouse-report.json \
  --chrome-flags="--headless"
```

Métriques analysées :
- **Performance** : Score 0-100
- **Accessibility** : Score 0-100
- **Best Practices** : Score 0-100
- **SEO** : Score 0-100

**Core Web Vitals** :
- **LCP (Largest Contentful Paint)** : < 2.5s (good), 2.5-4s (needs improvement), > 4s (poor)
- **FID (First Input Delay)** : < 100ms (good), 100-300ms (needs improvement), > 300ms (poor)
- **CLS (Cumulative Layout Shift)** : < 0.1 (good), 0.1-0.25 (needs improvement), > 0.25 (poor)

**Autres métriques** :
- **FCP (First Contentful Paint)** : < 1.8s
- **TTI (Time to Interactive)** : < 3.8s
- **TBT (Total Blocking Time)** : < 200ms
- **Speed Index** : < 3.4s

#### 2. **Bundle Size Analysis**

**JavaScript** :
```bash
# Vite
npx vite-bundle-visualizer

# Webpack
npx webpack-bundle-analyzer build/bundle-stats.json
```

Analyse :
- **Total bundle size** : Optimal < 500KB, Acceptable < 1MB
- **Largest chunks** : Identifier fichiers > 100KB
- **Unused code** : Tree-shaking opportunities
- **Duplicate dependencies** : Packages importés plusieurs fois

**CSS** :
```bash
# Purge CSS unused
npx purgecss --css build/**/*.css --content build/**/*.html
```

#### 3. **Assets Optimization**

**Images** :
- Format : WebP utilisé ? (vs PNG/JPG)
- Lazy loading : `loading="lazy"` présent ?
- Responsive : `srcset` utilisé ?
- Compression : Images compressées ? (TinyPNG)

**Fonts** :
- `font-display: swap` configuré ?
- Fonts subsettées ? (uniquement caractères utilisés)
- Preload fonts critiques ?

#### 4. **Caching Strategy**

Headers HTTP vérifiés :
```
Cache-Control: max-age=31536000, immutable  # JS/CSS avec hash
Cache-Control: no-cache                     # HTML
```

Service Worker :
- PWA avec SW configuré ?
- Stratégies caching (CacheFirst, NetworkFirst) ?

---

### **Backend Audit**

#### 1. **Endpoint Response Times**

Test tous endpoints critiques :

```python
import time
import requests

endpoints = [
    ("GET", "/api/users"),
    ("GET", "/api/users/1"),
    ("POST", "/api/users", {"name": "Test"}),
]

for method, path, *body in endpoints:
    start = time.time()
    response = requests.request(method, f"http://localhost:8000{path}", json=body[0] if body else None)
    duration = (time.time() - start) * 1000  # ms

    print(f"{method} {path}: {duration:.2f}ms (status: {response.status_code})")
```

**Seuils** :
- **< 100ms** : Excellent ✅
- **100-200ms** : Good ✅
- **200-500ms** : Acceptable ⚠️
- **> 500ms** : Poor ❌ (optimisation requise)

#### 2. **Database Slow Queries**

**PostgreSQL** :
```sql
-- Enable logging slow queries
ALTER SYSTEM SET log_min_duration_statement = 100;  -- Log queries > 100ms
SELECT pg_reload_conf();

-- Check slow queries log
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
WHERE mean_exec_time > 100
ORDER BY mean_exec_time DESC
LIMIT 10;
```

Pour chaque slow query :
1. Run `EXPLAIN ANALYZE <query>`
2. Identifier missing indexes
3. Check N+1 query patterns

**N+1 Queries Detection** (SQLAlchemy example) :
```python
from sqlalchemy import event
from sqlalchemy.engine import Engine

query_count = 0

@event.listens_for(Engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    global query_count
    query_count += 1

# Test endpoint
response = client.get("/api/users")  # Should be 1 query, not N+1

print(f"Queries executed: {query_count}")  # If > 2, likely N+1 problem
```

#### 3. **Database Health**

Checks :
- **Missing indexes** : Tables sans index sur foreign keys
- **Table bloat** : Tables fragmentées (PostgreSQL `pg_stat_user_tables`)
- **Unused indexes** : Indexes jamais utilisés (`pg_stat_user_indexes`)
- **Connection pool** : Pool size approprié ? (10-20 connexions)

#### 4. **Caching Effectiveness**

Si Redis/Memcached utilisé :
- **Hit rate** : Cache hit rate ≥ 80% ?
- **Eviction rate** : Trop d'evictions ? (cache trop petit)
- **TTL strategy** : TTL appropriés pour chaque clé ?

#### 5. **Load Testing** (optional)

```bash
# Locust load test
locust -f locustfile.py \
  --host=http://localhost:8000 \
  --users=100 \
  --spawn-rate=10 \
  --run-time=60s \
  --headless
```

Métriques :
- **Throughput** : Requests/sec (target ≥ 100 req/s)
- **P50, P95, P99** : Response times percentiles
- **Error rate** : < 1%

---

## Exemple Output

```
⚡ Performance Audit - 2026-01-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 FRONTEND AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Lighthouse Scores
Performance    : 78 ⚠️  (target ≥ 90)
Accessibility  : 95 ✅
Best Practices : 92 ✅
SEO            : 100 ✅

📈 Core Web Vitals
LCP : 3.2s ⚠️  (target < 2.5s)
FID : 85ms ✅ (target < 100ms)
CLS : 0.08 ✅ (target < 0.1)

📦 Bundle Size
Total         : 687 KB ⚠️  (target < 500 KB)
Largest chunk : main.js (423 KB)
Unused code   : ~145 KB (21%)

🖼️  Assets
Images format    : PNG/JPG ❌ (recommend WebP)
Lazy loading     : Partial ⚠️  (3/8 images)
Fonts optimized  : Yes ✅

💾 Caching
Cache headers    : Configured ✅
Service Worker   : Not configured ❌

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 BACKEND AUDIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏱️  Endpoint Response Times
GET  /api/users       : 145ms ✅
GET  /api/users/1     : 87ms ✅
POST /api/users       : 312ms ⚠️  (target < 200ms)
GET  /api/posts       : 1243ms ❌ (SLOW - needs optimization)

🗄️  Database Slow Queries (> 100ms)
1. SELECT * FROM posts WHERE user_id = ... (avg: 856ms, 145 calls)
   └─ ❌ Missing index on posts(user_id)
   └─ ❌ SELECT * (fetching all columns)

2. SELECT * FROM comments WHERE post_id IN (...) (avg: 234ms, 67 calls)
   └─ ⚠️  N+1 query pattern detected
   └─ 💡 Use joinedload or eager loading

📊 Database Health
Missing indexes   : 2 (posts.user_id, comments.post_id)
Table bloat       : posts (23% bloat - VACUUM recommended)
Unused indexes    : 1 (users_legacy_idx - safe to drop)
Connection pool   : 15/20 used ✅

💾 Caching (Redis)
Hit rate          : 67% ⚠️  (target ≥ 80%)
Eviction rate     : 12% ⚠️  (cache may be too small)
Keys              : 2,345 keys

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 RECOMMENDATIONS (by priority)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 CRITICAL (High Impact)

1. Fix N+1 query in /api/posts endpoint
   Impact: Response time 1243ms → ~150ms (88% improvement)
   Action:
   ```python
   # Current (N+1)
   posts = db.query(Post).all()
   for post in posts:
       post.comments  # Triggers query for each post

   # Fixed
   posts = db.query(Post).options(joinedload(Post.comments)).all()
   ```

2. Add missing database indexes
   Impact: Query time 856ms → ~50ms (94% improvement)
   Action:
   ```sql
   CREATE INDEX idx_posts_user_id ON posts(user_id);
   CREATE INDEX idx_comments_post_id ON comments(post_id);
   ```

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟠 HIGH IMPACT

3. Convert images to WebP format
   Impact: Bundle size -180 KB (~26% reduction)
   Action: Use Sharp or Squoosh to convert PNG/JPG → WebP

4. Code splitting for large chunks
   Impact: Initial load time -2.1s (LCP improvement)
   Action:
   ```javascript
   // Lazy load heavy components
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

5. Implement Service Worker caching
   Impact: Repeat visits load time -60%
   Action: Use Workbox or vite-plugin-pwa

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 MEDIUM IMPACT

6. Increase Redis cache size
   Impact: Hit rate 67% → 85% (reduce DB load)
   Action: Increase maxmemory from 256MB to 512MB

7. Add lazy loading to remaining images
   Impact: Initial page load -0.8s
   Action: Add `loading="lazy"` to <img> tags

8. Vacuum bloated tables
   Impact: Disk space +150MB, query perf +5-10%
   Action: `VACUUM FULL posts;`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Issues Found:
  🔴 Critical : 2
  🟠 High     : 3
  🟡 Medium   : 3

Potential Improvements:
  Frontend : Lighthouse 78 → 92 (+14 points)
  Backend  : Avg response 443ms → 95ms (-78%)
  Bundle   : 687 KB → 507 KB (-26%)

Estimated Dev Time: 4-6 hours
```

## Auto-Fix (partial)

Certaines optimisations peuvent être auto-fix :

```bash
/performance-audit --auto-fix
```

**Auto-fixable** :
- Ajouter indexes manquants (génère migration SQL)
- Convertir images PNG/JPG → WebP
- Ajouter `loading="lazy"` aux images
- Générer Service Worker config

**Non auto-fixable** (require refactoring) :
- Fix N+1 queries (require code changes)
- Code splitting (require architecture changes)

## Quand Utiliser

- **Avant release production** : Validation performance finale
- **Après ajout feature lourde** : Vérifier impact performance
- **Performance regression** : Identifier cause dégradation
- **Audit régulier** : Mensuel pour détecter régressions

## CI/CD Integration

GitHub Actions example :

```yaml
name: Performance Audit

on:
  pull_request:
    branches: [main]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build app
        run: npm run build

      - name: Start server
        run: npm start &

      - name: Performance audit
        run: claude performance-audit --url http://localhost:3000

      - name: Fail if Lighthouse < 90
        run: |
          score=$(jq '.categories.performance.score * 100' lighthouse-report.json)
          if [ "$score" -lt 90 ]; then
            echo "❌ Performance score $score < 90"
            exit 1
          fi
```

## Configuration

Fichier `.performance-audit-config.yaml` (optionnel) :

```yaml
frontend:
  url: http://localhost:3000
  lighthouse:
    thresholds:
      performance: 90
      accessibility: 95
  bundle:
    max_size_kb: 500

backend:
  base_url: http://localhost:8000
  endpoints:
    - GET /api/users
    - GET /api/posts
    - POST /api/users
  thresholds:
    response_time_ms: 200
    slow_query_ms: 100

database:
  check_indexes: true
  check_n_plus_one: true
```

## Notes

- **Baseline required** : Première exécution établit baseline, suivantes comparent
- **Environment matters** : Résultats varient selon machine (CPU, RAM, network)
- **Production audit** : Utiliser URL production pour audit réaliste
- **Cost-aware** : Load testing peut coûter cher (quotas API, bandwidth)
