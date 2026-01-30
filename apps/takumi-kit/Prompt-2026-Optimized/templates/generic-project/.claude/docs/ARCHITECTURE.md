# Architecture - [Nom Projet]

> Vue d'ensemble de l'architecture système du projet.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🏗️ Vue d'Ensemble

### Type de Projet
[Web App / Desktop App / API / CLI / Library]

### Stack Technique

| Composant | Technologie | Version | Raison |
|-----------|-------------|---------|--------|
| **Frontend** | [React / Next.js / Vue] | [version] | [pourquoi ce choix] |
| **Backend** | [FastAPI / Express / Django] | [version] | [pourquoi ce choix] |
| **Base de données** | [PostgreSQL / MySQL / MongoDB] | [version] | [pourquoi ce choix] |
| **Cache** | [Redis / Memcached] | [version] | [pourquoi ce choix] |
| **Queue** | [Celery / Bull / RabbitMQ] | [version] | [pourquoi ce choix] |

---

## 📐 Architecture Système

### Diagramme Haut Niveau

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│  (Browser)  │     │  (Backend)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │    Cache    │
                    │   (Redis)   │
                    └─────────────┘
```

### Description des Composants

#### Frontend
- **Rôle** : Interface utilisateur, interactions
- **Responsabilités** :
  - Rendu UI
  - Gestion état (Redux/Context)
  - Validation formulaires côté client
  - Communication API (axios/fetch)
- **Patterns** :
  - [Container/Presentational]
  - [Custom Hooks]
  - [Context for global state]

#### Backend API
- **Rôle** : Logique métier, orchestration
- **Responsabilités** :
  - Endpoints REST/GraphQL
  - Validation données
  - Authentification/Autorisation
  - Business logic
  - Communication DB
- **Patterns** :
  - [Repository Pattern]
  - [Service Layer]
  - [Dependency Injection]

#### Base de Données
- **Rôle** : Persistence données
- **Schéma** : Voir [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
- **Stratégie migrations** : [Alembic / Prisma / TypeORM]

---

## 🔐 Sécurité

### Authentification
- **Méthode** : [JWT / Sessions / OAuth]
- **Stockage tokens** : [httpOnly cookies / localStorage]
- **Expiration** :
  - Access token : [15-30 min]
  - Refresh token : [7-30 jours]

### Autorisation
- **Modèle** : [RBAC / ABAC / ACL]
- **Rôles** :
  - `admin` - Accès complet
  - `user` - Accès standard
  - `guest` - Accès limité

### Protection
- ✅ HTTPS obligatoire en production
- ✅ CSRF protection (tokens)
- ✅ Rate limiting API
- ✅ Input validation/sanitization
- ✅ SQL injection prevention (ORM)
- ✅ XSS prevention (output encoding)

---

## 🚀 Déploiement

### Environnements

| Env | URL | Purpose | Deploy |
|-----|-----|---------|--------|
| **LOCAL** | localhost:[PORT] | Développement | Manuel |
| **STAGING** | staging.domain.com | Tests pré-prod | Auto (git push) |
| **PRODUCTION** | app.domain.com | Production | Manuel (tag) |

### Architecture Déploiement

```
┌─────────────────────────────────────────┐
│  Nginx (Reverse Proxy + SSL)            │
│  Port 80/443                             │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│ App 1  │      │ App 2   │  (Load balanced)
│ :8000  │      │ :8001   │
└───┬────┘      └────┬────┘
    │                │
    └────────┬───────┘
             ▼
    ┌─────────────┐
    │  Database   │
    │  :5432      │
    └─────────────┘
```

### Container Strategy (Docker)

```yaml
services:
  app:      # Application principale
  db:       # Base de données
  redis:    # Cache
  nginx:    # Reverse proxy
```

---

## 📊 Scalabilité

### Stratégie Actuelle
- [Vertical scaling / Horizontal scaling]
- [Monolithic / Microservices]

### Limites Connues
- [Limite 1] : [description]
- [Limite 2] : [description]

### Plan Futur
1. [Amélioration 1]
2. [Amélioration 2]

---

## 🔄 Flux de Données

### Exemple : Création Utilisateur

```
1. Client POST /api/users
   ↓
2. API valide données
   ↓
3. API hash password
   ↓
4. API → DB: INSERT user
   ↓
5. API envoie email confirmation
   ↓
6. API → Client: 201 Created + token
```

### Exemple : Authentication Flow

```
1. Client POST /api/auth/login {email, password}
   ↓
2. API vérifie credentials
   ↓
3. API génère JWT access + refresh tokens
   ↓
4. API → Client: tokens (httpOnly cookies)
   ↓
5. Client stocke tokens
   ↓
6. Client fait requêtes avec access token
   ↓
7. Si access token expire → refresh
```

---

## 🗂️ Structure Fichiers

```
project/
├── src/
│   ├── api/            # Endpoints API
│   ├── core/           # Business logic
│   ├── models/         # Data models
│   ├── schemas/        # Validation schemas
│   ├── services/       # Services layer
│   └── utils/          # Utilitaires
├── tests/              # Tests unitaires
├── migrations/         # Migrations DB
├── .claude/            # Config Claude Code
└── docker-compose.yml  # Config Docker
```

---

## 📝 Décisions Architecture (ADR)

### ADR-001 : Choix PostgreSQL vs MongoDB
**Date** : [DATE]
**Décision** : PostgreSQL
**Raison** : Relations complexes, transactions ACID, maturité
**Alternatives considérées** : MongoDB (flexible mais moins de garanties)
**Conséquences** : Schema rigide mais data integrity garantie

### ADR-002 : JWT vs Sessions
**Date** : [DATE]
**Décision** : JWT avec refresh tokens
**Raison** : Stateless, scalable, mobile-friendly
**Alternatives** : Sessions serveur (moins scalable)
**Conséquences** : Gestion refresh tokens complexe mais scalabilité

---

## 🔗 Voir Aussi

- [API_REFERENCE.md](API_REFERENCE.md) - Documentation API complète
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Schéma base de données
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - Standards code

---

**Maintenu par** : [Équipe]
**Revue recommandée** : À chaque changement architecture majeur
