# Family Hub - Project Overview

**© 2025 La Voie Shinkofa**

---

## 📋 Métadonnées Projet

| Propriété | Valeur |
|-----------|--------|
| **Nom** | Family Hub |
| **Version** | 1.0.0 MVP |
| **Type** | Web Application (Full-Stack) |
| **Statut** | En développement (Phase 2) |
| **Propriétaire** | La Voie Shinkofa |
| **Développeur principal** | Jay The Ermite |
| **Date de démarrage** | Novembre 2024 |
| **Dernière mise à jour** | 3 janvier 2026 |
| **Licence** | CC-BY-NC-SA-4.0 (Propriétaire) |
| **Repository** | `https://github.com/theermite/Family-Planner-Simple` (Privé) |

---

## 🎯 Vue d'ensemble

### Concept

Family Hub est une plateforme web complète de gestion et d'organisation familiale, spécifiquement conçue pour les familles neurodiverses. L'application centralise tous les aspects de la vie familiale : calendrier partagé, gestion des tâches ménagères, planification des repas, listes de courses collaboratives, suivi des bébés, et protocoles de gestion de crise adaptés au Design Humain.

### Contexte d'utilisation

**Famille cible** : Famille Goncalves
- **3 adultes** : Jay (Projecteur Splénique 1/3), Angélique (Générateur 5/1), Gauthier (Générateur 5/1)
- **4 enfants** : Lyam (9 ans, Générateur 4/6), Théo (7 ans, Générateur-Manifesteur 4/6), Evy (1 an, Générateur-Manifesteur 2/4), Nami (6 mois, Manifesteur 4/1)

**Besoins spécifiques** :
- Adaptation à la neurodiversité (TDAH, HPI, hypersensibilité)
- Respect des cycles énergétiques selon Design Humain
- Gestion des crises (surcharge sensorielle, meltdown, shutdown)
- Collaboration familiale simplifiée
- Centralisation de l'information
- Accessibilité et clarté visuelle

### Positionnement

Family Hub se distingue des solutions classiques (Google Calendar, Todoist, etc.) par :
- **Approche holistique** : Intégration complète Design Humain et neurodiversité
- **Tout-en-un familial** : Calendrier + Tâches + Repas + Bébés + Crises dans une seule interface
- **Personnalisation avancée** : Profils énergétiques, protocoles de crise individualisés
- **Export Obsidian** : Intégration avec le système de notes markdown de Jay
- **Charte graphique Shinkofa** : Identité visuelle cohérente avec l'univers Shinkofa

---

## 👥 Fonctionnalités Utilisateur

### 1. 📅 Calendrier Familial

**Description** : Gestion centralisée des événements familiaux avec synchronisation Google Calendar.

**Fonctionnalités actuelles** :
- Création, modification, suppression d'événements
- Catégorisation (école, anniversaire, travail, activité, famille, santé, autre)
- Couleurs personnalisées par événement
- Vue calendrier mensuel
- Attribution à un membre de la famille
- Synchronisation bidirectionnelle Google Calendar (OAuth2)

**Fonctionnalités futures** :
- Événements récurrents (iCal RRULE)
- Vue semaine et agenda
- Notifications avant événement (Discord/Telegram)
- Filtres par catégorie et personne
- Rappels automatiques
- Export Obsidian des événements

**Cas d'usage** :
- Ajouter l'école de Théo (lundi-vendredi 09h-14h)
- Planifier les anniversaires de la famille
- Synchroniser avec Google Calendar personnel
- Visualiser tous les rendez-vous médicaux du mois

---

### 2. ✅ Tâches Ménagères

**Description** : Gestion collaborative des tâches du foyer avec attribution et suivi.

**Fonctionnalités actuelles** :
- Création, modification, suppression de tâches
- Catégorisation (cuisine, ménage, linge, courses, enfants, autre)
- Attribution à un membre (Jay, Ange, Gauthier)
- Statuts (ouverte, assignée, en cours, complétée, archivée)
- Priorités (basse, moyenne, haute)
- Système de points (gamification)
- Date d'échéance
- Notes additionnelles

**Fonctionnalités futures** :
- Tâches récurrentes (quotidienne, hebdomadaire, mensuelle)
- Historique des tâches complétées
- Statistiques par personne (points accumulés)
- Notifications d'assignation (Discord/Telegram)
- Templates de tâches courantes
- Export Obsidian

**Cas d'usage** :
- Créer la tâche "Lessive" assignée à Angélique pour demain
- Marquer "Vaisselle" comme complétée
- Voir toutes les tâches en retard
- Consulter les statistiques de participation familiale

---

### 3. 🍽️ Planning des Repas

**Description** : Planification hebdomadaire des repas avec assignation du cuisinier.

**Fonctionnalités actuelles** :
- Affichage planning hebdomadaire
- Types de repas (petit-déjeuner, déjeuner, goûter, dîner)
- Visualisation par jour et type de repas
- Consultation des repas planifiés

**Fonctionnalités futures** :
- Création/modification/suppression de repas
- Assignation du cuisinier
- Liste d'ingrédients
- Notes de préparation
- Génération automatique liste de courses depuis les repas
- Bibliothèque de recettes favorites
- Historique des repas (éviter répétitions)
- Export Obsidian

**Cas d'usage** :
- Planifier les repas de la semaine dimanche soir
- Assigner Gauthier pour le dîner du mercredi
- Consulter la liste d'ingrédients nécessaires
- Générer la liste de courses depuis le planning

---

### 4. 🛒 Listes de Courses

**Description** : Gestion collaborative des listes de courses par semaine.

