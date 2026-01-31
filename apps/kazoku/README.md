# Family Hub - Organisateur Familial Holistique

© 2025 La Voie Shinkofa

**Version**: 1.0.0 MVP
**Stack**: React 18 + Node.js/Express + MySQL

---

## 📋 Description

Family Hub est une application web complète de gestion familiale adaptée aux besoins des familles neurodiverses. L'application centralise la gestion du calendrier, des tâches ménagères, du planning des repas, des listes de courses, du suivi des bébés (Evy & Nami), et des protocoles de crise.

### Fonctionnalités principales

- 📅 **Calendrier familial** - Événements, rendez-vous, synchronisation Google Calendar
- ✓ **Tâches ménagères** - Attribution, statuts, priorités, récurrence
- 🍽️ **Planning repas** - Organisation hebdomadaire des repas
- 🛒 **Liste de courses** - Gestion par catégories, priorités, suivi de progression
- 👶 **Suivi bébés** - Repas, couches, bien-être pour Evy & Nami
- 🆘 **Protocoles de crise** - Procédures d'urgence neurodiversité
- 🔔 **Notifications** - Discord, Telegram (optionnel)
- 📥 **Export Obsidian** - Markdown exports pour tous les modules

### Adaptations neurodiversité

- Design Humain : Profils personnalisés (type, autorité)
- Interface claire et structurée
- Gestion des crises (surcharge sensorielle, meltdown, shutdown)
- Flexibilité et personnalisation

---

## 🏗️ Architecture

```
Family-Planner-Simple/
├── backend/          # API Node.js/Express + TypeScript
│   ├── src/
│   │   ├── controllers/   # Logique métier
│   │   ├── models/        # Accès BDD MySQL
│   │   ├── routes/        # Routes Express
│   │   ├── middleware/    # Auth JWT, validation, logs
│   │   ├── services/      # Google Calendar, Discord, Telegram, Obsidian
│   │   ├── utils/         # Helpers, logger, validation
│   │   └── server.ts      # Point d'entrée
│   └── package.json
├── frontend/         # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Composants réutilisables
│   │   ├── pages/         # Pages principales
│   │   ├── contexts/      # AuthContext (global state)
│   │   ├── App.tsx        # Routing
│   │   └── main.tsx       # Point d'entrée
│   └── package.json
├── database/         # Schémas et seeds SQL
│   ├── schema.sql         # Structure BDD MySQL
│   └── seeds.sql          # Données initiales
├── package.json      # Monorepo scripts
└── README.md         # Ce fichier
```

### Technologies

**Backend**:
- Node.js 18+ / Express
- TypeScript (strict mode)
- MySQL 8+ (base de données)
- JWT (authentification)
- Bcrypt (hash passwords)
- Joi (validation)
- Winston (logging)
- Google Calendar API v3
- Discord Webhooks
- Telegram Bot API

**Frontend**:
- React 18 (hooks)
- TypeScript (strict mode)
- Vite (build tool)
- React Router v6 (navigation)
- TanStack React Query (data fetching)
- Tailwind CSS (styling)
- Date-fns (dates)

---

## ⚙️ Prérequis

- **Node.js**: >= 18.x
- **npm**: >= 9.x
- **MySQL**: >= 8.x
- **Git**

---

## 🚀 Installation (Développement local)

### 1. Cloner le repository

```bash
git clone https://github.com/theermite/Family-Planner-Simple.git
cd Family-Planner-Simple
```

### 2. Installer les dépendances

```bash
# Installer toutes les dépendances (backend + frontend)
npm install
```

### 3. Configuration de la base de données MySQL

#### Créer la base de données

```bash
mysql -u root -p
```

```sql
CREATE DATABASE family_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'family_hub_user'@'localhost' IDENTIFIED BY 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON family_hub.* TO 'family_hub_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Importer le schéma et les seeds

```bash
mysql -u family_hub_user -p family_hub < database/schema.sql
mysql -u family_hub_user -p family_hub < database/seeds.sql
```

### 4. Configuration des variables d'environnement

#### Backend

Créer `backend/.env` :

```env
# Server
NODE_ENV=development
PORT=5000
API_PREFIX=/api/v1

# Database
DB_HOST=localhost
DB_PORT=3306
DB_NAME=family_hub
DB_USER=family_hub_user
DB_PASSWORD=votre_mot_de_passe

# JWT
JWT_SECRET=votre_secret_jwt_aleatoire_tres_long_et_securise
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=votre_secret_refresh_aleatoire_tres_long
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=http://localhost:3000

# Google Calendar (optionnel)
GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=votre_client_secret
GOOGLE_REDIRECT_URI=http://localhost:5000/api/v1/auth/google/callback

