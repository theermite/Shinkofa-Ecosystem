# Lessons Learned - Configuration

> Leçons apprises liées à la configuration, environnements, secrets.

---

## 📊 Statistiques

**Leçons documentées** : 4
**Dernière mise à jour** : 2026-01-29

---

## Leçons

### 1. Environment Variables - Secrets JAMAIS en .env Committé

**Contexte** : Configuration application avec credentials

**Problème** :
```bash
# ❌ .env committé dans Git (DANGER)
DATABASE_URL=postgresql://user:password123@localhost/db
JWT_SECRET=super-secret-key-do-not-share
STRIPE_SECRET_KEY=sk_live_51abc123...

# git add .env
# git commit -m "Add config"
# → Credentials exposés publiquement sur GitHub
```

**Risque** :
- 🔓 Credentials dans historique Git (même après suppression)
- 🔓 Bots GitHub scannent commits → credential harvesting
- 💥 Database compromise, unauthorized access

**Solution** :
```bash
# ✅ .env dans .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore

# ✅ .env.example pour documentation (sans valeurs)
DATABASE_URL=postgresql://user:password@localhost/db
JWT_SECRET=change-me-in-production
STRIPE_SECRET_KEY=sk_test_...

# ✅ Secrets en production via environment variables
# Docker: docker run -e DATABASE_URL=...
# Systemd: Environment="DATABASE_URL=..."
# Cloud: AWS Secrets Manager, GCP Secret Manager
```

**Si déjà committé** :
```bash
# ⚠️ URGENT: Rotate tous les secrets
# 1. Change passwords/keys
# 2. Remove from Git history
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all

# 3. Force push (si repo privé)
git push origin --force --all
```

**Impact** :
- ✅ Secrets jamais exposés
- ✅ .env.example = documentation pour devs
- ✅ Production uses secure secret management

**Catégorie** : Security Critical
**Tags** : secrets, env, security, gitignore

---

### 2. Configuration par Environnement (DEV/STAGING/PROD)

**Contexte** : Application déployée sur multiple environnements

**Problème** :
```python
# ❌ Hardcoded config (pas flexible)
DATABASE_URL = "postgresql://localhost/myapp"
DEBUG = True  # Oublié en PROD → security risk
ALLOWED_HOSTS = ["*"]  # Trop permissif
```

**Risques** :
- 🐛 DEBUG=True en PROD → stack traces exposés
- 🔓 ALLOWED_HOSTS="*" → CSRF vulnerable
- 🐌 Dev DB config en PROD → performance issue

**Solution** :
```python
# ✅ Config par environnement
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Defaults pour DEV
    DATABASE_URL: str = "postgresql://localhost/myapp_dev"
    DEBUG: bool = False  # Safe default
    ALLOWED_HOSTS: list[str] = ["localhost", "127.0.0.1"]
    LOG_LEVEL: str = "INFO"

    # Load from .env file
    class Config:
        env_file = ".env"

settings = Settings()

# PROD: override via env vars
# export DEBUG=false
# export DATABASE_URL=postgresql://prod-host/myapp
# export ALLOWED_HOSTS=["example.com", "www.example.com"]
```

**Structure Fichiers** :
```
.env.development  # Local dev
.env.staging      # Staging server
.env.production   # PROD (jamais committé)
.env.example      # Template (committé)
```

**Docker Compose** :
```yaml
# docker-compose.yml
services:
  app:
    env_file:
      - .env.${ENVIRONMENT:-development}
    environment:
      - DEBUG=${DEBUG:-false}
      - DATABASE_URL=${DATABASE_URL}
```

**Impact** :
- ✅ Config adaptée par environnement
- ✅ Safe defaults (DEBUG=false)
- ✅ Type validation (Pydantic)

**Catégorie** : Best Practice
**Tags** : config, environment, pydantic, docker

---

### 3. CORS Configuration - Strict en Production

**Contexte** : API accessible depuis frontend web

**Problème** :
```python
# ❌ CORS trop permissif (DANGER en PROD)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ N'importe quel site peut appeler API
    allow_credentials=True,  # ⚠️ + credentials = CRITICAL VULNERABILITY
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Risque** :
- 🔓 CSRF attacks (malicious site calls API with user cookies)
- 🔓 Data exfiltration
- 🔓 OWASP A01:2021 - Broken Access Control

**Solution** :
```python
# ✅ CORS strict en PROD
import os

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

if ENVIRONMENT == "development":
    # Dev: permissif pour faciliter dev
    allowed_origins = ["http://localhost:3000", "http://localhost:5173"]
elif ENVIRONMENT == "staging":
    allowed_origins = ["https://staging.example.com"]