**Fonctionnalités actuelles** :
- Création de listes par semaine
- Ajout/modification/suppression d'articles
- Catégorisation (fruits, légumes, protéines, produits laitiers, basiques, autre)
- Priorités (optionnel, souhaité, essentiel)
- Quantité et unités (pièce, kg, g, litre, ml, paquet)
- Cocher/décocher articles
- Statut de liste (planification, finale, courses faites)
- Localisation (Torre del Mar, Vélez-Málaga)
- Estimation prix total

**Fonctionnalités futures** :
- Synchronisation temps réel (WebSocket)
- Historique des courses
- Articles fréquents (suggestions)
- Mode "en magasin" (ordre par rayon)
- Partage par QR code
- Notifications ajout d'article
- Export Obsidian

**Cas d'usage** :
- Créer liste de courses pour la semaine
- Ajouter "Tomates 1kg" en priorité essentielle
- Cocher les articles achetés depuis le téléphone
- Marquer la liste comme "courses faites"

---

### 5. 👶 Suivi Bébés (Evy & Nami)

**Description** : Suivi quotidien des repas, couches et bien-être des bébés.

#### 5.1 Repas

**Fonctionnalités actuelles** :
- Visualisation des logs de repas
- Filtrage par enfant (Evy, Nami)
- Affichage date, heure, type (biberon/repas)

**Fonctionnalités futures** :
- Création de logs de repas
- Type : Biberon (quantité ml) ou Repas (taille assiette : petite/moyenne/grande)
- Durée du repas (minutes)
- Notes additionnelles
- Statistiques journalières/hebdomadaires
- Graphiques de suivi
- Alertes si délai inhabituel entre repas

#### 5.2 Couches

**Fonctionnalités actuelles** :
- Visualisation des changements de couches

**Fonctionnalités futures** :
- Création de logs de couches
- Type (pipi, caca, mixte)
- Notes (couleur, texture, observations santé)
- Statistiques de fréquence
- Alertes si aucun changement depuis X heures

#### 5.3 Bien-être

**Fonctionnalités actuelles** :
- Visualisation des notes de bien-être

**Fonctionnalités futures** :
- Création de notes bien-être
- Support tous les enfants (Lyam, Théo, Evy, Nami)
- Catégories (santé, sommeil, comportement, développement, humeur, allergie, autre)
- Observations libres
- Historique complet
- Export PDF/Markdown
- Liens vers événements santé

**Cas d'usage** :
- Logger biberon de 150ml pour Nami à 14h30
- Noter changement couche mixte avec observation
- Ajouter note sommeil perturbé pour Evy
- Consulter l'historique repas d'hier

---

### 6. 🧘 Profils Design Humain & Protocoles de Crise

**Description** : Gestion des profils énergétiques et protocoles de gestion de crise personnalisés.

#### 6.1 Profils Design Humain

**Fonctionnalités actuelles** :
- Stockage des profils utilisateurs
- Type Design Humain (Projecteur, Générateur, Générateur-Manifesteur, Manifesteur, Réflecteur)
- Ligne de profil (ex: 1/3, 5/1)
- Autorité (Splénique, Sacrale, Émotionnelle, Ego, Environnement, Lune, Aucune)

**Fonctionnalités futures** :
- Dashboard visuel des profils
- Informations détaillées par type
- Stratégie personnalisée
- Cycles énergétiques (heures focus/jour, pattern de pauses)
- Besoins de récupération
- Besoins spéciaux
- Recommandations adaptées
- Intégration avec planning (respect des cycles)

#### 6.2 Protocoles de Crise

**Fonctionnalités actuelles** :
- Stockage des protocoles par personne
- Types de crise (frustration, surcharge, transition, rejet, colère, peur, autre)

**Fonctionnalités futures** :
- Création/modification protocoles
- Reconnaissance des déclencheurs
- Réponse immédiate
- Étapes d'escalade (1, 2, 3)
- Besoins de support
- Outils disponibles
- Ce qu'il faut éviter
- Récupération post-crise
- Mode "Crise active" (affichage protocole simplifié)
- Historique des crises
- Notifications proches (Discord/Telegram)

**Cas d'usage** :
- Consulter le protocole de crise "Surcharge sensorielle" de Jay
- Activer mode "Crise active" pour affichage des étapes
- Ajouter nouveau protocole "Frustration" pour Théo
- Consulter les outils de récupération de Lyam

---

### 7. 🔔 Notifications & Intégrations

**Fonctionnalités futures** :
- **Discord** : Webhooks pour notifications (nouvelles tâches, événements proches, crises)
- **Telegram** : Bot interactif (consulter planning, ajouter tâche rapide, alertes prioritaires)
- **Obsidian** : Export Markdown de tous les modules (calendrier, tâches, repas, logs bébés)
- **Google Calendar** : Synchronisation bidirectionnelle complète

---

### 8. 👤 Gestion Utilisateur

**Fonctionnalités actuelles** :
- Authentification JWT (email/password)
- Profil utilisateur (nom, email, avatar couleur)
- Rôles (admin, contributor, viewer)

**Fonctionnalités futures** :
- OAuth2 Google (connexion alternative)
- Gestion des permissions par rôle
- Préférences utilisateur (dark mode, langue)
- Avatar personnalisé
- Historique d'activité
- Notifications personnalisées

---

## 🛠️ Aspect Technique

### Architecture Globale

**Type** : Monorepo Full-Stack (Frontend + Backend + Database)

**Pattern** : Architecture MVC (Model-View-Controller) avec API RESTful

