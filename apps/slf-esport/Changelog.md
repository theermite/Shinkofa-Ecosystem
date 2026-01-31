# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.2] - 2025-12-22

### 🐛 Corrections

#### Authentification - Token sessionStorage (Critique)
- **Problème** : Erreur 403 "Not authenticated" lors de la connexion sans cocher "Remember me"
- **Cause** : L'intercepteur API ne vérifiait que `localStorage`, mais le token était stocké dans `sessionStorage` quand "Remember me" n'était pas coché
- **Solution** :
  - `frontend/src/services/api.ts` : L'intercepteur vérifie maintenant **les deux** storages (`localStorage` ET `sessionStorage`)
  - Nettoyage des deux storages lors d'erreur 401
- **Impact** : Authentification fonctionnelle dans tous les cas
- **Commit** : `2e11865`

#### Utilisateurs - Gestion des comptes problématiques
- **Problème** : Utilisateur ID 4 désactivé (`is_active = false`) ne pouvait pas se connecter
- **Solution** :
  - Suppression de l'utilisateur ID 8 (doublon)
  - Réactivation de l'utilisateur ID 4 (`is_active = true`)
  - Réinitialisation des mots de passe
- **Comptes mis à jour** :
  - ID 4 (denied) : Mot de passe réinitialisé → `Meruem64`
  - ID 2 (The-Ermite) : Mot de passe réinitialisé → `Ermite2024`

### ✨ Nouvelles Fonctionnalités

#### UX - Toggle Reveal (Œil) sur les Champs Mot de Passe
- Ajout d'un bouton œil pour afficher/masquer les mots de passe
- Implémenté dans la page Profil → Onglet "Mot de passe"
- 3 champs concernés :
  - Mot de passe actuel
  - Nouveau mot de passe
  - Confirmation du nouveau mot de passe
- Icônes SVG pour états visible/caché
- **Fichier** : `frontend/src/pages/ProfilePage.tsx`
- **Commit** : `6a737ae`

#### Admin - Réinitialisation de Mot de Passe par Super Admin
- Nouvelle fonctionnalité **réservée aux Super Admins**
- Permet de réinitialiser le mot de passe de n'importe quel utilisateur sans connaître l'ancien
- Interface dans Gestion des utilisateurs → Modifier un utilisateur
- Validation du mot de passe :
  - Minimum 8 caractères
  - Au moins 1 chiffre
  - Au moins 1 lettre majuscule
- Toggle reveal (œil) inclus pour le nouveau mot de passe
- **Backend** :
  - Endpoint : `POST /api/v1/users/{user_id}/reset-password`
  - Schéma : `AdminPasswordReset` avec validation
  - Service : `UserService.admin_reset_password()`
- **Frontend** :
  - Service : `userService.resetUserPassword()`
  - Composant : Section dédiée dans `UserEditModal.tsx`
- **Fichiers** :
  - Backend : `backend/app/routes/users.py`, `backend/app/schemas/user.py`, `backend/app/services/user_service.py`
  - Frontend : `frontend/src/services/userService.ts`, `frontend/src/components/admin/UserEditModal.tsx`
- **Commits** : `44b39b9`, `678fc08`

#### Gaming - Rôle Secondaire en Jeux
- Ajout du champ `secondary_role` pour les profils gaming
- Permet aux joueurs de spécifier un rôle secondaire en plus du rôle principal
- Options identiques au rôle principal :
  - Roam/Support
  - ADC
  - Jungle
  - Clash Lane
  - Mid Lane
- Disponible dans :
  - Page Profil → Section "Profil Gaming"
  - Gestion utilisateurs → Modifier un utilisateur → Section "Profil Gaming"
- **Backend** :
  - Colonne `secondary_role VARCHAR(50)` ajoutée à la table `users`
  - Schémas `UserBase`, `UserCreate`, `UserUpdate` mis à jour
- **Frontend** :
  - Types `User`, `UserCreate`, `UserUpdate` mis à jour
  - Champ ajouté dans `ProfilePage.tsx` et `UserEditModal.tsx`
- **Fichiers** :
  - Backend : `backend/app/models/user.py`, `backend/app/schemas/user.py`
  - Frontend : `frontend/src/types/user.ts`, `frontend/src/pages/ProfilePage.tsx`, `frontend/src/components/admin/UserEditModal.tsx`
- **Commit** : `5f4bce0`

### 🔧 Configuration

#### Contrat Moral - Utilisateur ID 4
- **Statut vérifié** :
  - Username : `Meruem`
  - Email : `andreasbandzouono@gmail.com`
  - Role : `JOUEUR`
  - `moral_contract_accepted` : `false` ✅
- Le pop-up du contrat moral s'affichera automatiquement à la connexion
- Composant `MoralContractChecker` détecte et affiche le modal correctement

### 🗂️ Fichiers modifiés

**Backend**
- `backend/app/models/user.py`
- `backend/app/schemas/user.py`
- `backend/app/services/user_service.py`
- `backend/app/routes/users.py`
- Base de données : Colonne `secondary_role` ajoutée à la table `users`

**Frontend**
- `frontend/src/services/api.ts`
- `frontend/src/services/userService.ts`
- `frontend/src/types/user.ts`
- `frontend/src/pages/ProfilePage.tsx`
- `frontend/src/components/admin/UserEditModal.tsx`

