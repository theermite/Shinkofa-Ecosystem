# Configuration Sous-Domaine Dev (devslf.shinkofa.com)

## 📋 Objectif

Séparer l'environnement de développement (devslf.shinkofa.com) de la production (lslf.shinkofa.com) pour éviter :
- Les pop-ups d'auto-update constants pendant le développement
- Les manipulations de cache répétitives
- L'impact sur les utilisateurs finaux lors des tests

## 🔧 Configuration Nginx

### 1. Créer le fichier de configuration dev

```bash
sudo nano /etc/nginx/sites-available/devslf.shinkofa.com
```

Contenu du fichier :

```nginx
# Development subdomain for SLF E-Sport Platform
server {
    listen 80;
    listen [::]:80;
    server_name devslf.shinkofa.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name devslf.shinkofa.com;

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/devslf.shinkofa.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/devslf.shinkofa.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/devslf-access.log;
    error_log /var/log/nginx/devslf-error.log;

    # Frontend (React) - MÊME container que prod pour l'instant
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API - MÊME container que prod pour l'instant
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 2. Activer la configuration

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/devslf.shinkofa.com /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Recharger nginx (ne PAS redémarrer pour éviter downtime)
sudo systemctl reload nginx
```

### 3. Configurer le certificat SSL Let's Encrypt

```bash
# Obtenir le certificat SSL
sudo certbot --nginx -d devslf.shinkofa.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

## 🐳 Configuration Docker (Optionnel - Containers Séparés)

### Option A : Réutiliser les containers existants (RECOMMANDÉ pour commencer)

**Avantages :**
- Setup immédiat, zéro configuration Docker
- Économie de ressources VPS
- Code identique entre dev et prod

**Inconvénients :**
- Redémarrage du container affecte les deux domaines

**Configuration actuelle :** Les deux domaines pointent vers les mêmes containers (port 3000 frontend, 8001 backend).

### Option B : Containers séparés dev/prod (FUTUR)

Si tu veux isoler complètement dev et prod :

```yaml
# docker-compose.dev.yml
version: '3.8'

services:
  frontend-dev:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    container_name: slf-frontend-dev
    ports:
      - "3001:3000"  # Port différent
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - slf-network-dev

  backend-dev:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: slf-backend-dev
    ports:
      - "8002:8000"  # Port différent
    environment:
      - DATABASE_URL=postgresql://user:pass@db-dev:5432/slf_esport_dev
    depends_on:
      - db-dev
    restart: unless-stopped
    networks:
      - slf-network-dev

  db-dev:
    image: postgres:15
    container_name: slf-db-dev
    environment:
      - POSTGRES_USER=slf_user_dev
      - POSTGRES_PASSWORD=dev_password
      - POSTGRES_DB=slf_esport_dev
    volumes:
      - slf-db-data-dev:/var/lib/postgresql/data
    restart: unless-stopped
    networks:
      - slf-network-dev

networks:
  slf-network-dev:
    driver: bridge

volumes:
  slf-db-data-dev:
```

Puis modifier nginx pour pointer vers les nouveaux ports (3001, 8002).

## 🔄 Workflow Dev vs Prod

### Développement sur devslf.shinkofa.com

```bash
# 1. Modifier le code
cd /home/ubuntu/SLF-Esport/frontend

# 2. Rebuild frontend
npm run build

# 3. Redémarrer container
docker restart slf-frontend

# 4. Tester sur devslf.shinkofa.com
# ✅ Pas de pop-up auto-update
# ✅ Modifications visibles immédiatement
```

### Release sur lslf.shinkofa.com

```bash
# 1. Tester sur dev d'abord
# ... tests complets sur devslf.shinkofa.com

# 2. Créer un tag Git (déclenche l'auto-update pour les users)
git tag -a v1.0.0 -m "Release: Description des changements"
git push origin v1.0.0

# 3. Les containers sont partagés, donc pas de redéploiement nécessaire
# Les users sur lslf.shinkofa.com recevront la notification d'auto-update
```

## 📊 Vérification

### Tester le sous-domaine dev

```bash
# 1. Vérifier DNS (peut prendre quelques minutes)
nslookup devslf.shinkofa.com

# 2. Tester HTTP redirect vers HTTPS
curl -I http://devslf.shinkofa.com

# 3. Tester HTTPS
curl -I https://devslf.shinkofa.com

# 4. Vérifier les logs nginx
sudo tail -f /var/log/nginx/devslf-access.log
```

### Tester l'auto-update

1. **Sur devslf.shinkofa.com** : Modifier le code, rebuild, redémarrer → **Pas de pop-up**
2. **Sur lslf.shinkofa.com** : Créer un tag Git → **Pop-up apparaît pour les users**

## 🎯 Résumé

| Domaine | Auto-Update | Usage | Containers |
|---------|-------------|-------|------------|
| **devslf.shinkofa.com** | ❌ Désactivé | Développement & Tests | Partagés (ports 3000, 8001) |
| **lslf.shinkofa.com** | ✅ Activé | Production Users | Partagés (ports 3000, 8001) |

**Prochaine étape après cette config :**
- Tous tes développements se font sur devslf.shinkofa.com
- Plus besoin de vider le cache constamment
- Les users sur lslf.shinkofa.com ne sont pas impactés
- Quand tu es prêt, tu tagges une release Git et les users reçoivent la notification

---

**Auteur:** TAKUMI Agent
**Date:** 2025-01-04
**Version:** 1.0
