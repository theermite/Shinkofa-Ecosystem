# API Reference - [Nom Projet]

> Documentation complète de l'API REST FastAPI.

**Base URL** : `https://api.domain.com` (prod) | `http://localhost:8000` (local)
**Version** : v1
**Format** : JSON
**Auth** : JWT Bearer Token

---

## 🔐 Authentication

### POST /api/auth/login
Login utilisateur et génération tokens JWT.

**Request** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response 200** :
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "User Name",
    "role": "user"
  }
}
```

Refresh token envoyé dans httpOnly cookie.

### POST /api/auth/refresh
Refresh access token avec refresh token cookie.

**Response 200** :
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### POST /api/auth/logout
Logout (invalide refresh token).

**Headers** : `Authorization: Bearer <access_token>`
**Response 204** : No Content

---

## 👤 Users

### GET /api/users/me
Récupérer profil utilisateur connecté.

**Headers** : `Authorization: Bearer <access_token>`

**Response 200** :
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "user",
  "created_at": "2026-01-28T10:00:00Z"
}
```

### PATCH /api/users/me
Mettre à jour profil utilisateur.

**Request** :
```json
{
  "name": "New Name"
}
```

**Response 200** : User object updated

### POST /api/users
Créer nouvel utilisateur (public).

**Request** :
```json
{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "New User"
}
```

**Response 201** : User object + tokens

---

## 📝 [Autres Endpoints]

### GET /api/[resource]
Liste ressources avec pagination.

**Query Params** :
- `skip` (int, default=0) - Offset
- `limit` (int, default=100, max=1000) - Limit
- `sort` (string) - Sort field (ex: `created_at:desc`)

**Response 200** :
```json
{
  "items": [...],
  "total": 150,
  "skip": 0,
  "limit": 100
}
```

### POST /api/[resource]
Créer nouvelle ressource.

### GET /api/[resource]/{id}
Récupérer ressource par ID.

### PATCH /api/[resource]/{id}
Mettre à jour ressource.

### DELETE /api/[resource]/{id}
Supprimer ressource.

---

## 🚨 Codes d'Erreur

| Code | Signification | Exemple |
|------|---------------|---------|
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Token manquant/invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource inexistante |
| 422 | Unprocessable Entity | Pydantic validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Bug serveur |

**Format erreur** :
```json
{
  "detail": "Error message",
  "errors": [...]  // Si validation errors
}
```

---

## 📊 Rate Limiting

- **Authentification** : 5 req/min par IP
- **API générale** : 100 req/min par user
- **Endpoints publics** : 30 req/min par IP

Header response : `X-RateLimit-Remaining: 95`

---

## 🔗 Documentation Interactive

**Swagger UI** : `https://api.domain.com/docs`
**ReDoc** : `https://api.domain.com/redoc`
**OpenAPI Schema** : `https://api.domain.com/openapi.json`

---

**Version** : 1.0 | **Maintenu par** : Backend Team