---

## [1.0.1] - 2025-12-04

### 🐛 Corrections

#### Exercices - Mixed Content Error (Critique)
- **Problème** : Les 13 exercices ne s'affichaient pas en production HTTPS
- **Cause** : Nginx ne convertissait pas les redirections 307 de FastAPI de HTTP vers HTTPS
- **Solution** :
  - Ajout de `proxy_redirect http:// https://;` dans la configuration nginx (`/etc/nginx/sites-available/slf-esport`)
  - Ajout des headers `X-Forwarded-Proto: https` et `X-Forwarded-Host`
  - Configuration documentée dans `NGINX-CONFIG.md`

#### Exercices Custom - URLs manquantes
- **Problème** : Les mini-jeux custom affichaient "À venir" au lieu d'être fonctionnels
- **Cause** : `external_url` était `NULL` pour les exercices custom dans la base de données
- **Solution** :
  - Mise à jour de "Peripheral Vision Trainer" → `/games/peripheral-vision`
  - Mise à jour de "Multi-Task Test" → `/games/multi-task`
  - Désactivation de "Synchronization Test" (jeu pas encore implémenté)
  - Migration SQL documentée dans `backend/migrations/fix_custom_exercises_urls.sql`

### ✨ Améliorations

#### Frontend - Gestion des liens internes/externes
- Différenciation automatique entre URLs internes et externes dans `ExercisesPage.tsx`
- URLs internes (`/games/...`) : Ouverture dans le même onglet via React Router `<Link>`
- URLs externes (`https://...`) : Ouverture dans un nouvel onglet via `<a target="_blank">`

### 📝 Documentation

- Ajout de `NGINX-CONFIG.md` : Documentation complète de la configuration nginx pour HTTPS
- Ajout de `backend/migrations/fix_custom_exercises_urls.sql` : Script de migration pour les exercices custom
- Mise à jour du `README.md` :
  - Section troubleshooting avec la résolution du Mixed Content Error
  - Roadmap mise à jour avec éléments complétés (déploiement VPS, HTTPS, exercices)

### 🔧 Configuration

- **docker-compose.yml** : Mise à jour des variables d'environnement frontend pour HTTPS
  - `VITE_API_URL=https://lslf.shinkofa.com`
  - `VITE_WEBSOCKET_URL=wss://lslf.shinkofa.com/ws`
  - `VITE_ENVIRONMENT=production`

### 🗂️ Fichiers modifiés

- `docker-compose.yml`
- `frontend/.env`
- `frontend/src/pages/ExercisesPage.tsx`
- `/etc/nginx/sites-available/slf-esport` (production)
- `README.md`
- Base de données : Table `exercises` (IDs 6, 11, 13)

---

## [1.0.0] - 2025-12-03

### 🎉 Version initiale

#### ✨ Fonctionnalités principales

**Entraînement**
- Bibliothèque de 13 exercices cognitifs (réflexes, vision, mémoire, attention, coordination)
- 2 mini-jeux custom intégrés :
  - Peripheral Vision Trainer (entraînement vision périphérique)
  - Multi-Task Test (gestion multi-tâches)
- Suivi de progression avec statistiques et graphiques

**Coaching Holistique**
- Journal quotidien (sommeil, nutrition, bien-être mental, énergie)
- Gestion d'objectifs SMART
- Questionnaires d'évaluation

**Calendrier & Sessions**
- Calendrier interactif (React Big Calendar)
- Réservation de sessions de coaching
- Gestion des disponibilités

**Analytics**
- Dashboard personnalisé par rôle (Joueur, Coach, Manager)
- Graphiques de performance (Recharts)
- Statistiques détaillées

**Bibliothèque Média**
- Upload de fichiers (vidéos, PDF, images, audio)
- Playlists organisées
- Lecteur vidéo intégré
- Filtres et recherche

**Gestion Utilisateurs**
- 3 rôles : Joueur, Coach, Manager
- Authentification JWT sécurisée
- Contrat moral (charte éthique)
- Profil utilisateur avec avatar

#### 🏗️ Architecture

**Backend**
- FastAPI (Python 3.11+)
- PostgreSQL 15
- Redis 7
- SQLAlchemy 2.0 ORM
- Pydantic V2 validation
- WebSockets temps réel

**Frontend**
- React 18 + TypeScript 5
- Vite 5
- TailwindCSS 3
- Zustand (state management)
- React Query (data fetching)
- React Router DOM 6

**DevOps**
- Docker + Docker Compose
- Nginx reverse proxy
- Let's Encrypt SSL (Certbot)

#### 🚀 Déploiement

- VPS OVH configuré
- Domaine : https://lslf.shinkofa.com
- HTTPS avec certificat Let's Encrypt
- Services dockerisés (backend, frontend, postgres, redis)

---

## Format

### Types de changements
- `Added` ✨ : Nouvelles fonctionnalités
- `Changed` 🔄 : Modifications de fonctionnalités existantes
- `Deprecated` ⚠️ : Fonctionnalités bientôt supprimées
- `Removed` 🗑️ : Fonctionnalités supprimées
- `Fixed` 🐛 : Corrections de bugs
- `Security` 🔒 : Corrections de sécurité
