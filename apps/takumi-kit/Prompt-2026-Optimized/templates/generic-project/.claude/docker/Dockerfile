# ==============================================
# Dockerfile Multi-Stage
# Projet : [Nom Projet]
# ==============================================
#
# Ce Dockerfile supporte 2 stages:
# - development: avec hot-reload
# - production: optimisé, minimal
#
# Build:
#   Dev:  docker build --target development -t myapp:dev .
#   Prod: docker build --target production -t myapp:prod .
#
# ==============================================

# ----------------------------------------------
# CHOISIR BASE IMAGE selon stack
# ----------------------------------------------

# Option 1: Node.js
FROM node:20-alpine AS base-node

# Option 2: Python
# FROM python:3.11-slim AS base-python

# Option 3: Go
# FROM golang:1.21-alpine AS base-go


# ==============================================
# STAGE: Base (commun dev + prod)
# ==============================================
FROM node:20-alpine AS base

# Métadonnées
LABEL maintainer="your-email@example.com"
LABEL description="[Description projet]"

# Variables build
ARG BUILD_DATE
ARG VERSION
LABEL build_date=$BUILD_DATE
LABEL version=$VERSION

# Installer dépendances système
RUN apk add --no-cache \
    curl \
    bash \
    postgresql-client

# Créer user non-root (sécurité)
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Définir working directory
WORKDIR /app

# Copier fichiers dépendances
COPY package*.json ./
# OU pour Python:
# COPY requirements*.txt ./
# OU pour Go:
# COPY go.mod go.sum ./


# ==============================================
# STAGE: Development
# ==============================================
FROM base AS development

ENV NODE_ENV=development

# Installer TOUTES dépendances (incl. devDependencies)
RUN npm ci
# OU pour Python:
# RUN pip install --no-cache-dir -r requirements-dev.txt
# OU pour Go:
# RUN go mod download

# Copier code source
# NOTE: En dev, ce code sera overridé par volume mount
COPY --chown=appuser:appgroup . .

# Exposer port
EXPOSE 8000

# Passer à user non-root
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Commande dev (sera overridée dans docker-compose.dev.yml)
CMD ["npm", "run", "dev"]
# OU pour Python:
# CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
# OU pour Django:
# CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]


# ==============================================
# STAGE: Builder (compilation prod)
# ==============================================
FROM base AS builder

ENV NODE_ENV=production

# Installer dépendances PRODUCTION uniquement
RUN npm ci --only=production
# OU pour Python:
# RUN pip install --no-cache-dir -r requirements.txt

# Copier code source
COPY --chown=appuser:appgroup . .

# Build assets (si applicable)
RUN npm run build
# OU pour frontend:
# RUN npm run build && \
#     mv dist /app/build


# ==============================================
# STAGE: Production
# ==============================================
FROM node:20-alpine AS production

ENV NODE_ENV=production

# Variables runtime
ARG BUILD_DATE
ARG VERSION
ENV APP_VERSION=$VERSION

# Installer uniquement runtime dependencies
RUN apk add --no-cache \
    curl \
    postgresql-client

# Créer user non-root
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

WORKDIR /app

# Copier depuis builder uniquement ce qui est nécessaire
COPY --from=builder --chown=appuser:appgroup /app/node_modules ./node_modules
COPY --from=builder --chown=appuser:appgroup /app/dist ./dist
COPY --from=builder --chown=appuser:appgroup /app/package*.json ./
# OU pour Python:
# COPY --from=builder --chown=appuser:appgroup /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
# COPY --from=builder --chown=appuser:appgroup /app .

# Exposer port
EXPOSE 8000

# Passer à user non-root
USER appuser

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Commande production (sera overridée dans docker-compose.prod.yml)
CMD ["npm", "run", "start:prod"]
# OU pour Python avec Gunicorn:
# CMD ["gunicorn", "main:app", "--workers", "4", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]
# OU pour Django:
# CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "4"]


# ==============================================
# NOTES & BEST PRACTICES
# ==============================================
#
# 1. Multi-stage build réduit taille image finale
# 2. User non-root améliore sécurité
# 3. .dockerignore évite copier fichiers inutiles
# 4. Layer caching optimise rebuild
# 5. Health check permet auto-restart si crash
#
# Ordre layers (cache optimal):
#   1. Dépendances système (changent rarement)
#   2. Fichiers dépendances (package.json)
#   3. Installation dépendances
#   4. Code source (change souvent)
#   5. Build assets
#
# ==============================================
