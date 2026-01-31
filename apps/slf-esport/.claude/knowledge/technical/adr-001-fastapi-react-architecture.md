---
title: "ADR-001: FastAPI + React Architecture"
category: technical
tags: [architecture, fastapi, react, postgresql, adr]
author: "Jay The Ermite + Claude (TAKUMI)"
created_at: "2026-01-29"
version: "1.0"
sources:
  - "FastAPI Documentation officielle"
  - "React 18 Docs"
  - "12 Factor App Methodology"
related_docs:
  - "ADR-002: PostgreSQL Database Design"
  - "Shinkofa Platform Technical Stack"
---

# ADR-001: FastAPI + React Architecture

> **Décision** : Stack technique Shinkofa Platform = FastAPI (backend) + React 18 (frontend) + PostgreSQL (database)

---

## Contexte

**Projet** : Shinkofa Platform (coaching + tech SaaS)
**Date Décision** : 2025-12-15
**Participants** : Jay, Claude (TAKUMI)

**Problème** :
Choisir stack technique pour plateforme SaaS avec contraintes :
- Time-to-market rapide (MVP en 3 mois)
- Budget limité (Jay solo dev)
- Scalabilité future (100-1000 users horizon 2 ans)
- Maintenance facile (Jay 15h/semaine max)
- Accessibilité universelle (WCAG 2.1 AA)

**Contraintes** :
- Budget hébergement < 30€/mois
- Pas d'équipe (Jay seul)
- Expertise Jay : Python, JavaScript, React
- Performance : < 200ms API, < 2s page load

---

## Options Évaluées

### Option 1 : Django + Django Templates

**Description** : Framework Python fullstack, templates server-side

**Avantages** :
- ✅ Batteries included (admin, auth, ORM out-of-box)
- ✅ Monolithe (déploiement simple)
- ✅ Grande communauté (docs excellentes)
- ✅ Jay connaît Python

**Inconvénients** :
- ❌ UI daté (templates 2010s)
- ❌ SPA complexe (HTMX ou API séparée nécessaire)
- ❌ Overhead (features inutiles pour SaaS simple)
- ❌ Performance API < FastAPI (benchmark 3x plus lent)

**Coût** : Temps dev 4-5 mois (UI custom)

---

### Option 2 : Next.js 14 Fullstack (App Router)

**Description** : React framework fullstack, API routes + SSR

**Avantages** :
- ✅ SPA moderne (React 18)
- ✅ SSR/SSG (SEO excellent)
- ✅ API routes intégrées (pas besoin backend séparé)
- ✅ Vercel deploy gratuit (hobby tier)

**Inconvénients** :
- ❌ JavaScript backend (Jay préfère Python)
- ❌ API routes limitées (pas async workers, jobs complexes)
- ❌ Lock-in Vercel (deployment optimal)
- ❌ Bundle size important (100KB+ initial load)

**Coût** : Temps dev 3 mois, mais JS backend = moins confort Jay

---

### Option 3 : FastAPI + React 18 (SPA) ⭐ CHOISI

**Description** : Backend Python API moderne + Frontend React SPA séparés

**Avantages** :
- ✅ FastAPI ultra-rapide (ASGI async, 2x faster Django)
- ✅ Python backend (confort Jay, même langage scripts)
- ✅ React 18 UI moderne (accessibilité, UX)
- ✅ Séparation backend/frontend (scale indépendant)
- ✅ Type hints Python + TypeScript (safety)
- ✅ OpenAPI auto-généré (documentation gratuite)
- ✅ Async/await native (websockets future, jobs background)

**Inconvénients** :
- ❌ 2 déploiements (frontend + backend)
- ❌ CORS config nécessaire (sécurité à gérer)
- ❌ Pas de SSR React (SEO pages statiques seulement)

**Coût** : Temps dev 3 mois, hébergement 15€/mois (VPS OVH)

---

## Décision

**✅ CHOIX RETENU** : **FastAPI + React 18 (SPA)**