```
Family-Planner-Simple/
├── backend/              # API Node.js/Express + TypeScript
│   ├── src/
│   │   ├── controllers/  # Logique métier (CRUD operations)
│   │   ├── models/       # Accès base de données (MySQL queries)
│   │   ├── routes/       # Définition routes Express
│   │   ├── middleware/   # Auth JWT, validation, error handling, logs
│   │   ├── services/     # Services externes (Google, Discord, Telegram, Obsidian)
│   │   ├── utils/        # Helpers, logger Winston, validation Joi
│   │   ├── config/       # Configuration (DB, JWT, API keys)
│   │   ├── types/        # TypeScript types/interfaces
│   │   └── server.ts     # Point d'entrée serveur
│   ├── dist/             # Build production (TypeScript compiled)
│   └── package.json
├── frontend/             # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/   # Composants réutilisables (UI, Layout, Forms)
│   │   ├── pages/        # Pages principales (Calendar, Tasks, Shopping, etc.)
│   │   ├── contexts/     # AuthContext, ThemeContext (state global)
│   │   ├── hooks/        # Custom hooks React
│   │   ├── utils/        # Helpers frontend
│   │   ├── App.tsx       # Router principal
│   │   └── main.tsx      # Point d'entrée React
│   ├── dist/             # Build production (Vite static files)
│   └── package.json
├── database/             # Schémas et données initiales
│   ├── schema.sql        # Structure base de données MySQL
│   └── seeds.sql         # Données de test initiales
├── .claude/              # Instructions Claude Code TAKUMI
├── docker-compose.yml    # Docker MySQL local
├── package.json          # Monorepo scripts
└── README.md
```

---

### Stack Technique

#### Backend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Node.js** | 18+ | Runtime JavaScript serveur |
| **Express.js** | 4.x | Framework web API RESTful |
| **TypeScript** | 5.x | Typage statique (strict mode) |
| **MySQL** | 8.0+ | Base de données relationnelle |
| **mysql2** | 3.x | Driver MySQL avec Promises |
| **JWT** | 9.x | Authentification tokens |
| **Bcrypt** | 5.x | Hachage mots de passe |
| **Joi** | 17.x | Validation schémas données |
| **Winston** | 3.x | Logging avancé |
| **Helmet** | 7.x | Sécurité headers HTTP |
| **CORS** | 2.x | Cross-Origin Resource Sharing |
| **express-rate-limit** | 7.x | Protection contre abus |
| **dotenv** | 16.x | Variables d'environnement |

#### Frontend

| Technologie | Version | Usage |
|-------------|---------|-------|
| **React** | 18.x | Bibliothèque UI (hooks) |
| **TypeScript** | 5.x | Typage statique (strict mode) |
| **Vite** | 5.x | Build tool ultra-rapide |
| **React Router** | 6.x | Navigation SPA |
| **TanStack React Query** | 5.x | Data fetching, caching, synchronisation |
| **Tailwind CSS** | 3.x | Framework CSS utility-first |
| **date-fns** | 3.x | Manipulation dates/heures |
| **Lucide React** | 0.x | Icônes modernes |
| **Headless UI** | 2.x | Composants accessibles unstyled |

#### DevOps & Outils

| Technologie | Version | Usage |
|-------------|---------|-------|
| **Docker** | 24+ | Containerisation MySQL |
| **Docker Compose** | 2.x | Orchestration multi-containers |
| **Git** | 2.x | Versionnage code |
| **GitHub** | - | Repository privé + Actions CI/CD |
| **Jest** | 29.x | Tests unitaires backend |
| **Vitest** | 1.x | Tests unitaires frontend |
| **ESLint** | 8.x | Linting JavaScript/TypeScript |
| **Prettier** | 3.x | Formatage code |

---

### Base de Données

**SGBD** : MySQL 8.0+

**Encodage** : UTF-8 (utf8mb4_unicode_ci)

**Tables principales** :

| Table | Lignes | Description |
|-------|--------|-------------|
| `users` | 3-10 | Utilisateurs (adultes) |
| `user_profiles` | 3-10 | Profils Design Humain |
| `events` | ~500 | Événements calendrier |
| `tasks` | ~200 | Tâches ménagères |
| `meals` | ~365 | Planning repas |
| `shopping_lists` | ~52 | Listes courses (hebdo) |
| `shopping_items` | ~2000 | Articles courses |
| `repas_logs` | ~5000 | Logs repas bébés |
| `couche_logs` | ~3000 | Logs couches |
| `bien_etre_logs` | ~500 | Notes bien-être enfants |
| `crisis_protocols` | ~10 | Protocoles de crise |

**Indexes** :
- Composite indexes pour requêtes fréquentes (user_id + date, assigned_to + status, etc.)
- Foreign keys avec CASCADE/SET NULL appropriés
- Index sur champs de filtrage (status, category, date, etc.)

**Vues SQL** :
- `v_events_this_week` : Événements de la semaine en cours
- `v_tasks_active` : Tâches non archivées avec noms utilisateurs
- `v_repas_today` : Logs repas du jour

**Triggers** :
- Auto-update `updated_at` timestamps
- Auto-set `completed_at` quand tâche complétée

---

### API Backend

**Base URL** : `/api/v1`

**Authentification** : JWT Bearer Token (Header `Authorization: Bearer <token>`)

**Format** : JSON (Content-Type: application/json)

**Endpoints principaux** :

#### Auth (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Créer compte | Non |
| POST | `/login` | Se connecter | Non |
| POST | `/refresh` | Refresh token JWT | Non |
| POST | `/logout` | Se déconnecter | Oui |
| GET | `/profile` | Récupérer profil | Oui |

#### Events (`/api/v1/events`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Liste événements (query: ?start=DATE&end=DATE) | Oui |
| POST | `/` | Créer événement | Oui |
| GET | `/:id` | Récupérer événement | Oui |
| PUT | `/:id` | Modifier événement | Oui |
| DELETE | `/:id` | Supprimer événement | Oui |
| POST | `/:id/sync-google` | Sync Google Calendar | Oui |

#### Tasks (`/api/v1/tasks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Liste tâches (query: ?status=STATUS&assigned_to=ID) | Oui |
| POST | `/` | Créer tâche | Oui |
| GET | `/:id` | Récupérer tâche | Oui |
| PUT | `/:id` | Modifier tâche | Oui |
| DELETE | `/:id` | Supprimer tâche | Oui |
| POST | `/export/obsidian` | Export Markdown | Oui |

