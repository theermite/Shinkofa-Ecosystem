# API Reference - [Nom Projet]

> Documentation complète de l'API REST/GraphQL du projet.

**Base URL** : `https://api.domain.com/v1` (production)
**Base URL** : `http://localhost:8000/v1` (développement)
**Dernière mise à jour** : [DATE]
**Version API** : v1

---

## 🔐 Authentication

Toutes les routes nécessitent authentication sauf `/auth/*`.

### Headers Requis

```http
Authorization: Bearer {access_token}
Content-Type: application/json
```

### Obtenir un Token

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900
}
```

---

## 📚 Endpoints

### Authentication

#### POST /auth/register
Créer un nouveau compte utilisateur.

**Request** :
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
```

**Response** : `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-01-26T18:00:00Z"
}
```

**Errors** :
- `400` - Email déjà utilisé
- `422` - Validation failed

---

#### POST /auth/login
Authentifier un utilisateur.

**Request** :
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** : `200 OK`
```json
{
  "access_token": "...",
  "refresh_token": "...",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Errors** :
- `401` - Credentials invalides
- `422` - Validation failed

---

#### POST /auth/refresh
Rafraîchir l'access token.

**Request** :
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** : `200 OK`
```json
{
  "access_token": "new_access_token",
  "token_type": "bearer",
  "expires_in": 900
}
```

**Errors** :
- `401` - Refresh token invalide ou expiré

---

#### POST /auth/logout
Déconnecter l'utilisateur (invalide tokens).

**Request** : Aucun body

**Response** : `204 No Content`

---

### Users

#### GET /users/me
Obtenir profil utilisateur connecté.

**Response** : `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "created_at": "2026-01-26T18:00:00Z",
  "updated_at": "2026-01-26T18:00:00Z"
}
```

---

#### PUT /users/me
Mettre à jour profil utilisateur.

**Request** :
```json
{
  "name": "Jane Doe",
  "bio": "Developer & Designer"
}
```

**Response** : `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "Jane Doe",
  "bio": "Developer & Designer",
  "updated_at": "2026-01-26T19:00:00Z"
}
```

**Errors** :
- `422` - Validation failed

---

#### DELETE /users/me
Supprimer compte utilisateur.

**Response** : `204 No Content`

---

### [Autre Resource]

#### GET /resource
Lister toutes les ressources (avec pagination).

**Query Parameters** :
- `page` (int, default: 1) - Numéro de page
- `per_page` (int, default: 20, max: 100) - Items par page
- `sort` (string, default: "created_at") - Champ tri
- `order` (string, default: "desc") - Ordre tri (asc/desc)
- `search` (string) - Recherche fulltext

**Response** : `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Resource 1",
      "created_at": "2026-01-26T18:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "per_page": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

---

#### POST /resource
Créer une nouvelle ressource.

**Request** :
```json
{
  "title": "New Resource",
  "description": "Description here"
}
```

**Response** : `201 Created`
```json
{
  "id": "uuid",
  "title": "New Resource",
  "description": "Description here",
  "created_at": "2026-01-26T18:00:00Z"
}
```

---

#### GET /resource/:id
Obtenir une ressource par ID.

**Response** : `200 OK`
```json
{
  "id": "uuid",
  "title": "Resource 1",
  "description": "Full description",
  "created_at": "2026-01-26T18:00:00Z",
  "updated_at": "2026-01-26T18:00:00Z"
}
```

**Errors** :
- `404` - Resource not found

---

#### PUT /resource/:id
Mettre à jour une ressource.

**Request** :
```json
{
  "title": "Updated Title"
}
```

**Response** : `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "updated_at": "2026-01-26T19:00:00Z"
}
```

**Errors** :
- `404` - Resource not found
- `422` - Validation failed

---

#### DELETE /resource/:id
Supprimer une ressource.

**Response** : `204 No Content`

**Errors** :
- `404` - Resource not found

---

## 🚨 Error Handling

Tous les endpoints peuvent retourner les erreurs suivantes :

### Error Response Format

```json
{
  "error": {
    "code": "error_code",
    "message": "Human readable message",
    "details": {
      "field": "Specific error details"
    }
  }
}
```

### Status Codes

| Code | Signification | Utilisation |
|------|---------------|-------------|
| `200` | OK | Requête réussie |
| `201` | Created | Ressource créée |
| `204` | No Content | Suppression réussie |
| `400` | Bad Request | Requête mal formée |
| `401` | Unauthorized | Authentication requise |
| `403` | Forbidden | Pas de permissions |
| `404` | Not Found | Ressource introuvable |
| `422` | Unprocessable Entity | Validation échouée |
| `429` | Too Many Requests | Rate limit dépassé |
| `500` | Internal Server Error | Erreur serveur |

---

## 🔄 Pagination

Endpoints listant des ressources supportent la pagination.

**Request** :
```http
GET /resource?page=2&per_page=50
```

**Response Headers** :
```http
X-Total-Count: 150
X-Page: 2
X-Per-Page: 50
X-Total-Pages: 3
Link: </resource?page=1>; rel="first", </resource?page=3>; rel="last"
```

---

## 🔍 Filtering & Sorting

### Filtering

```http
GET /resource?status=active&category=tech
```

### Sorting

```http
GET /resource?sort=created_at&order=desc
```

### Search

```http
GET /resource?search=keyword
```

---

## ⚡ Rate Limiting

| Endpoint | Limite | Window |
|----------|--------|--------|
| `/auth/login` | 5 requêtes | 15 min |
| Autres auth endpoints | 10 requêtes | 15 min |
| Endpoints CRUD | 100 requêtes | 1 min |

**Headers Rate Limit** :
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000
```

**Response 429** :
```json
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "Too many requests. Retry after 60 seconds."
  }
}
```

---

## 🧪 Testing

### Postman Collection
[Lien vers collection Postman]

### Exemple cURL

```bash
# Login
curl -X POST https://api.domain.com/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"pass123"}'

# Get profile
curl https://api.domain.com/v1/users/me \
  -H "Authorization: Bearer {token}"
```

---

## 📝 Changelog API

### v1.1.0 (2026-02-01)
- Ajout endpoint `/resource`
- Rate limiting implémenté

### v1.0.0 (2026-01-15)
- Version initiale
- Endpoints authentication & users

---

## 🔗 Voir Aussi

- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture système
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Tests API

---

**Maintenu par** : [Équipe]
**Support** : api-support@domain.com
