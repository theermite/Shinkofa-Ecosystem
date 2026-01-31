# QuickRef: Performance Tips

> Référence rapide optimisations frontend et backend.

---

## Frontend Performance

### Lazy Loading

```typescript
// React - Code splitting
const Dashboard = React.lazy(() => import('./Dashboard'));

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Dashboard />
    </Suspense>
  );
}

// Images
<img loading="lazy" src="image.jpg" alt="..." />
```

### Bundle Optimization

```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          utils: ['lodash', 'date-fns']
        }
      }
    }
  }
}
```

### Caching

```typescript
// React Query - Cache par défaut
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers,
  staleTime: 5 * 60 * 1000,  // 5 minutes
  cacheTime: 30 * 60 * 1000  // 30 minutes
});

// SWR
const { data } = useSWR('/api/users', fetcher, {
  revalidateOnFocus: false,
  dedupingInterval: 60000
});
```

---

## Backend Performance

### Caching (Redis)

```python
import redis
from functools import wraps

r = redis.Redis()

def cache(ttl=300):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            key = f"{func.__name__}:{args}:{kwargs}"
            cached = r.get(key)
            if cached:
                return json.loads(cached)
            result = await func(*args, **kwargs)
            r.setex(key, ttl, json.dumps(result))
            return result
        return wrapper
    return decorator

@cache(ttl=600)
async def get_user(user_id: int):
    return await db.users.find_one(user_id)
```

### Database Query Optimization

```python
# ❌ N+1 Query Problem
users = await User.all()
for user in users:
    posts = await user.posts.all()  # N queries!

# ✅ Eager Loading
users = await User.all().prefetch_related('posts')  # 2 queries
```

```sql
-- Index sur colonnes filtrées
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);

-- Pagination cursor-based (pas OFFSET)
SELECT * FROM posts WHERE id < :last_id ORDER BY id DESC LIMIT 20;
```

### Async Operations

```python
# FastAPI - Background tasks
from fastapi import BackgroundTasks

@app.post("/send-email")
async def send_email(bg: BackgroundTasks):
    bg.add_task(send_email_async, to="user@example.com")
    return {"status": "queued"}

# Paralléliser requêtes
import asyncio

async def fetch_all():
    results = await asyncio.gather(
        fetch_users(),
        fetch_posts(),
        fetch_comments()
    )
    return results
```

---

## Métriques Clés

| Métrique | Cible | Outil |
|----------|-------|-------|
| LCP | <2.5s | Lighthouse |
| FID | <100ms | Lighthouse |
| CLS | <0.1 | Lighthouse |
| TTFB | <200ms | WebPageTest |
| API Response | <100ms | APM |

---

## Quick Wins

1. **Compresser** : gzip/brotli sur serveur
2. **CDN** : Static assets sur CDN
3. **Images** : WebP, tailles adaptées, lazy load
4. **Fonts** : font-display: swap, subset
5. **Minifier** : CSS/JS en production
6. **HTTP/2** : Activer sur serveur

---

## Profiling

```bash
# Python - cProfile
python -m cProfile -s cumtime script.py

# Node.js
node --prof app.js
node --prof-process isolate-*.log > processed.txt

# Chrome DevTools
# Performance tab → Record → Analyze
```

---

**Version** : 1.0 | **Trigger** : Optimisation, debug lenteur, audit performance