**Justification** :

1. **Performance** : FastAPI = 2-3x plus rapide que Django sur benchmarks API
   - Crucial pour UX (< 200ms latency cible)
   - Async native = handle 1000s connexions simultanées

2. **Confort Dev** : Python backend (langageJay maîtrise)
   - Scripts automation, admin, jobs = même langage
   - Pas context switch Python ↔ JavaScript backend

3. **Scalabilité** : Backend/frontend séparés
   - Scale API indépendamment frontend (load balancing futur)
   - Remplacer frontend sans toucher backend (future mobile app)

4. **Time-to-Market** : 3 mois realistic
   - FastAPI minimal boilerplate
   - React 18 UI rapide (composants réutilisables)

5. **Accessibilité** : React + ARIA = WCAG AA facile
   - Tailwind CSS + headlessui (composants accessibles)

**Trade-offs Acceptés** :
- Pas de SSR React (SEO limité pages statiques) → OK car SaaS app, pas blog
- 2 déploiements (frontend + backend) → OK, automatisé avec CI/CD
- CORS config nécessaire → Documenté, pas complexe

---

## Implémentation

### Architecture

```
┌─────────────────────────────────────────────────┐
│  Frontend (React 18 SPA)                        │
│  - Vite build                                   │
│  - TailwindCSS                                  │
│  - React Router v6                              │
│  - Zustand (state)                              │
│  - React Query (data fetching)                  │
└─────────────────┬───────────────────────────────┘
                  │ HTTPS (CORS)
                  │ JSON API
┌─────────────────▼───────────────────────────────┐
│  Backend (FastAPI)                              │
│  - Python 3.11+                                 │
│  - Pydantic validation                          │
│  - SQLAlchemy ORM                               │
│  - Alembic migrations                           │
│  - JWT auth (httpx)                             │
└─────────────────┬───────────────────────────────┘
                  │ psycopg2
┌─────────────────▼───────────────────────────────┐
│  Database (PostgreSQL 15)                       │
│  - Relational data                              │
│  - JSONB (flexible schemas)                     │
│  - Full-text search                             │
└─────────────────────────────────────────────────┘
```

### Stack Technique

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| **Backend API** | FastAPI | 0.109+ | Performance, async, OpenAPI auto |
| **Frontend UI** | React | 18.2+ | UI moderne, accessibilité, communauté |
| **Database** | PostgreSQL | 15+ | Fiabilité, JSONB, full-text search |
| **ORM** | SQLAlchemy | 2.0+ | Async support, migrations (Alembic) |
| **Auth** | JWT | N/A | Stateless, scalable, mobile-friendly |
| **Validation** | Pydantic | 2.5+ | Type safety, auto docs, performance |
| **State Frontend** | Zustand | 4.4+ | Simple, performant, DevTools |
| **Data Fetching** | React Query | 5.0+ | Cache, optimistic updates, devtools |
| **Styling** | Tailwind CSS | 3.4+ | Utility-first, bundle optimal, accessibilité |
| **Build Frontend** | Vite | 5.0+ | Fast HMR, build optimisé, ESM native |

### Code Exemple Backend

```python
# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from sqlalchemy.ext.asyncio import AsyncSession

app = FastAPI(title="Shinkofa API", version="1.0.0")

# CORS config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://shinkofa.com", "https://app.shinkofa.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["Content-Type", "Authorization"],
)

# Pydantic models
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str

# Endpoint
@app.post("/users", response_model=UserResponse, status_code=201)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    # Validation auto par Pydantic
    # Type hints pour IDE autocomplete
    existing_user = await db.execute(
        select(User).where(User.email == user.email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(400, "Email already registered")

    new_user = User(**user.dict(exclude={"password"}))
    new_user.hashed_password = hash_password(user.password)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user
```

### Code Exemple Frontend