#### Meals (`/api/v1/meals`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/week` | Repas semaine (query: ?week_start=DATE) | Oui |
| POST | `/` | Créer repas | Oui |
| PUT | `/:id` | Modifier repas | Oui |
| DELETE | `/:id` | Supprimer repas | Oui |
| POST | `/export/obsidian` | Export Markdown | Oui |

#### Shopping (`/api/v1/shopping`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/list` | Liste courses courante | Oui |
| POST | `/list` | Créer liste | Oui |
| POST | `/items` | Ajouter article | Oui |
| PUT | `/items/:id` | Modifier article | Oui |
| DELETE | `/items/:id` | Supprimer article | Oui |
| PUT | `/items/:id/check` | Cocher/décocher | Oui |
| POST | `/export/obsidian` | Export Markdown | Oui |

#### Baby (`/api/v1/baby`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/repas` | Logs repas (query: ?enfant=Evy&date=DATE) | Oui |
| POST | `/repas` | Ajouter repas | Oui |
| GET | `/couches` | Logs couches | Oui |
| POST | `/couches` | Ajouter couche | Oui |
| GET | `/bien-etre` | Logs bien-être | Oui |
| POST | `/bien-etre` | Ajouter note | Oui |
| POST | `/export/obsidian` | Export Markdown | Oui |

#### Crisis (`/api/v1/crisis`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/protocols` | Liste protocoles | Oui |
| POST | `/protocols` | Créer protocole | Oui |
| GET | `/protocols/:id` | Récupérer protocole | Oui |
| PUT | `/protocols/:id` | Modifier protocole | Oui |
| DELETE | `/protocols/:id` | Supprimer protocole | Oui |

**Codes de réponse** :
- `200 OK` : Succès
- `201 Created` : Ressource créée
- `400 Bad Request` : Validation échouée
- `401 Unauthorized` : Non authentifié
- `403 Forbidden` : Non autorisé
- `404 Not Found` : Ressource introuvable
- `500 Internal Server Error` : Erreur serveur

**Format réponse** :
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

**Format erreur** :
```json
{
  "success": false,
  "error": "Error message",
  "details": [ ... ]
}
```

---

### Frontend

**Architecture** : SPA (Single Page Application) React avec routing client-side

**State Management** :
- **AuthContext** : État authentification global (user, token, login, logout)
- **TanStack Query** : Cache et synchronisation données API (queries, mutations)
- **React useState/useReducer** : État local composants

**Composants principaux** :

```
src/components/
├── layout/
│   ├── MainLayout.tsx       # Layout principal avec header, sidebar, outlet
│   ├── Header.tsx            # Barre navigation
│   └── Sidebar.tsx           # Menu latéral
├── ui/
│   ├── Modal.tsx             # Modal réutilisable (Headless UI)
│   ├── FormField.tsx         # Champ formulaire générique
│   ├── FloatingButton.tsx    # Bouton flottant "+" avec menu
│   ├── Button.tsx            # Bouton stylisé
│   ├── Input.tsx             # Input stylisé
│   └── Select.tsx            # Select stylisé
├── calendar/
│   └── CalendarGrid.tsx      # Grille calendrier mensuel
├── tasks/
│   └── TaskCard.tsx          # Carte tâche
└── shopping/
    └── ShoppingItemRow.tsx   # Ligne article courses
```

**Pages** :

```
src/pages/
├── auth/
│   ├── LoginPage.tsx         # Connexion
│   └── RegisterPage.tsx      # Inscription
├── CalendarPage.tsx          # Calendrier familial
├── TasksPage.tsx             # Tâches ménagères
├── ShoppingPage.tsx          # Listes courses
├── MealsPage.tsx             # Planning repas
├── BabyPage.tsx              # Suivi bébés
├── CrisisPage.tsx            # Protocoles crise
├── ProfilePage.tsx           # Profil utilisateur
└── DashboardPage.tsx         # Tableau de bord
```

**Charte Graphique Shinkofa** :

```css
/* Couleurs principales (Tailwind custom) */
--shinkofa-blue-deep: #192040     /* Bleu foncé profond */
--shinkofa-blue-royal: #0c2284    /* Bleu royal */
--shinkofa-blue-sky: #0bb1f9      /* Bleu ciel */
--shinkofa-cream: #eaeaeb         /* Crème */
--shinkofa-emerald: #008080       /* Émeraude */
--shinkofa-gold: #d4a044          /* Or */
--shinkofa-bordeaux: #800020      /* Bordeaux */
```

**Accessibilité** :
- WCAG 2.1 AA minimum (objectif AAA pour production)
- Contraste couleurs ≥ 4.5:1 (texte) / 3:1 (UI)
- Labels ARIA sur tous les éléments interactifs
- Navigation clavier complète (Tab, Enter, Esc)
- Focus visible

---

### Sécurité

**Mesures implémentées** :

1. **Authentification** :
   - JWT avec expiration (7 jours access, 30 jours refresh)
   - Bcrypt (10 rounds) pour hash passwords
   - Tokens stockés HttpOnly cookies (future) ou localStorage (actuel)

2. **Protection injections** :
   - Requêtes paramétrées (mysql2 prepared statements)
   - Validation inputs stricte (Joi schemas)
   - Sanitization des données utilisateur

3. **Protection XSS** :
   - Helmet.js (headers sécurité HTTP)
   - CSP (Content Security Policy)
   - Escape HTML dans outputs React (par défaut)

4. **Protection CSRF** :
   - SameSite cookies (future)
   - CORS strict (domaines autorisés uniquement)

5. **Rate Limiting** :
   - express-rate-limit sur routes auth (5 tentatives/15min)
   - Protection brute-force login

