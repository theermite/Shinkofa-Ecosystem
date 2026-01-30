# Changelog - [Nom Projet]

> Historique complet des versions, changements et releases du projet.

**Format** : Ce changelog suit [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)
**Versioning** : Ce projet suit [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)

---

## [Unreleased]

### 🎯 En Cours de Développement

- [Feature en cours]
- [Fix en cours]

---

## [2.1.0] - 2026-02-15

### ✨ Added (Nouveautés)

- **Feature A** : Ajout système notifications temps réel
  - WebSocket implementation
  - Push notifications navigateur
  - Notifications email configurables
- **Feature B** : Recherche fulltext avancée
  - Support recherche multi-critères
  - Suggestions auto-complétion
  - Filtres avancés (date, catégorie, auteur)

### 🔧 Changed (Modifications)

- **UI** : Redesign page profil utilisateur
  - Nouveau layout responsive
  - Amélioration accessibilité (WCAG AA → AAA)
  - Chargement lazy-loading des avatars
- **API** : Rate limiting ajusté
  - 100 req/min → 150 req/min pour users authentifiés
  - Nouveaux headers `X-RateLimit-*`

### 🐛 Fixed (Corrections)

- **Auth** : Fix logout ne supprimait pas token côté serveur (#234)
- **DB** : Fix migration rollback cassait foreign keys (#245)
- **Frontend** : Fix bouton submit disabled après erreur validation (#256)

### 🗑️ Deprecated (Déprécié)

- **API** : Endpoint `/api/v1/users/old-profile` déprécié
  - Utiliser `/api/v1/users/me` à la place
  - Support jusqu'à version 3.0.0

### 🚨 Security (Sécurité)

- **Auth** : Patch vulnérabilité JWT signature bypass (CVE-2026-XXXX)
- **Deps** : Update `express` 4.17.1 → 4.18.2 (fix XSS)

---

## [2.0.0] - 2026-01-15

### 🎉 BREAKING CHANGES

⚠️ **Migration requise** : Voir [MIGRATION_v2.md](MIGRATION_v2.md)

#### Breaking Change 1 : Nouveau format API Response

**Avant (v1.x)** :
```json
{
  "data": { "id": 1, "name": "User" },
  "error": null
}
```

**Après (v2.x)** :
```json
{
  "data": { "id": 1, "name": "User" },
  "meta": { "timestamp": "2026-01-15T10:00:00Z" }
}
```

**Migration** :
- Mettre à jour clients API pour gérer nouveau format
- Support v1 retiré à partir de 2026-06-01

#### Breaking Change 2 : Suppression support Node.js 14

**Raison** : Node 14 EOL (End of Life)

**Action requise** :
- Upgrade Node.js 16+ minimum
- Recommandé : Node 20 LTS

### ✨ Added

- **Architecture** : Refonte complète backend avec microservices
- **Performance** : Ajout cache Redis pour queries fréquentes
- **Auth** : Support OAuth2 (Google, GitHub)
- **Tests** : Coverage passé de 65% → 85%

### 🔧 Changed

- **DB** : Migration PostgreSQL 13 → 15
- **Frontend** : Refonte UI avec design system unifié

### 🗑️ Removed

- **Deprecated** : Suppression endpoints `/api/v0/*` (deprecated v1.5.0)
- **Legacy** : Suppression support IE11

---

## [1.5.2] - 2025-12-20

### 🐛 Fixed

- **Hotfix** : Fix critical bug crash serveur sur requête malformée
- **DB** : Fix deadlock lors création users concurrent

---

## [1.5.1] - 2025-12-10

### 🐛 Fixed

- **Auth** : Fix refresh token expirait trop tôt
- **UI** : Fix style cassé sur Safari iOS

---

## [1.5.0] - 2025-12-01

### ✨ Added

- **Feature** : Export données utilisateur (conformité RGPD)
- **API** : Pagination sur tous les endpoints list

### 🗑️ Deprecated

- **API** : Endpoints `/api/v0/*` seront supprimés en v2.0.0

---

## [1.4.0] - 2025-11-15

### ✨ Added

- **Feature** : Mode sombre (dark mode)
- **Admin** : Panel admin pour gestion users

### 🔧 Changed

- **Performance** : Optimisation queries DB (-30% temps réponse)

---

## [1.3.0] - 2025-11-01

### ✨ Added

- **Feature** : Upload fichiers (images + PDF)
- **Tests** : Ajout tests E2E avec Playwright

---

## [1.2.0] - 2025-10-15

### ✨ Added

- **Feature** : Système de tags pour posts
- **API** : Endpoint recherche avancée

### 🐛 Fixed

- **Security** : Fix injection SQL sur endpoint `/search`

---

## [1.1.0] - 2025-10-01

### ✨ Added

- **Feature** : Profils utilisateurs étendus
- **Feature** : Système de likes sur posts

### 🔧 Changed

- **UI** : Amélioration responsive mobile

---

## [1.0.0] - 2025-09-15

### 🎉 Initial Release

#### Core Features

- ✅ Authentification JWT (login, register, logout)
- ✅ CRUD Posts (create, read, update, delete)
- ✅ Profils utilisateurs basiques
- ✅ API REST complète
- ✅ Documentation API (Swagger)
- ✅ Tests unitaires (coverage 65%)

#### Tech Stack

- **Backend** : FastAPI 0.103.0, Python 3.11
- **Frontend** : React 18, TypeScript 5
- **Database** : PostgreSQL 13
- **Deploy** : Docker, Nginx

---

## [0.9.0] - 2025-09-01 (Beta)

### ✨ Added

- Beta release pour tests utilisateurs
- Features core implémentées

---

## [0.1.0] - 2025-08-01 (Alpha)

### ✨ Added

- MVP initial
- Proof of concept

---

## 📋 Types de Changements

Ce changelog utilise les catégories suivantes :

- **✨ Added** : Nouvelles fonctionnalités
- **🔧 Changed** : Modifications de fonctionnalités existantes
- **🗑️ Deprecated** : Fonctionnalités dépréciées (seront supprimées)
- **🗑️ Removed** : Fonctionnalités supprimées
- **🐛 Fixed** : Corrections de bugs
- **🚨 Security** : Correctifs de sécurité

---

## 📐 Semantic Versioning

**Format** : MAJOR.MINOR.PATCH

- **MAJOR** : Breaking changes (incompatibilité backward)
- **MINOR** : Nouvelles features (backward compatible)
- **PATCH** : Bug fixes (backward compatible)

**Exemples** :
- `1.0.0` → `1.0.1` : Bug fix
- `1.0.1` → `1.1.0` : Nouvelle feature
- `1.1.0` → `2.0.0` : Breaking change

---

## 🔗 Liens Utiles

- [Keep a Changelog](https://keepachangelog.com/)
- [Semantic Versioning](https://semver.org/)
- [Migration Guides](./migrations/)

---

**Maintenu par** : [Équipe]
**Format** : Keep a Changelog 1.0.0

---

## 📝 Template pour Nouvelle Version

```markdown
## [X.Y.Z] - YYYY-MM-DD

### ✨ Added
- [Feature description]

### 🔧 Changed
- [Change description]

### 🗑️ Deprecated
- [Deprecation notice]

### 🗑️ Removed
- [Removal notice]

### 🐛 Fixed
- [Bug fix description] (#issue-number)

### 🚨 Security
- [Security fix description]
```

---

## 🔍 Comment Chercher dans ce Changelog

```bash
# Rechercher une feature spécifique
grep -i "notification" CHANGELOG.md

# Voir tous les breaking changes
grep -i "breaking" CHANGELOG.md

# Voir tous les security fixes
grep -A 2 "Security" CHANGELOG.md
```
