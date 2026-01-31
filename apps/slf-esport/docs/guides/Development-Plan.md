# 📋 Plan de Développement SLF E-Sport

**Date de l'audit** : 30 novembre 2025
**Version** : 1.0
**État actuel** : MVP fonctionnel déployé localement

---

## ✅ PROBLÈMES RÉSOLUS (Audit Nov 30)

### 1. Création de sessions - Erreur "Not Found" ✅
**Statut** : CORRIGÉ
**Problème** : Double préfixage des routes (`/api/v1/sessions/sessions`)
**Solution** : Suppression du prefix dans `sessions.py` ligne 27
**Tests** : ✅ Création de session fonctionnelle (curl testé)

### 2. Filtres de catégories d'exercices ✅
**Statut** : CORRIGÉ
**Problème** : Compteurs ne se mettaient pas à jour lors du filtrage
**Solution** : Filtrage côté client + séparation `allExercises` / `filteredExercises`
**Fichier** : `frontend/src/pages/ExercisesPage.tsx`

### 3. Jeux natifs absents de la liste d'exercices ✅
**Statut** : CORRIGÉ
**Problème** : PeripheralVisionGame et MultiTaskGame pas dans la DB
**Solution** : Création script `seed_native_games.py` et ajout à la DB
**Résultat** : 13 exercices totaux (11 externes + 2 custom)

---

## 🎯 FONCTIONNALITÉS ACTUELLEMENT OPÉRATIONNELLES

### ✅ Core Features (Production-Ready)
1. **Authentification** : Login/Register/JWT/CORS
2. **Dashboard** : Personnalisé par rôle (Joueur/Coach/Manager)
3. **Exercices** : 11 externes + 2 jeux custom
4. **Calendrier** : Sessions CRUD + filtres
5. **Mini-jeux** : Vision périphérique + Multi-tâches
6. **Base de données** : PostgreSQL + Redis
7. **API** : FastAPI auto-documentée (Swagger /docs)

### ⚠️ Partiellement Implémentées
1. **Coaching Page** : Placeholder "En développement"
2. **Suivi de scores** : Endpoints API présents, UI à vérifier
3. **Analytics** : Page existe, données à vérifier

### ❌ Non Implémentées (Roadmap README.md)
1. **Journal de coaching** : Page existe, backend à vérifier
2. **Objectifs** : Page existe, backend à vérifier
3. **Bibliothèque Média** : Page existe, backend à vérifier
4. **Notifications** : Pas implémenté
5. **Intégration Discord** : Pas implémenté
6. **PWA** : Pas configuré
7. **CI/CD** : Pas configuré

---

## 📊 PLAN DE DÉVELOPPEMENT PRIORITISÉ

### PHASE 1 : VALIDATION MVP (Priorité CRITIQUE) 🔴

**Objectif** : Vérifier que toutes les fonctionnalités existantes fonctionnent end-to-end

#### 1.1 Test Complet Joueur (3h)
- [ ] Inscription + Login
- [ ] Dashboard joueur
- [ ] Faire tous les exercices (11 externes + 2 custom)
- [ ] Enregistrer des scores
- [ ] Créer une session SOLO
- [ ] Voir le calendrier
- [ ] Tester journal/objectifs/média

#### 1.2 Test Complet Coach/Manager (2h)
- [ ] Login avec compte coach
- [ ] Dashboard coach
- [ ] Créer session GROUP
- [ ] Gérer participants
- [ ] Consulter stats joueurs
- [ ] Tester tous les endpoints coach

#### 1.3 Corrections Critiques (Variable)
- [ ] Fixer tous les bugs bloquants découverts
- [ ] Vérifier endpoints API non testés
- [ ] Valider authentification/permissions

---

### PHASE 2 : COMPLÉTION FONCTIONNALITÉS CORE (Priorité HAUTE) 🟠

**Objectif** : Finaliser les fonctionnalités partiellement implémentées

#### 2.1 Suivi de Scores Exercices (4h)
- [ ] Vérifier `ExerciseDetailPage.tsx`
- [ ] Tester création/modification scores
- [ ] Graphiques de progression (Recharts)
- [ ] Upload de screenshots (optionnel)
- [ ] Statistiques personnelles

#### 2.2 Analytics Dashboard (5h)
- [ ] Vérifier `AnalyticsPage.tsx`
- [ ] Implémenter graphiques performances
- [ ] Statistiques sessions
- [ ] Évolution dans le temps
- [ ] Insights personnalisés

#### 2.3 Journal de Coaching (4h)
- [ ] Vérifier `JournalPage.tsx`
- [ ] Backend CRUD journal entries
- [ ] Formulaire sommeil/nutrition/bien-être
- [ ] Historique journalier
- [ ] Export PDF (optionnel)

#### 2.4 Gestion Objectifs (4h)
- [ ] Vérifier `GoalsPage.tsx`
- [ ] Backend CRUD objectifs
- [ ] Objectifs SMART
- [ ] Suivi progression
- [ ] Notifications (optionnel)

#### 2.5 Bibliothèque Média (5h)
- [ ] Vérifier `MediaPage.tsx`
- [ ] Backend upload fichiers
- [ ] Stockage (S3 ou local)
- [ ] Playlists organisées
- [ ] Lecteur vidéo intégré
- [ ] Filtres/recherche

---

### PHASE 3 : COACHING PAGE (Priorité MOYENNE) 🟡

**Objectif** : Implémenter l'espace coaching complet

#### 3.1 Gestion Joueurs (Coach) (6h)
- [ ] Liste tous les joueurs
- [ ] Profil détaillé joueur
- [ ] Historique sessions
- [ ] Historique scores exercices
- [ ] Journal du joueur (lecture coach)