# Discord (optionnel)
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Telegram (optionnel)
TELEGRAM_BOT_TOKEN=votre_bot_token
TELEGRAM_CHAT_ID=votre_chat_id
```

#### Frontend

Créer `frontend/.env` :

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_API_PREFIX=/api/v1

# Google Calendar (optionnel)
VITE_GOOGLE_CLIENT_ID=votre_client_id.apps.googleusercontent.com

# App Configuration
VITE_APP_NAME=Family Hub
VITE_APP_VERSION=1.0.0

# Feature Flags
VITE_ENABLE_GOOGLE_CALENDAR=true
VITE_ENABLE_DISCORD=true
VITE_ENABLE_TELEGRAM=true
VITE_ENABLE_OBSIDIAN=true

# Development
VITE_DEBUG=false
```

### 5. Lancer l'application

#### Mode développement (hot reload)

```bash
# Terminal 1 : Backend (port 5000)
npm run dev:backend

# Terminal 2 : Frontend (port 3000)
npm run dev:frontend
```

#### Mode concurrent (1 seul terminal)

```bash
npm run dev
```

#### Accéder à l'application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1

#### Compte par défaut (seeds)

- **Email**: `jay@theermite.com`
- **Mot de passe**: `Password123!`

---

## 🧪 Tests

```bash
# Backend tests (Jest + coverage ≥80%)
npm run test:backend

# Frontend tests (Vitest + React Testing Library)
npm run test:frontend

# Tous les tests
npm test
```

---

## 📦 Build Production

```bash
# Build backend (TypeScript compilation)
npm run build:backend

# Build frontend (Vite production build)
npm run build:frontend

# Build complet
npm run build
```

Les builds sont générés dans :
- Backend: `backend/dist/`
- Frontend: `frontend/dist/`

---

## 🌐 Déploiement sur o2Switch

### Prérequis o2Switch

- Hébergement web avec :
  - Node.js support (via cPanel "Setup Node.js App")
  - MySQL 8+
  - Accès SSH (optionnel mais recommandé)
  - Git

### Étapes de déploiement

#### 1. Configuration Node.js via cPanel

1. Se connecter au cPanel o2Switch
2. Aller dans **"Setup Node.js App"**
3. Créer une nouvelle application :
   - **Node.js version**: 18.x (minimum)
   - **Application mode**: Production
   - **Application root**: `/home/votre_user/family-hub`
   - **Application URL**: `family-hub.votre-domaine.com`
   - **Application startup file**: `backend/dist/server.js`

#### 2. Déployer le code

**Via Git (recommandé)** :

```bash
ssh votre_user@votre-domaine.com
cd ~/family-hub
git clone https://github.com/theermite/Family-Planner-Simple.git .
```

**Ou via FTP** :
- Uploader tous les fichiers dans `/home/votre_user/family-hub`

#### 3. Configuration de la base de données

1. Via cPanel "MySQL Databases" :
   - Créer BDD : `votre_user_family_hub`
   - Créer utilisateur : `votre_user_fhuser`
   - Assigner utilisateur à la BDD

2. Importer le schéma via phpMyAdmin :
   - Importer `database/schema.sql`
   - Importer `database/seeds.sql`

#### 4. Variables d'environnement

Créer `backend/.env` sur le serveur :

```env
NODE_ENV=production
PORT=3000  # o2Switch assigne automatiquement le port
API_PREFIX=/api/v1

DB_HOST=localhost
DB_PORT=3306
DB_NAME=votre_user_family_hub
DB_USER=votre_user_fhuser
DB_PASSWORD=votre_mot_de_passe_mysql

JWT_SECRET=votre_secret_jwt_production_securise
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=votre_secret_refresh_production
JWT_REFRESH_EXPIRES_IN=30d

CORS_ORIGIN=https://family-hub.votre-domaine.com

# Google Calendar, Discord, Telegram (optionnel)
```

Créer `frontend/.env.production` :

```env
VITE_API_URL=https://family-hub.votre-domaine.com
VITE_API_PREFIX=/api/v1
```

#### 5. Installation et build

```bash
# Installer dépendances
npm install

# Build production
npm run build

# Les fichiers frontend sont dans frontend/dist/
# Les fichiers backend sont dans backend/dist/
```

#### 6. Servir le frontend

**Option A : Via Node.js App o2Switch** :

Le backend Express sert déjà les fichiers statiques frontend (configuré dans `server.ts`) :

```typescript
app.use(express.static(path.join(__dirname, '../../frontend/dist')));
```

Accéder à : `https://family-hub.votre-domaine.com`

**Option B : Via domaine séparé** :

1. Créer un sous-domaine `app.votre-domaine.com` dans cPanel
2. Document root : `/home/votre_user/family-hub/frontend/dist`
3. Mettre à jour `VITE_API_URL` dans `.env.production` avec l'URL du backend

#### 7. Démarrer l'application

Dans cPanel "Setup Node.js App" :
- Cliquer sur **"Start App"**
- Vérifier les logs si problème

#### 8. Configuration SSL (HTTPS)