6. **HTTPS** :
   - SSL/TLS obligatoire en production
   - Redirection HTTP → HTTPS

7. **Secrets** :
   - Variables environnement (.env)
   - Jamais hardcodés dans code
   - .env exclus de Git (.gitignore)

---

### Performance

**Backend** :
- Indexes MySQL optimisés pour requêtes fréquentes
- Connection pooling MySQL (mysql2)
- Compression gzip responses (compression middleware)
- Caching headers appropriés

**Frontend** :
- Code splitting Vite (lazy loading pages)
- TanStack Query cache (éviter requêtes redondantes)
- Images optimisées (WebP, lazy loading)
- Debounce inputs recherche
- Memoization composants lourds (React.memo, useMemo)

**Objectifs** :
- Time to First Byte (TTFB) < 200ms
- First Contentful Paint (FCP) < 1.5s
- Largest Contentful Paint (LCP) < 2.5s
- Cumulative Layout Shift (CLS) < 0.1
- Lighthouse Score ≥ 90

---

### Tests

**Stratégie** :
- Tests unitaires : Fonctions utilitaires, controllers, services
- Tests intégration : Routes API complètes
- Tests composants : React components, hooks
- Tests E2E : Flows utilisateur critiques (login → create → edit → delete)

**Outils** :

| Type | Backend | Frontend |
|------|---------|----------|
| **Unit** | Jest | Vitest |
| **Integration** | Supertest | React Testing Library |
| **E2E** | - | Playwright (future) |
| **Coverage** | jest --coverage | vitest --coverage |

**Objectifs** :
- Coverage backend ≥ 80% (core logic)
- Coverage frontend ≥ 70% (composants, hooks)
- Tous les endpoints API testés
- Flows critiques E2E testés

**Commandes** :
```bash
# Backend tests
npm run test:backend

# Frontend tests
npm run test:frontend

# Tous les tests
npm test

# Coverage
npm run test:backend -- --coverage
npm run test:frontend -- --coverage
```

---

### DevOps & CI/CD

**Workflow Git** :
- Branch `main` : Code stable, protégée
- Commits atomiques fréquents (toutes les 15-20 min)
- Format commits : `type(scope): description` (Conventional Commits)
- Push immédiat après commit

**GitHub Actions** (future) :
```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - Checkout code
      - Setup Node.js 18
      - Install dependencies
      - Run linting (ESLint)
      - Run tests (Jest, Vitest)
      - Upload coverage reports

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - Build backend (TypeScript)
      - Build frontend (Vite)
      - Archive artifacts

  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - Deploy to VPS OVH (SSH + Docker)
      - Restart services
      - Health check
```

---

## 🚀 Roadmap & Phases de Développement

### Phase 1 - MVP Fonctionnel ✅ (Complété - Décembre 2024)

**Durée** : 1 session (4-5 heures)

**Livrables** :
- [x] Setup Docker MySQL local (port 3307)
- [x] Backend API Node.js/Express opérationnel
- [x] Frontend React avec Vite
- [x] Authentification JWT (register, login, profile)
- [x] 5 pages principales (Calendar, Tasks, Shopping, Baby, Meals)
- [x] CRUD complet Events, Tasks, Shopping
- [x] Lecture seule Baby, Meals
- [x] Composants UI réutilisables (Modal, FormField, FloatingButton)
- [x] Charte graphique Shinkofa intégrée
- [x] Docker Compose développement local

**État** : ✅ Complété avec succès

---

### Phase 2 - Bug Fixes & Polish 🔄 (En cours - Janvier 2026)

**Durée estimée** : 2-3 sessions (6-9 heures)

**Priorités** :

#### Session 2.1 - Corrections critiques
- [ ] **BUGS.md** : Corriger 3 bugs critiques
  - Encodage UTF-8 MySQL
  - Validation backend CREATE operations
  - Routes Crisis & Meals (confusion endpoints)
- [ ] **FloatingButton global** : Visible sur toutes les pages avec menu contextuel
- [ ] **Baby Page complète** : Modals création (repas, couches, bien-être) + mutations POST
- [ ] **Meals Page complète** : Modal création repas + mutations POST/PUT/DELETE

#### Session 2.2 - Features fondamentales
- [ ] **Tâches récurrentes** : Support RRULE (quotidienne, hebdo, mensuelle)
- [ ] **Événements récurrents** : iCal RRULE complet
- [ ] **Gestion erreurs frontend** : Toast notifications (succès, erreur)
- [ ] **Validation formulaires** : Messages erreur clairs

#### Session 2.3 - UX améliorée
- [ ] **Vue semaine calendrier** : Alternative à la vue mois
- [ ] **Filtres avancés** : Par catégorie, personne, statut
- [ ] **Recherche** : Événements, tâches, articles
- [ ] **Statistiques basiques** : Dashboard tâches complétées, repas loggés

**État actuel** : Session 2.1 en cours

---

### Phase 3 - Features Avancées 📋 (Planifié - Janvier-Février 2026)

**Durée estimée** : 4-6 sessions (12-18 heures)

#### 3.1 Notifications & Intégrations

- [ ] **Discord Integration** (2h)
  - Webhooks notifications
  - Événements : nouvelle tâche assignée, événement proche, crise active
  - Configuration par utilisateur (ON/OFF)

- [ ] **Telegram Integration** (2h)
  - Bot interactif
  - Commandes : `/planning`, `/taches`, `/courses`
  - Notifications prioritaires

- [ ] **Export Obsidian** (1-2h)
  - Bouton export par module
  - Génération Markdown formaté
  - Métadonnées frontmatter
  - Sync automatique (optionnel)

- [ ] **Google Calendar Sync** (2-3h)
  - OAuth2 flow complet
  - Synchronisation bidirectionnelle
  - Gestion conflits
  - Auto-sync toutes les X minutes