```tsx
// UserForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { api } from './api';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  full_name: z.string().min(2, 'Required'),
});

type FormData = z.infer<typeof schema>;

export function UserForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.createUser(data),
    onSuccess: () => {
      alert('User created!');
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <input
        {...register('email')}
        type="email"
        aria-label="Email address"
        className="px-4 py-2 border rounded"
      />
      {errors.email && <span role="alert">{errors.email.message}</span>}

      <button type="submit" disabled={mutation.isPending}>
        {mutation.isPending ? 'Creating...' : 'Create User'}
      </button>
    </form>
  );
}
```

---

## Migration Path

**Phase 1 : Setup** (Semaine 1)
- [x] Init FastAPI projet (poetry, pyproject.toml)
- [x] Init React projet (Vite, TypeScript)
- [x] PostgreSQL setup (Docker local, Alembic migrations)
- [x] CI/CD GitHub Actions (lint, test, build)

**Phase 2 : Core Features** (Semaines 2-8)
- [x] Auth (JWT, refresh tokens, password reset)
- [x] User CRUD (registration, profile, update)
- [x] Coaching sessions booking
- [x] Dashboard UI (React components)

**Phase 3 : Deploy** (Semaine 9-10)
- [x] VPS OVH config (Nginx reverse proxy)
- [x] SSL certificates (Let's Encrypt)
- [x] Frontend deploy (Nginx static)
- [x] Backend deploy (systemd service)

**Phase 4 : Monitoring** (Semaine 11-12)
- [ ] Sentry error tracking
- [ ] Logs structured (JSON)
- [ ] Performance monitoring (New Relic free tier)

---

## Métriques Success

| Métrique | Cible | Actuel (2026-01-29) | Status |
|----------|-------|---------------------|--------|
| **API Latency p50** | < 100ms | 45ms | ✅ |
| **API Latency p99** | < 500ms | 180ms | ✅ |
| **Page Load (LCP)** | < 2.5s | 1.8s | ✅ |
| **Bundle Size** | < 300KB | 245KB gzipped | ✅ |
| **Lighthouse Score** | > 90 | 94 | ✅ |
| **WCAG Compliance** | AA | AA | ✅ |

---

## Lessons Learned

**Ce qui a marché** :
- ✅ FastAPI = excellent choix (dev rapide, performance)
- ✅ Pydantic validation = zéro bug input malformé
- ✅ React Query = cache automatique, UX fluide
- ✅ Async FastAPI = handle 1000 users concurrent tests OK

**Ce qui aurait pu être mieux** :
- ⚠️ SSR React manquant = SEO blog pages limité
  → Solution future: Astro pour blog statique séparé
- ⚠️ CORS config initial complexe (dev vs prod)
  → Documenté dans DEPLOYMENT.md maintenant
- ⚠️ Alembic migrations parfois confusing
  → Toujours review auto-generated migrations

**Pour la prochaine fois** :
- 💡 Considérer Astro + FastAPI (meilleur SEO)
- 💡 Setup Docker Compose dès jour 1 (pas semaine 3)
- 💡 E2E tests Playwright plus tôt (pas après MVP)

---

## Ressources

- **FastAPI Docs** : https://fastapi.tiangolo.com/
- **React 18 Docs** : https://react.dev/
- **Pydantic V2** : https://docs.pydantic.dev/2.5/
- **React Query** : https://tanstack.com/query/latest
- **12 Factor App** : https://12factor.net/
- **Benchmark FastAPI vs Django** : https://www.techempower.com/benchmarks/

---

## Revue & Updates

| Date | Auteur | Changement |
|------|--------|------------|
| 2025-12-15 | Jay + Claude | Décision initiale FastAPI + React |
| 2026-01-15 | Jay | Ajout métriques success (post-MVP) |
| 2026-01-29 | Claude | Migration vers ADR format standard |

---

**Dernière mise à jour** : 2026-01-29
**Keywords** : #architecture #fastapi #react #postgresql #adr #decision
**Status** : ✅ Implémenté et validé en production
