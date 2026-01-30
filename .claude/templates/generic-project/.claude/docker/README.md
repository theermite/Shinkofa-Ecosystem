# Docker Configuration - [Nom Projet]

> Configuration Docker centralisée pour environnements de développement et production.

**Dernière mise à jour** : [DATE]

---

## 📁 Structure

```
.claude/docker/
├── README.md                    # Ce fichier
├── docker-compose.yml           # Composition services principale
├── docker-compose.dev.yml       # Override développement
├── docker-compose.prod.yml      # Override production
├── .env.example                 # Variables d'environnement template
└── Dockerfile                   # Image application (si applicable)
```

---

## 🎯 Philosophie

**Centralisation** : Toute configuration Docker dans `.claude/docker/`
- ✅ Facile à trouver
- ✅ Isolé du code application
- ✅ Versionné avec projet
- ✅ Réutilisable entre environnements

**Pourquoi pas à la racine ?**
- Racine projet = code application
- `.claude/` = configuration outillage
- Séparation claire des responsabilités

---

## 🚀 Quick Start

### 1. Configuration Initiale

```bash
# Copier template variables d'environnement
cp .claude/docker/.env.example .claude/docker/.env

# Éditer variables selon votre environnement
nano .claude/docker/.env
```

### 2. Développement Local

```bash
# Démarrer tous les services en mode dev
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.dev.yml \
               up -d

# Voir les logs
docker-compose -f .claude/docker/docker-compose.yml logs -f

# Arrêter
docker-compose -f .claude/docker/docker-compose.yml down
```

### 3. Production

```bash
# Build images
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.prod.yml \
               build

# Démarrer en production
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.prod.yml \
               up -d
```

---

## 📋 Services

### Service : app

**Description** : Application principale [Backend / Frontend / Fullstack]

**Ports** :
- DEV : `8000:8000`
- PROD : `8000` (via nginx)

**Volumes** :
- DEV : Code monté (`./:/app`) pour hot-reload
- PROD : Code dans image (pas de mount)

**Variables d'environnement** : Voir `.env.example`

---

### Service : db

**Description** : Base de données [PostgreSQL / MySQL / MongoDB]

**Ports** :
- DEV : `5432:5432` (exposé pour accès local)
- PROD : Interne uniquement (pas exposé)

**Volumes** :
- `db-data:/var/lib/postgresql/data` (persistance)

**Backup** : Voir section Backup ci-dessous

---

### Service : redis (optionnel)

**Description** : Cache Redis

**Ports** :
- DEV : `6379:6379`
- PROD : Interne uniquement

**Volumes** :
- `redis-data:/data`

---

### Service : nginx (production uniquement)

**Description** : Reverse proxy + serveur statiques

**Ports** :
- `80:80` (HTTP)
- `443:443` (HTTPS)

**Configuration** : `nginx/nginx.conf`

---

## 🔧 Commandes Utiles

### Gestion Services

```bash
# Démarrer un service spécifique
docker-compose -f .claude/docker/docker-compose.yml up -d app

# Redémarrer un service
docker-compose -f .claude/docker/docker-compose.yml restart app

# Arrêter tous les services
docker-compose -f .claude/docker/docker-compose.yml down

# Arrêter ET supprimer volumes (⚠️ perte données)
docker-compose -f .claude/docker/docker-compose.yml down -v
```

### Logs & Debug

```bash
# Logs tous services
docker-compose -f .claude/docker/docker-compose.yml logs -f

# Logs service spécifique
docker-compose -f .claude/docker/docker-compose.yml logs -f app

# Logs avec tail (100 dernières lignes)
docker-compose -f .claude/docker/docker-compose.yml logs --tail=100 app

# Shell dans container
docker-compose -f .claude/docker/docker-compose.yml exec app bash
```

### Build & Images

