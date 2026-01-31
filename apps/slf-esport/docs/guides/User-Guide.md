# 🧪 Guide de Test - SLF E-Sport

**Guide complet pour tester toutes les fonctionnalités** de la plateforme SLF E-Sport.

---

## 📋 Prérequis

Avant de commencer les tests, assurez-vous que :

✅ Docker est installé et lancé
✅ L'application est démarrée (`docker-compose up`)
✅ Tous les services sont **UP** (`docker-compose ps`)
✅ Vous pouvez accéder à :
   - Frontend : http://localhost:3000
   - Backend API : http://localhost:8000
   - API Docs : http://localhost:8000/docs

---

## 🎯 Scénarios de test

### Scénario 1 : Première utilisation - Joueur

```
Persona : Alex, joueur e-sport débutant, souhaite s'entraîner
Objectif : Créer un compte, explorer la plateforme, faire un exercice
```

**Étapes** :

1. **Inscription** ✅
   - Aller sur http://localhost:3000
   - Cliquer sur "S'inscrire" ou "Register"
   - Remplir le formulaire :
     - Email : `alex.joueur@test.com`
     - Mot de passe : `TestPass123!`
     - Nom complet : `Alex Joueur`
     - Rôle : **Joueur** (sélectionner dans la liste)
   - Cliquer sur "S'inscrire"
   - **Résultat attendu** : Redirection vers la page de connexion avec message de succès

2. **Connexion** ✅
   - Email : `alex.joueur@test.com`
   - Mot de passe : `TestPass123!`
   - **Résultat attendu** : Redirection vers le **Dashboard Joueur**

3. **Explorer le Dashboard Joueur** ✅
   - Vérifier que le dashboard affiche :
     - Statistiques personnelles (exercices réalisés, temps passé, etc.)
     - Derniers exercices
     - Prochaines sessions
     - Graphiques de progression
   - **Résultat attendu** : Dashboard bien affiché avec widgets

4. **Accéder à la bibliothèque d'exercices** ✅
   - Menu : "Exercices" ou "Entraînement"
   - Vérifier la liste des exercices
   - Filtrer par catégorie (cognitif, réflexes, coordination)
   - **Résultat attendu** : Liste d'exercices avec descriptions et difficultés

5. **Lancer un exercice** ✅
   - Cliquer sur un exercice (ex: "Peripheral Vision Trainer")
   - Lire les instructions
   - Cliquer sur "Commencer"
   - Réaliser l'exercice
   - Voir le score final
   - **Résultat attendu** : Exercice interactif, score enregistré

6. **Jouer au mini-jeu : Peripheral Vision** 🎮
   - Menu : "Jeux" → "Peripheral Vision Trainer"
   - Suivre les instructions
   - Réussir quelques essais
   - **Résultat attendu** : Jeu fluide, score affiché, progression enregistrée

7. **Jouer au mini-jeu : Multi-Task Test** 🎮
   - Menu : "Jeux" → "Multi-Task Test"
   - Gérer plusieurs tâches simultanées
   - Terminer le test
   - **Résultat attendu** : Score multi-critères, feedback

8. **Consulter les Analytics** 📊
   - Menu : "Analytics" ou "Statistiques"
   - Vérifier les graphiques :
     - Évolution des scores
     - Temps d'entraînement
     - Progression par catégorie
   - **Résultat attendu** : Graphiques Recharts affichés correctement

9. **Réserver une session de coaching** 📅
   - Menu : "Calendrier" ou "Sessions"
   - Voir le calendrier interactif (React Big Calendar)
   - Cliquer sur un créneau disponible
   - Remplir le formulaire de réservation :
     - Type de session (ex: Coaching 1-1)
     - Description/Objectifs
   - Confirmer
   - **Résultat attendu** : Session créée, visible dans le calendrier

10. **Utiliser le Journal de Coaching** 📝
    - Menu : "Coaching" → "Journal"
    - Créer une entrée quotidienne :
      - Qualité du sommeil (1-10)
      - Nutrition (texte libre)
      - Bien-être mental (1-10)
      - Notes personnelles
    - Sauvegarder
    - **Résultat attendu** : Entrée enregistrée, historique visible

11. **Créer un Objectif** 🎯
    - Menu : "Coaching" → "Objectifs"
    - Cliquer sur "Nouvel objectif"
    - Remplir le formulaire SMART :
      - Titre : "Améliorer mon aim de 20%"
      - Description
      - Date cible
      - Critères de réussite
    - Sauvegarder
    - **Résultat attendu** : Objectif créé, progression à 0%

