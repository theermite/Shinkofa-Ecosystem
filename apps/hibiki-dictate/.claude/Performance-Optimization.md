# Performance Optimization Checklist

**Contexte d'usage** : Consulter si problème performance, optimisation demandée, ou avant déploiement production.

---

## ⚡ Frontend (React/Vue)

### Bundle & Assets
- [ ] Bundle size : Total < 500KB (vérifier `webpack-bundle-analyzer`)
- [ ] Code splitting : `React.lazy()`, dynamic imports pour routes
- [ ] Tree shaking : Imports nommés (`import { func } from 'lib'` pas `import *`)
- [ ] Images optimisées : WebP + fallback, lazy loading, responsive (`srcset`)
- [ ] Fonts optimisées : `font-display: swap`, subset, preload fonts critiques

### Rendering
- [ ] Memoization : `React.memo()`, `useMemo()`, `useCallback()` appropriés
- [ ] Virtualization : Listes longues (>100 items) avec `react-window`
- [ ] Debounce/Throttle : Inputs search, scroll handlers
- [ ] No unnecessary re-renders : React DevTools Profiler vérifié

### Metrics Cibles
- [ ] Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Core Web Vitals :
  - LCP (Largest Contentful Paint) < 2.5s
  - FID (First Input Delay) < 100ms
  - CLS (Cumulative Layout Shift) < 0.1
- [ ] Time to Interactive < 3.5s

---

## 🔥 Backend (FastAPI/Flask/Express)

### Database
- [ ] Queries optimisées : `EXPLAIN ANALYZE` sur queries lentes
- [ ] Indexes appropriés : Colonnes `WHERE`, `JOIN`, `ORDER BY` indexées
- [ ] N+1 queries éliminées : `joinedload` (SQLAlchemy) ou `include` (Prisma)
- [ ] Pagination : JAMAIS `SELECT *` sans `LIMIT` (max 100 items/page)
- [ ] Connection pooling : Pool size configuré (SQLAlchemy: 10-20 connexions)

### API
- [ ] Response time < 200ms : Endpoints critiques (GET listes, POST création)
- [ ] Caching : Redis pour données lues fréquemment, rarement modifiées
- [ ] Compression : Gzip responses (automatique FastAPI/Express)
- [ ] Rate limiting : Prévenir abus (slowapi, express-rate-limit)

### Infrastructure
- [ ] CDN : Assets statiques servis via CDN (Cloudflare, BunnyCDN)
- [ ] HTTP/2 : Nginx configuré pour HTTP/2
- [ ] Keep-Alive : Connexions persistantes activées

### Metrics Cibles
- [ ] Time to First Byte < 100ms
- [ ] P95 response time < 500ms
- [ ] Throughput : ≥ 100 req/s (si applicable)

---

## 🔧 Command Slash Disponible

- `/performance-audit` : Génère rapport performance complet

---

**Retour vers** : `CLAUDE.md` pour workflow principal