#### 3.2 Plans d'Entraînement (8h)
- [ ] Créer plans personnalisés
- [ ] Assigner exercices
- [ ] Définir objectifs
- [ ] Suivi progression plan
- [ ] Templates de plans

#### 3.3 Feedback & Communication (6h)
- [ ] Notes coach par session
- [ ] Commentaires sur scores
- [ ] Messagerie interne (optionnel)
- [ ] Notifications

---

### PHASE 4 : FONCTIONNALITÉS AVANCÉES (Priorité BASSE) 🟢

#### 4.1 Notifications (4h)
- [ ] Email notifications (SendGrid)
- [ ] Notifications in-app
- [ ] Rappels sessions
- [ ] Alerts objectifs

#### 4.2 Intégration Discord (5h)
- [ ] OAuth Discord
- [ ] Sync Discord roles
- [ ] Notifications Discord
- [ ] Commands bot (optionnel)

#### 4.3 PWA (Progressive Web App) (3h)
- [ ] Service Worker
- [ ] Manifest.json
- [ ] Offline support
- [ ] Install prompt
- [ ] Icons

#### 4.4 Tests Automatisés (8h)
- [ ] Tests E2E (Playwright)
- [ ] Tests unitaires backend (pytest)
- [ ] Tests unitaires frontend (Jest)
- [ ] Coverage > 80%

#### 4.5 CI/CD GitHub Actions (4h)
- [ ] Workflow tests automatiques
- [ ] Linting automatique
- [ ] Build validation
- [ ] Déploiement automatique VPS

---

### PHASE 5 : DÉPLOIEMENT PRODUCTION (Priorité CRITIQUE pour PROD) 🔴

#### 5.1 Préparation VPS OVH (3h)
- [ ] Créer VPS (3,50-5€/mois)
- [ ] SSH + Firewall
- [ ] Docker + Docker Compose
- [ ] Nginx reverse proxy
- [ ] SSL/HTTPS (Let's Encrypt)

#### 5.2 Configuration Production (4h)
- [ ] Variables d'environnement .env.production
- [ ] PostgreSQL production
- [ ] Redis production
- [ ] Backups automatiques
- [ ] Monitoring (optionnel)

#### 5.3 Déploiement Initial (3h)
- [ ] Build images Docker
- [ ] Deploy containers
- [ ] Configuration Nginx
- [ ] Test end-to-end production
- [ ] Documentation déploiement

#### 5.4 Domaine & DNS (2h)
- [ ] Acheter domaine (optionnel)
- [ ] Configurer DNS
- [ ] SSL wildcard
- [ ] Redirections

---

## 📈 ESTIMATION TEMPS TOTAL

| Phase | Description | Temps estimé |
|-------|-------------|--------------|
| **Phase 1** | Validation MVP | ~5h |
| **Phase 2** | Complétion Core | ~22h |
| **Phase 3** | Coaching Page | ~20h |
| **Phase 4** | Fonctionnalités Avancées | ~24h |
| **Phase 5** | Déploiement Production | ~12h |
| **TOTAL** | | **~83h** |

---

## 🎯 RECOMMANDATIONS

### Ordre de Priorité Suggéré
1. **PHASE 1** (URGENT) : Valider que ce qui existe fonctionne
2. **PHASE 2** (HAUTE) : Compléter les fonctionnalités à moitié faites
3. **PHASE 5** (CRITIQUE) : Déployer en production VPS OVH
4. **PHASE 3** (MOYENNE) : Coaching page (peut attendre retours utilisateurs)
5. **PHASE 4** (BASSE) : Fonctionnalités bonus

### MVP Minimum pour Lancement Public
- ✅ Authentification
- ✅ Dashboard
- ✅ Exercices + Mini-jeux
- ✅ Calendrier + Sessions
- ✅ Suivi scores (Phase 2.1)
- ✅ Analytics basique (Phase 2.2)
- ⚠️ Déploiement VPS (Phase 5)

**Temps MVP** : Phase 1 (5h) + Phase 2.1-2.2 (9h) + Phase 5 (12h) = **~26h**

---

## 📝 NOTES TECHNIQUES

### Backend (API FastAPI)
- ✅ CORS configuré
- ✅ JWT authentication
- ✅ Database migrations (Alembic implicite)
- ✅ Auto-documentation Swagger
- ⚠️ Tests backend à créer

### Frontend (React + TypeScript)
- ✅ Routing (React Router)
- ✅ State management (Zustand)
- ✅ Styling (TailwindCSS)
- ✅ Components réutilisables
- ⚠️ Tests frontend à créer

### DevOps
- ✅ Docker Compose dev
- ⚠️ Docker Compose production à créer
- ⚠️ Nginx config production à créer
- ⚠️ CI/CD GitHub Actions à créer

---

## 🔍 TESTS À EFFECTUER IMMÉDIATEMENT

### Test Session 1 (Joueur)
```bash
# 1. Créer compte joueur
# 2. Login
# 3. Aller sur /exercises
# 4. Tester un jeu custom (Peripheral Vision)
# 5. Enregistrer score via /exercises/:id
# 6. Vérifier score dans Analytics
# 7. Créer session SOLO
# 8. Voir session dans calendrier
```

### Test Session 2 (Coach)
```bash
# 1. Créer compte coach (modifier rôle en DB)
# 2. Login
# 3. Créer session GROUP
# 4. Ajouter participants
# 5. Consulter stats joueur
# 6. Tester /coaching
```

---

**Prochaine Étape** : Exécuter Phase 1 (Validation MVP) et documenter tous les bugs trouvés.

**Responsable** : TAKUMI Agent
**Contact** : Jay The Ermite