```bash
# Build images
docker-compose -f .claude/docker/docker-compose.yml build

# Build sans cache
docker-compose -f .claude/docker/docker-compose.yml build --no-cache

# Pull images
docker-compose -f .claude/docker/docker-compose.yml pull

# Liste images
docker images | grep [projet]
```

### Nettoyage

```bash
# Supprimer containers arrêtés
docker-compose -f .claude/docker/docker-compose.yml rm -f

# Nettoyer volumes inutilisés
docker volume prune

# Nettoyer images inutilisées
docker image prune -a

# Nettoyage complet système Docker
docker system prune -a --volumes
```

---

## 🗄️ Volumes & Données

### Volumes Déclarés

```yaml
volumes:
  db-data:        # Données base de données
  redis-data:     # Données cache Redis
  app-uploads:    # Fichiers uploadés (si applicable)
```

### Backup Volumes

#### Backup Base de Données

```bash
# PostgreSQL
docker-compose -f .claude/docker/docker-compose.yml exec db \
  pg_dump -U postgres [dbname] > backup-$(date +%Y%m%d).sql

# Restaurer
docker-compose -f .claude/docker/docker-compose.yml exec -T db \
  psql -U postgres [dbname] < backup-20260126.sql
```

#### Backup Volume Complet

```bash
# Backup volume dans archive
docker run --rm \
  -v [projet]_db-data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/db-data-backup-$(date +%Y%m%d).tar.gz -C /data .

# Restaurer volume depuis archive
docker run --rm \
  -v [projet]_db-data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/db-data-backup-20260126.tar.gz -C /data
```

---

## 🔐 Secrets & Variables

### Fichier .env

**IMPORTANT** : `.env` est dans `.gitignore`, jamais commité.

**Template** : `.env.example` (commité, sans valeurs sensibles)

```bash
# .env.example
DATABASE_URL=postgresql://user:password@db:5432/dbname
SECRET_KEY=change-me-in-production
REDIS_URL=redis://redis:6379
```

### Bonnes Pratiques Secrets

✅ **À FAIRE** :
- Utiliser `.env.example` comme template
- Documenter toutes les variables requises
- Générer secrets uniques par environnement
- Utiliser secrets managers en production (Vault, AWS Secrets Manager)

❌ **NE PAS FAIRE** :
- Committer `.env` avec secrets réels
- Hardcoder secrets dans docker-compose.yml
- Utiliser mêmes secrets dev/prod
- Partager secrets par email/Slack

### Générer Secrets

```bash
# Secret aléatoire
openssl rand -hex 32

# UUID
uuidgen

# Password fort
openssl rand -base64 48
```

---

## 🌍 Environnements

### Développement (docker-compose.dev.yml)

**Caractéristiques** :
- ✅ Code monté (hot-reload)
- ✅ Ports exposés (accès direct services)
- ✅ Logs verbeux
- ✅ Debug activé
- ❌ Pas de SSL
- ❌ Pas de reverse proxy

**Usage** :
```bash
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.dev.yml \
               up -d
```

---

### Production (docker-compose.prod.yml)

**Caractéristiques** :
- ✅ Code dans image (pas de mount)
- ✅ Nginx reverse proxy
- ✅ SSL/TLS
- ✅ Optimisations performance
- ❌ Ports internes uniquement (sauf 80/443)
- ❌ Pas de debug

**Usage** :
```bash
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.prod.yml \
               up -d
```

---

## 🔍 Health Checks

Chaque service devrait avoir un health check :

```yaml
services:
  app:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
```

**Vérifier santé** :
```bash
docker-compose -f .claude/docker/docker-compose.yml ps
```

---

## 📊 Monitoring

### Logs Centralisés

```bash
# Suivre tous les logs
docker-compose -f .claude/docker/docker-compose.yml logs -f

# Filtrer par niveau
docker-compose -f .claude/docker/docker-compose.yml logs -f | grep ERROR
```

### Métriques Containers

