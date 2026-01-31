# SLF E-Sport - Plateforme d'Entraînement E-Sport

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-Shinkofa-green)

**Plateforme complète de coaching et d'entraînement pour joueurs e-sport**, développée pour **La Salade de Fruits - Shinkofa**.

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Prérequis](#-prérequis)
- [Installation & Lancement](#-installation--lancement)
- [Accès aux services](#-accès-aux-services)
- [Structure du projet](#-structure-du-projet)
- [Guide de test](#-guide-de-test)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Aperçu

**SLF E-Sport** est une plateforme web complète permettant aux joueurs e-sport de :
- S'entraîner avec des exercices cognitifs et des mini-jeux
- Suivre leurs performances avec des analytics détaillés
- Gérer leur calendrier et réserver des sessions de coaching
- Utiliser un journal holistique (bien-être, nutrition, sommeil)
- Accéder à une bibliothèque de médias (vidéos, guides)

---

## ✨ Fonctionnalités

### 🎮 Entraînement
- **Bibliothèque d'exercices** : Exercices cognitifs, réflexes, coordination
- **Mini-jeux personnalisés** :
  - Peripheral Vision Trainer (entraînement vision périphérique)
  - Multi-Task Test (gestion multi-tâches)
- **Suivi de progression** : Historique des scores, statistiques

### 📊 Analytics
- Dashboard complet avec graphiques (Recharts)
- Statistiques de performance
- Évolution dans le temps
- Insights personnalisés

### 📅 Calendrier & Sessions
- Réservation de sessions de coaching
- Calendrier interactif (React Big Calendar)
- Gestion des disponibilités
- Notifications

### 🧘 Coaching Holistique
- **Journal quotidien** : Sommeil, nutrition, bien-être mental
- **Objectifs** : Création et suivi d'objectifs SMART
- **Questionnaires** : Évaluations périodiques

### 📚 Bibliothèque Média
- Upload de fichiers (vidéos, PDF, images)
- Playlists organisées
- Lecteur vidéo intégré
- Filtres et recherche

### 👥 Gestion Utilisateurs
- 3 rôles : Joueur, Coach, Manager
- Dashboards personnalisés selon le rôle
- Authentification JWT sécurisée

---

## 🏗️ Architecture

### Stack Technique

**Backend** :
- **FastAPI** (Python 3.11+) - API REST async
- **PostgreSQL 15** - Base de données relationnelle
- **Redis 7** - Cache et sessions
- **SQLAlchemy 2.0** - ORM
- **Pydantic V2** - Validation
- **WebSockets** - Communication temps réel

**Frontend** :
- **React 18** + **TypeScript 5**
- **Vite 5** - Build tool
- **TailwindCSS 3** - Design system
- **Zustand** - State management
- **React Query** - Data fetching
- **React Router DOM 6** - Routing
- **React Big Calendar** - Calendrier
- **Recharts** - Graphiques

**DevOps** :
- **Docker** + **Docker Compose** - Containerization
- **Nginx** - Reverse proxy (production)
- **GitHub Actions** - CI/CD (à venir)

### Microservices

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (prod)                       │
│                  Reverse Proxy (80/443)                 │
└────────────┬──────────────────────────────┬─────────────┘
             │                              │
    ┌────────▼────────┐          ┌─────────▼──────────┐
    │   Frontend      │          │    Backend         │
    │   React + TS    │◄─────────┤    FastAPI         │
    │   Port 3000     │  HTTP    │    Port 8000       │
    └─────────────────┘          └──────┬──────┬──────┘
                                        │      │
                           ┌────────────▼──┐ ┌▼──────────┐
                           │  PostgreSQL   │ │   Redis   │
                           │  Port 5432    │ │ Port 6379 │
                           └───────────────┘ └───────────┘
```

---

## 🔧 Prérequis

### Obligatoire
- **Docker Desktop** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**

### Optionnel (pour dev local sans Docker)
- **Python 3.11+**
- **Node.js 18+** + **npm 9+**
- **PostgreSQL 15**
- **Redis 7**

---

## 🚀 Installation & Lancement

### Option A : Docker (RECOMMANDÉ) 🐳

**1. Cloner le projet** (si pas déjà fait)
```bash
git clone https://github.com/theermite/SLF-Esport.git
cd SLF-Esport
```

**2. Vérifier le fichier .env**
```bash
# Le fichier .env est déjà configuré pour le dev
# Pas besoin de le modifier pour tester
```

**3. Lancer tous les services**
```bash
docker-compose up --build
```

**Temps de build initial** : ~5-10 minutes (téléchargement images + build)

**4. Vérifier que tout fonctionne**
```bash
# Dans un autre terminal
docker-compose ps
```

Vous devriez voir 4 services **Up** :
- `slf-postgres` (PostgreSQL)
- `slf-redis` (Redis)
- `slf-backend` (FastAPI)
- `slf-frontend` (React)

**5. Accéder à l'application**
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **API Docs** : http://localhost:8000/docs

---

### Option B : Installation locale (dev)

<details>
<summary>Cliquez pour voir les instructions d'installation locale</summary>

**Backend**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Lancer PostgreSQL et Redis localement
# Puis lancer le backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```
</details>

---

## 🌐 Accès aux services

| Service | URL | Credentials (dev) |
|---------|-----|-------------------|
| **Frontend React** | http://localhost:3000 | - |
| **Backend API** | http://localhost:8000 | - |
| **API Docs (Swagger)** | http://localhost:8000/docs | - |
| **API Redoc** | http://localhost:8000/redoc | - |
| **Health Check** | http://localhost:8000/health | - |
| **PostgreSQL** | localhost:5432 | User: `slf_user`<br>Pass: `slf_password_change_me`<br>DB: `slf_esport` |
| **Redis** | localhost:6379 | - |

### Comptes de test

Les comptes seront créés lors de votre première inscription via l'interface web.

**Pour créer un compte admin/coach** :
1. Inscrivez-vous normalement
2. Connectez-vous à la base PostgreSQL
3. Modifiez le rôle dans la table `users`

Ou utilisez les seeds (si disponibles) :
```bash
docker-compose exec backend python app/seed_data.py
```

---

## 📁 Structure du projet

```
SLF-Esport/
├── backend/                    # Backend FastAPI
│   ├── app/
│   │   ├── core/              # Config, DB, Security
│   │   ├── models/            # SQLAlchemy models
│   │   ├── routes/            # API endpoints
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   └── main.py            # Entry point
│   ├── tests/                 # Tests backend
│   ├── Dockerfile
│   └── requirements.txt
│
├── frontend/                  # Frontend React
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Pages/Routes
│   │   ├── services/          # API services
│   │   ├── store/             # Zustand stores
│   │   ├── types/             # TypeScript types
│   │   └── App.tsx
│   ├── Dockerfile
│   └── package.json
│
├── docker/                    # Docker config
│   └── nginx/                 # Nginx config (prod)
│
├── docker-compose.yml         # Services orchestration
├── .env                       # Variables d'environnement
├── .env.example               # Template .env
├── COPYRIGHT.md               # Licence & Copyright
└── README.md                  # Ce fichier
```

---

## 🧪 Guide de test

Voir le fichier **[USER-GUIDE.md](./USER-GUIDE.md)** pour un guide détaillé de test de toutes les fonctionnalités.

### Checklist rapide

- [ ] Inscription + Connexion
- [ ] Dashboard selon rôle (Joueur/Coach/Manager)
- [ ] Bibliothèque d'exercices
- [ ] Mini-jeux (Peripheral Vision, Multi-Task)
- [ ] Calendrier & Réservation de sessions
- [ ] Journal de coaching
- [ ] Objectifs
- [ ] Bibliothèque média
- [ ] Analytics Dashboard
- [ ] Profil utilisateur

---

## 🐛 Troubleshooting

### ✅ Problème résolu : Les exercices ne s'affichent pas (Mixed Content Error)

**Symptômes** :
- Page `/exercises` affiche "Erreur de chargement"
- Console navigateur : `Mixed Content: The page at 'https://...' was loaded over HTTPS, but requested an insecure XMLHttpRequest endpoint 'http://...'`

**Cause** :
- Nginx ne convertissait pas les redirections 307 de FastAPI de HTTP vers HTTPS
- Les exercices custom n'avaient pas d'URL configurée

**Solution appliquée** ✅ :
1. **Nginx** : Ajout de `proxy_redirect http:// https://;` dans `/etc/nginx/sites-available/slf-esport`
2. **Base de données** : Mise à jour des URLs des exercices custom vers `/games/peripheral-vision` et `/games/multi-task`
3. **Frontend** : Différenciation liens internes (React Router) vs externes (nouvel onglet)

**Référence** : Voir `NGINX-CONFIG.md` et `backend/migrations/fix_custom_exercises_urls.sql`

---

### Problème : Les containers ne démarrent pas

**Solution** :
```bash
# Arrêter tous les containers
docker-compose down

# Nettoyer les volumes
docker-compose down -v

# Rebuild complet
docker-compose up --build --force-recreate
```

### Problème : Port déjà utilisé

**Erreur** : `Error starting userland proxy: listen tcp4 0.0.0.0:3000: bind: address already in use`

**Solution** :
```bash
# Option 1 : Arrêter le process qui utilise le port
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Option 2 : Modifier le port dans docker-compose.yml
ports:
  - "3001:3000"  # Change 3001 vers le port libre
```

### Problème : Backend crash au démarrage

**Vérifier** :
```bash
# Logs backend
docker-compose logs backend

# Logs PostgreSQL
docker-compose logs postgres
```

**Solutions courantes** :
- PostgreSQL pas prêt → Attendre 30s puis relancer
- Variables .env manquantes → Vérifier .env
- Port 8000 occupé → Libérer le port

### Problème : Frontend page blanche

**Vérifier** :
```bash
# Logs frontend
docker-compose logs frontend

# Vérifier que le backend répond
curl http://localhost:8000/health
```

**Solutions** :
- Backend pas démarré → Attendre que backend soit UP
- Variables REACT_APP_ incorrectes → Vérifier .env
- Build error → Vérifier logs frontend

### Problème : Base de données vide

**Initialiser les données** :
```bash
# Accéder au container backend
docker-compose exec backend bash

# Lancer le seed (si disponible)
python app/seed_data.py

# Ou créer manuellement un user via API
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@slf.com",
    "password": "TestPass123!",
    "full_name": "Test User"
  }'
```

### Problème : Permissions Docker (Linux/Mac)

**Erreur** : `Permission denied`

**Solution** :
```bash
# Ajouter votre user au groupe docker
sudo usermod -aG docker $USER

# Se déconnecter/reconnecter
# Ou relancer Docker Desktop
```

### Réinitialisation complète

**Si tout casse** :
```bash
# ATTENTION : Ceci supprime TOUTES les données
docker-compose down -v
docker system prune -a --volumes
docker-compose up --build
```

---

## 📚 Documentation complémentaire

- **[USER-GUIDE.md](./USER-GUIDE.md)** - Guide de test utilisateur
- **[COPYRIGHT.md](./COPYRIGHT.md)** - Licence et copyright
- **[CHANGELOG.md](./.claude/templates/CHANGELOG.md)** - Historique des versions
- **API Docs** : http://localhost:8000/docs (après lancement)

---

## 🤝 Contribution

Projet privé - **La Voie Shinkofa**.
Pour toute question : contact@shinkofa.com

---

## 📄 Licence

© 2024 La Voie Shinkofa - Tous droits réservés.
Voir [COPYRIGHT.md](./COPYRIGHT.md) pour plus de détails.

---

## 🚀 Prochaines étapes (Roadmap)

- [x] ~~Déploiement VPS OVH~~ ✅ (https://lslf.shinkofa.com)
- [x] ~~Configuration HTTPS avec Let's Encrypt~~ ✅
- [x] ~~Fix Mixed Content Error pour exercices~~ ✅
- [x] ~~Support exercices custom internes~~ ✅
- [ ] CI/CD GitHub Actions
- [ ] Tests E2E (Playwright)
- [ ] Monitoring (Sentry)
- [ ] Intégration Discord
- [ ] Notifications email
- [ ] Export PDF des rapports
- [ ] PWA mobile

---

**Développé avec ❤️ par Jay The Ermite & TAKUMI Agent pour La Salade de Fruits - Shinkofa**
