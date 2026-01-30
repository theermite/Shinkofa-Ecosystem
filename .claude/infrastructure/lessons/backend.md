# Lessons Learned - Backend & API

> Leçons apprises liées au backend, API, serveurs, architecture.

---

## 📊 Statistiques

**Leçons documentées** : 5
**Dernière mise à jour** : 2026-01-29

---

## Leçons

### 1. Pydantic Validation vs Manual Validation

**Contexte** : FastAPI endpoints avec validation données input

**Problème** :
```python
# ❌ Manual validation (verbose, error-prone)
@app.post("/users")
async def create_user(data: dict):
    if "email" not in data:
        raise HTTPException(400, "Email required")
    if not re.match(r"^[\w\.-]+@[\w\.-]+\.\w+$", data["email"]):
        raise HTTPException(400, "Invalid email")
    if "age" not in data or not isinstance(data["age"], int):
        raise HTTPException(400, "Age must be integer")
    # 10 more lines of validation...
```

**Solution** :
```python
# ✅ Pydantic model (automatic, type-safe)
from pydantic import BaseModel, EmailStr, Field

class UserCreate(BaseModel):
    email: EmailStr
    age: int = Field(ge=18, le=120)
    username: str = Field(min_length=3, max_length=50)

@app.post("/users")
async def create_user(data: UserCreate):
    # Validation déjà faite par Pydantic
    user = await db.create_user(data.dict())
    return user
```

**Impact** :
- ✅ Validation automatique avant fonction
- ✅ Documentation OpenAPI auto-générée
- ✅ Type hints pour IDE autocomplete
- ✅ Moins de code, moins d'erreurs

**Catégorie** : Best Practice
**Tags** : fastapi, pydantic, validation

---

### 2. Blocking Operations in Async Endpoints

**Contexte** : FastAPI avec async/await, appels externes

**Problème** :
```python
# ❌ Blocking dans async (bloque event loop)
import requests
import time

@app.get("/data")
async def get_data():
    response = requests.get("https://api.example.com/data")  # BLOQUE
    time.sleep(2)  # BLOQUE
    return response.json()
```

**Symptômes** :
- 🐌 Toutes les requêtes attendent (event loop bloqué)
- 🐌 1000 req/s → 10 req/s
- 💥 Timeout sur autres endpoints

**Solution** :
```python
# ✅ Non-blocking avec httpx + asyncio
import httpx
import asyncio

@app.get("/data")
async def get_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
    await asyncio.sleep(2)  # Non-blocking
    return response.json()
```

**Impact** :
- ✅ Event loop libre pendant I/O
- ✅ Concurrent requests OK
- ✅ Performance x100 sur I/O-bound tasks

**Catégorie** : Bug Fix
**Tags** : fastapi, async, performance, httpx

---

### 3. JWT Refresh Token Rotation

**Contexte** : API avec authentification JWT

**Problème** :
```python
# ❌ Refresh token statique (risque sécurité)
@app.post("/refresh")
async def refresh_token(refresh_token: str):
    payload = decode_token(refresh_token)
    # Même refresh token réutilisable indéfiniment
    new_access_token = create_access_token(payload["sub"])
    return {"access_token": new_access_token}
```

**Risque** :
- 🔓 Si refresh token volé → accès permanent
- 🔓 Pas de révocation possible

**Solution** :
```python
# ✅ Token rotation (nouveau refresh à chaque usage)
@app.post("/refresh")
async def refresh_token(refresh_token: str):
    payload = decode_token(refresh_token)

    # Blacklist ancien refresh token
    await add_to_blacklist(refresh_token)

    # Générer NOUVEAU refresh token
    new_access_token = create_access_token(payload["sub"])
    new_refresh_token = create_refresh_token(payload["sub"])

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token  # ⭐ Nouveau
    }
```

**Impact** :
- ✅ Token volé inutile après 1 usage
- ✅ Détection tentatives multiples
- ✅ OWASP A02:2021 compliant

**Catégorie** : Security
**Tags** : jwt, auth, security, owasp

---

### 4. API Pagination avec Default Limits

**Contexte** : Endpoint retournant listes (users, posts, etc.)

**Problème** :
```python
# ❌ Pas de limite (retourne TOUS les rows)
@app.get("/users")
async def list_users():
    users = await db.query("SELECT * FROM users")
    return users  # 100,000 users → 50MB response
```

**Symptômes** :
- 💥 Timeout sur grandes tables
- 🐌 Mémoire saturée
- 💸 Bande passante gaspillée

**Solution** :
```python
# ✅ Pagination avec limits
from fastapi import Query

@app.get("/users")
async def list_users(
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=50, ge=1, le=100)  # Max 100
):
    users = await db.query(
        "SELECT * FROM users OFFSET $1 LIMIT $2",
        skip, limit
    )
    total = await db.query("SELECT COUNT(*) FROM users")
    return {
        "items": users,
        "total": total,
        "skip": skip,
        "limit": limit
    }
```

**Impact** :
- ✅ Réponses rapides (<1s)
- ✅ Mémoire contrôlée
- ✅ UX avec pagination frontend

**Catégorie** : Performance
**Tags** : api-design, pagination, performance

---

## 💡 Patterns Communs

**Validation** :
- Toujours utiliser Pydantic models dans FastAPI
- Validation côté backend + frontend (défense en profondeur)

**Async** :
- `httpx.AsyncClient` pour HTTP requests
- `asyncio.sleep()` au lieu de `time.sleep()`
- Vérifier librairies async-compatible

**Sécurité** :
- JWT rotation sur refresh
- Blacklist tokens révoqués (Redis TTL = token expiry)
- Rate limiting sur endpoints sensibles

**Performance** :
- Pagination par défaut (limit ≤ 100)
- Index DB sur colonnes filtrées (WHERE, ORDER BY)
- Cache Redis pour queries lourdes

---

## 🔗 Voir Aussi

- [auth.md](auth.md) - Authentication backend
- [database.md](database.md) - Base de données
- [deploy.md](deploy.md) - Déploiement API

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