```bash
# Stats temps réel
docker stats

# Stats service spécifique
docker stats [projet]_app_1
```

### Portainer (optionnel)

Interface web pour gérer Docker :

```bash
docker run -d -p 9000:9000 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  portainer/portainer-ce
```

Accès : http://localhost:9000

---

## 🐛 Troubleshooting

### Container redémarre en boucle

```bash
# Voir logs
docker-compose -f .claude/docker/docker-compose.yml logs app

# Vérifier health check
docker inspect [projet]_app_1 | grep -A 10 Health

# Désactiver temporairement restart policy
docker-compose -f .claude/docker/docker-compose.yml up app
```

### Erreur "port already in use"

```bash
# Trouver processus utilisant le port
lsof -i :8000   # Linux/macOS
netstat -ano | findstr :8000   # Windows

# Changer port dans docker-compose.yml ou stopper processus
```

### Volumes corrompus

```bash
# Sauvegarder données si possible
# Puis supprimer et recréer volume
docker-compose -f .claude/docker/docker-compose.yml down -v
docker-compose -f .claude/docker/docker-compose.yml up -d
```

### Permission denied (volumes)

**Linux** :
```bash
# Vérifier UID/GID
id

# Ajuster dans Dockerfile
USER 1000:1000
```

**Windows** :
```bash
# Vérifier Docker Desktop settings
# Enable "Use Docker Compose V2"
# Enable file sharing for project directory
```

### Voir lessons learned Docker

```bash
/search-registry "docker"
# Ou
python .claude/scripts/rag-manager.py search docker
```

---

## 📚 Ressources

### Documentation Officielle

- [Docker Compose](https://docs.docker.com/compose/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)
- [Docker Security](https://docs.docker.com/engine/security/)

### Voir Aussi

- [ARCHITECTURE.md](../docs/ARCHITECTURE.md) - Architecture déploiement
- [Lessons Learned - Docker](../../../infrastructure/lessons/docker.md)

---

## 🔄 Maintenance

### Mises à Jour Images

```bash
# Pull dernières versions
docker-compose -f .claude/docker/docker-compose.yml pull

# Rebuild
docker-compose -f .claude/docker/docker-compose.yml build --pull

# Redémarrer avec nouvelles images
docker-compose -f .claude/docker/docker-compose.yml up -d
```

### Rotation Logs

Configurer rotation dans `docker-compose.yml` :

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Backup Automatisé

Script cron :

```bash
# /etc/cron.daily/docker-backup.sh
#!/bin/bash
cd /path/to/project
docker-compose -f .claude/docker/docker-compose.yml exec -T db \
  pg_dump -U postgres dbname > /backups/db-$(date +%Y%m%d).sql
find /backups -name "db-*.sql" -mtime +30 -delete
```

---

## ✅ Checklist Déploiement

Avant de déployer en production :

- [ ] `.env` configuré avec secrets production
- [ ] Images buildées et testées
- [ ] Health checks configurés
- [ ] Volumes backup configuré
- [ ] SSL/TLS configuré (nginx)
- [ ] Firewall règles en place
- [ ] Monitoring configuré
- [ ] Logs rotation configurée
- [ ] Backup automatisé testé
- [ ] Rollback plan documenté

---

**Maintenu par** : [Équipe]
**Support** : [Contact]

---

## 💡 Raccourcis (Aliases)

Ajouter dans `~/.bashrc` ou `~/.zshrc` :

```bash
# Aliases Docker pour ce projet
alias dc='docker-compose -f .claude/docker/docker-compose.yml'
alias dcdev='docker-compose -f .claude/docker/docker-compose.yml -f .claude/docker/docker-compose.dev.yml'
alias dcprod='docker-compose -f .claude/docker/docker-compose.yml -f .claude/docker/docker-compose.prod.yml'

# Usage:
# dc up -d
# dcdev logs -f
# dcprod build
```