#### 3.2 Profils & Protocoles

- [ ] **Dashboard Design Humain** (2h)
  - Visualisation profils famille
  - Informations détaillées par type
  - Recommandations adaptées
  - Cycles énergétiques

- [ ] **Protocoles de Crise** (2h)
  - CRUD protocoles complet
  - Mode "Crise active"
  - Affichage simplifié étapes
  - Historique crises
  - Notifications proches

#### 3.3 UX Premium

- [ ] **Dark Mode** (1h)
  - Toggle dark/light
  - Sauvegarde préférence localStorage
  - Classes Tailwind `dark:` complètes

- [ ] **PWA (Progressive Web App)** (2h)
  - Service Worker
  - Offline support
  - Add to Home Screen
  - Push notifications

- [ ] **Responsive Mobile** (2h)
  - Breakpoints optimisés
  - Touch gestures
  - Mobile-first components

---

### Phase 4 - Production-Ready 🚀 (Planifié - Février-Mars 2026)

**Durée estimée** : 6-8 sessions (18-24 heures)

#### 4.1 Tests & Qualité

- [ ] **Tests Backend** (4h)
  - Tests unitaires controllers (≥80% coverage)
  - Tests intégration routes API
  - Tests services (Google, Discord, Telegram)
  - Mocks appropriés

- [ ] **Tests Frontend** (4h)
  - Tests composants UI (≥70% coverage)
  - Tests pages principales
  - Tests hooks custom
  - Tests intégration React Query

- [ ] **Tests E2E** (4h)
  - Playwright setup
  - Flow auth complet
  - Flow CRUD (create → edit → delete)
  - Flow critique (calendrier, tâches, bébés)

- [ ] **Monitoring & Logs** (2h)
  - Winston logs structurés
  - Niveaux appropriés (debug, info, warn, error)
  - Rotation logs
  - Dashboard logs (Logtail, Papertrail)

#### 4.2 Déploiement VPS OVH