1. Dans cPanel, aller dans **"SSL/TLS Status"**
2. Activer AutoSSL (Let's Encrypt) pour le domaine
3. L'application sera accessible en HTTPS automatiquement

### Maintenance o2Switch

**Redémarrer l'application** :
- Via cPanel "Setup Node.js App" → "Restart"
- Ou via SSH : `killall node && npm start`

**Voir les logs** :
- cPanel "Setup Node.js App" → "Open Logs"
- Ou SSH : `tail -f ~/nodevenv/family-hub/*/logs/*.log`

**Mettre à jour le code** :

```bash
ssh votre_user@votre-domaine.com
cd ~/family-hub
git pull
npm install
npm run build
# Redémarrer via cPanel
```

---

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Créer un compte |
| POST | `/api/v1/auth/login` | Se connecter |
| POST | `/api/v1/auth/refresh` | Refresh token JWT |
| POST | `/api/v1/auth/logout` | Se déconnecter |
| GET | `/api/v1/auth/profile` | Récupérer profil utilisateur |

### Events (Calendrier)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/events` | Liste événements |
| POST | `/api/v1/events` | Créer événement |
| PUT | `/api/v1/events/:id` | Modifier événement |
| DELETE | `/api/v1/events/:id` | Supprimer événement |
| POST | `/api/v1/events/:id/sync-google` | Sync Google Calendar |

### Tasks (Tâches)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/tasks` | Liste tâches |
| POST | `/api/v1/tasks` | Créer tâche |
| PUT | `/api/v1/tasks/:id` | Modifier tâche |
| DELETE | `/api/v1/tasks/:id` | Supprimer tâche |
| POST | `/api/v1/tasks/export/obsidian` | Export Markdown |

### Meals (Repas)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/meals/week` | Repas de la semaine |
| POST | `/api/v1/meals` | Créer repas |
| PUT | `/api/v1/meals/:id` | Modifier repas |
| DELETE | `/api/v1/meals/:id` | Supprimer repas |
| POST | `/api/v1/meals/export/obsidian` | Export Markdown |

### Shopping (Courses)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/shopping/list` | Liste de courses |
| POST | `/api/v1/shopping/list` | Créer liste |
| POST | `/api/v1/shopping/items` | Ajouter article |
| PUT | `/api/v1/shopping/items/:id` | Modifier article |
| DELETE | `/api/v1/shopping/items/:id` | Supprimer article |
| PUT | `/api/v1/shopping/items/:id/check` | Cocher article |
| POST | `/api/v1/shopping/export/obsidian` | Export Markdown |

### Baby (Suivi bébés)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/baby/repas` | Logs repas |
| POST | `/api/v1/baby/repas` | Ajouter repas |
| GET | `/api/v1/baby/couches` | Logs couches |
| POST | `/api/v1/baby/couches` | Ajouter couche |
| GET | `/api/v1/baby/bien-etre` | Logs bien-être |
| POST | `/api/v1/baby/bien-etre` | Ajouter note bien-être |
| POST | `/api/v1/baby/export/obsidian` | Export Markdown |

### Crisis (Protocoles crise)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/crisis/protocols` | Liste protocoles |
| POST | `/api/v1/crisis/protocols` | Créer protocole |
| PUT | `/api/v1/crisis/protocols/:id` | Modifier protocole |
| DELETE | `/api/v1/crisis/protocols/:id` | Supprimer protocole |

**Documentation complète API** : Voir `/api/v1/docs` (Swagger - à implémenter)

---

## 🎨 Charte Graphique Shinkofa

Couleurs principales (Tailwind) :

```css
--shinkofa-blue-deep: #192040
--shinkofa-blue-royal: #0c2284
--shinkofa-blue-sky: #0bb1f9
--shinkofa-cream: #eaeaeb
--shinkofa-emerald: #008080
--shinkofa-gold: #d4a044
--shinkofa-bordeaux: #800020
```

Polices :
- Titres : Bold, grandes tailles
- Corps : Regular, lisible
- Accessibilité : Contraste WCAG AA minimum

---

## 📖 Documentation Utilisateur

Voir [USER-GUIDE.md](./USER-GUIDE.md) pour le guide utilisateur complet (non-technique).

---

## 🔒 Sécurité

- **Authentication** : JWT avec refresh tokens
- **Passwords** : Bcrypt (10 rounds)
- **SQL Injection** : Requêtes paramétrées (mysql2)
- **XSS** : Helmet.js, validation inputs
- **HTTPS** : SSL/TLS obligatoire en production
- **Rate Limiting** : express-rate-limit
- **CORS** : Configuré par domaine

---

## 🤝 Contributing

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/ma-feature`)
3. Commit les changements (`git commit -m 'feat: ajouter ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

---

## 📄 License

© 2025 La Voie Shinkofa - Tous droits réservés

Ce projet est propriétaire. Voir [COPYRIGHT.md](./COPYRIGHT.md) pour plus de détails.

---

## 📞 Support

- **Email** : contact@lavoieshinkofa.com
- **Discord** : [Serveur Shinkofa](https://discord.gg/shinkofa)

---

**Développé avec ❤️ par Jay The Ermite pour La Voie Shinkofa**