12. **Explorer la Bibliothèque Média** 📚
    - Menu : "Médias" ou "Bibliothèque"
    - Voir les médias disponibles (vidéos, guides)
    - Filtrer par type
    - Lire une vidéo dans le lecteur intégré
    - **Résultat attendu** : Liste de médias, lecteur fonctionnel

13. **Modifier son Profil** 👤
    - Cliquer sur l'avatar ou "Profil"
    - Modifier les informations :
      - Nom
      - Avatar (upload image)
      - Préférences
    - Sauvegarder
    - **Résultat attendu** : Profil mis à jour

14. **Se déconnecter** 🚪
    - Cliquer sur "Déconnexion"
    - **Résultat attendu** : Retour à la page de connexion

---

### Scénario 2 : Coach - Gestion des joueurs

```
Persona : Marie, coach e-sport, souhaite suivre ses joueurs
Objectif : Créer un compte coach, voir le dashboard coach, gérer les sessions
```

**Étapes** :

1. **Inscription Coach** ✅
   - S'inscrire avec :
     - Email : `marie.coach@test.com`
     - Password : `CoachPass123!`
     - Nom : `Marie Coach`
     - Rôle : **Coach**

2. **Connexion Coach** ✅
   - Se connecter
   - **Résultat attendu** : Dashboard Coach (différent du dashboard Joueur)

3. **Dashboard Coach** ✅
   - Vérifier les widgets spécifiques coach :
     - Liste des joueurs suivis
     - Sessions à venir
     - Statistiques globales de l'équipe
     - Alertes/Notifications

4. **Consulter les joueurs** 👥
   - Menu : "Mes Joueurs" ou "Équipe"
   - Voir la liste des joueurs
   - Cliquer sur un joueur (ex: Alex Joueur)
   - Voir son profil détaillé :
     - Statistiques
     - Progression
     - Objectifs
     - Historique des sessions
   - **Résultat attendu** : Profil joueur complet visible

5. **Créer une session de coaching** 📅
   - Menu : "Calendrier"
   - Créer une nouvelle session :
     - Type : Coaching 1-1
     - Joueur : Alex Joueur
     - Date/Heure
     - Durée
     - Description
   - **Résultat attendu** : Session créée, joueur notifié

6. **Accéder aux Analytics de l'équipe** 📊
   - Menu : "Analytics Équipe"
   - Voir les statistiques globales
   - Comparer les joueurs
   - **Résultat attendu** : Dashboard analytics complet

7. **Uploader un média** 📤
   - Menu : "Bibliothèque Média"
   - Cliquer sur "Upload"
   - Sélectionner un fichier (vidéo/PDF)
   - Remplir les métadonnées :
     - Titre
     - Description
     - Tags
     - Playlist
   - Uploader
   - **Résultat attendu** : Fichier uploadé, visible dans la bibliothèque

8. **Créer une Playlist** 📝
   - Menu : "Bibliothèque Média" → "Playlists"
   - Créer nouvelle playlist : "Tutoriels Aim"
   - Ajouter des médias à la playlist
   - Partager avec les joueurs
   - **Résultat attendu** : Playlist créée et partagée

---

### Scénario 3 : Manager - Vue d'ensemble

```
Persona : Thomas, manager d'équipe, souhaite gérer l'équipe
Objectif : Vue globale, gestion administrative
```

**Étapes** :

1. **Inscription Manager** ✅
   - Email : `thomas.manager@test.com`
   - Password : `ManagerPass123!`
   - Rôle : **Manager**

2. **Dashboard Manager** ✅
   - Vérifier les widgets spécifiques :
     - KPIs équipe
     - Budget/Finances (si implémenté)
     - Planning global
     - Rapports

3. **Gérer les utilisateurs** 👥
   - Menu : "Utilisateurs"
   - Voir tous les utilisateurs (Joueurs + Coachs)
   - Modifier les rôles
   - Activer/Désactiver des comptes
   - **Résultat attendu** : Liste complète, actions admin disponibles

4. **Voir le calendrier global** 📅
   - Menu : "Calendrier"
   - Voir toutes les sessions de tous les coachs
   - Filtrer par coach/joueur
   - **Résultat attendu** : Vue d'ensemble complète