- [ ] **Infrastructure** (3h)
  - VPS OVH (4€/mois)
  - Ubuntu Server 22.04 LTS
  - Docker + Docker Compose
  - MySQL 8.0 (containerisé)
  - Nginx reverse proxy
  - Certbot SSL (Let's Encrypt)

- [ ] **Configuration** (2h)
  - Variables environnement production
  - Secrets management
  - Firewall (UFW)
  - Fail2ban
  - SSH key-only

- [ ] **CI/CD** (3h)
  - GitHub Actions
  - Auto-deploy sur push main
  - Tests avant déploiement
  - Rollback automatique si échec
  - Notifications Discord/Telegram

- [ ] **Backup & Récupération** (2h)
  - Backup automatique MySQL (quotidien)
  - Stockage backups externes (S3, Backblaze)
  - Procédure restauration testée
  - Monitoring uptime (UptimeRobot)

#### 4.3 Documentation

- [ ] **Documentation technique** (2h)
  - Architecture détaillée
  - Diagrammes (Mermaid)
  - API documentation complète (Swagger/OpenAPI)
  - Guides développement

- [ ] **Documentation utilisateur** (2h)
  - USER-GUIDE.md complet
  - Captures d'écran
  - FAQ
  - Troubleshooting

- [ ] **Runbooks opérationnels** (1h)
  - Procédures déploiement
  - Procédures maintenance
  - Procédures incident
  - Contacts urgence

---

### Phase 5 - Évolutions Futures 🔮 (2026+)

**Features envisagées** (non priorisées) :

- **Gamification avancée** : Badges, niveaux, récompenses
- **Partage familial étendu** : Invitations, permissions granulaires
- **Templates** : Menus types, routines quotidiennes, protocoles standards
- **Intelligence artificielle** :
  - Suggestions repas selon historique
  - Prédiction courses selon consommation
  - Détection patterns crises (alertes préventives)
  - Recommandations Design Humain personnalisées
- **Intégrations supplémentaires** :
  - Apple Calendar
  - Notion
  - Trello
  - WhatsApp
- **Analytics** :
  - Statistiques avancées (temps, fréquence, tendances)
  - Graphiques interactifs (Chart.js)
  - Export rapports PDF
- **Multi-langues** : i18n (français, anglais, espagnol)
- **Thèmes personnalisés** : Au-delà de dark/light (solarized, high contrast, etc.)

---

## 🌐 Déploiement & Infrastructure

### Environnement Développement Local

**Prérequis** :
- Node.js ≥ 18.0.0
- npm ≥ 9.0.0
- Docker Desktop
- Git

**Setup** :
```bash
# 1. Cloner repository
git clone https://github.com/theermite/Family-Planner-Simple.git
cd Family-Planner-Simple

# 2. Installer dépendances
npm install

# 3. Lancer MySQL via Docker
docker-compose up -d

# 4. Configurer .env (backend + frontend)
# Voir README.md pour templates

# 5. Lancer développement
npm run dev
# Backend : http://localhost:5000
# Frontend : http://localhost:3000
```

**Compte par défaut** :
- Email : `jay@theermite.com`
- Password : `Password123!`

---

### Environnement Production (VPS OVH)

**Spécifications recommandées** :
- **VPS** : OVH VPS Starter (4-5€/mois)
- **CPU** : 1 vCore
- **RAM** : 2 GB
- **Storage** : 20 GB SSD
- **OS** : Ubuntu Server 22.04 LTS
- **Bandwidth** : Illimité

**Stack production** :
```
Internet
   ↓
[Cloudflare DNS] (optionnel - DDoS protection, CDN)
   ↓
[VPS OVH - Ubuntu 22.04]
   ↓
[Nginx] (reverse proxy + SSL)
   ↓
[Docker Compose]
   ├── Backend Container (Node.js/Express)
   ├── Frontend Container (Nginx serving static)
   └── MySQL Container (MySQL 8.0)
```

**Domaine** (optionnel) :
- Exemple : `family-hub.shinkofa.com`
- SSL/TLS : Let's Encrypt (gratuit, auto-renew)
- HTTPS forcé (redirection HTTP → HTTPS)

**Commandes déploiement** :
```bash
# Sur VPS via SSH

# 1. Cloner repository
git clone https://github.com/theermite/Family-Planner-Simple.git
cd Family-Planner-Simple

# 2. Configuration production
cp backend/.env.example backend/.env.production
cp frontend/.env.example frontend/.env.production
# Éditer avec vraies valeurs production

# 3. Build
npm run build

# 4. Lancer Docker Compose production
docker-compose -f docker-compose.prod.yml up -d

# 5. Nginx config
sudo nano /etc/nginx/sites-available/family-hub
# Copier config reverse proxy
sudo ln -s /etc/nginx/sites-available/family-hub /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 6. SSL Certbot
sudo certbot --nginx -d family-hub.shinkofa.com
```

**Monitoring** :
- **Uptime** : UptimeRobot (ping toutes les 5 min)
- **Logs** : Logtail ou Papertrail (agrégation logs)
- **Performances** : Google Lighthouse CI
- **Errors** : Sentry (error tracking)

---

### Alternative : Hébergement o2Switch (Non recommandé)

**⚠️ Limitations o2Switch** :
- Support Node.js limité (via cPanel "Setup Node.js App")
- Performance moindre que VPS dédié
- Moins de contrôle (pas root access complet)

**Recommandé UNIQUEMENT pour** :
- Sites statiques (React build servi via Apache/Nginx)
- Applications PHP/MySQL classiques

**Pour Family Hub** : **VPS OVH recommandé** (meilleur contrôle, performance, prix similaire)

---

## 🔧 Maintenance & Développement

### Workflow de Développement

#### 1. Nouvelle Feature

```bash
# 1. Créer branche feature (si nécessaire)
git checkout -b feature/nom-feature

# 2. Développer avec commits atomiques fréquents
git add .
git commit -m "feat(scope): description"
git push origin main  # ou feature/nom-feature

# 3. Tester localement
npm run dev
npm test

# 4. Ouvrir Pull Request (si branche feature)
# Review → Merge → Delete branch
```

#### 2. Bug Fix

```bash
# 1. Identifier bug (voir BUGS.md)
# 2. Reproduire localement
# 3. Fixer avec tests de non-régression
git add .
git commit -m "fix(scope): description bug fixé"
git push origin main

# 4. Valider fix
npm test
```

#### 3. Mise à jour Production

```bash
# Sur VPS via SSH

# 1. Pull dernières modifications
cd ~/Family-Planner-Simple
git pull origin main

# 2. Rebuild si nécessaire
npm install  # si dépendances changées
npm run build

# 3. Redémarrer containers
docker-compose -f docker-compose.prod.yml restart

# 4. Vérifier santé
curl https://family-hub.shinkofa.com/api/v1/health
```

---

### Standards Code

**Backend (TypeScript)** :
- Strict mode activé
- Type hints complets (pas de `any`)
- Docstrings JSDoc sur fonctions publiques
- Error handling try/catch systématique
- Validation inputs (Joi schemas)
- Logs Winston niveaux appropriés

**Frontend (TypeScript + React)** :
- Strict mode activé
- Props interfaces typées
- Composants fonctionnels (hooks)
- React.memo pour composants lourds
- useMemo/useCallback si pertinent
- Accessibilité (ARIA labels, keyboard nav)

**Styling (Tailwind CSS)** :
- Utility-first
- Classes responsive (sm:, md:, lg:, xl:)
- Classes dark mode (dark:)
- Charte Shinkofa respectée
- Contraste WCAG AA minimum

**Git Commits** :
- Format : `type(scope): description`
- Types : `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `style`
- Scope : Module concerné (auth, calendar, tasks, etc.)
- Atomiques (1 commit = 1 changement logique)
- Fréquents (toutes les 15-20 min)

---

### Documentation Projet

| Document | Description | Emplacement |
|----------|-------------|-------------|
| **README.md** | Guide installation, usage, architecture | Racine |
| **USER-GUIDE.md** | Documentation end-user non-technique | Racine |
| **COPYRIGHT.md** | Licence, mentions légales | Racine |
| **BUGS.md** | Liste bugs connus + fixes | Racine |
| **TODO-NEXT-SESSION.md** | Roadmap détaillée prochaines sessions | Racine |
| **CDC-Family-Hub-V1.1-EXHAUSTIF.md** | Cahier des charges complet | Racine |
| **FamilyHub-Project-Overview.md** | Ce document (vue d'ensemble) | Racine |
| **.claude/CLAUDE.md** | Instructions TAKUMI agent | `.claude/` |

---

### Checklist Pré-Production

Avant déploiement production :

#### Code
- [ ] Tous les bugs critiques (BUGS.md) résolus
- [ ] Tests backend coverage ≥ 80%
- [ ] Tests frontend coverage ≥ 70%
- [ ] Tous tests passent (npm test)
- [ ] Linting zéro warnings (npm run lint)
- [ ] Build production réussit (npm run build)

#### Sécurité
- [ ] Secrets jamais hardcodés
- [ ] .env.production configuré
- [ ] JWT secrets forts (≥32 chars aléatoires)
- [ ] HTTPS/SSL activé
- [ ] Rate limiting activé
- [ ] Headers sécurité (Helmet)
- [ ] Validation inputs stricte

#### Performance
- [ ] Lighthouse Score ≥ 90
- [ ] Images optimisées (WebP, lazy loading)
- [ ] Code splitting activé
- [ ] Compression gzip
- [ ] Cache headers appropriés

#### Accessibilité
- [ ] WCAG AA validé
- [ ] Navigation clavier complète
- [ ] Labels ARIA appropriées
- [ ] Contraste couleurs ≥ 4.5:1

#### Documentation
- [ ] README.md complet et testé
- [ ] USER-GUIDE.md créé
- [ ] COPYRIGHT.md créé
- [ ] API documentation à jour
- [ ] CHANGELOG.md mis à jour

#### Infrastructure
- [ ] VPS provisionné et configuré
- [ ] Domaine DNS configuré
- [ ] SSL/TLS actif (Let's Encrypt)
- [ ] Backup automatique configuré
- [ ] Monitoring actif (UptimeRobot)
- [ ] Logs centralisés (Logtail)

---

## 📊 Métriques & KPIs

### Métriques Techniques

| Métrique | Objectif | Actuel | Statut |
|----------|----------|--------|--------|
| **Backend Coverage** | ≥ 80% | 0% | 🔴 À développer |
| **Frontend Coverage** | ≥ 70% | 0% | 🔴 À développer |
| **Lighthouse Performance** | ≥ 90 | Non mesuré | 🟡 À mesurer |
| **Lighthouse Accessibility** | ≥ 95 | Non mesuré | 🟡 À mesurer |
| **API Response Time (p95)** | < 200ms | Non mesuré | 🟡 À mesurer |
| **Uptime** | ≥ 99.5% | N/A (local) | 🟡 Post-déploiement |

### Métriques Utilisateur

| Métrique | Objectif | Description |
|----------|----------|-------------|
| **Daily Active Users** | 3 | Utilisateurs quotidiens (Jay, Ange, Gauthier) |
| **Events créés/mois** | ~50 | Événements calendrier |
| **Tasks créées/mois** | ~40 | Tâches ménagères |
| **Logs bébés/jour** | ~20 | Repas + Couches (Evy + Nami) |
| **Listes courses/mois** | ~4 | Listes hebdomadaires |
| **Satisfaction** | ≥ 8/10 | Feedback utilisateurs |

---

## 🔗 Liens & Ressources

### Repositories

- **GitHub** : `https://github.com/theermite/Family-Planner-Simple` (Privé)
- **Claude Instructions** : `.claude/CLAUDE.md` (TAKUMI agent)

### Documentation Externe

- **React** : https://react.dev
- **TypeScript** : https://www.typescriptlang.org/docs
- **Express** : https://expressjs.com
- **TanStack Query** : https://tanstack.com/query/latest
- **Tailwind CSS** : https://tailwindcss.com/docs
- **MySQL** : https://dev.mysql.com/doc

### Services Intégrés (Future)

- **Google Calendar API** : https://developers.google.com/calendar
- **Discord Webhooks** : https://discord.com/developers/docs
- **Telegram Bot API** : https://core.telegram.org/bots/api

### Outils DevOps

- **Docker** : https://docs.docker.com
- **Nginx** : https://nginx.org/en/docs
- **Let's Encrypt** : https://letsencrypt.org
- **GitHub Actions** : https://docs.github.com/en/actions

---

## 📝 Notes de Version

### v1.0.0 MVP (Décembre 2024)

**Date** : 31 décembre 2024

**Highlights** :
- ✅ Setup complet Docker MySQL local
- ✅ Backend API RESTful opérationnel (Auth, Events, Tasks, Shopping, Baby, Meals, Crisis)
- ✅ Frontend React SPA avec 5 pages principales
- ✅ Authentification JWT (register, login, profile)
- ✅ CRUD complet Calendar, Tasks, Shopping
- ✅ Lecture seule Baby, Meals
- ✅ Composants UI réutilisables (Modal, FormField, FloatingButton)
- ✅ Charte graphique Shinkofa intégrée
- ✅ Documentation technique (README.md)

**Bugs connus** :
- Encodage UTF-8 MySQL (accents non affichés)
- CREATE operations validation backend
- Routes Crisis & Meals confusion endpoints

**Prochaine version** : v1.1.0 - Bug Fixes & Polish (Janvier 2026)

---

### v1.1.0 - Bug Fixes & Polish (Planifié - Janvier 2026)

**Objectifs** :
- 🔧 Corriger tous bugs critiques (BUGS.md)
- ✨ FloatingButton global avec menu contextuel
- ✨ Baby Page complète (CRUD repas, couches, bien-être)
- ✨ Meals Page complète (CRUD planning repas)
- ✨ Tâches et événements récurrents (RRULE)
- 🎨 Gestion erreurs frontend (toast notifications)

---

## 🤝 Contributeurs

**Développeur principal** : Jay The Ermite (TAKUMI)
- Email : contact@shinkofa.com
- GitHub : @theermite

**Agent IA** : TAKUMI (Claude Code)
- Rôle : Développeur senior autonome fullstack
- Spécialité : Production-ready code, zéro erreur, stabilité

**Utilisateurs Beta** :
- Jay (Projecteur Splénique 1/3)
- Angélique (Générateur 5/1)
- Gauthier (Générateur 5/1)

---

## 📄 Licence

**© 2025 La Voie Shinkofa - Tous droits réservés**

Ce projet est propriétaire et confidentiel. Usage strictement réservé à la famille Goncalves.

**Licence** : CC-BY-NC-SA-4.0 (Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International)

Voir [COPYRIGHT.md](./COPYRIGHT.md) pour plus de détails.

---

## 📞 Support & Contact

**Email** : contact@lavoieshinkofa.com

**Discord** : Serveur Shinkofa (privé)

**Issues** : GitHub Issues (repository privé)

---

**Document généré le** : 3 janvier 2026
**Dernière mise à jour** : 3 janvier 2026
**Version du document** : 1.0.0
**Auteur** : TAKUMI (Claude Code) pour Jay The Ermite

---

*Développé avec précision et fiabilité par TAKUMI pour La Voie Shinkofa* 🌊
