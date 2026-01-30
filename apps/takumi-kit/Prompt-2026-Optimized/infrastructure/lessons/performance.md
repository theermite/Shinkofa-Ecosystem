# Lessons Learned - Performance

> Leçons apprises liées à la performance, optimisations, caching.

---

## 📊 Statistiques

**Leçons documentées** : 4
**Dernière mise à jour** : 2026-01-29

---

## Leçons

### 1. Database N+1 Query Problem

**Contexte** : API retournant liste avec relations (users + posts)

**Problème** :
```python
# ❌ N+1 queries (1 query users + N queries posts)
users = await db.query("SELECT * FROM users LIMIT 10")  # 1 query
for user in users:
    # N queries (10 queries si 10 users)
    user.posts = await db.query(
        "SELECT * FROM posts WHERE user_id = $1", user.id
    )
# TOTAL: 11 queries pour 10 users
```

**Impact** :
- 🐌 10 users → 11 queries → ~50ms
- 🐌 1000 users → 1001 queries → 5+ secondes
- 💥 Database connection pool saturé

**Solution** :
```python
# ✅ 2 queries avec JOIN ou IN clause
# Option 1: JOIN
users_with_posts = await db.query("""
    SELECT u.*, p.id as post_id, p.title, p.content
    FROM users u
    LEFT JOIN posts p ON u.id = p.user_id
    LIMIT 10
""")

# Option 2: IN clause (meilleur si many posts/user)
users = await db.query("SELECT * FROM users LIMIT 10")
user_ids = [u.id for u in users]
posts = await db.query(
    "SELECT * FROM posts WHERE user_id = ANY($1)", user_ids
)
# Group posts by user_id
posts_by_user = {}
for post in posts:
    posts_by_user.setdefault(post.user_id, []).append(post)
for user in users:
    user.posts = posts_by_user.get(user.id, [])
# TOTAL: 2 queries pour 10 users
```

**Impact** :
- ✅ 1000 users: 1001 queries → 2 queries
- ✅ Latence: 5s → 50ms (100x faster)
- ✅ DB load réduit

**Catégorie** : Performance Critical
**Tags** : database, n+1, sql, optimization

---

### 2. Redis Cache avec TTL Stratégique

**Contexte** : API avec queries lourdes répétées

**Problème** :
```python
# ❌ Query lourde sans cache
@app.get("/stats/dashboard")
async def dashboard():
    # Query complexe: 3 JOINs, aggregations
    stats = await db.query("""
        SELECT ... FROM users
        JOIN orders ... JOIN products ...
        GROUP BY ... HAVING ...
    """)  # 500ms à chaque requête
    return stats
```

**Coût** :
- 🐌 500ms par requête
- 🐌 100 req/min → 50s CPU time/min
- 💸 DB compute wasted (données changent peu)

**Solution** :
```python
# ✅ Redis cache avec TTL
import redis.asyncio as redis
import json

redis_client = redis.Redis(host="localhost", port=6379)

@app.get("/stats/dashboard")
async def dashboard():
    cache_key = "dashboard:stats"

    # Check cache first
    cached = await redis_client.get(cache_key)
    if cached:
        return json.loads(cached)

    # Cache miss → query DB
    stats = await db.query("""...""")  # 500ms

    # Store in cache with TTL
    await redis_client.setex(
        cache_key,
        300,  # 5 minutes TTL
        json.dumps(stats)
    )
    return stats
```

**Impact** :
- ✅ Cache hit: 500ms → 2ms (250x faster)
- ✅ DB load: 100 queries/min → 0.33 queries/min
- ✅ TTL 5min = données "assez fraîches" pour dashboards

**TTL Guidelines** :
- **Stats/Dashboards** : 5-15min (données agrégées, changent peu)
- **User profiles** : 1-5min (mises à jour occasionnelles)
- **Hot data** : 30s-1min (prix, stock)
- **Session data** : Token expiry (ex: 1h)

**Catégorie** : Performance
**Tags** : redis, cache, ttl, optimization

---

### 3. Image Optimization (WebP + Lazy Loading)

**Contexte** : Site avec galerie photos/images produits

**Problème** :
```html
<!-- ❌ JPG full resolution, eager loading -->
<img src="/images/product-4000x3000.jpg" alt="Product" />
<!-- 2.5MB image chargée immédiatement, même si hors viewport -->
```

