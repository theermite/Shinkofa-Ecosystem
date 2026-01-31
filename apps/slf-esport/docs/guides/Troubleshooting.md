# 🔧 Troubleshooting - Plateforme SLF E-Sport

**Version** : 1.0.0
**Date** : 2025-11-29
**Auteur** : TAKUMI Agent

---

## 📋 Table des Matières

1. [Problèmes Docker](#problèmes-docker)
2. [Problèmes Frontend](#problèmes-frontend)
3. [Problèmes Backend](#problèmes-backend)
4. [Problèmes Base de Données](#problèmes-base-de-données)
5. [Problèmes de Connexion/Authentification](#problèmes-de-connexionauthentification)
6. [Problèmes de Performance](#problèmes-de-performance)
7. [Erreurs Courantes](#erreurs-courantes)
8. [Réinitialisation Complète](#réinitialisation-complète)
9. [Commandes Utiles](#commandes-utiles)
10. [Support](#support)

---

## Problèmes Docker

### ❌ Les containers ne démarrent pas

#### Symptômes
```bash
docker-compose up -d
# Erreur : "Cannot start service..."
```

#### Solutions

**1. Vérifier que Docker Desktop est lancé**
```bash
# Windows
tasklist | findstr "Docker"

# Devrait afficher "Docker Desktop.exe"
```

**2. Vérifier les ports**
```bash
# Vérifier si les ports sont déjà utilisés
netstat -ano | findstr :3001
netstat -ano | findstr :8001
netstat -ano | findstr :5433
netstat -ano | findstr :6380
```

Si un port est utilisé, soit :
- Arrête le processus qui utilise le port
- Change le port dans `docker-compose.yml`

**3. Redémarrer Docker Desktop**
- Ferme Docker Desktop complètement
- Relance Docker Desktop
- Attends qu'il soit complètement démarré (icône dans la barre des tâches)
- Réessaye `docker-compose up -d`

---

### ❌ Container en état "Unhealthy" ou "Restarting"

#### Symptômes
```bash
docker-compose ps
# slf-postgres : Unhealthy
# slf-backend  : Restarting
```

#### Solutions

**1. Voir les logs du container problématique**
```bash
docker-compose logs slf-postgres
docker-compose logs slf-backend
docker-compose logs slf-frontend
```

**2. PostgreSQL Unhealthy**

Vérifier les variables d'environnement :
```bash
# Dans .env (créer si n'existe pas)
POSTGRES_USER=slf_user
POSTGRES_PASSWORD=slf_password_change_me
POSTGRES_DB=slf_esport
```

Recréer le container :
```bash
docker-compose down
docker-compose up -d postgres
```

**3. Backend Restarting**

Vérifier la connexion à la base de données :
```bash
# Logs backend
docker-compose logs backend | grep -i error

# Vérifier que PostgreSQL est healthy avant de lancer backend
docker-compose ps postgres
```

---

### ❌ Port déjà utilisé

#### Symptômes
```
Error: Bind for 0.0.0.0:3000 failed: port is already allocated
```

#### Solutions

**1. Identifier le processus qui utilise le port**
```bash
# Windows
netstat -ano | findstr :3000

# Note le PID (dernière colonne)
# Ex: 27280
```

**2. Arrêter le processus**
```bash
# Windows (Administrateur)
taskkill /PID 27280 /F
```

**3. OU changer le port dans docker-compose.yml**
```yaml
frontend:
  ports:
    - "3001:3000"  # Au lieu de "3000:3000"
```

---

## Problèmes Frontend

### ❌ Page blanche au chargement

#### Symptômes
- Le navigateur affiche une page blanche
- Pas de contenu visible

#### Solutions

**1. Vérifier la console navigateur**
```
F12 → Onglet Console
```

Cherche des erreurs rouges :
- Erreurs de module manquant
- Erreurs de syntaxe
- Erreurs CORS

**2. Vérifier que le backend est accessible**
```bash
# Dans un navigateur ou terminal
curl http://localhost:8001/health

# Devrait répondre : {"status": "ok"}
```

**3. Vérifier les variables d'environnement**

Dans `frontend/.env` :
```
REACT_APP_API_URL=http://localhost:8001/api
REACT_APP_WEBSOCKET_URL=ws://localhost:8001/ws
```

**4. Rebuild le frontend**
```bash
docker-compose down
docker-compose up -d --build frontend
```

---

### ❌ Erreur Tailwind CSS

#### Symptômes
```
[postcss] The `border-border` class does not exist
```

#### Solution

Vérifier `frontend/src/styles/index.css` :
```css
/* Ligne 8 - Doit être : */
@apply box-border;

/* PAS : */
@apply border-border;  /* ❌ INCORRECT */
```

Si l'erreur persiste :
```bash
# Rebuild le container frontend
docker-compose down
docker-compose up -d --build frontend
```

---

### ❌ Modules npm manquants

#### Symptômes
```
Module not found: Can't resolve 'react-router-dom'
```

#### Solution

**1. Rebuild avec cache clear**
```bash
docker-compose down
docker-compose build --no-cache frontend
docker-compose up -d
```

**2. Vérifier package.json**
```bash
# Lire le fichier
cat frontend/package.json

# Vérifier que toutes les dépendances sont présentes
```

---

### ❌ Hot Reload ne fonctionne pas

#### Symptômes
- Les modifications de code ne se reflètent pas automatiquement
- Il faut recharger manuellement le navigateur

#### Solution

**1. Vérifier le volume dans docker-compose.yml**
```yaml
frontend:
  volumes:
    - ./frontend:/app
    - /app/node_modules
```

**2. Redémarrer le container**
```bash
docker-compose restart frontend
```

---

## Problèmes Backend

### ❌ Erreur 500 Internal Server Error

#### Symptômes
```
HTTP 500 Internal Server Error
```

#### Solutions

**1. Voir les logs backend**
```bash
docker-compose logs backend --tail=50
```

**2. Vérifier la connexion DB**
```bash
# Logs backend
docker-compose logs backend | grep -i "database"
```

**3. Vérifier les variables d'environnement**

Dans `backend/.env` :
```
ENVIRONMENT=development
POSTGRES_SERVER=postgres
POSTGRES_USER=slf_user
POSTGRES_PASSWORD=slf_password_change_me
POSTGRES_DB=slf_esport
DATABASE_URL=postgresql://slf_user:slf_password_change_me@postgres:5432/slf_esport
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
```

**4. Restart backend**
```bash
docker-compose restart backend
```

---

### ❌ CORS Error

#### Symptômes
```
Access to fetch at 'http://localhost:8001/api/...' from origin 'http://localhost:3001'
has been blocked by CORS policy
```

#### Solution

Vérifier `backend/app/core/config.py` :
```python
BACKEND_CORS_ORIGINS = [
    "http://localhost:3001",
    "http://localhost:3000",
    "http://127.0.0.1:3001",
    "http://127.0.0.1:3000"
]
```

Si modifié, restart backend :
```bash
docker-compose restart backend
```

---

### ❌ Erreur JWT / Token invalide

#### Symptômes
```
{"detail": "Could not validate credentials"}
```

#### Solutions

**1. Vérifier que le token est envoyé**
```javascript
// Console navigateur → Network → Headers
// Chercher : Authorization: Bearer <token>
```

**2. Supprimer le token et se reconnecter**
```javascript
// Console navigateur
localStorage.removeItem('token');
// Puis reconnecte-toi
```

**3. Vérifier JWT_SECRET_KEY**

Assure-toi qu'elle est la même partout :
```bash
# .env
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
```

---

## Problèmes Base de Données

### ❌ Erreur de connexion PostgreSQL

#### Symptômes
```
FATAL: password authentication failed for user "slf_user"
```

#### Solutions

**1. Vérifier les credentials**

Dans `docker-compose.yml` et `.env` :
```yaml
POSTGRES_USER: slf_user
POSTGRES_PASSWORD: slf_password_change_me
POSTGRES_DB: slf_esport
```

**2. Réinitialiser la base de données**
```bash
# ⚠️ ATTENTION : Supprime toutes les données !
docker-compose down -v  # -v supprime les volumes
docker-compose up -d
```

---

### ❌ Tables n'existent pas

#### Symptômes
```
relation "users" does not exist
```

#### Solutions

**1. Vérifier les logs backend au démarrage**
```bash
docker-compose logs backend | grep -i "database initialized"

# Devrait afficher :
# INFO - Database initialized successfully
```

**2. Forcer la création des tables**
```bash
# Restart backend pour déclencher la création
docker-compose restart backend
```

**3. Si ça ne fonctionne toujours pas**
```bash
# Supprime les volumes et recrée
docker-compose down -v
docker-compose up -d
```

---

### ❌ Données perdues après redémarrage

#### Symptômes
- Tous les comptes/données ont disparu après `docker-compose down`

#### Explication
- Si tu utilises `docker-compose down -v`, le flag `-v` **supprime les volumes** (données)

#### Solutions

**1. Arrêt normal (garde les données)**
```bash
docker-compose down     # ✅ Garde les données
docker-compose up -d
```

**2. Vérifier les volumes**
```bash
docker volume ls | grep slf

# Devrait afficher :
# slf-esport_postgres-data
```

**3. Backup de la base**
```bash
# Exporter la base
docker exec -t slf-postgres pg_dump -U slf_user slf_esport > backup.sql

# Restaurer
docker exec -i slf-postgres psql -U slf_user slf_esport < backup.sql
```

---

## Problèmes de Connexion/Authentification

### ❌ Impossible de se connecter

#### Symptômes
```
Identifiants invalides
```

#### Solutions

**1. Vérifier que le compte existe**
```bash
# Accéder à la base de données
docker exec -it slf-postgres psql -U slf_user -d slf_esport

# Dans psql :
SELECT email, username FROM users;
```

**2. Réinitialiser le mot de passe**

Via l'API (si endpoint existe) ou créer un nouveau compte.

**3. Vérifier le hashing du mot de passe**

Assure-toi que `bcrypt` est utilisé correctement dans le backend.

---

### ❌ Session expire immédiatement

#### Symptômes
- Connexion réussie mais déconnecté immédiatement
- Token invalide après quelques secondes

#### Solutions

**1. Vérifier la durée du token**

Dans `backend/app/core/config.py` :
```python
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 jours
```

**2. Vérifier le stockage du token**
```javascript
// Console navigateur
localStorage.getItem('token');

// Devrait afficher le token JWT
```

---

## Problèmes de Performance

### ❌ Application lente

#### Symptômes
- Chargement de pages lent
- Requêtes API qui prennent du temps

#### Solutions

**1. Vérifier les ressources Docker**

Docker Desktop → Settings → Resources :
- RAM : Au moins 4 GB
- CPU : Au moins 2 cores

**2. Vérifier les logs pour erreurs**
```bash
docker-compose logs | grep -i "error\|warning"
```

**3. Redémarrer les containers**
```bash
docker-compose restart
```

---

### ❌ Upload de fichiers échoue

#### Symptômes
```
413 Payload Too Large
```

#### Solution

Augmenter la limite dans `backend/app/core/config.py` :
```python
MAX_UPLOAD_SIZE = 100 * 1024 * 1024  # 100 MB
```

Et dans nginx (si utilisé) :
```nginx
client_max_body_size 100M;
```

---

## Erreurs Courantes

### Erreur : "Cannot find module 'X'"

**Solution** :
```bash
docker-compose build --no-cache frontend
docker-compose up -d
```

---

### Erreur : "Network slf-network not found"

**Solution** :
```bash
docker-compose down
docker network prune
docker-compose up -d
```

---

### Erreur : "Conflict. The container name is already in use"

**Solution** :
```bash
docker-compose down
docker rm -f slf-frontend slf-backend slf-postgres slf-redis
docker-compose up -d
```

---

### Frontend affiche "API Error" partout

**Solution** :
1. Vérifier que backend est UP : http://localhost:8001/health
2. Vérifier CORS (voir section CORS ci-dessus)
3. Vérifier REACT_APP_API_URL dans frontend/.env

---

## Réinitialisation Complète

Si rien ne fonctionne, **réinitialisation complète** :

### ⚠️ ATTENTION : Supprime TOUTES les données !

```bash
# 1. Arrêter tout
docker-compose down -v

# 2. Supprimer les containers
docker rm -f $(docker ps -aq)

# 3. Supprimer les images du projet
docker rmi slf-esport-frontend slf-esport-backend

# 4. Nettoyer les réseaux
docker network prune -f

# 5. Nettoyer les volumes
docker volume prune -f

# 6. Rebuild from scratch
docker-compose build --no-cache

# 7. Redémarrer
docker-compose up -d

# 8. Vérifier
docker-compose ps
docker-compose logs -f
```

---

## Commandes Utiles

### Gestion des containers

```bash
# Voir le statut
docker-compose ps

# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Restart un service
docker-compose restart backend

# Rebuild un service
docker-compose up -d --build frontend

# Voir les logs
docker-compose logs -f backend

# Voir les dernières 50 lignes
docker-compose logs backend --tail=50
```

---

### Accéder aux containers

```bash
# Accéder au backend (shell)
docker exec -it slf-backend bash

# Accéder à PostgreSQL
docker exec -it slf-postgres psql -U slf_user -d slf_esport

# Accéder au frontend
docker exec -it slf-frontend sh
```

---

### Base de données

```bash
# Dump de la base
docker exec -t slf-postgres pg_dump -U slf_user slf_esport > backup_$(date +%Y%m%d).sql

# Restaurer un dump
docker exec -i slf-postgres psql -U slf_user slf_esport < backup_20251129.sql

# Voir les tables
docker exec -it slf-postgres psql -U slf_user -d slf_esport -c "\dt"

# Compter les utilisateurs
docker exec -it slf-postgres psql -U slf_user -d slf_esport -c "SELECT COUNT(*) FROM users;"
```

---

### Nettoyage

```bash
# Nettoyer les images inutilisées
docker image prune -a

# Nettoyer les volumes inutilisés
docker volume prune

# Nettoyer les réseaux inutilisés
docker network prune

# Nettoyage complet (⚠️ supprime tout)
docker system prune -a --volumes
```

---

## Support

### Avant de demander de l'aide

1. ✅ Consulte ce guide TROUBLESHOOTING.md
2. ✅ Vérifie [GUIDE-TEST.md](./GUIDE-TEST.md)
3. ✅ Lis les logs des containers :
   ```bash
   docker-compose logs
   ```
4. ✅ Note le message d'erreur exact
5. ✅ Note les étapes pour reproduire le problème

---

### Informations à fournir

Lorsque tu rapportes un bug, fournis :

```markdown
**Environnement** :
- OS : Windows 11 / macOS / Linux
- Docker version : `docker --version`
- Docker Compose version : `docker-compose --version`

**Problème** :
[Description claire du problème]

**Étapes pour reproduire** :
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Message d'erreur** :
```
[Copie le message d'erreur exact]
```

**Logs containers** :
```bash
docker-compose logs backend --tail=50
```

**Console navigateur** (F12 → Console) :
```
[Copie les erreurs de la console]
```

**Captures d'écran** :
[Si possible]
```

---

### Ressources Externes

- **Documentation Docker** : https://docs.docker.com/
- **Documentation FastAPI** : https://fastapi.tiangolo.com/
- **Documentation React** : https://react.dev/
- **Documentation PostgreSQL** : https://www.postgresql.org/docs/
- **Documentation Tailwind CSS** : https://tailwindcss.com/docs

---

**Bonne chance ! 🔧**
