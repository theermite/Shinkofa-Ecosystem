---
title: Cahier des Charges - Family Hub V1.1 EXHAUSTIF
author: KOSHIN - Coaching Shinkofa
date: 2025-11-14
version: 1.1
status: PRODUCTION
confidentiality: CONFIDENTIEL - FOYER
context: Famille Goncalves - Organisation logistique & bien-être holistique
target_audience: Claude Code - Développement fullstack
encoding: UTF-8
---

# CDC FAMILY HUB V1.1 EXHAUSTIF

## 1. CONTEXTE & OBJECTIFS

### 1.1 Composition familiale
- 3 adultes : Jay (Projecteur Splénique 1/3), Angelique (Générateur 5/1), Gauthier (Générateur 5/1)
- 4 enfants : Théo (7 ans, Générateur-Manifesteur 4/6), Evy (1 an, Générateur-Manifesteur 2/4), Nami (6 mois, Manifesteur 4/1), Lyam (9 ans, Générateur 4/6)
- Invités temporaires : Mike, Sarah, Adriel

### 1.2 Anniversaires principaux
- Jay : 17 nov 1985
- Ange : 10 janv 1991
- Gauthier : 23 févr 1996
- Lyam : 28 juil 2016
- Théo : 25 avril 2018
- Evy : 20 févr 2024
- Nami : 16 mars 2025

### 1.3 Objectifs
- Plateforme collaborative, adaptée à la neurodiversité
- Gestion complète : calendrier, tâches, courses, menus, suivi enfants, profils énergétiques, crises

---

## 2. ARCHITECTURE GLOBALE

### 2.1 Modules fonctionnels
#### Module 1 : Calendrier familial
- Sync bidirectionnel Google Calendar (OAuth2, API v3)
- Ajout/modif événements (anniversaires, école Théo lundi-vendredi 09h-14h)
- Vue semaine/mois, couleurs personnalisées
- Création avec récurrence (école)
- Edition locale et Google
- Multi-comptes (Jay, Ange, Gauthier)

#### Module 2 : Comptes et permissions
- Connexion séparée par adulte
- Permissions individuelles : ajout, modification, suppression selon rôle

#### Module 3 : Tâches ménagères
- Liste collaborative, attribution manuelle
- Ajout, édition, statut, supprimé ou archivé
- Système interne (pas d’intégration externe)

#### Module 4 : Courses et menus
- Liste de courses partagée (ajout/retrait en temps réel, historique)
- Menus semaine : déjeuner, dîner, goûter, assignation "Qui cuisine ?"

#### Module 5 : Suivi repas filles (Evy/Nami)
- Type : Biberon | Repas solide
- Sélection enfant, heure auto
- Si biberon : quantité (ml)
- Si repas : taille assiette (petite, moyenne, grande)

#### Module 6 : Suivi couches
- Heure, enfant (Evy/Nami), type (pipi/caca), note optionnelle

#### Module 7 : Suivi bien-être
- Notes/allergies/santé/humeur/développement
- Historique, export PDF/MD

#### Module 8 : Profils énergétiques et crises
- Dashboard type Design Humain (Projecteur, Générateur, etc.)
- Affichage besoins, cycles énergie
- Protocoles gestion crise détaillés (pattern, étapes, support, récupération)

---

## 3. DATA MODELS

### 3.1 Event
```js
Event {
  id: UUID
  title: string
  startTime: ISO8601
  endTime: ISO8601
  person: FK User
  category: enum ['école', 'anniversaire', 'activité', 'famille', 'autre']
  color: HexColor
  recurring: boolean | RecurrenceRule
  notes: text
  googleId: string
}
```

### 3.2 User
```js
User {
  id: UUID
  name: string
  email: string
  role: enum ['admin', 'contributor', 'viewer']
  children: FK Child[]
}
```

### 3.3 Task
```js
Task {
  id: UUID
  title: string
  assignedTo: FK User | null
  status: enum ['ouverte','assignée','complétée','archivée']
  dueDate: date | null
  notes: text
}
```

### 3.4 ShoppingList / Menu
```js
ShoppingList {
  id: UUID
  week: date
  items: ShoppingItem[]
  createdBy: FK User
}

Menu {
  id: UUID
  date: date
  mealType: enum ['déj','dîner','goûter']
  assignedCook: FK User
  notes: text
}
```

### 3.5 RepasFilles & Couche
```js
RepasFilles {
  id: UUID
  date: date
  time: time
  enfant: enum ['Evy','Nami']
  type: enum ['biberon','repas']
  quantite_ml: integer | null
  taille_assiette: enum ['petite','moyenne','grande'] | null
}

Couche {
  id: UUID
  enfant: enum
  time: time
  type: enum ['pipi','caca']
  notes: text
}
```

### 3.6 Bien-être
```js
BienEtre {
  id: UUID
  date: date
  enfant: enum
  category: enum ['santé','humeur','développement','autre']
  notes: text
}
```

### 3.7 Profil HD & Crise
```js
ProfileHD {
  id: UUID
  name: string
  type: enum ['Projecteur','Générateur','Générateur-Manifesteur','Manifesteur']
  energyCycle: { focus_h: integer, pausePattern: string }
}

CrisisProtocol {
  id: UUID
  enfant: string
  crisisType: enum
  étapes: [text]
  support: [text]
  recover: text
}
```

---

## 4. INTÉGRATIONS
- Google Calendar API (synchro événements, anniversaires)
- Discord (notifications, bot)
- Telegram (notifs prioritaire, interaction bot)
- Obsidian (Export notes, repas, logs en markdown)

---

## 5. SÉCURITÉ ET CONFIDENTIALITÉ
- Authentification OAuth2 Google + mot de passe (fallback)
- Rôles, autorisations strictes
- Cryptage données utilisateurs sensibles
- Export sur demande, suppression/oubli RGPD
- Sauvegarde quotidienne

---

## 6. DESIGN HOLISTIQUE
- Palette Shinkofa adaptée
- Navigation simple, raccourcis clavier
- Accessibilité renforcée (WCAG AA)
- Cycles énergie Jay respectés (projecteur)
- Pas de surcharge info : max 3 actions majeures/écran
- Modes contraste/hypersensibilité

---

## 7. ROADMAP
- Phase 1 : Auth, calendriers, tâches, listes courses, menus
- Phase 2 : Repas filles, suivi couches/bien-être, dashboard HD/crise
- Phase 3 : Exports PDF/MD, optimisation accessibilité, intégrations Telegram/Discord/Obsidian

---

## 8. USER FLOWS
- Premiers pas utilisateur : Auth Google, setup profil HD, invitation membres
- Ajout événement calendrier/anniversaire, synchro Google
- Attribution tâche, validation, archivage
- Ajout menu + assignation cuisiner
- Log repas/journée/couche/note-bien-être
- Protocole crise : étapes automatiques, support, récupération
- Export historiques vers Obsidian

---

## 9. CRITÈRES ACCEPTATION
- Création/modif événement (école, anniversaires) et synchro Google OK
- Listes courses collaboratives instantanées
- Attribution tâches manuelle et statuts corrects
- Menus avec assignation cuisinier visible
- Repas/couche/notes bien-être loggées et exportables
- Dashboard HD fonctionnel, protos crise intégrés
- Intégrations actives (Google, Discord, Telegram, Obsidian)
- Sécurité et confidentialité RGPD

---

**Document exhaustif, modulaire et prêt pour Claude Code - Usage interne Goncalves uniquement**
