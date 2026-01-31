# 🚀 Guide de Déploiement - SLF E-Sport Platform

**Version** : 1.0
**Date** : 30 novembre 2025
**Hébergement recommandé** : **VPS OVH** (pas o2Switch)

---

## ❓ POURQUOI VPS OVH (et pas o2Switch) ?

### ✅ VPS OVH - **RECOMMANDÉ**

**Avantages** :
- ✅ **Docker supporté** (essentiel pour notre stack)
- ✅ **Python/FastAPI** natif
- ✅ **Node.js** dernières versions
- ✅ **PostgreSQL + Redis** configurables
- ✅ **WebSocket** supporté (temps réel)
- ✅ **Root SSH** (contrôle total)
- ✅ **Scalable** (upgrade RAM/CPU facile)
- ✅ **Backups automatiques** configurables
- ✅ **Prix** : 3,50€ - 7€/mois (excellent rapport qualité/prix)

**Stack compatible** :
- FastAPI (Python 3.11+)
- React (Vite build)
- PostgreSQL 15
- Redis 7
- Nginx reverse proxy
- Docker + Docker Compose

### ❌ o2Switch - **NON RECOMMANDÉ**

**Limitations** :
- ❌ **Pas de Docker** (mutualisé)
- ❌ **Python limité** (versions anciennes)
- ❌ **Pas de PostgreSQL** (MySQL uniquement)
- ❌ **Pas de Redis** (pas de caching avancé)
- ❌ **Pas de WebSocket** (pas de temps réel)
- ❌ **Pas de contrôle système**

**Uniquement pour** :
- Sites WordPress/PHP classiques
- Sites statiques HTML/CSS/JS
- Pas adapté aux applications modernes

---

## 🎯 SOLUTION RECOMMANDÉE

### **VPS OVH Starter** (Recommandé)

**Spécifications** :
- **CPU** : 1 vCore
- **RAM** : 2 GB
- **Stockage** : 20 GB SSD
- **Bande passante** : Illimitée
- **Prix** : ~3,50€ HT/mois (~4,20€ TTC)
- **OS** : Ubuntu 22.04 LTS

**Suffisant pour** :
- 50-100 utilisateurs simultanés
- Base de données PostgreSQL
- Redis caching
- Backend FastAPI
- Frontend React
- Tous les services Docker

**Upgrade possible** :
- VPS Comfort : 2 vCores, 4 GB RAM (~7€/mois)
- VPS Elite : 4 vCores, 8 GB RAM (~14€/mois)

---

## 📋 PRÉREQUIS

- Compte OVH (créer sur ovh.com)
- Nom de domaine (optionnel mais recommandé)
- Clé SSH locale (pour connexion sécurisée)
- Connaissance basique Linux/SSH

---

## 🔧 ÉTAPE 1 : COMMANDER & CONFIGURER LE VPS

### 1.1 Commander VPS OVH