5. **Exporter des rapports** 📄
   - Menu : "Rapports" (si disponible)
   - Générer rapport de progression de l'équipe
   - Exporter en PDF/CSV
   - **Résultat attendu** : Rapport généré et téléchargé

---

## 🧪 Tests Techniques

### Test 1 : API Backend

**Vérifier que le backend répond** :

```bash
# Health check
curl http://localhost:8000/health

# Résultat attendu :
# {
#   "status": "healthy",
#   "service": "SLF E-Sport Platform",
#   "version": "1.0.0",
#   "environment": "development"
# }
```

**Créer un utilisateur via API** :

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api.test@test.com",
    "password": "ApiTest123!",
    "full_name": "API Test User",
    "role": "player"
  }'

# Résultat attendu : 201 Created + objet user
```

**Se connecter via API** :

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "api.test@test.com",
    "password": "ApiTest123!â€
  }'

# Résultat attendu : 200 OK + access_token
```

---

### Test 2 : Base de données PostgreSQL

**Accéder à la base de données** :

```bash
# Se connecter au container PostgreSQL
docker-compose exec postgres psql -U slf_user -d slf_esport

# Lister les tables
\dt

# Résultat attendu : Liste des tables (users, exercises, sessions, etc.)

# Voir les utilisateurs
SELECT id, email, full_name, role FROM users;

# Quitter
\q
```

---

### Test 3 : Redis Cache

**Vérifier Redis** :

```bash
# Se connecter au container Redis
docker-compose exec redis redis-cli

# Tester
PING
# Résultat attendu : PONG

# Voir les clés (si cache utilisé)
KEYS *

# Quitter
exit
```

---

### Test 4 : Frontend React

**Vérifier le build** :

```bash
# Logs frontend
docker-compose logs frontend

# Résultat attendu : Pas d'erreurs TypeScript/ESLint
```

**Tester en mode dev local** (optionnel) :

```bash
cd frontend
npm install
npm run dev

# Accéder à http://localhost:5173
```

---

### Test 5 : Uploads de fichiers

**Tester l'upload de médias** :

1. Se connecter en tant que Coach
2. Aller dans "Bibliothèque Média"
3. Uploader un fichier (image/vidéo/PDF)
4. Vérifier que le fichier est dans `uploads/` sur le serveur :

```bash
docker-compose exec backend ls -la /app/uploads
```

---

## 🐛 Tests de Robustesse

### Test 1 : Erreurs de validation

**Tester les validations backend** :

- S'inscrire avec email invalide → **Erreur attendue**
- S'inscrire avec mot de passe faible → **Erreur attendue**
- Se connecter avec mauvais credentials → **Erreur attendue**
- Créer un objectif sans date → **Erreur attendue**

### Test 2 : Autorisations

**Tester les permissions** :

- Joueur essaie d'accéder au dashboard Coach → **403 Forbidden**
- Utilisateur non connecté accède à `/exercises` → **Redirect vers login**
- Coach essaie de supprimer un joueur (sans permission) → **403 Forbidden**

### Test 3 : Performance

**Tester la charge** :

- Créer 50 entrées de journal rapidement
- Uploader 10 fichiers simultanément
- Ouvrir 5 onglets avec le dashboard
- **Résultat attendu** : Pas de crash, temps de réponse <500ms

### Test 4 : Responsive Design

**Tester sur différentes tailles** :

- Desktop (1920x1080)
- Tablet (768x1024)
- Mobile (375x667)
- **Résultat attendu** : UI adaptée, pas de débordement

---

## ✅ Checklist complète de test

### Authentification & Utilisateurs
- [ ] Inscription joueur
- [ ] Inscription coach
- [ ] Inscription manager
- [ ] Connexion
- [ ] Déconnexion
- [ ] Modification profil
- [ ] Upload avatar
- [ ] Mot de passe oublié (si implémenté)

### Dashboards
- [ ] Dashboard Joueur affiché correctement
- [ ] Dashboard Coach affiché correctement
- [ ] Dashboard Manager affiché correctement
- [ ] Widgets chargent les données

### Exercices & Entraînement
- [ ] Liste des exercices visible
- [ ] Filtres fonctionnent
- [ ] Lancer un exercice
- [ ] Exercice se termine, score enregistré
- [ ] Historique visible dans analytics

### Mini-Jeux
- [ ] Peripheral Vision Trainer fonctionne
- [ ] Multi-Task Test fonctionne
- [ ] Scores enregistrés
- [ ] Leaderboard (si implémenté)

