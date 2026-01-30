# Architecture - [Nom Projet FastAPI + React]

> Vue d'ensemble de l'architecture système fullstack.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🏗️ Vue d'Ensemble

### Type de Projet
**Fullstack Web Application** (SPA + API REST)

### Stack Technique

| Composant | Technologie | Version | Raison |
|-----------|-------------|---------|--------|
| **Frontend** | React 18 + TypeScript + Vite | 18.x | Performance, DX moderne, type safety |
| **Backend** | FastAPI + Python | 3.11+ / 0.109+ | Performance async, OpenAPI auto, validation Pydantic |
| **Base de données** | PostgreSQL | 15+ | Relations complexes, ACID, maturité |
| **ORM** | SQLAlchemy + Alembic | 2.x / 1.13+ | Async support, migrations robustes |
| **Cache** | Redis | 7+ | Session storage, rate limiting, caching |
| **State Management** | React Context + TanStack Query | - | Simple, cache-aware, server state sync |

---

## 📐 Architecture Système

### Diagramme Haut Niveau

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   FastAPI   │────▶│ PostgreSQL  │
│ (React SPA) │     │  Backend    │     │   Database  │
└─────────────┘     └───────┬─────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │    Redis    │
                    │   Cache     │
                    └─────────────┘
```

### Description des Composants

#### Frontend (React + TypeScript + Vite)
- **Rôle** : Interface utilisateur, interactions client
- **Responsabilités** :
  - Rendu UI avec composants React
  - Gestion état (Context API pour global, useState local)
  - Validation formulaires côté client (react-hook-form + zod)
  - Communication API (axios + TanStack Query pour cache)
  - Routing (React Router v6)
- **Patterns** :
  - Atomic Design (atoms, molecules, organisms, templates, pages)
  - Custom Hooks pour logique réutilisable
  - Context API pour auth, theme, language
  - TanStack Query pour server state (cache, refetch, optimistic updates)

#### Backend API (FastAPI + Python)
- **Rôle** : Logique métier, orchestration, API REST
- **Responsabilités** :
  - Endpoints REST auto-documentés (OpenAPI/Swagger)
  - Validation données (Pydantic schemas)
  - Authentification JWT (access + refresh tokens)
  - Autorisation (dépendances FastAPI)
  - Business logic (services layer)
  - Communication DB (SQLAlchemy async)
  - Background tasks (FastAPI BackgroundTasks)
- **Patterns** :
  - Repository Pattern (DAL)
  - Service Layer (business logic)
  - Dependency Injection (FastAPI dependencies)
  - Pydantic schemas pour validation

#### Base de Données (PostgreSQL + Redis)
- **PostgreSQL** :
  - Rôle : Persistence données relationnelles
  - Schéma : Voir [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
  - Migrations : Alembic (auto-generate depuis models SQLAlchemy)
- **Redis** :
  - Sessions utilisateur
  - Rate limiting
  - Cache API responses
  - Task queue (optionnel : Celery)

---

## 🔐 Sécurité

### Authentification
- **Méthode** : JWT (JSON Web Tokens)
- **Stockage** :
  - Access token : localStorage (courte durée 15-30 min)
  - Refresh token : httpOnly cookie (longue durée 7-30 jours)
- **Flow** :
  1. Login → API génère access + refresh tokens
  2. Client stocke access (localStorage), refresh (cookie httpOnly)
  3. Requêtes avec `Authorization: Bearer <access_token>`
  4. Si access expiré → Refresh endpoint avec cookie → nouveaux tokens

### Autorisation
- **Modèle** : RBAC (Role-Based Access Control)
- **Rôles** :
  - `admin` - Accès complet (CRUD users, settings, etc.)
  - `user` - Accès standard (CRUD own resources)
  - `guest` - Lecture seule (public endpoints)
- **Implémentation** : FastAPI dependencies + decorators

### Protection
- ✅ HTTPS obligatoire en production (Let's Encrypt)
- ✅ CORS configuré (origins whitelist)
- ✅ CSRF protection (tokens pour forms)
- ✅ Rate limiting API (Redis + slowapi)
- ✅ Input validation (Pydantic auto + frontend zod)
- ✅ SQL injection prevention (SQLAlchemy ORM)
- ✅ XSS prevention (React auto-escaping)
- ✅ Password hashing (bcrypt)

---

## 🚀 Déploiement

### Environnements

| Env | Frontend URL | Backend URL | Purpose | Deploy |
|-----|-------------|-------------|---------|--------|
| **LOCAL** | localhost:5173 | localhost:8000 | Développement | Manuel (docker-compose) |
| **STAGING** | staging-app.domain.com | staging-api.domain.com | Tests pré-prod | Auto (push develop) |
| **PRODUCTION** | app.domain.com | api.domain.com | Production | Manuel (tag release) |

### Architecture Déploiement (Production)

```
┌─────────────────────────────────────────┐
│  Nginx (Reverse Proxy + SSL)            │
│  Port 80/443                             │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼─────┐      ┌───▼──────┐
│Frontend │      │ Backend  │
│(Static) │      │ FastAPI  │
│Nginx    │      │ :8000    │
└─────────┘      └────┬─────┘
                      │
             ┌────────┴────────┐
             │                 │
        ┌────▼─────┐      ┌───▼────┐
        │PostgreSQL│      │ Redis  │
        │  :5432   │      │ :6379  │
        └──────────┘      └────────┘
