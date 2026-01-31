# ============================================
# Dockerfile Template - Production-Ready
# ============================================
# Multi-stage build pour optimisation taille image
# Supporte Python et Node.js
# Version: 1.0 | 2025-11-13

# ============================================
# OPTION 1: Python FastAPI Application
# ============================================

# Stage 1: Builder
FROM python:3.11-slim as python-builder

# Variables d'environnement
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

# Installer dépendances système build
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copier requirements et installer dépendances
WORKDIR /app
COPY requirements.txt .
RUN pip install --user --no-warn-script-location -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim as python-runtime

# Variables d'environnement production
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PATH=/root/.local/bin:$PATH

# Créer utilisateur non-root (sécurité)
RUN useradd -m -u 1000 appuser && \
    apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copier dépendances depuis builder
COPY --from=python-builder /root/.local /home/appuser/.local

# Copier code application
WORKDIR /app
COPY --chown=appuser:appuser . .

# Passer à utilisateur non-root
USER appuser

# Exposer port application
EXPOSE 8000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Commande démarrage (FastAPI avec Uvicorn)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]


# ============================================
# OPTION 2: Node.js / React Application
# ============================================

# Stage 1: Builder Node
FROM node:18-alpine as node-builder

# Variables d'environnement
ENV NODE_ENV=production \
    NPM_CONFIG_LOGLEVEL=warn

# Copier package.json et installer dépendances
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

# Copier code et builder (si React/Next.js)
COPY . .
RUN npm run build

# Stage 2: Runtime Node
FROM node:18-alpine as node-runtime

# Créer utilisateur non-root
RUN addgroup -g 1000 appuser && \
    adduser -D -u 1000 -G appuser appuser

# Copier node_modules et build depuis builder
WORKDIR /app
COPY --from=node-builder --chown=appuser:appuser /app/node_modules ./node_modules
COPY --from=node-builder --chown=appuser:appuser /app/build ./build
COPY --from=node-builder --chown=appuser:appuser /app/package*.json ./

# Passer à utilisateur non-root
USER appuser

# Exposer port
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Commande démarrage
CMD ["node", "build/index.js"]


# ============================================
# OPTION 3: React Static (Nginx serve)
# ============================================

# Stage 1: Builder React
FROM node:18-alpine as react-builder

WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force

COPY . .
RUN npm run build

# Stage 2: Nginx serve
FROM nginx:alpine as react-runtime

# Copier build React dans Nginx
COPY --from=react-builder /app/build /usr/share/nginx/html

# Copier config Nginx custom (optionnel)
# COPY nginx.conf /etc/nginx/nginx.conf

# Exposer port
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1

# Nginx démarre automatiquement
CMD ["nginx", "-g", "daemon off;"]


# ============================================
# Instructions Utilisation
# ============================================

# Build image:
# docker build -t nom-app:latest .

# Run container:
# docker run -d -p 8000:8000 --name nom-app nom-app:latest

# Run avec variables d'environnement:
# docker run -d -p 8000:8000 --env-file .env --name nom-app nom-app:latest

# Logs:
# docker logs -f nom-app

# Stop:
# docker stop nom-app

# Remove:
# docker rm nom-app


# ============================================
# Optimisations Production
# ============================================

# ✅ Multi-stage build (réduction taille image 40-60%)
# ✅ Utilisateur non-root (sécurité)
# ✅ Healthcheck intégré (monitoring)
# ✅ Cache layers optimisé (COPY dependencies avant code)
# ✅ Nettoyage apt/npm cache (réduction taille)
# ✅ Variables environnement production
# ✅ Alpine Linux (images légères Node)


# ============================================
# Notes
# ============================================

# - Choisir OPTION appropriée (Python/Node/React static)
# - Remplacer ports si différents (8000, 3000, 80)
# - Adapter CMD selon point d'entrée application
# - Ajouter volumes si persistance données nécessaire
# - Utiliser docker-compose.yml pour multi-services
