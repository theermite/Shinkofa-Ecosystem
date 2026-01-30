# Changelog - [Nom Projet]

> Historique des versions du projet.

**Format** : [Keep a Changelog](https://keepachangelog.com/)
**Versioning** : [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)

---

## [Unreleased]

### À venir
- Feature X (planifiée Q2 2026)
- Intégration API tierce Y

---

## [1.0.0] - YYYY-MM-DD

### 🎉 Premier Release Production

#### Added
- Authentification JWT (access + refresh tokens)
- Gestion utilisateurs (CRUD complet)
- API REST endpoints (/api/auth, /api/users)
- Dashboard utilisateur (profil, settings)
- Documentation API (Swagger UI + ReDoc)
- Tests automatisés (pytest + Vitest, 80% coverage)
- CI/CD pipeline (GitHub Actions)
- Déploiement production (VPS + Docker)

#### Security
- HTTPS obligatoire (Let's Encrypt)
- Rate limiting (100 req/min par user)
- CORS configuré (whitelist origins)
- Password hashing (bcrypt)
- CSRF protection

---

## [0.3.0] - YYYY-MM-DD

### 🚀 Beta Release

#### Added
- Feature [nom feature]
- Endpoint GET /api/[resource]
- Tests intégration pour [feature]

#### Changed
- Refactoring service layer (séparation business logic)
- Migration base de données (Alembic revision XYZ)

#### Fixed
- Bug #123 : [Description]
- Performance : Query N+1 sur endpoint /api/users

---

## [0.2.0] - YYYY-MM-DD

### Alpha Release

#### Added
- Backend FastAPI avec SQLAlchemy
- Frontend React 18 + TypeScript + Vite
- Base de données PostgreSQL
- Cache Redis

#### Changed
- Architecture : Passage de monolithe à API REST

---

## [0.1.0] - YYYY-MM-DD

### 🌱 Initial Commit

#### Added
- Setup projet (structure fichiers)
- Docker Compose configuration
- README.md avec instructions setup

---

## Format Commit Messages

**Convention** : Conventional Commits

```
<type>(scope): <description>

[optional body]

[optional footer]
```

**Types** :
- `feat` : Nouvelle feature
- `fix` : Bug fix
- `docs` : Documentation seule
- `style` : Formatting (pas de changement logique)
- `refactor` : Refactoring (ni feature ni fix)
- `perf` : Performance improvement
- `test` : Ajout/modification tests
- `chore` : Tâches maintenance (deps, config)
- `ci` : CI/CD changes

**Exemples** :
```
feat(auth): add refresh token rotation
fix(users): prevent duplicate email registration
docs(api): update authentication flow diagram
```

---

## Notes de Version (Release Notes)

### Comment créer une release

1. **Update CHANGELOG.md** : Déplacer [Unreleased] vers [X.Y.Z]
2. **Update version** :
   - Backend : `pyproject.toml` ou `__version__`
   - Frontend : `package.json`
3. **Commit** : `chore: bump version to X.Y.Z`
4. **Tag** : `git tag -a vX.Y.Z -m "Release X.Y.Z"`
5. **Push** : `git push origin main --tags`
6. **Deploy** : Suivre [DEPLOY.md](.claude/DEPLOY.md)

---

## Migration Guide

### v0.3.0 → v1.0.0

**Breaking Changes** :
- ⚠️ Endpoint `/api/auth/login` : Response format changé
  - **Avant** : `{token: "..."}`
  - **Après** : `{access_token: "...", token_type: "bearer"}`

**Migration Steps** :
1. Update frontend API client (axios interceptors)
2. Clear localStorage tokens (force re-login)
3. Run database migration : `alembic upgrade head`

---

**Maintenu par** : Dev Team | **Dernière mise à jour** : [DATE]