```

### Container Strategy (Docker)

```yaml
services:
  frontend:    # Nginx serving React build
  backend:     # FastAPI uvicorn
  db:          # PostgreSQL 15
  redis:       # Redis 7
  nginx:       # Reverse proxy (prod only)
```

**Voir `.claude/docker/` pour configuration complète.**

---

## 📊 Scalabilité

### Stratégie Actuelle
- **Vertical scaling** : Augmenter ressources serveur
- **Monolithic** : Frontend + Backend séparés mais déployés ensemble

### Limites Connues
- Backend monolithe (1 instance FastAPI)
- DB single instance (pas de read replicas)
- Redis single instance (pas de cluster)

### Plan Futur (si besoin)
1. **Horizontal scaling backend** : Load balancer + multiple FastAPI instances
2. **Database read replicas** : PostgreSQL primary + replicas read-only
3. **CDN frontend** : Cloudflare/CloudFront pour assets statiques
4. **Redis cluster** : HA cache avec failover

---

## 🔄 Flux de Données

### Exemple : Création Utilisateur

```
1. Frontend : Form submission (react-hook-form + zod validation)
   ↓
2. Frontend : POST /api/users (axios + TanStack Query mutation)
   ↓
3. Backend : Pydantic schema validation
   ↓
4. Backend : Hash password (bcrypt)
   ↓
5. Backend : SQLAlchemy → PostgreSQL INSERT
   ↓
6. Backend : Background task → Send confirmation email
   ↓
7. Backend : Return 201 Created + JWT tokens
   ↓
8. Frontend : Store tokens, redirect to dashboard
```

### Exemple : Authentication Flow

```
1. Frontend : POST /api/auth/login {email, password}
   ↓
2. Backend : Validate credentials (bcrypt compare)
   ↓
3. Backend : Generate JWT access (15min) + refresh (7d)
   ↓
4. Backend : Return {access_token, user} + httpOnly cookie (refresh)
   ↓
5. Frontend : Store access_token in localStorage
   ↓
6. Frontend : All requests with Authorization: Bearer <access>
   ↓
7. If 401 → POST /api/auth/refresh (with cookie)
   ↓
8. Backend : Validate refresh token → new access token
```

---

## 🗂️ Structure Fichiers

### Backend (FastAPI)

```
backend/
├── app/
│   ├── api/              # Endpoints (routes)
│   │   ├── v1/
│   │   │   ├── auth.py
│   │   │   ├── users.py
│   │   │   └── ...
│   │   └── deps.py       # Dependencies (auth, db)
│   ├── core/             # Config, security, settings
│   │   ├── config.py
│   │   ├── security.py
│   │   └── deps.py
│   ├── models/           # SQLAlchemy models
│   │   ├── user.py
│   │   └── ...
│   ├── schemas/          # Pydantic schemas
│   │   ├── user.py
│   │   └── ...
│   ├── services/         # Business logic
│   │   ├── user_service.py
│   │   └── ...
│   ├── db/               # Database
│   │   ├── base.py
│   │   └── session.py
│   └── main.py           # FastAPI app
├── alembic/              # Migrations
├── tests/                # Tests pytest
└── requirements.txt
```

### Frontend (React)

```
frontend/
├── src/
│   ├── api/              # API client (axios)
│   ├── components/       # Composants React
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   └── templates/
│   ├── pages/            # Pages (routes)
│   ├── hooks/            # Custom hooks
│   ├── contexts/         # Context API (auth, theme)
│   ├── utils/            # Utilitaires
│   ├── types/            # TypeScript types
│   ├── App.tsx
│   └── main.tsx
├── public/               # Assets statiques
└── package.json
```

---

## 📝 Décisions Architecture (ADR)

### ADR-001 : FastAPI vs Django/Flask
**Date** : [DATE]
**Décision** : FastAPI
**Raison** : Performance async, OpenAPI auto, validation Pydantic, modern DX
**Alternatives** : Django (batteries-included mais sync), Flask (trop minimal)
**Conséquences** : Courbe apprentissage async Python, écosystème récent

### ADR-002 : React Context + TanStack Query vs Redux
**Date** : [DATE]
**Décision** : Context pour global state, TanStack Query pour server state
**Raison** : Simplicité, moins de boilerplate, cache-aware
**Alternatives** : Redux (overkill pour projet), Zustand (pas besoin)
**Conséquences** : Context API peut re-render si mal utilisé (optimisations nécessaires)

### ADR-003 : JWT vs Sessions
**Date** : [DATE]
**Décision** : JWT (access + refresh tokens)
**Raison** : Stateless, scalable, mobile-friendly
**Alternatives** : Sessions serveur (moins scalable, sticky sessions)
**Conséquences** : Refresh token rotation complexe, logout immédiat impossible

---

## 🔗 Voir Aussi

- [API_REFERENCE.md](API_REFERENCE.md) - Documentation API complète
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Schéma PostgreSQL
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - Standards Python + TypeScript
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Tests pytest + Vitest

---

**Maintenu par** : [Équipe]
**Revue recommandée** : À chaque changement architecture majeur
