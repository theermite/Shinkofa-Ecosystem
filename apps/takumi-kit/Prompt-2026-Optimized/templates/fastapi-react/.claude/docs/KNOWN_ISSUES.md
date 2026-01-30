# Known Issues - [Nom Projet]

> Problèmes connus, limitations, et workarounds.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🐛 Bugs Connus

### HIGH Priority

#### #001 : [Titre Bug]
**Status** : 🔴 Open | **Priorité** : HIGH | **Version** : 1.0.0

**Description** :
[Description détaillée du bug]

**Steps to Reproduce** :
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Expected Behavior** :
[Ce qui devrait se passer]

**Actual Behavior** :
[Ce qui se passe réellement]

**Workaround** :
```
[Code ou actions pour contourner temporairement]
```

**Fix Planned** : v1.0.1 (ETA: YYYY-MM-DD)

---

### MEDIUM Priority

#### #002 : Performance lente sur liste utilisateurs (>1000 users)
**Status** : 🟡 In Progress | **Priorité** : MEDIUM | **Version** : 1.0.0

**Description** :
Endpoint GET /api/users slow (>3s) quand >1000 utilisateurs en base.

**Root Cause** :
Query non optimisée (missing index sur `created_at`, N+1 sur relations)

**Workaround** :
Utiliser pagination avec limit=50 au lieu de 100 :
```typescript
const { data } = await api.get('/api/users?limit=50');
```

**Fix Planned** : v1.1.0
- Ajouter index sur `created_at`
- Eager loading SQLAlchemy relations
- Cache Redis (5min) sur liste users

---

### LOW Priority

#### #003 : Dark mode : Contraste insuffisant sur boutons secondaires
**Status** : 🟢 Acknowledged | **Priorité** : LOW | **Version** : 1.0.0

**Description** :
En dark mode, boutons secondaires (`.btn-secondary`) ont contraste 3.8:1 (< 4.5:1 WCAG AA).

**Workaround** :
Force contraste CSS temporairement :
```css
.btn-secondary {
  background-color: #444 !important; /* Au lieu de #333 */
}
```

**Fix Planned** : v1.0.2 (design system update)

---

## ⚠️ Limitations Techniques

### Backend (FastAPI)

#### Limitation #1 : Single instance (pas de horizontal scaling)
**Impact** : Performance limitée à 1 CPU core pour requests CPU-bound

**Context** :
Architecture actuelle = 1 instance FastAPI + Uvicorn.
Si traffic > 1000 req/min, bottleneck CPU.

**Solution Future** :
- v1.5.0 : Load balancer + multiple FastAPI instances (Docker Swarm ou Kubernetes)
- Ou : Migrate CPU-bound tasks vers Celery workers

**Workaround Actuel** :
- Vertical scaling VPS (upgrade cores)
- Cache Redis agressif (reduce DB load)

---

#### Limitation #2 : PostgreSQL single instance (pas de read replicas)
**Impact** : Toutes queries (read + write) sur 1 DB → bottleneck si traffic élevé

**Context** :
v1.0 utilise PostgreSQL single instance.

**Solution Future** :
- v2.0 : PostgreSQL primary + 2 read replicas
- Route read queries vers replicas (SQLAlchemy routing)

**Workaround Actuel** :
- Cache Redis sur GET endpoints (TTL 5-10min)
- Database indexes optimisés

---

### Frontend (React)

#### Limitation #3 : Bundle size >500KB (gzip)
**Impact** : First paint lent sur 3G (~3-4s)

**Context** :
React 18 + TanStack Query + autres libs = 520KB gzip.

**Solution Future** :
- v1.1 : Code splitting par route (React.lazy)
- Tree shaking agressif (check unused deps)
- Migrate vers Preact si nécessaire (compatibilité 90%)

**Workaround Actuel** :
- Lazy load images (react-lazy-load)
- Defer non-critical JS

---

## 🔧 Workarounds Temporaires

### Workaround #1 : Session timeout trop court (15min)

**Problème** : Users se plaignent de logout fréquent.

**Workaround** :
Augmenter timeout dans `.env` :
```bash
# Backend .env
ACCESS_TOKEN_EXPIRE_MINUTES=30  # Au lieu de 15
```

**Fix Permanent** : v1.0.1 → Rendre configurable par user (setting "Stay logged in")

---

### Workaround #2 : CORS errors en local (frontend port 5173)

**Problème** :
En dev local, si frontend sur `localhost:5173` et backend sur `localhost:8000`, CORS errors.

**Workaround** :
Ajouter `localhost:5173` dans backend CORS origins :
```python
# backend/app/core/config.py
CORS_ORIGINS = [
    "http://localhost:5173",  # Vite dev server
    "http://localhost:3000",  # Alternative
]
```

**Fix Permanent** : v1.0.1 → Auto-detect dev mode (env variable)

---

## 🚨 Security Considerations

### Consideration #1 : Refresh tokens stockés en httpOnly cookies
**Risk Level** : ⚠️ MEDIUM

**Context** :
Refresh tokens dans cookies httpOnly = secure contre XSS, mais vulnérable CSRF.

**Mitigation Actuelle** :
- CSRF tokens sur endpoints critiques
- SameSite=Strict cookies

**Amélioration Future** : v1.2 → Token rotation (refresh token utilisé = invalide + nouveau généré)

---

### Consideration #2 : Rate limiting basé sur IP
**Risk Level** : ⚠️ LOW

**Context** :
Rate limiting actuel utilise IP client.
Problème : Users derrière proxy/NAT partagent IP → faux positifs.

**Mitigation Actuelle** :
- Whiteliste IPs connues (entreprises clientes)
- Rate limit généreux (100 req/min)

**Amélioration Future** : v1.3 → Rate limiting par user_id (authentifié) + IP (non-auth)

---

## 📊 Performance Bottlenecks

### Bottleneck #1 : Database query lente sur /api/users (JOIN multiple)
**Impact** : 500ms p95 (target: <100ms)

**Query Problématique** :
```python
# Slow query (N+1 problem)
users = session.query(User).filter(User.is_active == True).all()
for user in users:
    user.projects  # N queries supplémentaires
```

**Workaround** :
Eager loading SQLAlchemy :
```python
users = session.query(User).options(
    joinedload(User.projects)
).filter(User.is_active == True).all()
```

**Fix Permanent** : v1.1 → Audit toutes queries + indexes

---

### Bottleneck #2 : Frontend re-renders excessifs (Context API)
**Impact** : UI lag sur formulaires complexes

**Root Cause** :
Context API re-render tous consumers même si slice non utilisée.

**Workaround** :
Split contexts :
```typescript
// Au lieu de 1 gros AuthContext
<AuthUserContext>    {/* user data */}
<AuthActionsContext> {/* login, logout */}
```

**Fix Permanent** : v1.2 → Migrate vers Zustand (selective subscriptions)

---

## 🔗 Références

- **Issue Tracker** : [Lien vers GitHub Issues]
- **Security Advisories** : [Lien vers advisories]
- **Performance Monitoring** : [Lien vers Grafana]

---

## 📝 Comment Reporter un Bug

1. **Vérifier Known Issues** (ce fichier)
2. **Chercher dans Issues** : [GitHub Issues](https://github.com/user/repo/issues)
3. **Créer nouveau issue** :
   - Template : `.github/ISSUE_TEMPLATE/bug_report.md`
   - Labels : `bug`, `priority:high/medium/low`
4. **Inclure** :
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots si applicable
   - Environment (OS, browser, version)

---

**Maintenu par** : QA Team | **Review** : À chaque sprint