### Calendrier & Sessions
- [ ] Calendrier s'affiche (React Big Calendar)
- [ ] Créer une session
- [ ] Modifier une session
- [ ] Annuler une session
- [ ] Filtrer par coach/joueur
- [ ] Notifications (si implémentées)

### Coaching Holistique
- [ ] Créer entrée journal
- [ ] Modifier entrée journal
- [ ] Historique journal visible
- [ ] Créer objectif SMART
- [ ] Suivre progression objectif
- [ ] Marquer objectif terminé
- [ ] Questionnaires (si implémentés)

### Bibliothèque Média
- [ ] Liste médias visible
- [ ] Upload fichier (image)
- [ ] Upload fichier (vidéo)
- [ ] Upload fichier (PDF)
- [ ] Lecteur vidéo fonctionne
- [ ] Créer playlist
- [ ] Ajouter médias à playlist
- [ ] Partager playlist

### Analytics
- [ ] Dashboard analytics joueur
- [ ] Dashboard analytics équipe (coach)
- [ ] Graphiques Recharts affichés
- [ ] Données correctes
- [ ] Export rapports (si implémenté)

### Backend API
- [ ] Health check répond
- [ ] Documentation Swagger accessible
- [ ] Endpoints auth fonctionnent
- [ ] Endpoints users fonctionnent
- [ ] Endpoints exercises fonctionnent
- [ ] Endpoints sessions fonctionnent
- [ ] Endpoints coaching fonctionnent
- [ ] Endpoints media fonctionnent
- [ ] Validations Pydantic fonctionnent
- [ ] Erreurs bien formatées

### Base de données
- [ ] Tables créées automatiquement
- [ ] Données persistantes après redémarrage
- [ ] Relations FK fonctionnent
- [ ] Indexes performants

### Sécurité
- [ ] JWT tokens fonctionnent
- [ ] Refresh tokens (si implémentés)
- [ ] CORS configuré
- [ ] Mots de passe hashés (bcrypt)
- [ ] Injections SQL bloquées (Pydantic)
- [ ] XSS bloqué (React)

### Performance
- [ ] Pages chargent en <2s
- [ ] API répond en <500ms
- [ ] Pas de memory leaks
- [ ] WebSockets stables (si utilisés)

### Responsive & UX
- [ ] Mobile responsive
- [ ] Tablet responsive
- [ ] Desktop optimal
- [ ] Navigation fluide
- [ ] Messages d'erreur clairs
- [ ] Feedback utilisateur (spinners, toasts)

---

## 🚨 Bugs potentiels à surveiller

| Bug potentiel | Symptôme | Solution |
|---------------|----------|----------|
| **Frontend page blanche** | Rien ne s'affiche | Vérifier console navigateur, logs Docker |
| **401 Unauthorized** | Déconnecté sans raison | Token JWT expiré, relogin nécessaire |
| **Upload échoue** | Erreur lors upload | Vérifier permissions dossier `/app/uploads` |
| **Calendrier vide** | Pas de sessions affichées | Vérifier les dates (timezone), créer une session |
| **Graphiques vides** | Pas de données analytics | Pas assez de données, faire des exercices |
| **500 Internal Server Error** | Erreur backend | Voir logs backend : `docker-compose logs backend` |

---

## 📊 Rapport de test

Après avoir terminé les tests, remplir ce rapport :

**Date du test** : _______
**Testeur** : _______
**Version** : 1.0.0

**Résultats** :

- ✅ Fonctionnalités OK : _____ / _____
- ⚠️ Bugs mineurs : _____
- ❌ Bugs critiques : _____

**Bugs trouvés** :

1. _______________________________
2. _______________________________
3. _______________________________

**Commentaires** :

_______________________________________
_______________________________________

---

## 🎉 Après les tests

Si tous les tests passent :

1. ✅ Projet **VALIDÉ** pour déploiement
2. 📝 Préparer le déploiement VPS OVH
3. 🔒 Changer les secrets en production (.env)
4. 🚀 Lancer le déploiement

Si des bugs sont trouvés :

1. 📋 Créer des issues GitHub
2. 🐛 Corriger les bugs critiques
3. 🔄 Re-tester
4. ✅ Valider la correction

---

**Bons tests ! 🧪**

*Guide créé par TAKUMI Agent pour Jay The Ermite - Shinkofa*
