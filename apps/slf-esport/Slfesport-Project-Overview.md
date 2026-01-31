# SLF E-Sport Training Platform - Overview & Technical Documentation

**Dernière mise à jour** : 2026-01-03
**Version** : 1.2.0
**Statut** : Production (https://lslf.shinkofa.com)

---

## 📋 Table des matières

1. [Identité du projet](#identité-du-projet)
2. [Vue d'ensemble](#vue-densemble)
3. [Fonctionnalités utilisateur](#fonctionnalités-utilisateur)
4. [Stack technique](#stack-technique)
5. [Architecture](#architecture)
6. [Base de données](#base-de-données)
7. [API Endpoints](#api-endpoints)
8. [Déploiement](#déploiement)
9. [Maintenance & développement](#maintenance--développement)

---

## 🎯 Identité du projet

### Informations générales
- **Nom** : La Salade de Fruits (LSLF) E-Sport Training Platform
- **Type** : Plateforme de coaching e-sport holistique
- **Jeu ciblé** : Honor of Kings (Competitive Team)
- **Philosophie** : Shinkofa (Performance + Bien-être)
- **URL Production** : https://lslf.shinkofa.com
- **Copyright** : La Voie Shinkofa

### Mission
Fournir une plateforme complète de coaching e-sport combinant :
- Entraînement cognitif (réflexes, mémoire, attention, coordination)
- Gestion tactique (tableau stratégique Honor of Kings)
- Suivi holistique (journal, objectifs, bien-être)
- Coordination d'équipe (calendrier, sessions, assignments)

### Public cible
- **Joueurs** (JOUEUR) : Joueurs compétitifs Honor of Kings cherchant à progresser
- **Coachs** (COACH) : Entraîneurs e-sport gérant jusqu'à 10 joueurs
- **Managers** (MANAGER) : Gestionnaires d'équipe avec vue d'ensemble analytique
- **Administrateurs** (SUPER_ADMIN) : Administration système

---

## 🌐 Vue d'ensemble

### Proposition de valeur

**Pour les joueurs** :
- Bibliothèque d'exercices cognitifs personnalisés (réflexes, mémoire, vision, attention)
- Mini-jeux d'entraînement cérébral avec scoring et leaderboards
- Suivi de progression détaillé avec analytics visuels
- Calendrier de sessions d'entraînement
- Tableau tactique pour étudier les stratégies d'équipe
- Journal de développement holistique (humeur, énergie, sommeil)
- Objectifs SMART avec suivi de progression

**Pour les coachs** :
- Dashboard de gestion de joueurs (max 10)
- Système d'assignments d'exercices avec targets et deadlines
- Calendrier de sessions avec tracking de présence
- Tableau tactique pour créer et partager des stratégies
- Création de questionnaires personnalisés
- Bibliothèque média (replays, tutoriels, méditations)
- Analytics de performance d'équipe

**Pour les managers** :
- Vue d'ensemble de toute l'organisation
- Analytics avancés (taux de présence, progression mensuelle)
- Gestion complète des utilisateurs
- Rapports de performance

### Différenciation

**Ce qui rend LSLF unique** :
1. **Approche holistique** : Combine performance gaming et bien-être (Shinkofa)
2. **Spécialisation Honor of Kings** : Cartes tactiques HOK spécifiques (lanes, objectives)
3. **Entraînement cognitif complet** : 11 types d'exercices cérébraux intégrés
4. **Workflow coach-joueur** : Système d'assignments avec feedback bidirectionnel
5. **Tableau tactique avancé** : Dessin, animation timeline, partage de formations
6. **Intégration Discord** : Champs prêts pour bot Discord (discord_id, discord_username)

---

## ✨ Fonctionnalités utilisateur

### 1. Authentification & gestion utilisateurs

**Inscription/Connexion** :
- Système JWT (tokens 24h)
- Reset password par email (SMTP configuré)
- Acceptance du contrat moral obligatoire
- Guard route par rôle (ProtectedRoute component)

**Profil utilisateur** :
- Avatar upload
- Bio, nom complet
- Informations gaming : game_username, game_uid (ID Honor of Kings)
- Rôles préférés : preferred_role, secondary_role (Tank, Mage, Marksman, Support, Assassin, Warrior)
- Niveau : skill_level (Beginner, Intermediate, Advanced)
- Intégration Discord : discord_id, discord_username
- Adaptation Shinkofa : energy_type, peak_hours (heures de pic d'énergie)

**Rôles & permissions** :
- **JOUEUR** : Accès exercices, journal, sessions, stats personnelles
- **COACH** : + Gestion joueurs (10 max), création assignments, sessions, questionnaires
- **MANAGER** : + Vue d'ensemble équipe, analytics avancés
- **SUPER_ADMIN** : + Administration système complète

### 2. Bibliothèque d'exercices & scoring

**Types d'exercices** :
- **Réflexes** (Reflexes) : Temps de réaction, vitesse
- **Vision** (Vision) : Vision périphérique, awareness
- **Mémoire** (Memory) : Mémoire de travail, rappel
- **Attention** (Attention) : Focus, multitâche
- **Coordination** (Coordination) : Coordination œil-main, précision

**Exercices externes** (liens vers outils tiers) :
- URL externe configurable
- Instructions détaillées
- Screenshot upload pour validation score

**Exercices custom** (intégrés à la plateforme) :
- Exercices créés par coachs
- Configurations spécifiques

**Système de scoring** :
- Unités flexibles : ms, %, points, items
- Flag `lower_is_better` (ex: temps de réaction)
- Historique complet des scores
- Personal bests automatiques
- Leaderboards par exercice

### 3. Sessions d'exercices cérébraux (Brain Training)

**11 mini-jeux intégrés** :

**Mémoire** :
1. **Memory Cards** (memory_cards) : Retourner et matcher des cartes
2. **Pattern Recall** (pattern_recall) : Reproduire des patterns visuels
3. **Sequence Memory** (sequence_memory) : Mémoriser des séquences progressives
4. **Image Pairs** (image_pairs) : Matcher des paires d'images

**Réflexes & Attention** :
5. **Reaction Time Trainer** (reaction_time) : Cliquer dès apparition stimulus
6. **Peripheral Vision Game** (peripheral_vision) : Détecter stimuli périphériques
7. **Multi-Task Test** (multitask) : Gérer plusieurs tâches simultanées

**Spécifique MOBA Gaming** :
8. **Last Hit Trainer** (last_hit) : Timing pour last-hit minions
9. **Dodge Master** (dodge) : Esquiver projectiles
10. **Skillshot Trainer** (skillshot) : Précision des compétences à cibler

**Bien-être** :
11. **Breathing Exercises** (breathing) : Exercices de respiration guidés

**Système de difficulté** :
- **Easy** : Multiplicateur 1.0x
- **Medium** : Multiplicateur 1.3x
- **Hard** : Multiplicateur 1.6x
- **Expert** : Multiplicateur 2.0x

**Scoring détaillé** :
- Métriques : total_moves, correct_moves, incorrect_moves, time_elapsed_ms
- Score breakdown JSON (accuracy, time_bonus, difficulty_multiplier)
- Final score calculé
- Max sequence reached (pour sequence memory)

**Leaderboards** :
- Leaderboards globaux par type d'exercice
- Filtres : difficulté, période
- Stats utilisateur : moyenne, meilleur score, total sessions

### 4. Système d'assignments (Coach → Joueur)

**Création d'assignment** (par coach) :
- Sélection joueur + exercice
- Titre, description
- Target score (objectif à atteindre)
- Due date (échéance)
- Priorité (niveau 1-5)
- Flag `is_mandatory` (obligatoire ou optionnel)

**Workflow d'assignment** :
1. **Pending** : Assigné, pas encore commencé
2. **In Progress** : Joueur a commencé
3. **Completed** : Objectif atteint ou exercice terminé
4. **Skipped** : Joueur a passé

**Tracking** :
- `attempts_count` : Nombre de tentatives
- `best_score` : Meilleur score atteint
- `player_notes` : Notes du joueur
- `coach_feedback` : Retour du coach après complétion

**Vues** :
- **Joueur** : `/assignments/my-assignments` - Ses assignments avec filtres (status, priority)
- **Coach** : `/assignments/player/{player_id}` - Assignments d'un joueur spécifique

### 5. Calendrier & gestion de sessions

**Types de sessions** :
- **Solo** : Entraînement individuel
- **Duo** : 2 joueurs
- **Trio** : 3 joueurs
- **Team** : Équipe complète (5 joueurs HOK)
- **Group** : Sessions de coaching de groupe

**Planification** :
- Calendrier interactif (React Big Calendar)
- Sélection date/heure début + fin
- Durée calculée automatiquement (minutes)
- Coach assigné
- Meeting URL (Discord, Zoom, etc.)

**Gestion participants** :
- Ajout/retrait participants
- Tracking présence : Confirmed, Attended, Absent, Late, Cancelled
- Notes par participant

**Statuts session** :
- **Pending** : Planifiée, pas confirmée
- **Confirmed** : Confirmée par participants
- **Cancelled** : Annulée
- **Completed** : Terminée

**Filtres & recherche** :
- Par type (Solo, Duo, Team...)
- Par statut (Pending, Confirmed...)
- Par date (date_from, date_to)
- Par coach
- Sessions de l'utilisateur courant (`/sessions/me`)

### 6. Tableau tactique (Tactic Board)

**Cartes supportées** :

**Honor of Kings** :
- `hok_full` : Carte complète HOK
- `hok_top_lane` : Top lane isolée
- `hok_mid_lane` : Mid lane isolée
- `hok_bot_lane` : Bot lane isolée
- `hok_blue_buff` : Zone Blue Buff
- `hok_red_buff` : Zone Red Buff
- `hok_drake` : Zone Dragon
- `hok_lord` : Zone Lord

**Autres MOBA** :
- `summoners_rift` : League of Legends
- `dota2_map` : Dota 2
- `generic` : Carte générique

**Outils de dessin** (React Konva) :
- **Positionnement** : Placer joueurs/ennemis avec icônes
- **Flèches** : Indiquer mouvements, rotations
- **Cercles** : Zones d'engagement, zones de contrôle
- **Texte** : Annotations
- **Timeline** : Animations par étapes (step 1, step 2...)

**Système de formations** :

**Données sauvegardées** (JSONB `formation_data`) :
```json
{
  "players": [...],      // Positions joueurs
  "enemies": [...],      // Positions ennemis
  "drawings": [...],     // Flèches, cercles, texte
  "timeline": [...]      // Étapes animation
}
```

**Métadonnées** :
- `name` : Nom de la formation (ex: "Baron Nashor Setup")
- `description` : Description détaillée
- `category` : Engage, Poke, Siege, Teamfight, Rotation, Defense, Split Push
- `tags` : Tags libre (array, ex: ["early-game", "mid-prio"])
- `map_type` : Carte utilisée

**Partage & collaboration** :
- `is_public` : Publique (visible par tous) ou privée
- `shared_with` : Array d'user IDs (partage ciblé)
- `team_id` : Équipe propriétaire (placeholder, table team future)
- `created_by` : Créateur de la formation

**Statistiques** :
- `views_count` : Nombre de vues
- `likes_count` : Nombre de likes
- Endpoint `/tactical-formations/{id}/like` pour liker

**Filtres** :
- Par catégorie (Engage, Poke...)
- Par map_type (hok_full, hok_top_lane...)
- Par équipe (team_id)
- Publiques uniquement ou incluant privées

### 7. Module coaching holistique (Shinkofa)

**Journal personnel** :

**Champs** :
- `title` : Titre de l'entrée
- `content` : Contenu markdown
- `mood` : excellent, good, neutral, low, bad
- `energy_level` : 1-10 (échelle énergie)
- `training_quality` : 1-10 (qualité entraînement)
- `sleep_hours` : Heures de sommeil
- `tags` : JSON array (ex: ["mental", "gameplay", "teamwork"])
- `is_public` : Partage avec coach/équipe ou privé

**Vues** :
- `/coaching/journal/me` : Mes entrées (filtre par date, mood, tags)
- Timeline chronologique
- Visualisations analytics (mood over time, correlation sommeil/performance)

**Objectifs (Goals)** :

**Système SMART** :
- `title` : Titre objectif
- `description` : Description détaillée
- `category` : gameplay, mental, physical, teamwork
- `target_date` : Date cible
- `progress_percentage` : 0-100% (manuel ou auto-calculé)
- `milestones` : JSON array d'étapes (ex: [{"step": "Atteindre Diamant", "done": true}])
- `is_public` : Visible par coach/équipe

**Tracking** :
- Endpoint `/coaching/goals/{id}/progress` pour update progression
- Dashboard objectifs (actifs, complétés, en retard)
- Visualisations progression

**Questionnaires** :

**Types** :
- `onboarding` : Questionnaire initial nouveau joueur
- `energy_check` : Check-in énergie quotidien/hebdomadaire
- `goal_setting` : Définition objectifs
- `progress_evaluation` : Évaluation progression
- `wellbeing` : Bien-être général
- `custom` : Questionnaire custom coach

**Structure** :
- `title`, `description`
- `questions` : JSON array
  ```json
  [
    {
      "id": "q1",
      "question": "Comment évalues-tu ton niveau actuel ?",
      "type": "scale",  // scale, text, choice
      "options": [1, 2, 3, 4, 5]
    }
  ]
  ```
- `is_active` : Actif ou archivé
- `is_required` : Obligatoire pour tous joueurs
- `target_roles` : Array de rôles ciblés (ex: ["JOUEUR"])

**Réponses** :
- `answers` : JSON avec réponses
  ```json
  {
    "q1": "4",
    "q2": "Je me sens confiant sur la mécanique mais besoin d'améliorer ma vision de jeu"
  }
  ```
- `submitted_at` : Timestamp soumission
- `coach_notes` : Notes coach après review

### 8. Bibliothèque média

**Types de média** :
- **Video** : mp4, webm, mkv, avi (max 100MB)
- **Audio** : mp3, wav, ogg, m4a (max 100MB)
- **Document** : pdf, doc, txt, md (max 100MB)
- **Image** : jpg, png, gif, webp (max 10MB)

**Catégories** :
- **Meditation** : Méditations guidées, breathing exercises
- **Coaching** : Contenus coaching (talks, webinars)
- **Replay** : Replays de parties (VODs, highlights)
- **Tutorial** : Tutoriels (guides, how-to)
- **Strategy** : Contenus stratégiques (meta, builds, tactics)
- **Other** : Autre

**Métadonnées** :
- `title`, `description`
- `file_url` : Chemin fichier (uploads/)
- `file_name`, `file_size`, `mime_type`
- `duration_seconds` : Durée (audio/vidéo)
- `thumbnail_url` : Vignette (auto-générée pour vidéos)
- `uploaded_by_id` : Créateur
- `is_public` : Public ou privé
- `tags` : Array tags libre
- `view_count` : Nombre de vues

**Playlists** :
- Création playlists thématiques
- Ordre personnalisable (PlaylistMedia avec `order` field)
- `is_public` : Partage avec équipe
- Relation many-to-many Media ↔ Playlist

**Upload** :
- Endpoint `/upload/media` avec multipart/form-data
- Validation côté backend (taille, extension, mime-type)
- Storage dans volume Docker `/app/uploads`
- Serving via static files FastAPI

### 9. Analytics & statistiques

**Dashboard joueur** :
- Graphiques progression scores (Recharts)
- Temps total entraînement
- Breakdown par catégorie exercice (Reflexes, Memory...)
- Historique sessions cérébrales
- Taux de complétion assignments

**Dashboard coach** :
- Nombre joueurs actifs (max 10)
- Taux présence moyen (`attendance_rate`)
- Sessions à venir cette semaine
- Progression moyenne équipe
- Breakdown complétion assignments par joueur
- Graphiques comparatifs joueurs

**Dashboard manager** :
- Vue d'ensemble organisation complète
- Taux progression mensuel (`progression_rate`)
- Analytics avancés (heatmaps activité, trends)
- Rapports exportables

**Visualisations** (Recharts + Chart.js) :
- Line charts : Évolution scores over time
- Bar charts : Comparaisons entre joueurs
- Pie charts : Distribution catégories exercices
- Radar charts : Profil multi-catégories joueur

### 10. Système de notifications

**Préférences utilisateur** (NotificationPreferences) :
- Email notifications (on/off)
- In-app notifications (on/off)
- Notification types :
  - Session reminders (24h avant, 1h avant)
  - Assignment notifications (nouvelle, deadline proche)
  - Questionnaire à compléter
  - Team updates

**Dispatch notifications** :
- Service `notification_service.py`
- Email via SMTP (configurable : host, port, user, password)
- In-app : Stockage notifications avec flag `is_read`
- Endpoint `/notifications` : Liste, mark as read

### 11. Intégration Discord

**Champs prêts** :
- `discord_id` : Discord user ID (snowflake)
- `discord_username` : Discord username#tag

**Use cases futurs** :
- Bot Discord pour notifications
- Commandes Discord (/stats, /sessions)
- Sync rôles Discord ↔ Platform roles
- Invitations sessions via Discord

---

## 🛠️ Stack technique

### Backend

**Framework & langage** :
- **Python 3.11+**
- **FastAPI 0.104+** (framework async moderne)
  - Auto-documentation OpenAPI (Swagger UI, Redoc)
  - Validation Pydantic V2
  - Performance async/await
  - Type hints natifs

**Base de données** :
- **PostgreSQL 15** (RDBMS principal)
  - SQLAlchemy 2.0 ORM (async engine)
  - Alembic migrations
  - JSON/JSONB support (formation_data, tags, milestones...)
  - Array types (tags, shared_with)
  - Enum types (role, mood, category...)

**Cache** :
- **Redis 7** (caching, sessions futures)
  - Async redis-py
  - Cache stratégique (leaderboards, stats)

**Sécurité** :
- **JWT** : python-jose, passlib[bcrypt]
  - HS256 algorithm
  - 24h token expiration
  - Refresh tokens (future)
- **Password hashing** : bcrypt (cost factor 12)
- **SQL injection prevention** : Parameterized queries SQLAlchemy
- **Input validation** : Pydantic schemas strict

**Email** :
- **SMTP** : aiosmtplib (async email)
- Configurable : host, port, username, password
- Templates HTML emails (password reset, notifications)

**File handling** :
- Upload multipart/form-data
- Static files serving (`/uploads`, `/avatars`)
- File validation (size, extension, mime-type)

**Testing** :
- **pytest** (tests unitaires + intégration)
- **pytest-asyncio** (tests async)
- Coverage target : ≥80%

**Linting & formatting** :
- **Ruff** (linter + formatter ultra-rapide)
- **mypy** (type checking)

### Frontend

**Framework & langage** :
- **React 18+** (hooks, concurrent features)
- **TypeScript 5** (strict mode)
- **Vite 5** (build tool ultra-rapide)
  - HMR (Hot Module Replacement)
  - Optimizations production (code splitting, tree shaking)

**Styling** :
- **TailwindCSS 3** (utility-first CSS)
  - Custom design system
  - Dark mode support (class strategy)
  - Responsive design mobile-first
  - Custom plugins (animations, gradients)

**State management** :
- **Zustand 4** (state global léger)
  - Stores : authStore, themeStore
  - Persist middleware (localStorage)
  - Immer integration (immutability)

**Data fetching** :
- **React Query 3** (tanstack/react-query)
  - Cache automatique
  - Background refetching
  - Optimistic updates
  - Infinite queries (pagination)

**Routing** :
- **React Router DOM 6**
  - Protected routes (ProtectedRoute wrapper)
  - Role-based guards
  - Lazy loading routes

**UI Components** :

**Calendrier** :
- **React Big Calendar** : Calendrier interactif sessions
  - Views : Month, Week, Day, Agenda
  - Drag & drop (future)
  - Event customization

**Charts & Analytics** :
- **Recharts** : Visualisations analytics principales
  - LineChart, BarChart, PieChart, RadarChart
  - Responsive, customizable
- **Chart.js + react-chartjs-2** : Charts avancés
  - Heatmaps, scatter plots

**Canvas & Drawing** :
- **React Konva** : Tableau tactique
  - Canvas HTML5 performant
  - Shapes (Circle, Arrow, Rect, Text)
  - Drag & drop, transformations
  - Export images

**Forms** :
- **React Hook Form** : Gestion formulaires performante
  - Minimal re-renders
  - Validation Zod integration
  - Error handling
- **Zod** : Schema validation TypeScript-first
  - Type inference
  - Custom error messages

**Utilities** :
- **date-fns** : Manipulation dates (léger vs moment.js)
- **React Icons** : Bibliothèque icônes (Lucide, Font Awesome)
- **clsx / classnames** : Conditional classes

**Testing** :
- **Jest** : Test runner
- **React Testing Library** : Tests composants
- **@testing-library/user-event** : Simulations interactions
- Coverage target : ≥80%

**Linting & formatting** :
- **ESLint** : Linter JavaScript/TypeScript
  - Plugins : react, react-hooks, typescript-eslint
- **Prettier** : Code formatting
  - Integration ESLint

### DevOps & Infrastructure

**Containerization** :
- **Docker** : Containerization services
- **Docker Compose** : Orchestration multi-containers
  - Services : postgres, redis, backend, frontend, nginx
  - Volumes : database data, uploads, logs
  - Networks : Internal network isolation

**Reverse Proxy** :
- **Nginx** : Production reverse proxy
  - SSL/TLS termination (Let's Encrypt)
  - Static files serving (frontend build)
  - API proxy (/api → backend:8000)
  - WebSocket support (future)
  - Gzip compression
  - Security headers (CSP, HSTS, X-Frame-Options)

**SSL/TLS** :
- **Let's Encrypt** : Certificats SSL gratuits
  - Auto-renewal (certbot)
  - HTTPS obligatoire production

**CI/CD** (à configurer) :
- **GitHub Actions** : Pipeline CI/CD
  - Tests automatiques (pytest, Jest)
  - Linting (Ruff, ESLint)
  - Build validation
  - Déploiement automatique production

**Monitoring** (futur) :
- **Sentry** : Error tracking
- **Prometheus + Grafana** : Metrics & dashboards
- **Uptime Robot** : Monitoring uptime

---

## 🏗️ Architecture

### Architecture globale

**Pattern** : 3-Tier Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT TIER                          │
│  (React 18 + TypeScript + TailwindCSS + Vite)          │
│  - Pages, Components, State (Zustand)                  │
│  - React Query (cache), React Router (routing)         │
└─────────────────────────────────────────────────────────┘
                          ↓ HTTPS/REST API
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION TIER                        │
│  (FastAPI + Pydantic + Python 3.11)                    │
│  - Routes (controllers)                                 │
│  - Services (business logic)                            │
│  - Schemas (validation)                                 │
│  - Middleware (auth, CORS, error handling)             │
└─────────────────────────────────────────────────────────┘
                          ↓ SQLAlchemy ORM
┌─────────────────────────────────────────────────────────┐
│                    DATA TIER                            │
│  - PostgreSQL 15 (persistence)                          │
│  - Redis 7 (cache, sessions)                            │
│  - File system (uploads: avatars, media)               │
└─────────────────────────────────────────────────────────┘
```

### Architecture Backend (FastAPI)

**Pattern** : MVC (Model-View-Controller) + Service Layer

```
backend/app/
├── core/                      # Configuration & core utilities
│   ├── config.py             # Settings (Pydantic BaseSettings)
│   ├── database.py           # SQLAlchemy engine, session, base
│   └── security.py           # JWT, password hashing, dependencies
│
├── models/                    # SQLAlchemy ORM models (Data layer)
│   ├── __init__.py           # Export all models
│   ├── user.py               # User, NotificationPreferences
│   ├── exercise.py           # Exercise, ExerciseScore
│   ├── memory_exercise.py    # MemoryExerciseSession
│   ├── session.py            # Session, SessionParticipant
│   ├── assignment.py         # ExerciseAssignment
│   ├── tactical_formation.py # TacticalFormation
│   ├── coaching.py           # Questionnaire, QuestionnaireResponse, JournalEntry, Goal
│   ├── media.py              # Media, Playlist, PlaylistMedia
│   └── password_reset.py     # PasswordResetToken
│
├── schemas/                   # Pydantic schemas (Validation layer)
│   ├── __init__.py
│   ├── user.py               # UserCreate, UserUpdate, UserResponse
│   ├── exercise.py           # ExerciseCreate, ScoreCreate, ScoreResponse
│   ├── session.py            # SessionCreate, ParticipantCreate
│   ├── assignment.py         # AssignmentCreate, AssignmentUpdate
│   ├── tactical_formation.py # FormationCreate, FormationUpdate
│   ├── coaching.py           # QuestionnaireCreate, JournalCreate, GoalCreate
│   └── media.py              # MediaCreate, PlaylistCreate
│
├── routes/                    # API endpoints (Controller layer)
│   ├── __init__.py
│   ├── auth.py               # POST /auth/register, /login, GET /me
│   ├── users.py              # CRUD users
│   ├── exercises.py          # CRUD exercises, GET /exercises/scores
│   ├── memory_exercises.py   # Brain training sessions, leaderboards
│   ├── sessions.py           # CRUD sessions, participants
│   ├── assignments.py        # Exercise assignments
│   ├── tactical_formations.py# Tactical board formations
│   ├── coaching.py           # Questionnaires, journal, goals
│   ├── media.py              # Media library, playlists
│   ├── upload.py             # File uploads (avatars, media)
│   ├── notifications.py      # Notifications, preferences
│   ├── stats.py              # Analytics dashboards
│   └── password_reset.py     # Password reset flow
│
├── services/                  # Business logic (Service layer)
│   ├── user_service.py       # User CRUD, auth logic
│   ├── exercise_service.py   # Exercise CRUD, scoring logic
│   ├── memory_exercise_service.py # Brain training logic, score calculation
│   ├── session_service.py    # Session booking, calendar logic
│   ├── assignment_service.py # Assignment workflow logic
│   ├── coaching_service.py   # Questionnaires, journal, goals logic
│   ├── media_service.py      # Media upload, playlists logic
│   ├── notification_service.py # Notification dispatch
│   └── email_service.py      # SMTP email sending
│
├── utils/                     # Utilities & dependencies
│   ├── dependencies.py       # FastAPI dependencies (get_db, get_current_user)
│   └── helpers.py            # Helper functions
│
└── main.py                    # FastAPI app initialization, CORS, routes registration
```

**Flux requête typique** :
```
Client → Route (controller) → Service (business logic) → Model (ORM) → Database
                ↓                        ↓
            Schema validation      Business rules
```

**Exemple** : Créer un assignment
```python
# 1. Route (routes/assignments.py)
@router.post("/", response_model=AssignmentResponse)
async def create_assignment(
    assignment: AssignmentCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Validation rôle coach
    if current_user.role not in [UserRole.COACH, UserRole.MANAGER]:
        raise HTTPException(status_code=403)

    # Délégation au service
    return await assignment_service.create_assignment(db, assignment, current_user.id)

# 2. Service (services/assignment_service.py)
async def create_assignment(db: AsyncSession, assignment: AssignmentCreate, coach_id: int):
    # Business logic
    # - Vérifier que le joueur existe et est un JOUEUR
    # - Vérifier que l'exercice existe
    # - Vérifier que le coach n'a pas déjà assigné cet exercice à ce joueur

    # Création model
    db_assignment = ExerciseAssignment(**assignment.dict(), coach_id=coach_id)
    db.add(db_assignment)
    await db.commit()
    await db.refresh(db_assignment)

    # Dispatch notification (fire and forget)
    asyncio.create_task(notification_service.notify_new_assignment(db, db_assignment))

    return db_assignment

# 3. Model (models/assignment.py)
class ExerciseAssignment(Base):
    __tablename__ = "exercise_assignments"

    id = Column(Integer, primary_key=True)
    player_id = Column(Integer, ForeignKey("users.id"))
    exercise_id = Column(Integer, ForeignKey("exercises.id"))
    coach_id = Column(Integer, ForeignKey("users.id"))
    # ... autres champs
```

### Architecture Frontend (React)

**Pattern** : Component-based + Feature-sliced

```
frontend/src/
├── assets/                    # Static assets (images, fonts)
│
├── components/                # Reusable components
│   ├── auth/
│   │   ├── LoginForm.tsx     # Form login
│   │   ├── RegisterForm.tsx  # Form registration
│   │   └── ProtectedRoute.tsx # Route guard HOC
│   │
│   ├── coaching/
│   │   ├── CoachDashboard.tsx # Coach dashboard
│   │   ├── JournalList.tsx    # Journal entries list
│   │   ├── GoalTracker.tsx    # Goals tracker widget
│   │   └── TacticBoard/       # Tactical board components
│   │       ├── TacticBoard.tsx
│   │       ├── Canvas.tsx     # Konva canvas
│   │       ├── Toolbar.tsx    # Drawing tools
│   │       └── FormationList.tsx
│   │
│   ├── exercises/
│   │   ├── ExerciseList.tsx   # Exercises library
│   │   ├── ExerciseCard.tsx   # Exercise card UI
│   │   ├── ScoreChart.tsx     # Score evolution chart
│   │   └── Leaderboard.tsx    # Leaderboard component
│   │
│   ├── games/                 # Brain training mini-games
│   │   ├── MemoryCards.tsx
│   │   ├── PatternRecall.tsx
│   │   ├── SequenceMemory.tsx
│   │   └── shared/
│   │       ├── GameTimer.tsx
│   │       └── ScoreDisplay.tsx
│   │
│   ├── sessions/
│   │   ├── SessionCalendar.tsx # Big Calendar wrapper
│   │   ├── SessionModal.tsx    # Create/edit session modal
│   │   └── SessionCard.tsx     # Session details card
│   │
│   ├── layout/
│   │   ├── MainLayout.tsx     # Main app layout
│   │   ├── Navbar.tsx         # Navigation bar
│   │   ├── Sidebar.tsx        # Sidebar (mobile/desktop)
│   │   └── Footer.tsx
│   │
│   ├── modals/
│   │   ├── MoralContractModal.tsx # Moral contract acceptance
│   │   ├── VisionModal.tsx        # Vision/mission popup
│   │   └── StaffModal.tsx         # Team staff info
│   │
│   └── ui/                    # UI primitives (design system)
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Modal.tsx
│       ├── Badge.tsx
│       ├── Spinner.tsx
│       └── Tooltip.tsx
│
├── pages/                     # Route pages
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   ├── RegisterPage.tsx
│   │
│   ├── dashboard/
│   │   ├── PlayerDashboard.tsx
│   │   ├── CoachDashboard.tsx
│   │   └── ManagerDashboard.tsx
│   │
│   ├── exercises/
│   │   ├── ExercisesPage.tsx      # Library browsing
│   │   ├── ExerciseDetailPage.tsx # Exercise detail + scoring
│   │   └── MyScoresPage.tsx       # Personal scores history
│   │
│   ├── games/                 # Standalone game pages
│   │   ├── MemoryCardsPage.tsx
│   │   ├── ReactionTimePage.tsx
│   │   └── LastHitTrainerPage.tsx
│   │
│   ├── sessions/
│   │   ├── CalendarPage.tsx       # Sessions calendar
│   │   └── SessionDetailPage.tsx  # Session detail
│   │
│   ├── tactics/
│   │   └── TacticBoardPage.tsx    # Tactical board full page
│   │
│   ├── coaching/
│   │   ├── JournalPage.tsx
│   │   ├── GoalsPage.tsx
│   │   └── QuestionnairesPage.tsx
│   │
│   ├── media/
│   │   ├── MediaLibraryPage.tsx
│   │   └── PlaylistPage.tsx
│   │
│   └── ProfilePage.tsx
│
├── services/                  # API clients
│   ├── api.ts                # Axios instance config
│   ├── authService.ts        # Auth API calls
│   ├── exerciseService.ts    # Exercise API calls
│   ├── memoryExerciseService.ts # Brain training API
│   ├── sessionService.ts     # Session API calls
│   ├── assignmentService.ts  # Assignment API calls
│   ├── tacticalFormationService.ts
│   ├── coachingService.ts    # Journal, goals, questionnaires
│   ├── mediaService.ts
│   └── versionManager.ts     # Cache management, migrations
│
├── store/                     # Zustand stores
│   ├── authStore.ts          # Auth state (user, token)
│   ├── themeStore.ts         # Theme state (dark/light)
│   └── notificationStore.ts  # In-app notifications
│
├── types/                     # TypeScript types/interfaces
│   ├── user.ts
│   ├── exercise.ts
│   ├── session.ts
│   ├── assignment.ts
│   └── ...
│
├── utils/                     # Utilities & helpers
│   ├── formatters.ts         # Date, number formatters
│   ├── validators.ts         # Custom validators
│   └── constants.ts          # Constants (API_URL, roles, etc.)
│
├── hooks/                     # Custom React hooks
│   ├── useAuth.ts            # Auth hook (login, logout, user)
│   ├── useExercises.ts       # React Query hook exercises
│   ├── useSessions.ts        # React Query hook sessions
│   └── useDebounce.ts        # Debounce hook
│
├── App.tsx                    # Main app component
├── main.tsx                   # Entry point
└── index.css                  # Global styles (Tailwind imports)
```

**Flux données typique** (avec React Query) :
```
Component → React Query hook → Service (API call) → Backend API → Database
     ↑                              ↓
     └──────── Cache (React Query) ←┘
```

**Exemple** : Afficher liste exercises avec scores
```tsx
// 1. Page (pages/exercises/ExercisesPage.tsx)
export default function ExercisesPage() {
  const { data: exercises, isLoading } = useExercises();

  if (isLoading) return <Spinner />;

  return (
    <div>
      <h1>Exercises</h1>
      <ExerciseList exercises={exercises} />
    </div>
  );
}

// 2. Hook (hooks/useExercises.ts)
export function useExercises(category?: string) {
  return useQuery({
    queryKey: ['exercises', category],
    queryFn: () => exerciseService.getExercises(category),
    staleTime: 5 * 60 * 1000, // Cache 5 min
  });
}

// 3. Service (services/exerciseService.ts)
export const exerciseService = {
  async getExercises(category?: string) {
    const params = category ? { category } : {};
    const response = await api.get('/exercises', { params });
    return response.data;
  },

  async submitScore(exerciseId: number, scoreData: ScoreCreate) {
    const response = await api.post('/exercises/scores', {
      exercise_id: exerciseId,
      ...scoreData
    });
    return response.data;
  }
};

// 4. Component (components/exercises/ExerciseList.tsx)
interface Props {
  exercises: Exercise[];
}

export function ExerciseList({ exercises }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {exercises.map(exercise => (
        <ExerciseCard key={exercise.id} exercise={exercise} />
      ))}
    </div>
  );
}
```

### Communication Frontend ↔ Backend

**REST API** :
- Base URL : `http://localhost:8001/api/v1` (dev) | `https://lslf.shinkofa.com/api` (prod)
- Format : JSON
- Auth : Bearer token JWT dans header `Authorization`
- CORS configuré (allowed origins)

**Axios instance** (services/api.ts) :
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8001/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor : Ajouter token JWT
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor : Gérer erreurs 401 (logout)
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear auth state, redirect login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**React Query** :
- Cache automatique requêtes GET (staleTime, cacheTime)
- Invalidation cache après mutations (POST, PUT, DELETE)
- Optimistic updates pour UX réactive
- Background refetching automatique

**Exemple mutation avec invalidation cache** :
```tsx
const queryClient = useQueryClient();

const submitScoreMutation = useMutation({
  mutationFn: (data: ScoreCreate) => exerciseService.submitScore(exerciseId, data),
  onSuccess: () => {
    // Invalider cache scores pour forcer refetch
    queryClient.invalidateQueries({ queryKey: ['scores', exerciseId] });
    queryClient.invalidateQueries({ queryKey: ['leaderboard', exerciseId] });
  }
});
```

---

## 💾 Base de données

### Schéma relationnel (PostgreSQL)

**Tables principales** :

#### Users
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  hashed_password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL, -- JOUEUR, COACH, MANAGER, SUPER_ADMIN
  full_name VARCHAR(255),
  avatar_url VARCHAR(500),
  bio TEXT,

  -- Gaming info
  game_username VARCHAR(100),
  game_uid VARCHAR(100), -- Honor of Kings player ID
  preferred_role VARCHAR(50), -- Tank, Mage, Marksman, Support, Assassin, Warrior
  secondary_role VARCHAR(50),
  skill_level VARCHAR(20), -- Beginner, Intermediate, Advanced

  -- Discord
  discord_id VARCHAR(100),
  discord_username VARCHAR(100),

  -- Shinkofa adaptation
  energy_type VARCHAR(50),
  peak_hours VARCHAR(100), -- JSON or comma-separated

  -- Moral contract
  moral_contract_accepted BOOLEAN DEFAULT FALSE,
  moral_contract_accepted_at TIMESTAMP,

  -- Flags
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_discord_id ON users(discord_id);
```

#### Exercises
```sql
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- Reflexes, Vision, Memory, Attention, Coordination
  exercise_type VARCHAR(20) NOT NULL, -- external, custom
  external_url VARCHAR(500),
  instructions TEXT,

  -- Scoring
  score_unit VARCHAR(20), -- ms, %, points, items
  lower_is_better BOOLEAN DEFAULT FALSE, -- true for reaction time

  -- Metadata
  created_by INTEGER REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_exercises_category ON exercises(category);
CREATE INDEX idx_exercises_is_active ON exercises(is_active);
```

#### Exercise Scores
```sql
CREATE TABLE exercise_scores (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,

  score_value FLOAT NOT NULL,
  score_unit VARCHAR(20),
  screenshot_url VARCHAR(500),
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_scores_user_id ON exercise_scores(user_id);
CREATE INDEX idx_scores_exercise_id ON exercise_scores(exercise_id);
CREATE INDEX idx_scores_created_at ON exercise_scores(created_at DESC);
```

#### Memory Exercise Sessions (Brain Training)
```sql
CREATE TABLE memory_exercise_sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER REFERENCES exercises(id) ON DELETE SET NULL,

  exercise_type VARCHAR(50) NOT NULL, -- memory_cards, pattern_recall, sequence_memory, etc.
  difficulty VARCHAR(20) NOT NULL, -- easy, medium, hard, expert

  -- Config
  exercise_config JSONB, -- { "grid_size": 4, "pairs": 8, ... }

  -- Metrics
  total_moves INTEGER,
  correct_moves INTEGER,
  incorrect_moves INTEGER,
  time_elapsed_ms INTEGER,
  max_sequence_reached INTEGER, -- For sequence memory

  -- Scoring
  final_score FLOAT,
  score_breakdown JSONB, -- { "accuracy": 85, "time_bonus": 120, "difficulty_multiplier": 1.3 }

  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_memory_sessions_user_id ON memory_exercise_sessions(user_id);
CREATE INDEX idx_memory_sessions_type ON memory_exercise_sessions(exercise_type);
CREATE INDEX idx_memory_sessions_difficulty ON memory_exercise_sessions(difficulty);
```

#### Sessions (Calendar)
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  session_type VARCHAR(20) NOT NULL, -- Solo, Duo, Trio, Team, Group
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, confirmed, cancelled, completed

  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  duration_minutes INTEGER,

  coach_id INTEGER REFERENCES users(id),
  created_by INTEGER NOT NULL REFERENCES users(id),

  meeting_url VARCHAR(500),
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_start_time ON sessions(start_time);
CREATE INDEX idx_sessions_coach_id ON sessions(coach_id);
CREATE INDEX idx_sessions_type ON sessions(session_type);
CREATE INDEX idx_sessions_status ON sessions(status);
```

#### Session Participants
```sql
CREATE TABLE session_participants (
  id SERIAL PRIMARY KEY,
  session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  attendance_status VARCHAR(20) DEFAULT 'confirmed', -- confirmed, attended, absent, late, cancelled
  notes TEXT,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(session_id, user_id)
);

CREATE INDEX idx_participants_session_id ON session_participants(session_id);
CREATE INDEX idx_participants_user_id ON session_participants(user_id);
```

#### Exercise Assignments
```sql
CREATE TABLE exercise_assignments (
  id SERIAL PRIMARY KEY,
  player_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  exercise_id INTEGER NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  coach_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  target_score FLOAT,

  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,

  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- pending, in_progress, completed, skipped
  priority INTEGER DEFAULT 3, -- 1=lowest, 5=highest
  is_mandatory BOOLEAN DEFAULT FALSE,

  -- Tracking
  attempts_count INTEGER DEFAULT 0,
  best_score FLOAT,

  -- Feedback
  player_notes TEXT,
  coach_feedback TEXT,

  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_assignments_player_id ON exercise_assignments(player_id);
CREATE INDEX idx_assignments_coach_id ON exercise_assignments(coach_id);
CREATE INDEX idx_assignments_status ON exercise_assignments(status);
CREATE INDEX idx_assignments_due_date ON exercise_assignments(due_date);
```

#### Tactical Formations
```sql
CREATE TABLE tactical_formations (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  map_type VARCHAR(50) NOT NULL, -- hok_full, hok_top_lane, summoners_rift, etc.

  -- Formation data (JSON with players, enemies, drawings, timeline)
  formation_data JSONB NOT NULL,

  -- Ownership
  created_by INTEGER NOT NULL REFERENCES users(id),
  team_id INTEGER, -- Future: REFERENCES teams(id)

  -- Organization
  tags TEXT[], -- Array of tags
  category VARCHAR(50), -- Engage, Poke, Siege, Teamfight, Rotation, Defense, Split Push

  -- Sharing
  is_public BOOLEAN DEFAULT FALSE,
  shared_with INTEGER[], -- Array of user IDs

  -- Stats
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_formations_created_by ON tactical_formations(created_by);
CREATE INDEX idx_formations_map_type ON tactical_formations(map_type);
CREATE INDEX idx_formations_category ON tactical_formations(category);
CREATE INDEX idx_formations_is_public ON tactical_formations(is_public);
CREATE INDEX idx_formations_tags ON tactical_formations USING GIN(tags);
```

#### Questionnaires
```sql
CREATE TABLE questionnaires (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  questionnaire_type VARCHAR(50) NOT NULL, -- onboarding, energy_check, goal_setting, etc.

  questions JSONB NOT NULL, -- [{ "id": "q1", "question": "...", "type": "scale", "options": [...] }]

  created_by INTEGER NOT NULL REFERENCES users(id),
  is_active BOOLEAN DEFAULT TRUE,
  is_required BOOLEAN DEFAULT FALSE,
  target_roles TEXT[], -- ['JOUEUR', 'COACH']

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questionnaires_type ON questionnaires(questionnaire_type);
CREATE INDEX idx_questionnaires_is_active ON questionnaires(is_active);
```

#### Questionnaire Responses
```sql
CREATE TABLE questionnaire_responses (
  id SERIAL PRIMARY KEY,
  questionnaire_id INTEGER NOT NULL REFERENCES questionnaires(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  answers JSONB NOT NULL, -- { "q1": "4", "q2": "Texte libre..." }
  coach_notes TEXT,

  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(questionnaire_id, user_id, submitted_at)
);

CREATE INDEX idx_responses_questionnaire_id ON questionnaire_responses(questionnaire_id);
CREATE INDEX idx_responses_user_id ON questionnaire_responses(user_id);
```

#### Journal Entries
```sql
CREATE TABLE journal_entries (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title VARCHAR(255),
  content TEXT NOT NULL,

  -- Metrics
  mood VARCHAR(20), -- excellent, good, neutral, low, bad
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 10),
  training_quality INTEGER CHECK (training_quality >= 1 AND training_quality <= 10),
  sleep_hours FLOAT,

  tags JSONB, -- ["mental", "gameplay", "teamwork"]
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_journal_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_created_at ON journal_entries(created_at DESC);
CREATE INDEX idx_journal_mood ON journal_entries(mood);
```

#### Goals
```sql
CREATE TABLE goals (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- gameplay, mental, physical, teamwork

  target_date DATE,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),

  milestones JSONB, -- [{ "step": "...", "done": true }]
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_goals_user_id ON goals(user_id);
CREATE INDEX idx_goals_category ON goals(category);
CREATE INDEX idx_goals_target_date ON goals(target_date);
```

#### Media
```sql
CREATE TABLE media (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  media_type VARCHAR(20) NOT NULL, -- video, audio, document, image
  category VARCHAR(50) NOT NULL, -- meditation, coaching, replay, tutorial, strategy, other

  file_url VARCHAR(500) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT, -- bytes
  mime_type VARCHAR(100),
  duration_seconds INTEGER, -- for audio/video
  thumbnail_url VARCHAR(500), -- for videos

  uploaded_by_id INTEGER NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,
  tags TEXT[],
  view_count INTEGER DEFAULT 0,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_media_type ON media(media_type);
CREATE INDEX idx_media_category ON media(category);
CREATE INDEX idx_media_uploaded_by ON media(uploaded_by_id);
CREATE INDEX idx_media_tags ON media USING GIN(tags);
```

#### Playlists
```sql
CREATE TABLE playlists (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by_id INTEGER NOT NULL REFERENCES users(id),
  is_public BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_playlists_created_by ON playlists(created_by_id);
```

#### Playlist Media (Junction table)
```sql
CREATE TABLE playlist_media (
  id SERIAL PRIMARY KEY,
  playlist_id INTEGER NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
  media_id INTEGER NOT NULL REFERENCES media(id) ON DELETE CASCADE,
  order_position INTEGER NOT NULL,

  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  UNIQUE(playlist_id, media_id)
);

CREATE INDEX idx_playlist_media_playlist_id ON playlist_media(playlist_id);
CREATE INDEX idx_playlist_media_media_id ON playlist_media(media_id);
```

#### Notification Preferences
```sql
CREATE TABLE notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  email_notifications BOOLEAN DEFAULT TRUE,
  in_app_notifications BOOLEAN DEFAULT TRUE,

  session_reminders BOOLEAN DEFAULT TRUE,
  assignment_notifications BOOLEAN DEFAULT TRUE,
  questionnaire_notifications BOOLEAN DEFAULT TRUE,
  team_updates BOOLEAN DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notif_prefs_user_id ON notification_preferences(user_id);
```

#### Password Reset Tokens
```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_reset_tokens_email ON password_reset_tokens(email);
```

### Relations clés

**User → Exercise Scores** : One-to-Many
Un user peut avoir plusieurs scores sur plusieurs exercises

**User → Memory Exercise Sessions** : One-to-Many
Un user peut avoir plusieurs sessions de brain training

**Session ↔ Users** : Many-to-Many (via session_participants)
Une session a plusieurs participants, un user participe à plusieurs sessions

**User → Exercise Assignments** (player_id) : One-to-Many
Un joueur peut avoir plusieurs assignments

**User → Exercise Assignments** (coach_id) : One-to-Many
Un coach peut créer plusieurs assignments

**User → Tactical Formations** : One-to-Many
Un user peut créer plusieurs formations tactiques

**User → Journal Entries** : One-to-Many
Un user peut avoir plusieurs entrées de journal

**User → Goals** : One-to-Many
Un user peut avoir plusieurs objectifs

**User → Media** : One-to-Many
Un user peut uploader plusieurs médias

**Playlist ↔ Media** : Many-to-Many (via playlist_media)
Une playlist contient plusieurs medias, un media peut être dans plusieurs playlists

---

## 🔌 API Endpoints

**Base URL** : `/api/v1`

### Authentication

```
POST   /auth/register          # Register new user
POST   /auth/login             # Login (returns JWT token)
GET    /auth/me                # Get current user info
```

### Password Reset

```
POST   /password-reset/request        # Request reset token (email)
POST   /password-reset/reset          # Reset password with token
```

### Users

```
GET    /users                  # List all users (COACH/MANAGER only)
GET    /users/{user_id}        # Get user details
PUT    /users/{user_id}        # Update user
DELETE /users/{user_id}        # Delete user (SUPER_ADMIN only)
```

### Exercises

```
GET    /exercises                     # List exercises (filter: category, is_active)
GET    /exercises/{exercise_id}      # Get exercise details
POST   /exercises                     # Create exercise (COACH/MANAGER)
PUT    /exercises/{exercise_id}      # Update exercise
DELETE /exercises/{exercise_id}      # Delete exercise
```

**Exercise Scores** :

```
GET    /exercises/scores                      # List all scores (filter: user, exercise)
POST   /exercises/scores                      # Submit score
GET    /exercises/scores/user/{user_id}      # User's scores
GET    /exercises/scores/exercise/{ex_id}    # Exercise leaderboard
```

### Memory Exercises (Brain Training)

```
POST   /memory-exercises/sessions                # Create session
PUT    /memory-exercises/sessions/{id}          # Update session (submit results)
GET    /memory-exercises/sessions/{id}          # Get session details
GET    /memory-exercises/sessions/user/{id}     # User's sessions
GET    /memory-exercises/leaderboard            # Leaderboard (filter: exercise_type, difficulty)
GET    /memory-exercises/stats/user/{id}        # User stats
```

### Sessions (Calendar)

```
POST   /sessions                    # Create session
GET    /sessions                    # List sessions (filters: user, coach, type, status, dates)
GET    /sessions/me                 # My sessions (as participant or coach)
GET    /sessions/{session_id}       # Session details
PUT    /sessions/{session_id}       # Update session
DELETE /sessions/{session_id}       # Cancel session
```

**Participants** :

```
POST   /sessions/{session_id}/participants           # Add participant
PUT    /sessions/{session_id}/participants/{user_id} # Update attendance
DELETE /sessions/{session_id}/participants/{user_id} # Remove participant
```

### Assignments

```
POST   /assignments                  # Create assignment (COACH/MANAGER)
GET    /assignments/my-assignments   # Current user's assignments
GET    /assignments/my-created       # Assignments created by current user (COACH)
GET    /assignments/player/{id}      # Player's assignments (COACH access)
PUT    /assignments/{id}             # Update assignment
PUT    /assignments/{id}/status      # Update assignment status
DELETE /assignments/{id}             # Delete assignment
```

### Tactical Formations

```
POST   /tactical-formations                 # Create formation
GET    /tactical-formations                 # List formations (filter: category, team, map_type)
GET    /tactical-formations/{id}            # Get formation
PUT    /tactical-formations/{id}            # Update formation
DELETE /tactical-formations/{id}            # Delete formation
POST   /tactical-formations/{id}/share      # Share with users
POST   /tactical-formations/{id}/like       # Like formation
```

### Coaching

**Questionnaires** :

```
POST   /coaching/questionnaires              # Create questionnaire (COACH/MANAGER)
GET    /coaching/questionnaires              # List questionnaires
GET    /coaching/questionnaires/{id}         # Get questionnaire
PUT    /coaching/questionnaires/{id}         # Update questionnaire
DELETE /coaching/questionnaires/{id}         # Delete questionnaire
```

**Questionnaire Responses** :

```
POST   /coaching/questionnaire-responses     # Submit response
GET    /coaching/questionnaire-responses/me  # My responses
GET    /coaching/questionnaire-responses/questionnaire/{id} # Responses for questionnaire
```

**Journal** :

```
POST   /coaching/journal                     # Create journal entry
GET    /coaching/journal/me                  # My journal entries
GET    /coaching/journal/{id}                # Get entry
PUT    /coaching/journal/{id}                # Update entry
DELETE /coaching/journal/{id}                # Delete entry
```

**Goals** :

```
POST   /coaching/goals                       # Create goal
GET    /coaching/goals/me                    # My goals
GET    /coaching/goals/{id}                  # Get goal
PUT    /coaching/goals/{id}                  # Update goal
PUT    /coaching/goals/{id}/progress         # Update progress percentage
DELETE /coaching/goals/{id}                  # Delete goal
```

### Media

```
GET    /media                       # List media (filter: type, category, uploaded_by)
GET    /media/{media_id}            # Get media details
POST   /media                       # Upload media
PUT    /media/{media_id}            # Update media metadata
DELETE /media/{media_id}            # Delete media
```

**Playlists** :

```
POST   /media/playlists                      # Create playlist
GET    /media/playlists                      # List playlists
GET    /media/playlists/{id}                 # Get playlist
PUT    /media/playlists/{id}                 # Update playlist
DELETE /media/playlists/{id}                 # Delete playlist
POST   /media/playlists/{id}/media           # Add media to playlist
DELETE /media/playlists/{id}/media/{media_id} # Remove media from playlist
```

### Upload

```
POST   /upload/avatar               # Upload user avatar
POST   /upload/media                # Upload media file
```

### Notifications

```
GET    /notifications                        # List notifications
PUT    /notifications/{id}/read              # Mark notification as read
GET    /notifications/preferences            # Get notification preferences
PUT    /notifications/preferences            # Update preferences
```

### Statistics

```
GET    /stats/coach-dashboard        # Coach dashboard stats
GET    /stats/manager-dashboard      # Manager dashboard stats
```

---

## 🚀 Déploiement

### Environnement développement

**Prérequis** :
- Docker + Docker Compose
- Node.js 18+ (pour dev frontend local)
- Python 3.11+ (pour dev backend local)

**Docker Compose** :

```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: lslf_postgres
    environment:
      POSTGRES_USER: lslf_user
      POSTGRES_PASSWORD: lslf_password
      POSTGRES_DB: lslf_db
    ports:
      - "5433:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    container_name: lslf_redis
    ports:
      - "6380:6379"
    restart: unless-stopped

  backend:
    build: ./backend
    container_name: lslf_backend
    environment:
      DATABASE_URL: postgresql+asyncpg://lslf_user:lslf_password@postgres:5432/lslf_db
      REDIS_URL: redis://redis:6379/0
      SECRET_KEY: your-secret-key-here
      SMTP_HOST: smtp.gmail.com
      SMTP_PORT: 587
    ports:
      - "8001:8000"
    volumes:
      - ./backend/app:/app/app
      - uploads_data:/app/uploads
    depends_on:
      - postgres
      - redis
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    restart: unless-stopped

  frontend:
    build: ./frontend
    container_name: lslf_frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend/src:/app/src
    environment:
      VITE_API_URL: http://localhost:8001/api/v1
    command: npm run dev -- --host
    restart: unless-stopped

volumes:
  postgres_data:
  uploads_data:
```

**Démarrage** :

```bash
# Cloner repo
git clone <repo-url>
cd SLF-Esport

# Lancer services
docker-compose up -d

# Migrations database (si nécessaire)
docker exec lslf_backend alembic upgrade head

# Créer super admin (optionnel)
docker exec lslf_backend python scripts/create_superadmin.py
```

**URLs** :
- Frontend : http://localhost:3000
- Backend API : http://localhost:8001
- API Docs : http://localhost:8001/docs (Swagger UI)
- PostgreSQL : localhost:5433
- Redis : localhost:6380

### Environnement production

**Infrastructure** :
- **Hébergement** : VPS (recommandé OVH ~5€/mois) ou serveur dédié
- **OS** : Ubuntu 22.04 LTS
- **Reverse Proxy** : Nginx
- **SSL** : Let's Encrypt (certbot)
- **Domain** : lslf.shinkofa.com

**Docker Compose Production** :

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: lslf_postgres_prod
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: ${DB_NAME}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: always
    networks:
      - lslf_network

  redis:
    image: redis:7-alpine
    container_name: lslf_redis_prod
    restart: always
    networks:
      - lslf_network

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    container_name: lslf_backend_prod
    environment:
      DATABASE_URL: ${DATABASE_URL}
      REDIS_URL: ${REDIS_URL}
      SECRET_KEY: ${SECRET_KEY}
      SMTP_HOST: ${SMTP_HOST}
      SMTP_PORT: ${SMTP_PORT}
      SMTP_USER: ${SMTP_USER}
      SMTP_PASSWORD: ${SMTP_PASSWORD}
    volumes:
      - uploads_data:/app/uploads
    depends_on:
      - postgres
      - redis
    restart: always
    networks:
      - lslf_network

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.prod
      args:
        VITE_API_URL: https://lslf.shinkofa.com/api
    container_name: lslf_frontend_prod
    restart: always
    networks:
      - lslf_network

  nginx:
    image: nginx:alpine
    container_name: lslf_nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
      - ./frontend/dist:/usr/share/nginx/html:ro
      - uploads_data:/usr/share/nginx/uploads:ro
    depends_on:
      - backend
      - frontend
    restart: always
    networks:
      - lslf_network

volumes:
  postgres_data:
  uploads_data:

networks:
  lslf_network:
    driver: bridge
```

**Nginx Configuration** (`nginx/nginx.conf`) :

```nginx
events {
  worker_connections 1024;
}

http {
  include /etc/nginx/mime.types;
  default_type application/octet-stream;

  # Gzip compression
  gzip on;
  gzip_vary on;
  gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

  # Rate limiting
  limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;

  server {
    listen 80;
    server_name lslf.shinkofa.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
  }

  server {
    listen 443 ssl http2;
    server_name lslf.shinkofa.com;

    # SSL certificates (Let's Encrypt)
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Content-Security-Policy "default-src 'self' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;" always;

    # Frontend (static files)
    location / {
      root /usr/share/nginx/html;
      try_files $uri $uri/ /index.html;
      expires 1d;
      add_header Cache-Control "public, immutable";
    }

    # API backend
    location /api/ {
      limit_req zone=api_limit burst=20 nodelay;

      proxy_pass http://lslf_backend_prod:8000/api/;
      proxy_http_version 1.1;
      proxy_set_header Host $host;
      proxy_set_header X-Real-IP $remote_addr;
      proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
      proxy_set_header X-Forwarded-Proto $scheme;

      # Timeouts
      proxy_connect_timeout 60s;
      proxy_send_timeout 60s;
      proxy_read_timeout 60s;
    }

    # Uploads (static files)
    location /uploads/ {
      alias /usr/share/nginx/uploads/;
      expires 1y;
      add_header Cache-Control "public, immutable";
    }

    # Max body size (for uploads)
    client_max_body_size 100M;
  }
}
```

**Déploiement** :

```bash
# 1. Cloner repo sur VPS
git clone <repo-url> /opt/lslf-esport
cd /opt/lslf-esport

# 2. Créer .env production
cp .env.example .env
nano .env  # Remplir variables production

# 3. Générer certificats SSL Let's Encrypt
sudo certbot certonly --standalone -d lslf.shinkofa.com
# Copier certificats dans nginx/ssl/

# 4. Build et lancer containers
docker-compose -f docker-compose.prod.yml up -d --build

# 5. Migrations database
docker exec lslf_backend_prod alembic upgrade head

# 6. Créer super admin
docker exec lslf_backend_prod python scripts/create_superadmin.py
```

**Maintenance** :

```bash
# Logs
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend

# Restart services
docker-compose -f docker-compose.prod.yml restart backend

# Update code
git pull
docker-compose -f docker-compose.prod.yml up -d --build

# Backup database
docker exec lslf_postgres_prod pg_dump -U lslf_user lslf_db > backup_$(date +%Y%m%d).sql

# Restore database
docker exec -i lslf_postgres_prod psql -U lslf_user lslf_db < backup_20260103.sql
```

---

## 🔧 Maintenance & développement

### Roadmap fonctionnalités futures

**Phase 1 - Court terme (1-2 mois)** :
- [ ] Table `teams` + relation avec users, formations
- [ ] Bot Discord (notifications, commandes, sync rôles)
- [ ] PWA complète (offline support, install prompt)
- [ ] Export stats/analytics en PDF
- [ ] Tests coverage ≥80% (backend + frontend)
- [ ] CI/CD GitHub Actions

**Phase 2 - Moyen terme (3-6 mois)** :
- [ ] Module VOD analysis (upload replays, annotations timestamp)
- [ ] Système de badges/achievements
- [ ] Tournois internes (brackets, scoring)
- [ ] Replays HOK intégrés (si API disponible)
- [ ] Chat temps réel (WebSocket)
- [ ] Notifications push web

**Phase 3 - Long terme (6-12 mois)** :
- [ ] Mobile app (React Native)
- [ ] IA coaching assistant (Ollama integration)
- [ ] Analytics prédictifs (performance forecasting)
- [ ] Intégration Twitch/YouTube (streaming stats)
- [ ] Multi-langue (i18n : EN, FR, CN pour HOK)
- [ ] API publique externe (documentation, rate limiting)

### Points techniques à améliorer

**Performance** :
- [ ] Lazy loading images (React lazy, Suspense)
- [ ] Code splitting routes (React.lazy)
- [ ] Database query optimization (indexes, N+1 queries)
- [ ] Redis caching stratégique (leaderboards, stats)
- [ ] CDN pour static assets

**Sécurité** :
- [ ] Rate limiting API (par user, par IP)
- [ ] CSRF protection
- [ ] Input sanitization HTML (DOMPurify)
- [ ] 2FA (Two-Factor Authentication)
- [ ] Audit logs (actions critiques)

**UX/UI** :
- [ ] Skeleton loaders (au lieu de spinners)
- [ ] Optimistic UI updates (React Query)
- [ ] Toast notifications amélioration
- [ ] Dark mode amélioration (plus de personnalisation)
- [ ] Responsive mobile amélioration (tactical board)

**DevOps** :
- [ ] Monitoring (Sentry error tracking, Prometheus metrics)
- [ ] Logging centralisé (ELK stack ou Loki)
- [ ] Backup automatique database (cron job)
- [ ] Blue-green deployment
- [ ] Load balancing (si scaling)

### Documentation à créer

- [ ] **API Documentation** : OpenAPI spec complet, exemples cURL
- [ ] **USER-GUIDE.md** : Guide utilisateur non-technique
- [ ] **ARCHITECTURE.md** : Décisions architecture détaillées
- [ ] **CONTRIBUTING.md** : Guide contribution développeurs
- [ ] **DEPLOYMENT.md** : Guide déploiement complet (VPS, o2Switch alternatives)
- [ ] **CHANGELOG.md** : Historique versions (format Keep a Changelog)

### Tests à écrire

**Backend** :
- [ ] Tests unitaires services (pytest)
- [ ] Tests intégration routes (pytest + httpx)
- [ ] Tests database models (SQLAlchemy)
- [ ] Tests email service (mocking SMTP)
- [ ] Tests authentication/authorization

**Frontend** :
- [ ] Tests composants UI (React Testing Library)
- [ ] Tests hooks custom (React Hooks Testing Library)
- [ ] Tests services API (Jest + MSW mocking)
- [ ] Tests intégration (Cypress ou Playwright)
- [ ] Tests accessibilité (jest-axe)

### Dépendances à surveiller

**Backend** :
- FastAPI (breaking changes en v1.0+)
- SQLAlchemy (migration 2.0 → 2.1)
- Pydantic (V2 → V3 future)
- Python (3.11 → 3.12+)

**Frontend** :
- React (18 → 19 - Server Components)
- React Router (6 → 7)
- Vite (5 → 6)
- TailwindCSS (3 → 4)

**Infrastructure** :
- PostgreSQL (15 → 16)
- Redis (7 → 8)
- Node.js (18 LTS → 20 LTS)

### Commandes utiles maintenance

**Backend** :

```bash
# Créer migration Alembic
docker exec lslf_backend alembic revision --autogenerate -m "Description"

# Appliquer migrations
docker exec lslf_backend alembic upgrade head

# Rollback migration
docker exec lslf_backend alembic downgrade -1

# Tests backend
docker exec lslf_backend pytest --cov --cov-report=html

# Linting backend
docker exec lslf_backend ruff check --fix app/
```

**Frontend** :

```bash
# Build production
cd frontend
npm run build

# Tests frontend
npm test -- --coverage

# Linting frontend
npm run lint -- --fix

# Type checking
npm run type-check
```

**Database** :

```bash
# Connexion psql
docker exec -it lslf_postgres psql -U lslf_user -d lslf_db

# Backup
docker exec lslf_postgres pg_dump -U lslf_user lslf_db > backup.sql

# Restore
docker exec -i lslf_postgres psql -U lslf_user lslf_db < backup.sql

# Vacuum database
docker exec lslf_postgres psql -U lslf_user -d lslf_db -c "VACUUM ANALYZE;"
```

---

## 📊 Métriques & KPIs

### Métriques techniques

**Performance** :
- Lighthouse score : ≥90 (performance, accessibility, best practices, SEO)
- Time to First Byte (TTFB) : <200ms
- First Contentful Paint (FCP) : <1.5s
- API response time p95 : <500ms
- Database query time p95 : <100ms

**Qualité code** :
- Test coverage : ≥80% (backend + frontend)
- Linting warnings : 0
- TypeScript errors : 0
- Security vulnerabilities : 0 (npm audit, safety check)

**Fiabilité** :
- Uptime : ≥99.5% (objectif 99.9%)
- Error rate : <1% requests
- Crash-free rate : ≥99%

### Métriques utilisateur (KPIs)

**Engagement** :
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Session duration moyenne
- Retention rate D7, D30

**Utilisation** :
- Exercices complétés / jour
- Sessions schedulées / semaine
- Journal entries / user / mois
- Tactical formations créées / mois

**Performance coaching** :
- Taux complétion assignments
- Progression moyenne scores (%)
- Taux présence sessions (%)
- Objectifs atteints / mois

---

## 📝 Notes importantes

### Limitations actuelles connues

1. **Inscription publique désactivée** : Landing page redirige vers `/`, pas de self-registration
   - Reason : Plateforme privée équipe HOK
   - Solution : Super admin crée comptes manuellement

2. **Table teams non implémentée** : `team_id` dans tactical_formations est placeholder
   - Impact : Pas de gestion multi-équipes encore
   - Solution future : Migration ajout table teams + relations

3. **Stats placeholders** : `attendance_rate`, `progression_rate` calculés basiquement
   - Impact : Analytics manager dashboard simplifiés
   - Solution : Affiner algorithmes calcul stats

4. **PWA incomplete** : Manifest + service worker présents mais non testés production
   - Impact : Offline support non garanti
   - Solution : Tests PWA complets + Workbox integration

5. **CI/CD absent** : Pas de pipeline automatisé GitHub Actions
   - Impact : Tests manuels, déploiement manuel
   - Solution : Créer workflow `.github/workflows/ci.yml`

### Décisions architecture importantes

**Pourquoi PostgreSQL et pas MongoDB ?**
- Relations complexes (many-to-many sessions/users, playlists/media)
- Intégrité référentielle critique (CASCADE deletes)
- JSONB pour flexibilité où nécessaire (formation_data, questions)

**Pourquoi React Query et pas Redux ?**
- React Query spécialisé server state (cache, refetch, mutations)
- Redux overkill pour client state simple (auth, theme)
- Zustand léger pour global state minimal

**Pourquoi FastAPI et pas Django ?**
- Performance async supérieure (Starlette + uvicorn)
- Auto-documentation OpenAPI native
- Type hints Pydantic modernes
- Moins de boilerplate que Django DRF

**Pourquoi Vite et pas Create React App ?**
- Build ultra-rapide (esbuild)
- HMR instantané
- CRA deprecated/slow

---

**FIN DU DOCUMENT**

---

**Utilisation de ce document** :

Ce document sert de référence centrale pour :
- **Onboarding développeurs** : Comprendre rapidement toute la plateforme
- **Planification features** : Identifier où ajouter nouvelles fonctionnalités
- **Maintenance** : Retrouver architecture, endpoints, schémas DB
- **Documentation projet** : Partager avec stakeholders, investisseurs
- **Index projets** : Organiser et structurer développement futur

**Maintenir ce document à jour** :
- Update après chaque feature majeure
- Update après refactoring architecture
- Update après changement stack technique
- Versioning : Increment version number en haut document
