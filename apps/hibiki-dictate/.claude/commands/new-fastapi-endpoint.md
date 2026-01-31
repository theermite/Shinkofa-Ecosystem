---
description: Scaffold un endpoint FastAPI CRUD complet avec modèles Pydantic, auth JWT et tests
---

# Nouveau Endpoint FastAPI

Génère un endpoint FastAPI production-ready CRUD complet avec :

**Arguments** : `<ResourceName>` (PascalCase, singulier)

**Fichiers générés** :
- `routes/<resource_name>.py` : Endpoints CRUD complets
- `models/<resource_name>.py` : Modèles Pydantic avec validation
- `schemas/<resource_name>.py` : Schémas request/response
- `crud/<resource_name>.py` : Logique CRUD database
- `tests/test_<resource_name>.py` : Tests pytest + httpx

**Endpoints créés** :
- `GET /api/<resources>/` : Liste avec pagination
- `GET /api/<resources>/{id}` : Récupération item unique
- `POST /api/<resources>/` : Création (auth required)
- `PUT /api/<resources>/{id}` : Mise à jour complète (auth required)
- `PATCH /api/<resources>/{id}` : Mise à jour partielle (auth required)
- `DELETE /api/<resources>/{id}` : Suppression (auth required)

**Template inclus** :
- Modèles Pydantic validation stricte (Field, EmailStr, etc.)
- Authentification JWT (Depends security)
- Authorization par rôles (admin/user/viewer)
- Error handling complet (HTTPException)
- Logging détaillé (info, warning, error)
- Pagination (skip, limit)
- Parameterized queries SQL injection prevention
- Documentation OpenAPI auto-générée
- Async/await non-blocking

**Standards qualité** :
- Type hints complets
- Docstrings Google style
- Tests coverage ≥ 80%
- Security (JWT, input validation, parameterized queries)
- Performance (async, caching si pertinent)

**Exemple utilisation** :
```bash
/new-fastapi-endpoint User
```

Génère endpoints :
- `GET /api/users/`
- `GET /api/users/{id}`
- `POST /api/users/`
- etc.

**Référence template** : `.claude/templates/fastapi-endpoint-template.py`
