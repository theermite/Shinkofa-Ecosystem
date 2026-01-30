# Infrastructure VPS OVH

> Configuration et services du serveur de production.

---

## Serveur

| Spec | Valeur |
|------|--------|
| **Fournisseur** | OVH |
| **OS** | Ubuntu 25.04 (Plucky) |
| **CPU** | 8 cores Intel Haswell |
| **RAM** | 22 GB (18 GB disponible) |
| **Stockage** | 193 GB total, 163 GB libre (16% utilisé) |
| **IP** | 217.182.206.127 |

---

## Projets Déployés

### 1. Shinkofa Platform (Principal - En cours)

| Environnement | Domaine | Services |
|---------------|---------|----------|
| **Production** | app.shinkofa.com | Web :3000, API Auth, API Shizen :8001 |
| **Alpha/Staging** | alpha.shinkofa.com | Web :3100, API Auth :8100, API Shizen :8101 |

**Stack** : Next.js + FastAPI + PostgreSQL + Redis

### 2. SLF-Esport (En cours)

| Environnement | Domaine | Services |
|---------------|---------|----------|
| **Production** | lslf.shinkofa.com | Frontend :3001, Backend :8003 |
| **Dev** | devslf.shinkofa.com | - |

**Stack** : Nginx + FastAPI + PostgreSQL :5433 + Redis :6380

### 3. Ermite Toolbox (Widgets)

| Domaine | Service |
|---------|---------|
| tools.theermite.com | API :8050 + Widgets statiques |
| brain-training.theermite.com | Platform Control Center :3002 |

**Widgets déployés** (15) :
- breathing-exercise, dodge-master, image-pairs, last-hit-trainer
- memory-cards, multi-task, pattern-recall, peripheral-vision
- reaction-time, sequence-memory, skillshot-trainer, tracking-focus
- task-manager, **daily-journal** (nouveau)

**DB** : PostgreSQL système (brain_training)

### 4. ~~Planner Shinkofa~~ (Archivé - 2026-01-20)

Code utile extrait vers daily-journal widget. Conteneurs supprimés.

---

## Services Additionnels

### N8N (Automation)
- **Domaine** : n8n.theermite.com
- **Port** : 5678 (localhost)
- **DB** : PostgreSQL système (n8n_publisher)
- **Stockage** : /home/ubuntu/n8n-data

### Ermite Toolbox API
- **Domaine** : tools.theermite.com
- **Port** : 8050 (localhost)
- **Service** : FastAPI (systemd)
- **Widgets** : /var/www/tools.theermite.com/widgets/

---

## Conteneurs Docker (14 total)

| Projet | Conteneurs |
|--------|------------|
| Shinkofa Alpha | 4 (web, api-auth, api-shizen, postgres, redis) |
| Shinkofa Prod | 5 (web, api-auth, api-shizen, postgres, redis) |
| SLF | 4 (frontend, backend, postgres, redis) |
| N8N | 1 |

---

## Ports

### Publics (exposés internet)
| Port | Service |
|------|---------|
| 80, 443 | Nginx (HTTP/HTTPS) |
| 22 | SSH |
| 3001 | SLF Frontend |
| 3002 | Brain Training Platform |
| 5433 | PostgreSQL SLF |
| 5434 | PostgreSQL système |
| 6380 | Redis SLF |
| 8003 | SLF Backend |

### Localhost uniquement
| Port | Service |
|------|---------|
| 3000 | Shinkofa Web Prod |
| 3100 | Shinkofa Web Alpha |
| 5678 | N8N |
| 8001 | Shinkofa API Shizen Prod |
| 8050 | Ermite Toolbox API |
| 8100 | Shinkofa API Auth Alpha |
| 8101 | Shinkofa API Shizen Alpha |

---

## Certificats SSL (Let's Encrypt)

| Domaine | Expiration | Status |
|---------|------------|--------|
| tools.theermite.com | 2026-04-17 | ✅ 87j |
| app.shinkofa.com | 2026-04-13 | ✅ 84j |
| alpha.shinkofa.com | 2026-04-05 | ✅ 76j |
| devslf.shinkofa.com | 2026-04-04 | ✅ 75j |
| brain-training.theermite.com | 2026-03-28 | ✅ 68j |
| n8n.theermite.com | 2026-03-12 | ✅ 51j |
| shizen.shinkofa.com | 2026-03-11 | ✅ 51j |
| lslf.shinkofa.com | 2026-03-04 | ⚠️ 43j |

---

## Bases de Données

### PostgreSQL Système (port 5434)
- `brain_training` (user: brain_training)
- `n8n_publisher` (user: n8n_user)

### PostgreSQL Docker
- **Shinkofa Alpha** : shinkofa_auth_alpha + shinkofa_shizen_planner_alpha
- **Shinkofa Prod** : shinkofa_auth_prod + shinkofa_shizen_planner_prod
- **SLF** : slf_user (port 5433)

### Redis
- Shinkofa Alpha/Prod
- SLF (port 6380 public)

---

## Réseaux Docker

- shinkofa-alpha_shinkofa-alpha-network
- docker_shinkofa-alpha-network
- docker_shinkofa-prod-network
- shinkofa-platform_shinkofa-network
- slf-esport_slf-network
- n8n_default
- bridge, host, none

---

## ⚠️ Points d'Attention

1. **SSL lslf.shinkofa.com** : Expire dans 43 jours
2. **Sécurité** : Ports DB/Redis exposés publiquement (5433, 6380)

---

## Configuration SSH

### Fichier Config (`~/.ssh/config`)

**Clé utilisée** : `~/.ssh/id_ed25519` (ermite-game-windows)

```ssh-config
# VPS OVH - Tous projets (Shinkofa, SLF, Ermite Toolbox)
Host vps-shinkofa
    HostName 217.182.206.127
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes

# Alias court
Host vps
    HostName 217.182.206.127
    User ubuntu
    IdentityFile ~/.ssh/id_ed25519
    IdentitiesOnly yes
    AddKeysToAgent yes
```

### Clés Autorisées sur le VPS

```
ssh-ed25519 ...pe+g ermite-game-windows        ✅ Machine principale Jay
ssh-ed25519 ...lRQ  github-actions-deploy      ✅ CI/CD GitHub
ssh-ed25519 ...tCP  toolbox-deploy-windows     ✅ Déploiement Ermite Toolbox
```

### Utilisation

```bash
# Connexion (aucun mot de passe demandé)
ssh vps

# Commande directe
ssh vps "docker ps"

# Copie fichiers
scp fichier.txt vps:/home/ubuntu/

# Git (si remote configuré)
git push vps main
```

---

## Commandes Fréquentes

```bash
# Connexion
ssh vps

# Status containers
docker ps -a

# Logs projet
docker-compose -f /path/to/project/docker-compose.yml logs -f

# Restart projet
cd /path/to/project && docker-compose down && docker-compose up -d

# Espace disque
df -h
docker system prune -a  # Nettoyage Docker
```

---

**Dernière mise à jour** : 2026-01-22