else:  # production
    # PROD: UNIQUEMENT domaines légitimes
    allowed_origins = [
        "https://example.com",
        "https://www.example.com",
        "https://app.example.com",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,  # ✅ Explicit whitelist
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],  # ✅ Explicit methods
    allow_headers=["Content-Type", "Authorization"],  # ✅ Explicit headers
)
```

**Nginx Reverse Proxy (Alternative)** :
```nginx
# Handle CORS at reverse proxy level
location /api {
    if ($http_origin ~* (https://example\.com|https://app\.example\.com)) {
        add_header Access-Control-Allow-Origin $http_origin;
        add_header Access-Control-Allow-Credentials true;
    }
    proxy_pass http://backend:8000;
}
```

**Impact** :
- ✅ CSRF protection
- ✅ Origin whitelist explicit
- ✅ Compliance OWASP

**Catégorie** : Security
**Tags** : cors, security, fastapi, csrf

---

### 4. Logging Configuration - Structured Logs en Production

**Contexte** : Application déployée, debug issues PROD

**Problème** :
```python
# ❌ Print debugging (non-structured, non-persisté)
print(f"User {user_id} logged in")  # Va nulle part en PROD
print(f"Error: {e}")  # Pas de context, pas de timestamp
```

**Problèmes** :
- 🐛 Logs non-persistés (stdout perdu après restart)
- 🐛 Pas de timestamp/level
- 🐛 Impossible de filtrer/chercher
- 🐛 Pas de correlation ID pour tracer requêtes

**Solution** :
```python
# ✅ Structured logging (JSON format)
import logging
import sys
from pythonjsonlogger import jsonlogger

# Configure logger
logger = logging.getLogger("myapp")
handler = logging.StreamHandler(sys.stdout)

# JSON formatter
formatter = jsonlogger.JsonFormatter(
    "%(asctime)s %(name)s %(levelname)s %(message)s"
)
handler.setFormatter(formatter)
logger.addHandler(handler)

# Log level par environnement
log_level = os.getenv("LOG_LEVEL", "INFO")
logger.setLevel(log_level)

# Usage
logger.info("User logged in", extra={
    "user_id": user_id,
    "ip_address": request.client.host,
    "user_agent": request.headers.get("user-agent"),
})

# Output JSON:
# {
#   "asctime": "2026-01-29T14:30:00",
#   "name": "myapp",
#   "levelname": "INFO",
#   "message": "User logged in",
#   "user_id": 123,
#   "ip_address": "192.168.1.1"
# }
```

**Correlation ID (traçabilité requêtes)** :
```python
import uuid
from contextvars import ContextVar

correlation_id_var = ContextVar("correlation_id", default=None)

@app.middleware("http")
async def correlation_middleware(request, call_next):
    correlation_id = request.headers.get("X-Correlation-ID", str(uuid.uuid4()))
    correlation_id_var.set(correlation_id)

    # Log all requests with correlation ID
    logger.info("Request started", extra={
        "correlation_id": correlation_id,
        "method": request.method,
        "path": request.url.path,
    })

    response = await call_next(request)
    return response
```

**Agrégation Logs (Production)** :
```bash
# Loki + Grafana
docker run -d --name=loki -p 3100:3100 grafana/loki
docker run -d --name=promtail -v /var/log:/var/log grafana/promtail

# Query logs par correlation_id
{job="myapp"} |= "correlation_id" | json | correlation_id="abc-123"
```

**Impact** :
- ✅ Logs structured (parseable)
- ✅ Filtrable par level, user_id, etc.
- ✅ Correlation ID pour tracer flow
- ✅ Intégrable Loki/ELK/Datadog

**Catégorie** : Operations
**Tags** : logging, observability, json, correlation-id

---

## 💡 Patterns Communs

**Secrets Management** :
- .env dans .gitignore TOUJOURS
- .env.example committé (template)
- Production: AWS Secrets Manager, GCP Secret Manager, Vault
- Rotate secrets régulièrement (90 jours)

**Environment Config** :
- Pydantic Settings pour validation
- Defaults sécurisés (DEBUG=false, ALLOWED_HOSTS restrictif)
- Override par env vars en PROD
- .env.{environment} pour multi-env

**CORS** :
- Dev: localhost OK
- PROD: whitelist explicit domains
- JAMAIS allow_origins=["*"] + allow_credentials=True
- Consider reverse proxy (Nginx/Cloudflare)

**Logging** :
- Structured logs (JSON) en PROD
- Correlation ID pour traçabilité
- Log levels: ERROR (always), INFO (production), DEBUG (dev only)
- Agrégation centralisée (Loki, ELK, Datadog)

---

## 🔗 Voir Aussi

- [deploy.md](deploy.md) - Configuration déploiement
- [docker.md](docker.md) - Configuration Docker

---

**Maintenu par** : TAKUMI (Claude Code)
**Template version** : 1.0
