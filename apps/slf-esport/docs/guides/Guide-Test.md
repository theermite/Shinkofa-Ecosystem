# 🧪 Guide de Test - Plateforme SLF E-Sport

**Version** : 1.0.0
**Date** : 2025-11-29
**Auteur** : TAKUMI Agent

---

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Démarrage de la Plateforme](#démarrage-de-la-plateforme)
3. [Tests Fonctionnels](#tests-fonctionnels)
   - [Étape 1 : Accès à l'Interface](#étape-1--accès-à-linterface)
   - [Étape 2 : Inscription](#étape-2--inscription-dun-nouveau-compte)
   - [Étape 3 : Connexion](#étape-3--connexion)
   - [Étape 4 : Dashboard](#étape-4--explorer-le-dashboard)
   - [Étape 5 : Exercices](#étape-5--tester-les-exercices)
   - [Étape 6 : Sessions](#étape-6--sessions-dentraînement)
   - [Étape 7 : Questionnaires](#étape-7--questionnaires)
   - [Étape 8 : Journal](#étape-8--journal-personnel)
   - [Étape 9 : Objectifs](#étape-9--objectifs)
   - [Étape 10 : Médiathèque](#étape-10--médiathèque)
   - [Étape 11 : API Documentation](#étape-11--vérifier-la-documentation-api)
4. [Tests Avancés](#tests-avancés)
5. [Checklist Récapitulative](#checklist-récapitulative)
6. [Rapport de Bugs](#rapport-de-bugs)

---

## Prérequis

Avant de commencer les tests, assure-toi que :

- ✅ Docker Desktop est installé et lancé
- ✅ Les containers sont démarrés (`docker-compose up -d`)
- ✅ Le backend répond sur http://localhost:8001/health
- ✅ Le frontend est accessible sur http://localhost:3001

### Vérification rapide

```bash
# Vérifier les containers
docker-compose ps

# Tous doivent être "Up" et "healthy"
# slf-postgres, slf-redis, slf-backend, slf-frontend
```

---

## Démarrage de la Plateforme

### Démarrer tous les services

```bash
cd D:\30-Dev-Projects\SLF-Esport
docker-compose up -d
```

### Arrêter tous les services

```bash
docker-compose down
```

### Voir les logs en temps réel

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f frontend
docker-compose logs -f backend
```

---

## Tests Fonctionnels

### Étape 1 : Accès à l'Interface

**Objectif** : Vérifier que l'interface frontend se charge correctement.

#### Actions

1. Ouvre ton navigateur (Chrome, Firefox, Edge)
2. Va sur **http://localhost:3001**

#### Résultats attendus

- ✅ La page d'accueil s'affiche sans erreur
- ✅ Logo SLF E-Sport visible
- ✅ Boutons "Se connecter" et "S'inscrire" présents
- ✅ Menu de navigation fonctionnel
- ✅ Design responsive (teste en redimensionnant la fenêtre)
- ✅ Pas d'erreur dans la console navigateur (F12 → Console)

#### Erreurs possibles

- ❌ Page blanche → Voir [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- ❌ Erreur 404 → Vérifier que le container frontend est démarré
- ❌ Erreur Tailwind CSS → Vérifier les logs frontend

---

### Étape 2 : Inscription d'un Nouveau Compte

**Objectif** : Créer un compte utilisateur et tester le système d'authentification.

#### Actions

1. Clique sur **"S'inscrire"** (ou "Sign Up")
2. Remplis le formulaire d'inscription :

**Informations de base** :
```
Nom d'utilisateur : testjoueur1
Email : testjoueur1@example.com
Mot de passe : TestPassword123!
Confirmer mot de passe : TestPassword123!
Nom complet : Jean Testeur
Rôle : JOUEUR
```

**Informations joueur supplémentaires** :
```
Pseudo en jeu : TestGamer
Rôle préféré : Support
Niveau de compétence : Intermédiaire
Discord ID : testgamer#1234
Discord Username : TestGamer
```

3. Clique sur **"Créer mon compte"**

#### Résultats attendus

- ✅ Message de confirmation "Compte créé avec succès"
- ✅ Redirection vers la page de connexion OU connexion automatique
- ✅ Email de vérification envoyé (si activé)
- ✅ Validation des champs (mot de passe fort, email valide)
- ✅ Messages d'erreur clairs si formulaire invalide

#### Test de validation

Teste également avec des données invalides :
- ❌ Email invalide : `test@` → Doit afficher une erreur
- ❌ Mot de passe faible : `123` → Doit afficher une erreur
- ❌ Username existant → Doit afficher "Nom d'utilisateur déjà utilisé"

---

### Étape 3 : Connexion

**Objectif** : Tester le système de connexion.

#### Actions

1. Si déconnecté, clique sur **"Se connecter"** (ou "Sign In")
2. Entre tes identifiants :

```
Email ou Username : testjoueur1
Mot de passe : TestPassword123!
```

3. Clique sur **"Se connecter"**

#### Résultats attendus

- ✅ Redirection vers le dashboard
- ✅ Message de bienvenue avec ton nom : "Bienvenue, Jean Testeur !"
- ✅ Menu utilisateur visible (avatar/pseudo en haut à droite)
- ✅ Token JWT stocké dans le localStorage
- ✅ Session persistante (recharge la page → toujours connecté)

#### Test de sécurité

- ❌ Mauvais mot de passe → Erreur "Identifiants invalides"
- ❌ Email inexistant → Erreur "Utilisateur introuvable"
- ✅ Bouton "Se déconnecter" fonctionne correctement

---

### Étape 4 : Explorer le Dashboard

**Objectif** : Vérifier l'affichage du tableau de bord principal.

#### Actions

1. Une fois connecté, observe le **dashboard principal**

#### Résultats attendus

- ✅ Statistiques personnelles affichées :
  - Nombre d'exercices complétés
  - Sessions suivies
  - Objectifs en cours
  - Progression globale
- ✅ Graphiques de progression (même vides au départ)
- ✅ Section "Sessions à venir"
- ✅ Section "Exercices recommandés"
- ✅ Widgets de stats (scores moyens, temps d'entraînement)
- ✅ Navigation latérale fonctionnelle

---

### Étape 5 : Tester les Exercices

**Objectif** : Tester la bibliothèque d'exercices et l'enregistrement de scores.

#### 5A. Liste des exercices

##### Actions

1. Clique sur **"Exercices"** dans le menu latéral
2. Observe la bibliothèque d'exercices

##### Résultats attendus

- ✅ Liste d'exercices affichée avec cartes
- ✅ Filtres par catégorie disponibles :
  - Réflexes
  - Vision
  - Mémoire
  - Attention
  - Coordination
- ✅ Chaque carte affiche :
  - Nom de l'exercice
  - Icône/image
  - Description courte
  - Catégorie (badge coloré)
  - Bouton "Commencer"

#### 5B. Commencer un exercice

##### Actions

1. Clique sur un exercice (ex : **"AimLab - Gridshot"**)
2. Lis les instructions
3. Si exercice externe :
   - Clique sur **"Ouvrir l'exercice"**
   - Nouvelle fenêtre/onglet s'ouvre vers le site externe
   - Complète l'exercice
   - Reviens sur la plateforme

##### Résultats attendus

- ✅ Page de détails de l'exercice affichée
- ✅ Instructions claires
- ✅ Lien externe fonctionnel (s'ouvre dans nouvel onglet)
- ✅ Bouton "Enregistrer mon score" visible

#### 5C. Enregistrer un score

##### Actions

1. Clique sur **"Enregistrer mon score"**
2. Remplis le formulaire :

```
Score : 85000
Unité : points
Screenshot : (optionnel - upload une capture d'écran)
Notes : Bon run, concentration maximale
```

3. Clique sur **"Enregistrer"**

##### Résultats attendus

- ✅ Score enregistré avec succès
- ✅ Message de confirmation
- ✅ Score visible dans l'historique personnel
- ✅ Graphique de progression mis à jour
- ✅ Meilleur score affiché (badge "Best Score")
- ✅ Statistiques recalculées

---

### Étape 6 : Sessions d'Entraînement

**Objectif** : Tester la création et gestion de sessions.

#### 6A. Créer une session

##### Actions

1. Clique sur **"Sessions"** dans le menu
2. Clique sur **"Créer une session"**
3. Remplis le formulaire :

```
Titre : Warm-up Matinal
Type : SOLO
Description : Session d'échauffement cognitif matinale
Date : [Sélectionne demain]
Heure de début : 10:00
Durée : 60 minutes
```

4. Clique sur **"Créer"**

##### Résultats attendus

- ✅ Session créée avec succès
- ✅ Message de confirmation
- ✅ Redirection vers la liste des sessions
- ✅ Nouvelle session visible dans "Sessions à venir"

#### 6B. Voir et gérer les sessions

##### Actions

1. Retourne sur **"Sessions"**
2. Observe la liste des sessions

##### Résultats attendus

- ✅ Sessions affichées avec :
  - Titre
  - Type (SOLO, DUO, TRIO, TEAM, GROUP)
  - Date et heure
  - Durée
  - Statut (badge coloré)
  - Coach assigné (si applicable)
- ✅ Filtres disponibles :
  - Par statut (En attente, Confirmée, Annulée, Terminée)
  - Par type
  - Par date
- ✅ Actions disponibles :
  - Modifier
  - Annuler
  - Rejoindre (si session de groupe)
  - Voir détails

#### 6C. Rejoindre une session (si coach a créé une session de groupe)

##### Actions

1. Si un coach a créé une session GROUP
2. Clique sur **"Rejoindre"**
3. Confirme ta participation

##### Résultats attendus

- ✅ Participant ajouté à la session
- ✅ Notification envoyée au coach
- ✅ Session visible dans "Mes sessions"

---

### Étape 7 : Questionnaires

**Objectif** : Tester le système de questionnaires.

#### Actions

1. Clique sur **"Questionnaires"** dans le menu
2. Sélectionne **"Questionnaire d'évaluation énergétique"**
3. Réponds aux questions :

```
Niveau d'énergie actuel : 7/10
Qualité de sommeil (cette nuit) : Bonne
Niveau de stress : Modéré
Motivation pour l'entraînement : Élevée
Notes additionnelles : Prêt à donner le maximum !
```

4. Clique sur **"Soumettre"**

#### Résultats attendus

- ✅ Réponses enregistrées avec succès
- ✅ Message de confirmation
- ✅ Redirection vers l'historique des réponses
- ✅ Graphiques d'évolution affichés :
  - Évolution de l'énergie dans le temps
  - Qualité de sommeil
  - Niveau de stress
- ✅ Possibilité de comparer avec réponses précédentes

---

### Étape 8 : Journal Personnel

**Objectif** : Tester le système de journal de bord.

#### Actions

1. Clique sur **"Journal"** dans le menu
2. Clique sur **"Nouvelle entrée"**
3. Remplis le formulaire :

```
Titre : Session productive du matin
Mood : GOOD 😊
Contenu : Excellente session aujourd'hui !
          Mes scores sur AimLab Gridshot s'améliorent
          considérablement. Je sens que ma réactivité
          est meilleure après une bonne nuit de sommeil.

Niveau d'énergie : 8/10
Qualité d'entraînement : 9/10
Heures de sommeil : 7.5h
Tags : aimlab, progression, concentration, réflexes
Visibilité : Privé
```

4. Clique sur **"Enregistrer"**

#### Résultats attendus

- ✅ Entrée créée avec succès
- ✅ Entrée visible dans la liste du journal
- ✅ Date et heure automatiquement enregistrées
- ✅ Mood affiché avec emoji approprié
- ✅ Tags cliquables pour filtrer
- ✅ Statistiques de mood tracking mises à jour
- ✅ Calendrier des entrées affiché (vue mois)
- ✅ Possibilité de modifier/supprimer l'entrée

---

### Étape 9 : Objectifs

**Objectif** : Tester le système de définition et suivi d'objectifs.

#### Actions

1. Clique sur **"Objectifs"** dans le menu
2. Clique sur **"Créer un objectif"**
3. Remplis le formulaire :

```
Titre : Atteindre 100k points sur Gridshot
Catégorie : Réflexes
Description : Améliorer mes réflexes avec AimLab Gridshot
              pour atteindre 100 000 points en un run.

Date cible : [Dans 1 mois]

Milestones :
  1. 70 000 points (court terme - 1 semaine)
  2. 85 000 points (moyen terme - 2 semaines)
  3. 100 000 points (objectif final - 1 mois)

Visibilité : Public (pour motivation communautaire)
```

4. Clique sur **"Créer"**

#### Résultats attendus

- ✅ Objectif créé avec succès
- ✅ Objectif visible dans la liste
- ✅ Barre de progression affichée (calculée avec les scores actuels)
- ✅ Milestones visibles avec statut :
  - ✅ Atteint (vert)
  - ⏳ En cours (orange)
  - ❌ Pas encore atteint (gris)
- ✅ Graphique de progression vers l'objectif
- ✅ Date cible affichée avec compte à rebours
- ✅ Notifications/rappels (si activés)

---

### Étape 10 : Médiathèque

**Objectif** : Tester le système de gestion de médias.

#### 10A. Upload d'un média

##### Actions

1. Clique sur **"Médiathèque"** dans le menu
2. Clique sur **"Uploader un fichier"**
3. Remplis le formulaire :

```
Type : Vidéo
Catégorie : Replay
Titre : Ma meilleure partie - Clutch 1v5
Description : Clutch incroyable en finale de tournoi.
              Analyse de ma prise de décision sous pression.

Fichier : [Sélectionne un fichier vidéo .mp4]
Thumbnail : [Optionnel - miniature personnalisée]
Tags : gameplay, clutch, highlights, tournoi
Visibilité : Public
```

4. Clique sur **"Uploader"**

##### Résultats attendus

- ✅ Upload en cours avec barre de progression
- ✅ Média uploadé avec succès
- ✅ Thumbnail généré automatiquement (si non fourni)
- ✅ Média visible dans la médiathèque
- ✅ Lecteur vidéo fonctionnel
- ✅ Compteur de vues initialisé à 0

#### 10B. Créer une playlist

##### Actions

1. Clique sur **"Playlists"** (dans Médiathèque)
2. Clique sur **"Nouvelle playlist"**
3. Remplis le formulaire :

```
Titre : Mes meilleurs moments 2025
Description : Compilation de mes meilleurs clutchs
              et performances en tournoi
Visibilité : Public
```

4. **Ajoute des médias** à la playlist :
   - Recherche ou sélectionne des vidéos
   - Réordonne avec drag & drop

5. Clique sur **"Créer"**

##### Résultats attendus

- ✅ Playlist créée avec succès
- ✅ Playlist visible dans la liste
- ✅ Médias dans l'ordre défini
- ✅ Lecteur playlist fonctionnel (lecture automatique suivante)
- ✅ Possibilité de partager la playlist (lien)
- ✅ Compteur de vues de la playlist

---

### Étape 11 : Vérifier la Documentation API

**Objectif** : Tester l'accès à la documentation API Swagger.

#### Actions

1. Ouvre un **nouvel onglet**
2. Va sur **http://localhost:8001/docs**

#### Résultats attendus

- ✅ Documentation Swagger UI s'affiche
- ✅ Tous les endpoints documentés :
  - `/api/auth/*` (Authentication)
  - `/api/users/*` (Users)
  - `/api/exercises/*` (Exercises)
  - `/api/sessions/*` (Sessions)
  - `/api/questionnaires/*` (Questionnaires)
  - `/api/journal/*` (Journal)
  - `/api/goals/*` (Goals)
  - `/api/media/*` (Media)
- ✅ Schémas de données (models) documentés
- ✅ Possibilité de tester les requêtes directement :
  - Clique sur un endpoint
  - Clique "Try it out"
  - Remplis les paramètres
  - Clique "Execute"
  - Voir la réponse
- ✅ Authentification JWT testable (cadenas)

---

## Tests Avancés

### Test Multi-Rôles

#### Test 12 : Créer un compte Coach

1. **Déconnecte-toi** (menu utilisateur → Déconnexion)
2. **Crée un nouveau compte** avec le rôle **COACH**

```
Username : testcoach1
Email : testcoach1@example.com
Password : CoachPassword123!
Nom complet : Marie Coach
Rôle : COACH
Spécialités : Coaching mental, stratégie
Bio : Coach certifiée en performance e-sport
```

3. **Explore les fonctionnalités coach** :
   - ✅ Créer des sessions de groupe (TEAM, GROUP)
   - ✅ Assigner des exercices aux joueurs
   - ✅ Voir les statistiques de tous les joueurs assignés
   - ✅ Créer des questionnaires personnalisés
   - ✅ Dashboard coach avec vue globale des joueurs

#### Test 13 : Créer un compte Manager

1. **Crée un compte** avec le rôle **MANAGER**

```
Username : testmanager1
Email : testmanager1@example.com
Password : ManagerPassword123!
Nom complet : Thomas Manager
Rôle : MANAGER
```

2. **Explore les fonctionnalités manager** :
   - ✅ Gestion d'équipe complète
   - ✅ Planning des sessions
   - ✅ Statistiques équipe
   - ✅ Rapports de performance
   - ✅ Gestion des inscriptions tournois

---

### Test Multi-Utilisateurs

#### Test 14 : Interactions entre utilisateurs

1. **Ouvre un navigateur en mode incognito**
2. **Connecte-toi avec le 2e compte joueur**
3. **Teste les interactions** :
   - Rejoindre une session créée par le coach
   - Voir les objectifs publics d'autres joueurs
   - Consulter la médiathèque publique
   - Commenter les médias publics

---

### Tests de Performance

#### Test 15 : Test de charge

1. **Crée plusieurs entrées rapidement** :
   - 10 scores d'exercices
   - 5 entrées de journal
   - 3 objectifs
   - 5 uploads de médias

2. **Vérifie** :
   - ✅ Pas de ralentissement
   - ✅ Graphiques se mettent à jour correctement
   - ✅ Pagination fonctionne
   - ✅ Recherche reste rapide

---

## Checklist Récapitulative

Coche les fonctionnalités testées :

### Authentification
- [ ] Inscription joueur
- [ ] Inscription coach
- [ ] Inscription manager
- [ ] Connexion
- [ ] Déconnexion
- [ ] Mot de passe oublié (si implémenté)
- [ ] Vérification email (si implémenté)

### Dashboard
- [ ] Affichage statistiques
- [ ] Graphiques de progression
- [ ] Sessions à venir
- [ ] Exercices recommandés

### Exercices
- [ ] Liste des exercices
- [ ] Filtres par catégorie
- [ ] Détails d'un exercice
- [ ] Ouverture lien externe
- [ ] Enregistrement de score
- [ ] Historique des scores
- [ ] Graphiques de progression
- [ ] Meilleur score affiché

### Sessions
- [ ] Création session SOLO
- [ ] Création session GROUP (coach)
- [ ] Rejoindre une session
- [ ] Annuler une session
- [ ] Voir liste des participants
- [ ] Filtres par statut/type

### Questionnaires
- [ ] Liste des questionnaires
- [ ] Remplir un questionnaire
- [ ] Voir historique des réponses
- [ ] Graphiques d'évolution
- [ ] Création questionnaire custom (coach)

### Journal
- [ ] Créer une entrée
- [ ] Modifier une entrée
- [ ] Supprimer une entrée
- [ ] Filtrer par tags
- [ ] Mood tracking
- [ ] Calendrier des entrées
- [ ] Statistiques bien-être

### Objectifs
- [ ] Créer un objectif
- [ ] Définir milestones
- [ ] Voir progression
- [ ] Marquer milestone comme atteint
- [ ] Objectifs publics/privés
- [ ] Compléter un objectif

### Médiathèque
- [ ] Upload vidéo
- [ ] Upload audio
- [ ] Upload image
- [ ] Upload document
- [ ] Créer playlist
- [ ] Ajouter médias à playlist
- [ ] Lecteur vidéo/audio
- [ ] Partage de média
- [ ] Compteur de vues

### API
- [ ] Documentation Swagger accessible
- [ ] Tous endpoints documentés
- [ ] Test d'appels API
- [ ] Authentification JWT

---

## Rapport de Bugs

Si tu rencontres des bugs, note les informations suivantes :

### Template de rapport de bug

```markdown
**Bug #X : [Titre court du bug]**

**Sévérité** : Critique / Haute / Moyenne / Basse

**Étape de test** : [Étape X - Nom de l'étape]

**Étapes pour reproduire** :
1. Aller sur [page]
2. Cliquer sur [bouton]
3. Remplir [formulaire]
4. Observer le résultat

**Résultat attendu** :
[Ce qui devrait se passer]

**Résultat réel** :
[Ce qui se passe effectivement]

**Message d'erreur** (si applicable) :
```
[Copier le message d'erreur exact]
```

**Console navigateur** (F12 → Console) :
```
[Copier les erreurs de la console]
```

**Logs backend** (si applicable) :
```bash
docker-compose logs backend | tail -50
```

**Captures d'écran** :
[Joindre si possible]

**Environnement** :
- Navigateur : [Chrome 120 / Firefox 115 / etc.]
- OS : [Windows 11 / macOS / Linux]
- Date/Heure : [2025-11-29 14:30]
```

---

## Notes Finales

- **Fréquence des tests** : Teste chaque nouvelle fonctionnalité immédiatement après développement
- **Tests de régression** : Re-teste les fonctionnalités existantes après chaque mise à jour
- **Performance** : Note les ralentissements éventuels
- **UX/UI** : Note les problèmes d'ergonomie ou de design

**Pour toute question**, consulte [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) ou contacte TAKUMI.

---

**Bon test ! 🚀**