1. Aller sur [ovh.com/fr/vps](https://www.ovh.com/fr/vps/)
2. Choisir **VPS Starter** (3,50€/mois)
3. Sélectionner **Ubuntu 22.04 LTS**
4. Choisir datacenter (France - Gravelines recommandé)
5. Valider commande

### 1.2 Première Connexion SSH

Après réception email OVH avec IP et mot de passe root :

```bash
# Connexion SSH
ssh root@VOTRE_IP_VPS

# Première chose : changer le mot de passe root
passwd
```

### 1.3 Créer Utilisateur Non-Root (Sécurité)

```bash
# Créer utilisateur
adduser slf
usermod -aG sudo slf

# Copier clé SSH (optionnel mais recommandé)
mkdir -p /home/slf/.ssh
cp /root/.ssh/authorized_keys /home/slf/.ssh/
chown -R slf:slf /home/slf/.ssh
chmod 700 /home/slf/.ssh
chmod 600 /home/slf/.ssh/authorized_keys

# Se déconnecter et reconnecter avec nouvel utilisateur
exit
ssh slf@VOTRE_IP_VPS
```

---

## 🐳 ÉTAPE 2 : INSTALLER DOCKER & DOCKER COMPOSE

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer dépendances
sudo apt install -y apt-transport-https ca-certificates curl software-properties-common

# Ajouter clé GPG Docker
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Ajouter repo Docker
echo "deb [arch=amd64 signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Installer Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io

# Installer Docker Compose V2
sudo apt install -y docker-compose-plugin

# Ajouter utilisateur au groupe docker
sudo usermod -aG docker $USER

# Se déconnecter et reconnecter pour appliquer
exit
ssh slf@VOTRE_IP_VPS

# Vérifier installation
docker --version
docker compose version
```

---

## 🚢 ÉTAPE 3 : DÉPLOYER L'APPLICATION

### 3.1 Cloner le Projet

```bash
# Installer Git
sudo apt install -y git

# Cloner le repo (HTTPS)
git clone https://github.com/VOTRE_USERNAME/SLF-Esport.git
cd SLF-Esport

# OU cloner avec SSH (recommandé si configuré)
git clone git@github.com:VOTRE_USERNAME/SLF-Esport.git
cd SLF-Esport
```

### 3.2 Configurer Variables d'Environnement

```bash
# Copier template .env
cp .env.example .env

# Éditer .env avec nano
nano .env
```

**Fichier .env Production** :

```bash
# Environment
ENVIRONMENT=production
DEBUG=False

# Database PostgreSQL
POSTGRES_HOST=postgres
POSTGRES_PORT=5432
POSTGRES_DB=slf_esport_prod
POSTGRES_USER=slf_user
POSTGRES_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE_FORT

# Redis
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=CHANGEZ_CE_MOT_DE_PASSE_REDIS

# Backend API
API_HOST=0.0.0.0
API_PORT=8000
SECRET_KEY=CHANGEZ_CETTE_CLE_SECRETE_LONGUE_ET_ALEATOIRE

# JWT
JWT_SECRET_KEY=CHANGEZ_CETTE_CLE_JWT_DIFFERENTE
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS (votre domaine)
CORS_ORIGINS=https://slf-esport.fr,https://www.slf-esport.fr

# Frontend
VITE_API_URL=https://slf-esport.fr/api
VITE_WEBSOCKET_URL=wss://slf-esport.fr/ws
VITE_ENVIRONMENT=production
```

**Générer clés secrètes sécurisées** :

```bash
# Générer SECRET_KEY (Python)
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Générer JWT_SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Générer mot de passe PostgreSQL
python3 -c "import secrets; print(secrets.token_urlsafe(32))"

# Générer mot de passe Redis
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3.3 Créer Docker Compose Production

Créer `docker-compose.prod.yml` :

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: slf-postgres-prod
    restart: always
    environment:
      POSTGRES_DB: ${POSTGRES_DB}
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - slf-network
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: slf-redis-prod
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - slf-network
    healthcheck:
      test: ["CMD", "redis-cli", "--raw", "incr", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: slf-backend-prod
    restart: always
    env_file:
      - .env
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    networks:
      - slf-network
    volumes:
      - ./backend/app:/app/app
      - media_uploads:/app/media
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        VITE_API_URL: ${VITE_API_URL}
        VITE_WEBSOCKET_URL: ${VITE_WEBSOCKET_URL}
        VITE_ENVIRONMENT: ${VITE_ENVIRONMENT}
    container_name: slf-frontend-prod
    restart: always
    networks:
      - slf-network

  nginx:
    image: nginx:alpine
    container_name: slf-nginx
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/ssl:/etc/nginx/ssl
      - ./frontend/dist:/usr/share/nginx/html
    depends_on:
      - backend
      - frontend
    networks:
      - slf-network

volumes:
  postgres_data:
  redis_data:
  media_uploads:

networks:
  slf-network:
    driver: bridge
```

### 3.4 Créer Dockerfile Production Frontend

Créer `frontend/Dockerfile.prod` :

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copier package.json
COPY package*.json ./

# Installer dépendances
RUN npm ci

# Copier code source
COPY . .

# Build arguments
ARG VITE_API_URL
ARG VITE_WEBSOCKET_URL
ARG VITE_ENVIRONMENT

ENV VITE_API_URL=$VITE_API_URL
ENV VITE_WEBSOCKET_URL=$VITE_WEBSOCKET_URL
ENV VITE_ENVIRONMENT=$VITE_ENVIRONMENT

# Build production
RUN npm run build

# Étape finale - servir avec Nginx
FROM nginx:alpine

# Copier build
COPY --from=builder /app/dist /usr/share/nginx/html

# Exposer port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 3.5 Lancer l'Application

```bash
# Build images
docker compose -f docker-compose.prod.yml build

# Lancer services
docker compose -f docker-compose.prod.yml up -d

# Vérifier logs
docker compose -f docker-compose.prod.yml logs -f

# Vérifier statut
docker compose -f docker-compose.prod.yml ps
```

### 3.6 Initialiser Base de Données

```bash
# Seed exercices
docker exec slf-backend-prod python seed_exercises.py

# Seed jeux natifs
docker exec slf-backend-prod python seed_native_games.py

# Créer comptes Manager & Coach (à faire après avoir créé le script)
docker exec slf-backend-prod python seed_admin_accounts.py
```

---

## 🌐 ÉTAPE 4 : CONFIGURER NGINX

### 4.1 Créer Configuration Nginx

Créer `docker/nginx/nginx.conf` :

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logs
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss;

    # Serveur HTTP (redirect vers HTTPS)
    server {
        listen 80;
        server_name slf-esport.fr www.slf-esport.fr;

        # ACME Challenge pour Let's Encrypt
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }

        # Redirect vers HTTPS
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # Serveur HTTPS
    server {
        listen 443 ssl http2;
        server_name slf-esport.fr www.slf-esport.fr;

        # Certificats SSL
        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # SSL Config
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_prefer_server_ciphers on;
        ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';

        # Max upload size
        client_max_body_size 100M;

        # Frontend (React build)
        location / {
            root /usr/share/nginx/html;
            try_files $uri $uri/ /index.html;
        }

        # Backend API
        location /api/ {
            proxy_pass http://backend:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket
        location /ws/ {
            proxy_pass http://backend:8000/ws/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # Health check
        location /health {
            proxy_pass http://backend:8000/health;
        }
    }
}
```

---

## 🔒 ÉTAPE 5 : CONFIGURER SSL/HTTPS (Let's Encrypt)

### 5.1 Installer Certbot

```bash
# Installer Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtenir certificat SSL (remplacer par votre domaine)
sudo certbot certonly --webroot -w /var/www/certbot -d slf-esport.fr -d www.slf-esport.fr

# Copier certificats dans docker/nginx/ssl
sudo mkdir -p docker/nginx/ssl
sudo cp /etc/letsencrypt/live/slf-esport.fr/fullchain.pem docker/nginx/ssl/
sudo cp /etc/letsencrypt/live/slf-esport.fr/privkey.pem docker/nginx/ssl/
```

### 5.2 Auto-Renewal

```bash
# Tester renouvellement
sudo certbot renew --dry-run

# Ajouter tâche cron pour auto-renouvellement
sudo crontab -e

# Ajouter cette ligne (renouvelle tous les jours à 3h du matin)
0 3 * * * certbot renew --quiet && docker compose -f /home/slf/SLF-Esport/docker-compose.prod.yml restart nginx
```

---

## 🔥 ÉTAPE 6 : CONFIGURER FIREWALL

```bash
# Installer UFW
sudo apt install -y ufw

# Autoriser SSH (IMPORTANT avant d'activer!)
sudo ufw allow ssh
sudo ufw allow 22/tcp

# Autoriser HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Activer firewall
sudo ufw enable

# Vérifier statut
sudo ufw status
```

---

## 💾 ÉTAPE 7 : BACKUPS AUTOMATIQUES

### 7.1 Script Backup PostgreSQL

Créer `scripts/backup-db.sh` :

```bash
#!/bin/bash

# Variables
BACKUP_DIR="/home/slf/backups"
DATE=$(date +%Y%m%d_%H%M%S)
CONTAINER="slf-postgres-prod"
DB_NAME="slf_esport_prod"
DB_USER="slf_user"

# Créer dossier backups
mkdir -p $BACKUP_DIR

# Backup PostgreSQL
docker exec $CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/backup_${DATE}.sql.gz

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_${DATE}.sql.gz"
```

### 7.2 Automatiser Backups

```bash
# Rendre script exécutable
chmod +x scripts/backup-db.sh

# Ajouter tâche cron (backup quotidien à 2h du matin)
crontab -e

# Ajouter:
0 2 * * * /home/slf/SLF-Esport/scripts/backup-db.sh
```

---

## 📊 ÉTAPE 8 : MONITORING & LOGS

### 8.1 Voir Logs

```bash
# Tous les services
docker compose -f docker-compose.prod.yml logs -f

# Service spécifique
docker compose -f docker-compose.prod.yml logs -f backend

# Dernières 100 lignes
docker compose -f docker-compose.prod.yml logs --tail=100 backend
```

### 8.2 Statistiques

```bash
# Utilisation ressources
docker stats

# Espace disque
df -h

# Mémoire
free -h
```

---

## 🔄 ÉTAPE 9 : MISES À JOUR

### 9.1 Déployer Nouvelles Versions

```bash
# Sur votre machine locale
git add .
git commit -m "Update: nouvelle fonctionnalité"
git push origin main

# Sur le VPS
cd /home/slf/SLF-Esport
git pull origin main

# Rebuild & redéployer
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Vérifier logs
docker compose -f docker-compose.prod.yml logs -f
```

### 9.2 Migrations Base de Données (si nécessaire)

```bash
# Si vous utilisez Alembic pour migrations
docker exec slf-backend-prod alembic upgrade head
```

---

## 🚨 DÉPANNAGE

### Problème 1 : Containers ne démarrent pas

```bash
# Voir logs détaillés
docker compose -f docker-compose.prod.yml logs

# Rebuild complet
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### Problème 2 : 502 Bad Gateway

```bash
# Vérifier backend fonctionne
docker exec slf-backend-prod curl http://localhost:8000/health

# Redémarrer Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Problème 3 : Base de données corrompue

```bash
# Restaurer backup
gunzip -c /home/slf/backups/backup_YYYYMMDD_HHMMSS.sql.gz | docker exec -i slf-postgres-prod psql -U slf_user -d slf_esport_prod
```

---

## 💰 COÛTS ESTIMÉS

| Service | Coût mensuel | Annuel |
|---------|--------------|--------|
| VPS OVH Starter | 3,50€ HT (~4,20€ TTC) | ~50€ |
| Nom de domaine .fr | ~1€/mois | ~12€ |
| SSL Let's Encrypt | Gratuit | Gratuit |
| **TOTAL** | **~5€/mois** | **~60€/an** |

---

## ✅ CHECKLIST PRÉ-PRODUCTION

- [ ] VPS OVH commandé et configuré
- [ ] Docker + Docker Compose installés
- [ ] Variables `.env` production configurées
- [ ] Clés secrètes générées (SECRET_KEY, JWT, passwords)
- [ ] SSL/HTTPS configuré (Let's Encrypt)
- [ ] Firewall UFW activé
- [ ] Backups automatiques configurés
- [ ] Nom de domaine pointé vers IP VPS
- [ ] Tests end-to-end réussis
- [ ] Comptes Manager & Coach créés
- [ ] Monitoring logs configuré

---

## 📞 SUPPORT

**VPS OVH** :
- Documentation : https://docs.ovh.com/fr/vps/
- Support : https://www.ovh.com/manager/

**Docker** :
- Documentation : https://docs.docker.com/

**Let's Encrypt** :
- Documentation : https://letsencrypt.org/docs/

---

**Guide créé par TAKUMI Agent pour La Salade de Fruits E-Sport** 🥗