**Impact** :
- 🐌 LCP (Largest Contentful Paint): 4+ secondes
- 📦 Bande passante gaspillée (mobile)
- 💸 Coût hébergement (bandwidth)

**Solution** :
```html
<!-- ✅ WebP + responsive + lazy loading -->
<picture>
  <source
    srcset="
      /images/product-400w.webp 400w,
      /images/product-800w.webp 800w,
      /images/product-1200w.webp 1200w
    "
    sizes="(max-width: 600px) 400px, (max-width: 1200px) 800px, 1200px"
    type="image/webp"
  />
  <img
    src="/images/product-800w.jpg"
    alt="Product"
    loading="lazy"
    decoding="async"
  />
</picture>
```

**Impact** :
- ✅ WebP: 2.5MB → 400KB (83% reduction)
- ✅ Lazy loading: Images hors viewport pas chargées
- ✅ Responsive: Mobile charge 400w, Desktop charge 1200w
- ✅ LCP: 4s → 1.2s

**Build Automation (Next.js)** :
```tsx
import Image from 'next/image';

<Image
  src="/images/product.jpg"
  alt="Product"
  width={800}
  height={600}
  loading="lazy"
  // Next.js auto-génère WebP + srcset
/>
```

**Catégorie** : Performance
**Tags** : images, webp, lazy-loading, lcp, core-web-vitals

---

### 4. Bundle Splitting (Code Splitting + Tree Shaking)

**Contexte** : React app avec bundle.js 2MB+

**Problème** :
```tsx
// ❌ Import all, bundle everything
import { Button, Modal, Chart, Table, Editor } from 'ui-library';
// → Bundle inclut 2MB même si on utilise que Button
```

**Impact** :
- 📦 bundle.js: 2.5MB (gzipped: 800KB)
- 🐌 TTI (Time to Interactive): 6+ secondes (mobile 3G)
- 🐌 FCP (First Contentful Paint): 3+ secondes

**Solution** :
```tsx
// ✅ Code splitting + tree shaking
// 1. Named imports (tree shaking)
import { Button } from 'ui-library/button';  // Only Button code

// 2. Dynamic imports (code splitting)
const Chart = lazy(() => import('ui-library/chart'));
const Editor = lazy(() => import('./HeavyEditor'));

function Dashboard() {
  return (
    <Suspense fallback={<Spinner />}>
      {showChart && <Chart data={data} />}  // Loaded only when shown
    </Suspense>
  );
}

// 3. Route-based splitting (Next.js/React Router)
// pages/admin.tsx → admin-hash.js (loaded only on /admin)
```

**Vite Config** :
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-ui': ['ui-library'],
          'charts': ['chart.js', 'recharts'],
        }
      }
    }
  }
}
```

**Impact** :
- ✅ Initial bundle: 2.5MB → 400KB (6x reduction)
- ✅ TTI: 6s → 2s (mobile 3G)
- ✅ Lazy-loaded chunks: chargés on-demand

**Catégorie** : Performance Critical
**Tags** : bundle, code-splitting, tree-shaking, webpack, vite

---

## 💡 Patterns Communs

**Database** :
- Indexes sur colonnes WHERE/ORDER BY/JOIN
- N+1 queries → JOIN ou IN clause
- EXPLAIN ANALYZE pour profiler queries lentes
- Connection pooling (max_connections = CPU cores * 2)

**Caching** :
- Redis pour données fréquentes
- TTL adapté au use case (5min stats, 30s hot data)
- Cache invalidation sur mutations (DEL key après UPDATE)
- Cache stampede protection (SETNX lock)

**Frontend** :
- Images: WebP + lazy loading + responsive srcset
- Fonts: preload critical, display=swap
- JS: code splitting + tree shaking + minification
- CSS: purge unused (Tailwind), critical CSS inline

**Monitoring** :
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- API latency: p50 < 200ms, p99 < 1s
- DB queries: slow query log (>500ms)
- Redis hit rate: >90% pour cache efficace

---

## 🔗 Voir Aussi

- [frontend.md](frontend.md) - Performance UI
- [backend.md](backend.md) - Performance API
- [database.md](database.md) - Optimisations DB

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
