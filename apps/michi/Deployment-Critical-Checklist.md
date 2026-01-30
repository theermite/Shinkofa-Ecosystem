# ⚠️ CHECKLIST CRITIQUE BUILD & DEPLOY - NEXT.JS

**Date de création** : 15 janvier 2026
**Objectif** : Éviter les erreurs de déploiement Next.js (URLs, env vars, etc.)
**Contexte** : Erreurs passées = Failed to fetch (localhost:8000 au lieu de api.shinkofa.com)

---

## 🚨 RÈGLES ABSOLUES (NON-NÉGOCIABLES)

### 1. **NEXT_PUBLIC_* Variables = Build Time ONLY**

**❌ ERREUR CRITIQUE** : Les variables `NEXT_PUBLIC_*` sont **compilées dans le JavaScript** au moment du **BUILD**, pas au runtime.

**✅ RÈGLE** :
```bash
# ❌ MAUVAIS : Runtime env vars (ne fonctionnera PAS)
docker run -e NEXT_PUBLIC_API_URL=https://api.shinkofa.com ...

# ✅ BON : Build args (compilé dans le code)
docker build --build-arg NEXT_PUBLIC_API_URL=https://api.shinkofa.com ...
```

---

### 2. **.env.production DOIT POINTER VERS LE BACKEND**

**Fichier** : `apps/web/.env.production`

**❌ ERREUR CRITIQUE** : Pointer vers le frontend (`app.shinkofa.com`)

**✅ RÈGLE** :
```bash
# IMPORTANT: Ces URLs pointent vers le BACKEND, PAS le frontend
NEXT_PUBLIC_API_URL=https://api.shinkofa.com
NEXT_PUBLIC_AUTH_API_URL=https://api.shinkofa.com/auth
NEXT_PUBLIC_API_SHIZEN_URL=https://api.shinkofa.com/shizen
NEXT_PUBLIC_WS_URL=wss://api.shinkofa.com/shizen/ws
```

**Explication** :
- `app.shinkofa.com` = Frontend (React/Next.js)
- `api.shinkofa.com` = Backend (FastAPI/Python)
- Le frontend appelle le backend, donc les URLs doivent pointer vers `api.shinkofa.com`

---

## 📋 CHECKLIST PRÉ-BUILD (OBLIGATOIRE)

Avant CHAQUE `docker build`, vérifier :

- [ ] **1. Vérifier `.env.production`**
  ```bash
  cat apps/web/.env.production | grep NEXT_PUBLIC_AUTH_API_URL
  # Doit afficher : https://api.shinkofa.com/auth (PAS app.shinkofa.com)
  ```

- [ ] **2. Vérifier que les URLs backend sont accessibles**
  ```bash
  curl -I https://api.shinkofa.com/auth/health
  # Doit retourner : HTTP/2 200
  ```

- [ ] **3. Build local AVANT Docker (optionnel mais recommandé)**
  ```bash
  cd apps/web
  npm run build
  # Vérifie qu'il n'y a pas d'erreurs TypeScript ou de compilation
  ```

---

## 🐳 CHECKLIST BUILD DOCKER (OBLIGATOIRE)

**Commande complète** :
```bash
cd /home/ubuntu/shinkofa-platform/apps/web

docker build --target production \
  --build-arg NEXT_PUBLIC_API_URL=https://api.shinkofa.com \
  --build-arg NEXT_PUBLIC_AUTH_API_URL=https://api.shinkofa.com/auth \
  --build-arg NEXT_PUBLIC_API_SHIZEN_URL=https://api.shinkofa.com/shizen \
  --build-arg NEXT_PUBLIC_WS_URL=wss://api.shinkofa.com/shizen/ws \
  -t docker-web .
```

**Notes** :
- `--no-cache` si tu veux forcer un rebuild complet (plus lent mais plus sûr)
- Les build args sont **redondants** avec `.env.production`, mais ajoutent une sécurité

---

## 🚀 CHECKLIST DEPLOY (OBLIGATOIRE)

**1. Arrêter l'ancien container** :
```bash
docker stop shinkofa_web_prod
docker rm shinkofa_web_prod
```

**2. Démarrer le nouveau container** :
```bash
docker run -d --name shinkofa_web_prod \
  --restart unless-stopped \
  -p 127.0.0.1:3000:3000 \
  --network docker_shinkofa-prod-network \
  docker-web:latest
```

**3. Vérifier que le container démarre** :
```bash
sleep 10
docker logs --tail 20 shinkofa_web_prod
docker ps --filter "name=shinkofa_web_prod"
```

**4. Tester l'accès local** :
```bash
curl -I http://localhost:3000/
# Doit retourner : HTTP/1.1 200 OK
```

**5. ⚠️ CRITIQUE : Tester l'URL API dans le navigateur**
- Ouvrir navigateur : https://app.shinkofa.com
- Ouvrir DevTools (F12) → Console
- Essayer de se connecter
- **VÉRIFIER** : Aucune erreur `localhost:8000` dans la console
- **VÉRIFIER** : Les requêtes partent bien vers `https://api.shinkofa.com/auth`

---

## 🧪 TESTS POST-DEPLOY (OBLIGATOIRE)

- [ ] **1. Test homepage**
  ```bash
  curl -s https://app.shinkofa.com/ | grep "Shinkofa Platform"
  ```

- [ ] **2. Test login page**
  - Aller sur https://app.shinkofa.com/auth/login
  - Ouvrir DevTools → Network tab
  - Essayer de se connecter
  - **VÉRIFIER** : Request URL = `https://api.shinkofa.com/auth/api/auth/login`
  - **VÉRIFIER** : Pas d'erreur `Failed to fetch` ou `ERR_CONNECTION_REFUSED`

- [ ] **3. Test profil holistique (si connecté)**
  - Aller sur https://app.shinkofa.com/profile/holistic
  - **VÉRIFIER** : Toutes les traductions françaises s'affichent correctement

---

## 🚨 EN CAS D'ERREUR "Failed to fetch"

**Symptôme** :
```
POST https://localhost:8000/api/auth/login net::ERR_CONNECTION_REFUSED
```

**Cause** : Les variables `NEXT_PUBLIC_*` pointent vers `localhost` au lieu de `api.shinkofa.com`

**Solution immédiate** :
1. Vérifier `.env.production` (doit pointer vers `api.shinkofa.com`)
2. Rebuild l'image Docker **avec --no-cache**
3. Redémarrer le container
4. **TESTER IMMÉDIATEMENT** dans le navigateur (DevTools → Console)

---

## 📝 RAPPEL ARCHITECTURE URLS

| Service | URL | Port | Rôle |
|---------|-----|------|------|
| **Frontend** | https://app.shinkofa.com | 443 (nginx → 3000) | React/Next.js UI |
| **Backend Auth** | https://api.shinkofa.com/auth | 443 (nginx → 8000) | FastAPI Auth |
| **Backend Shizen** | https://api.shinkofa.com/shizen | 443 (nginx → 8001) | FastAPI Shizen/Planner |

**Règle d'or** : Le frontend (`app.shinkofa.com`) appelle TOUJOURS le backend (`api.shinkofa.com`), jamais `localhost`.

---

## 🔄 COMMIT APRÈS DEPLOY

Une fois le deploy réussi et testé :

```bash
git add apps/web/.env.production
git commit -m "fix(web): Correct .env.production URLs (api.shinkofa.com)"
git push origin main
```

---

**✅ Checklist validée par : TAKUMI**
**Date dernière erreur évitée : 15 janvier 2026**
