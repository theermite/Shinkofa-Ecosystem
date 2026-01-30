# Guide de Déploiement - Shinkofa Ecosystem

> Stratégies de déploiement pour chaque app du MonoRepo

## 🎯 Principe Important

⚠️ **Le MonoRepo complet NE va PAS sur le VPS!**

**Pourquoi?**
- VPS a espace limité (~20-30GB disponible)
- node_modules du MonoRepo = 2-3GB
- Inutile: Le VPS n'a besoin que des builds finaux

**Stratégie**: Build local → Upload uniquement le résultat final

---

## 🏗️ Déploiement par App

### 1. Site Vitrine (shinkofa.com)

**Hébergement**: O2Switch
**Port Prod**: 443 (HTTPS)
**Build**: Vite (statique)

#### Processus

```bash
# 1. Build local
cd D:\30-Dev-Projects\Shinkofa-Ecosystem
pnpm --filter @shinkofa/site-vitrine build

# 2. Vérifier dist/
ls apps/site-vitrine/dist

# 3. Upload via FTP/SFTP vers O2Switch
# - dist/index.html
# - dist/assets/*
# - Copier dans public_html/

# 4. Test
# https://shinkofa.com
```

**Taille déployée**: ~2-5MB (juste HTML/CSS/JS minifiés)

---

### 2. Plateforme Michi (app.shinkofa.com)

**Hébergement**: VPS OVH
**Port**: 3003 (local) → 443 via nginx reverse proxy
**Build**: Next.js standalone

#### Processus

```bash
# 1. Build local (standalone mode)
cd D:\30-Dev-Projects\Shinkofa-Ecosystem
pnpm --filter @shinkofa/michi build

# 2. Vérifier .next/standalone/
ls apps/michi/.next/standalone

# 3. Créer package de déploiement
cd apps/michi
tar -czf michi-deploy.tar.gz .next/standalone .next/static public

# 4. Upload vers VPS
scp michi-deploy.tar.gz user@vps:/var/www/michi/

# 5. Sur VPS
ssh user@vps
cd /var/www/michi
tar -xzf michi-deploy.tar.gz
pm2 restart michi

# 6. Test
# https://app.shinkofa.com
```

**Taille déployée**: ~50-100MB (Next.js standalone + node_modules optimisés)

---

### 3. API Shizen (api.shinkofa.com)

**Hébergement**: VPS OVH
**Port**: 8000 (local) → 443 via nginx
**Stack**: FastAPI + Docker

#### Processus

```bash
# 1. Build Docker image localement
cd D:\30-Dev-Projects\Shinkofa-Ecosystem\apps\api-shizen
docker build -t shinkofa/api-shizen:latest .

# 2. Export image
docker save shinkofa/api-shizen:latest | gzip > api-shizen.tar.gz

# 3. Upload vers VPS
scp api-shizen.tar.gz user@vps:/opt/docker/

# 4. Sur VPS
ssh user@vps
cd /opt/docker
docker load < api-shizen.tar.gz
docker-compose up -d api-shizen

# 5. Test
# https://api.shinkofa.com/docs
```

**Taille déployée**: ~500MB-1GB (image Docker complète)

---

## 🔄 Stratégie MonoRepo sur VPS

### ❌ Ce qu'on NE fait PAS

```bash
# NE PAS faire ça sur VPS!
git clone Shinkofa-Ecosystem.git
cd Shinkofa-Ecosystem
pnpm install  # ← 2-3GB de node_modules!
```

### ✅ Ce qu'on FAIT

**Option A: Builds séparés (Recommandé)**

```
VPS OVH/
├── /var/www/michi/            # Seulement .next/standalone (~100MB)
├── /opt/docker/api-shizen/    # Seulement image Docker (~1GB)
└── /etc/nginx/                # Configs nginx
```

**Option B: MonoRepo minimal (Si vraiment nécessaire)**

Si on doit absolument avoir le MonoRepo sur VPS:

