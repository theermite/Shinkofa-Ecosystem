# ✅ Checklist Build Alpha - Shinkofa Web

**Date création**: 2026-01-17
**Contexte**: Éviter erreurs CORS et 404 lors déploiement alpha

---

## 🚨 Points Critiques

### 1. Variables d'environnement Next.js (NEXT_PUBLIC_*)

**Problème**: Les variables `NEXT_PUBLIC_*` sont **compilées dans le JavaScript** au moment du build, pas au runtime.

**Solution**:
```bash
# ❌ INCORRECT - Variables runtime ignorées
docker run -e NEXT_PUBLIC_API_URL="https://alpha.shinkofa.com/api" shinkofa-web:alpha

# ✅ CORRECT - Variables build-time
docker build \
  --build-arg NEXT_PUBLIC_API_URL="https://alpha.shinkofa.com/api" \
  --build-arg NEXT_PUBLIC_AUTH_API_URL="https://alpha.shinkofa.com/api" \
  --build-arg NEXT_PUBLIC_API_SHIZEN_URL="https://alpha.shinkofa.com/api" \
  --build-arg NEXT_PUBLIC_WS_URL="wss://alpha.shinkofa.com/ws" \
  -t shinkofa-web:alpha .
```

### 2. Configuration SPLIT Auth vs Shizen API (CRITIQUE!)

**Problème**: Le codebase utilise 2 patterns différents pour construire les URLs :

**Auth API (`lib/api/auth.ts`)**: Ajoute `/api/auth/login` au base URL
```typescript
const AUTH_API_URL = process.env.NEXT_PUBLIC_AUTH_API_URL
fetch(`${AUTH_API_URL}/api/auth/login`)  // Ajoute /api/auth/*
```

**Shizen API (`lib/api.ts`)**: Utilise `baseURL` directement avec routes relatives
```typescript
const apiClient = axios.create({ baseURL: API_BASE_URL })
apiClient.get('/questionnaire/structure')  // Juste append la route
```

**Solution - CONFIGURATION SPLIT** :
```bash
# ✅ CORRECT - Auth SANS /api (code l'ajoute)
NEXT_PUBLIC_AUTH_API_URL=https://alpha.shinkofa.com

# ✅ CORRECT - Shizen AVEC /api (code ne l'ajoute pas)
NEXT_PUBLIC_API_SHIZEN_URL=https://alpha.shinkofa.com/api
NEXT_PUBLIC_API_URL=https://alpha.shinkofa.com/api
```

**Résultats attendus** :
- Auth: `https://alpha.shinkofa.com` + `/api/auth/login` = `/api/auth/login` ✅
- Shizen: `https://alpha.shinkofa.com/api` + `/questionnaire/structure` = `/api/questionnaire/structure` ✅

**❌ Erreur fréquente - Double /api/** :
```bash
# ❌ INCORRECT - Auth AVEC /api
NEXT_PUBLIC_AUTH_API_URL=https://alpha.shinkofa.com/api
# Résultat: /api + /api/auth/login = /api/api/auth/login ❌❌❌
```

### 3. Network Docker

**Problème**: Containers alpha doivent accéder à postgres-prod (sur network séparé)

**Solution**:
```bash
# Connecter aux 2 networks
docker network connect docker_shinkofa-alpha-network shinkofa_web_alpha
docker network connect docker_shinkofa-prod-network shinkofa_web_alpha
```

### 4. Cache Navigateur

**Problème**: Les anciens bundles JS restent en cache

**Solution utilisateur**:
- Vider cache navigateur (Ctrl+Shift+Del)
- Hard reload (Ctrl+Shift+R)

---

## 📝 Procédure Complète Build Alpha

### Étape 1: Stopper container existant
```bash
docker stop shinkofa_web_alpha
docker rm shinkofa_web_alpha
```

### Étape 2: Rebuild avec bonnes variables (CONFIGURATION SPLIT!)
```bash
cd /home/ubuntu/shinkofa-platform/apps/web

docker build \
  --build-arg NEXT_PUBLIC_AUTH_API_URL="https://alpha.shinkofa.com" \
  --build-arg NEXT_PUBLIC_API_SHIZEN_URL="https://alpha.shinkofa.com/api" \
  --build-arg NEXT_PUBLIC_API_URL="https://alpha.shinkofa.com/api" \
  --build-arg NEXT_PUBLIC_WS_URL="wss://alpha.shinkofa.com/ws" \
  --no-cache \
  -t shinkofa-web:alpha .
```

**CRITIQUE**: `NEXT_PUBLIC_AUTH_API_URL` est SANS `/api` (lib/api/auth.ts ajoute `/api/auth/*`)

### Étape 3: Démarrer nouveau container
```bash
docker run -d \
  --name shinkofa_web_alpha \
  --network docker_shinkofa-alpha-network \
  -p 3010:3000 \
  -e NEXTAUTH_SECRET="shinkofa_nextauth_secret_alpha_2026" \
  -e NODE_ENV="production" \
  --restart unless-stopped \
  shinkofa-web:alpha
```

### Étape 4: Connecter network postgres
```bash
docker network connect docker_shinkofa-prod-network shinkofa_web_alpha
```

### Étape 5: Vérifier
```bash
# Test API
curl -s https://alpha.shinkofa.com/api/questionnaire/structure | jq '.metadata.version'
# Devrait retourner: "5.1"

# Test frontend
curl -s https://alpha.shinkofa.com/ | grep -o '<title>[^<]*</title>'
# Devrait retourner: <title>Shinkofa Platform</title>
```

---

## 🔍 Diagnostic Erreurs Fréquentes

### Erreur CORS "No 'Access-Control-Allow-Origin'"
**Cause**: Frontend appelle API sur domaine différent (app.shinkofa.com vs alpha.shinkofa.com)
**Solution**: Rebuild avec bonnes `NEXT_PUBLIC_*` URLs

### Erreur 404 sur `/questionnaire/structure` (sans /api)
**Cause**: Manque suffix `/api` dans `NEXT_PUBLIC_API_SHIZEN_URL`
**Solution**: Ajouter `/api` dans `NEXT_PUBLIC_API_SHIZEN_URL` uniquement (PAS dans `NEXT_PUBLIC_AUTH_API_URL`)

### Erreur 404 sur `/api/api/auth/login` (double /api)
**Cause**: `NEXT_PUBLIC_AUTH_API_URL` contient `/api` alors que le code l'ajoute déjà
**Solution**: Enlever `/api` de `NEXT_PUBLIC_AUTH_API_URL` (doit être juste `https://alpha.shinkofa.com`)

### Erreur 500 "failed to resolve host 'postgres-prod'"
**Cause**: Container pas connecté au network postgres
**Solution**: `docker network connect docker_shinkofa-prod-network shinkofa_web_alpha`

### Services fonctionnent en localhost mais pas via nginx
**Cause**: Nginx config incorrecte ou fichier backup conflictuel
**Solution**: `sudo nginx -t` puis supprimer backups dans `/etc/nginx/sites-enabled/`

---

## 📄 Fichiers de Référence

- `.env.alpha` - Variables alpha documentées
- `.env.production` - Variables production (défaut)
- `Dockerfile` - Build args configurés (lignes 50-65)
- `/etc/nginx/sites-available/alpha.shinkofa.com` - Config nginx

---

**Changelog**:
- 2026-01-17: Création suite résolution erreurs CORS + 404 alpha