```bash
# Sur VPS - Clone sans node_modules
git clone --depth 1 Shinkofa-Ecosystem.git
cd Shinkofa-Ecosystem

# Installer SEULEMENT les apps déployées
pnpm install --filter @shinkofa/michi --prod
pnpm install --filter @shinkofa/api-shizen --prod

# Build sur VPS (si pas assez de RAM locale)
pnpm --filter @shinkofa/michi build
```

⚠️ **Attention**: VPS a RAM limitée, build peut échouer!

---

## 📊 Espace Disque VPS

### Estimation Actuelle

| App | Taille Build | Emplacement VPS |
|-----|-------------|-----------------|
| Michi (Next.js) | ~100MB | /var/www/michi |
| API Shizen (Docker) | ~1GB | /opt/docker |
| PostgreSQL data | ~500MB | /var/lib/postgresql |
| Nginx configs | ~1MB | /etc/nginx |
| Logs | ~100MB | /var/log |
| **TOTAL** | **~1.7GB** | - |

**VPS Disponible**: ~20GB
**Marge sécurité**: ~18GB restants ✅

---

## 🚀 Workflow de Déploiement Recommandé

### 1. Développement Local

```bash
# Dans MonoRepo complet
cd Shinkofa-Ecosystem
pnpm dev
# Développer, tester
```

### 2. Build Local

```bash
# Build l'app à déployer
pnpm --filter @shinkofa/michi build
```

### 3. Test Build Local

```bash
# Tester le build avant upload
pnpm --filter @shinkofa/michi start
```

### 4. Déploiement VPS

```bash
# Script automatisé (à créer)
./deploy.sh michi production
```

---

## 🛠️ Scripts de Déploiement Automatisés

Créer `scripts/deploy.sh` dans MonoRepo:

```bash
#!/bin/bash
APP=$1
ENV=$2

case $APP in
  site-vitrine)
    pnpm --filter @shinkofa/site-vitrine build
    rsync -avz apps/site-vitrine/dist/ o2switch:/public_html/
    ;;
  michi)
    pnpm --filter @shinkofa/michi build
    tar -czf michi.tar.gz -C apps/michi .next/standalone .next/static public
    scp michi.tar.gz vps:/var/www/michi/
    ssh vps "cd /var/www/michi && tar -xzf michi.tar.gz && pm2 restart michi"
    ;;
  api-shizen)
    cd apps/api-shizen
    docker build -t shinkofa/api-shizen:latest .
    docker save shinkofa/api-shizen:latest | gzip | ssh vps "docker load && docker-compose up -d api-shizen"
    ;;
esac
```

---

## 🔐 Variables d'Environnement VPS

Chaque app a son `.env` sur VPS:

```
/var/www/michi/.env.production
/opt/docker/api-shizen/.env.production
```

**Gestion sécurisée**:
- Ne JAMAIS commit .env.production dans git
- Utiliser secrets manager (Doppler, Vault, ou fichiers chiffrés)
- Sur VPS: chmod 600 .env.production

---

## 📋 Checklist Déploiement

### Avant Déploiement

- [ ] Tests passent localement
- [ ] Build réussit sans erreurs
- [ ] Variables .env.production préparées
- [ ] Backup DB effectué (si migration)
- [ ] Espace disque VPS vérifié

### Déploiement

- [ ] Build créé localement
- [ ] Upload vers VPS réussi
- [ ] Services redémarrés (pm2/docker)
- [ ] Health check OK
- [ ] Logs vérifiés (pas d'erreurs)

### Après Déploiement

- [ ] Tests manuels interface
- [ ] Monitoring actif
- [ ] Rollback plan prêt

---

## 🆘 Rollback Rapide

```bash
# Site Vitrine
# Restaurer backup FTP O2Switch

# Michi
ssh vps "pm2 restart michi-previous"

# API
ssh vps "docker-compose up -d api-shizen:previous-tag"
```

---

## 📊 Monitoring VPS

```bash
# Espace disque
ssh vps "df -h"

# RAM
ssh vps "free -h"

# CPU
ssh vps "top"

# Logs
ssh vps "pm2 logs michi --lines 50"
ssh vps "docker logs api-shizen --tail 50"
```

---

**Conclusion**: Le MonoRepo reste LOCAL, seuls les BUILDS vont sur VPS! ✅
