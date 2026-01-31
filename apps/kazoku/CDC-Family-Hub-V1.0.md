---
title: Cahier des Charges - Family Hub V1.0
author: KOSHIN - Coaching Shinkofa
date: 2025-11-13
version: 1.0
status: PRODUCTION
confidentiality: CONFIDENTIEL - FOYER
context: Famille Goncalves - Organisation logistique & bien-être holistique
target_audience: Claude Code - Développement fullstack
encoding: UTF-8 sans BOM
---

# CDC FAMILY HUB V1.0

## 1. CONTEXTE & OBJECTIFS

### 1.1 Situation famille

**Composition foyer Corumbela, Andalousie (Torre del Mar)**
- 3 adultes : Jay (Projecteur Splénique 1/3), Angelique/Ange (Générateur 5/1), Gauthier (Générateur 5/1)
- 4 enfants : Théo (7 ans, Générateur-Manifesteur 4/6), Evy (1 an, Générateur-Manifesteur 2/4), Nami (6 mois, Manifesteur 4/1), Lyam (9 ans, Générateur 4/6 - Belgique moitié vacances)
- 3 invités temporaires : Mike, Sarah, Adriel (2 ans)

**Contraintes principales**
- Cycles énergétiques Jay (3-5h focus/jour max) = fondamental
- Attente invitations Jay avant action (Projecteur)
- Evy/Nami très attachées Jay = présence qualitative prioritaire
- Théo école 09h00-14h00 immuable
- Lyam coordination externe avec Belgique (moitié vacances belges)
- Voiture propre en panne → utilisation véhicule Mike/Sarah
- Courses hebdomadaires Torre del Mar / Vélez-Málaga

### 1.2 Objectifs principal

Créer **plateforme collaborative centralisée** permettant :
1. **Synchronisation calendrier** avec Google Calendar (bidirectionnel)
2. **Gestion tâches ménagères** attribution manuelle 3 adultes
3. **Planification repas & courses** collaborative
4. **Suivi bébés** (biberons, couches) avec logs rapides
5. **Gestion profils énergétiques** famille (Design Humain)
6. **Gestion crise enfants** par profil énergétique & besoins
7. **Respect cycles énergétiques Jay** = priorité design

---

## 2. ARCHITECTURE FONCTIONNELLE

### 2.1 Modules principaux

#### MODULE 1 : CALENDRIER FAMILIAL PARTAGÉ
**Fonction** : Vue centralisée événements famille & travail
- Sync bidirectionnel Google Calendar (API Google Calendar v3)
- Ajout événements directs dans app + auto-sync Google
- Couleurs personnalisées par personne
- Vue semaine (défaut) / mois / jour
- Affichage catégories événements (école, travail, activités, famille)
- Événements récurrents (école Théo chaque semaine 09h-14h)

**Data model**
```
Event {
  id: UUID
  title: string
  startTime: ISO8601
  endTime: ISO8601
  person: Person (FK)
  category: enum ['école', 'travail', 'activité', 'famille', 'autre']
  googleCalendarId: string (sync ref)
  color: HexColor
  recurring: boolean | RecurrenceRule
  notes: text
  syncStatus: enum ['synced', 'pending', 'error']
  createdAt: timestamp
  updatedAt: timestamp
}
```

**API intégration Google Calendar**
- OAuth 2.0 authentification
- Sync bidirectionnel automatic (webhook Google Calendar)
- Gestion conflits (local vs Google priorité : LOCAL en création, GOOGLE en modif externe)
- Fallback offline (cache local events)

**Accessibilité**
- Légende couleurs claire texte + symboles
- Keyboard navigation (Tab, Enter, Arrow keys)
- Screen reader friendly (aria-labels)
- Mode contraste élevé pour hypersensibilité

---

#### MODULE 2 : TÂCHES MÉNAGÈRES

**Fonction** : Attribution manuelle tâches 3 adultes (Jay, Ange, Gauthier)
- Liste tâches récurrentes + ponctuelles
- Assignation manuelle checkbox per person
- État task : assignée, en cours, complétée
- Pas automation rotation = flexibilité selon énergie jour

**Data model**
```
Task {
  id: UUID
  title: string
  description: text
  category: enum ['cuisine', 'ménage', 'linge', 'courses', 'enfants', 'autre']
  assignedTo: Person (FK) | null
  frequency: enum ['ponctuelle', 'quotidienne', 'hebdo', 'mensuelle']
  dueDate: date | null
  completedAt: timestamp | null
  status: enum ['ouverte', 'assignée', 'en_cours', 'complétée', 'reportée']
  priority: enum ['basse', 'moyenne', 'haute']
  notes: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

**Tâches pré-chargées**
- Quotidiennes : vaisselle, balayage cuisine, préparation repas
- Hebdo : lessive, nettoyage salles bain, courses
- Mensuelles : nettoyage profond, rangements

**Permissions**
- Assignation : self-assignment ou Ange/Jay assignment
- Modification : assigné peut changer statut, creator peut modifier détails
- Pas suppression, archivage seulement

---

#### MODULE 3 : SUIVI COURSES & MENUS

**Fonction** : Planification collaborative repas semaine + liste courses

**3a - Planning menus**
```
WeeklyMenu {
  id: UUID
  weekStart: date
  meals: {
    lundi: { petit_déj, déj, goûter, dîner }
    mardi: { ... }
    ...
  }
  notes: text
  createdBy: Person
  lastUpdated: timestamp
}

Meal {
  id: UUID
  name: string
  ingredients: Ingredient[]
  prepTime: integer (minutes)
  difficulty: enum ['facile', 'moyen', 'complexe']
  specialtyFor: enum ['Evy', 'Nami', 'Théo', 'tous', 'adultes'] // allergies
  notes: text
}
```

**3b - Liste courses**
```
ShoppingList {
  id: UUID
  weekStart: date
  status: enum ['planification', 'finale', 'courses_faites']
  items: ShoppingItem[]
  location: enum ['Torre del Mar', 'Vélez-Málaga', 'autre']
  totalEstimate: decimal | null
  createdBy: Person
  completedBy: Person | null
  completedAt: timestamp | null
}

ShoppingItem {
  id: UUID
  name: string
  quantity: string
  unit: enum ['pièce', 'kg', 'litre', 'paquet', 'autre']
  category: enum ['fruits', 'légumes', 'protéines', 'produits laitiers', 'basiques', 'autre']
  addedBy: Person
  checked: boolean
  priority: enum ['optionnel', 'souhaité', 'essentiel']
}
```

**Workflow**
- Lundi : Ange/Jay planifient menus semaine
- Mardi : Liste courses auto-générée depuis ingrédients menus
- Mercredi : Validation courses disponibilité/budget
- Jeudi : Courses Torre del Mar (Mike/Sarah ou rotation)

---

#### MODULE 4 : SUIVI BÉBÉS (EVY 1 AN / NAMI 6 MOIS)

**Fonction** : Logs rapides biberons, couches, notes bien-être

**4a - Suivi biberons**
```
BottleLog {
  id: UUID
  date: date
  time: time
  baby: enum ['Evy', 'Nami']
  quantity: integer (ml) 
  type: enum ['lait maternel', 'formule', 'eau', 'autre']
  duration: integer (minutes) | null
  notes: text
  loggedBy: Person
  createdAt: timestamp
}
```

**4b - Suivi couches**
```
DiapperLog {
  id: UUID
  date: date
  time: time
  baby: enum ['Evy', 'Nami']
  changedBy: Person // QUI A CHANGÉ la couche
  type: enum ['pipi', 'popo', 'mixte']
  notes: text // couleur, texture, obs. santé
  createdAt: timestamp
}
```

**4c - Notes bien-être bébés**
```
BabyNote {
  id: UUID
  date: date
  baby: enum ['Evy', 'Nami']
  category: enum ['santé', 'sommeil', 'comportement', 'développement', 'autre']
  observation: text
  addedBy: Person
  createdAt: timestamp
}
```

**Interface**
- Vue jour + historique semaine
- Pré-remplissage heure automatique (now)
- Boutons rapides "Biberon Evy", "Couche Nami changée par [person]"
- Graphiques simples : fréquence biberons/jour, patterns couches
- Export jour/semaine PDF pour pédiatre

---

#### MODULE 5 : PLANNING ENFANTS

**Fonction** : Vue centralisée horaires enfants, activités, coordination

**5a - Théo (7 ans)**
```
TheoPlan {
  école: {
    jours: ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi']
    heures: '09:00-14:00'
    depositTime: '08:30'
    pickupTime: '14:00'
    coordinators: [Jay, Ange, Gauthier] // qui peut faire dépôt/récup
  }
  activities: Activity[] // activités extra
  coordination: {
    parentBiological: { name, contact, schedule } // 1 weekend/mois Paris
  }
}
```

**5b - Lyam (9 ans, Belgique)**
```
LyamSchedule {
  residenceMain: 'Belgique' (mère)
  visitesEspagne: [
    { start: date, end: date, coordBy: Jay } // moitié vacances scolaires
  ]
  planning: {
    datesPrecisesArrivee: date (anticipation 2-3 sem avant)
    activities: Activity[]
    integration: 'fratrie recomposée' // Théo, Evy, Nami
  }
}
```

**Data model générique**
```
Activity {
  id: UUID
  name: string
  child: enum ['Théo', 'Lyam', 'Evy', 'Nami']
  startDate: date
  endDate: date
  dayOfWeek: enum | null // récurrent
  startTime: time
  endTime: time
  location: string
  instructor: string | null
  cost: decimal | null
  notes: text
  status: enum ['planifiée', 'confirmée', 'annulée']
}
```

---

#### MODULE 6 : PROFILS ÉNERGÉTIQUES FAMILLE

**Fonction** : Dashboard Design Humain, affichage besoins énergétiques chacun

**6a - Profil adulte**
```
AdultProfile {
  id: UUID
  name: string // Jay, Ange, Gauthier
  designHuman: {
    type: enum ['Projecteur', 'Générateur', 'Générateur-Manifesteur', 'Manifesteur']
    authorité: enum ['Splénique', 'Sacrale']
    ligneProfil: string // ex: '1/3', '5/1'
  }
  energyCycle: {
    focusHoursPerDay: integer // Jay max 3-5h
    breakPatterns: string // ex: 'pause 15min every 90min'
    recoveryNeeds: string // ex: 'repos régulier', 'invitations avant action'
  }
  specialNeeds: text // ex: Jay = respect cycles énergétiques, attendre invitations
  notes: text
}
```

**6b - Profil enfant** (Design Humain simplifié)
```
ChildProfile {
  id: UUID
  name: string
  age: integer
  designHuman: {
    type: enum ['Projecteur', 'Générateur', 'Générateur-Manifesteur', 'Manifesteur']
    ligneProfil: string
  }
  energyPattern: text // ex: 'Manifesteur rapide = décisions instinctives'
  needs: text[] // besoins spécifiques énergétiques
  triggers: text[] // déclencheurs crises potentielles
  supportStrategies: text[] // stratégies support en situation
}
```

**Dashboard**
- Affichage 3 adultes : type HD, besoins énergétiques clés, patterns jour
- Affichage 4 enfants : type HD, besoins, zones sensibilité
- Codage couleur par type (Projecteur=bleu, Générateur=vert, Manifesteur=rouge)
- Aide à la compréhension interactions famille

---

#### MODULE 7 : GESTION CRISE ENFANTS

**Fonction** : Protocoles support gestion crises enfants selon type HD & besoins

**7a - Modèles crise par enfant**
```
CrisisProtocol {
  id: UUID
  childName: string
  designHumanType: string // Générateur-Manifesteur, Manifesteur, etc.
  crisisType: enum ['frustration', 'surcharge', 'transition', 'rejet', 'autre']
  triggerRecognition: text[] // signes avant-coureurs
  immediateResponse: text // actions premières 1-2 min
  escalationSteps: {
    step1: text // 2-5 min
    step2: text // 5-10 min
    step3: text // 10+ min escalade
  }
  supportNeeds: text[] // ex: espace, contact, distraction, validation
  toolsAvailable: text[] // ex: fidget toys, musique, nature
  whatToAvoid: text[] // NON à faire (amplifier crise)
  recovery: text // après-crise : réconfort, explication
  notes: text
}
```

**Modèles pré-chargés par profil**
- Théo (Générateur-Manifesteur 4/6) : crise frustration décision rapide, besoin validation
- Evy (Générateur-Manifesteur 2/4) : crise transition, besoin stabilité Jay
- Nami (Manifesteur 4/1) : crise initiation rapide, besoin clarté/limites
- Lyam (Générateur 4/6) : crise loyauté/rejet, besoin connexion fratrie

**Checklist utilisation**
- Avant crise : identifier type enfant + trigger
- Pendant crise : appliquer immediate response + escalation steps
- Après crise : support récupération, débrief famille

---

#### MODULE 8 : COORDINATION LYAM (BELGIQUE)

**Fonction** : Anticipation arrivées Belgique, coordination externe mère

**Data model**
```
LyamCoordination {
  id: UUID
  academicYear: string // 2025-2026
  breaks: {
    noel: { belgique_start, belgique_end, espagne_start, espagne_end }
    paques: { ... }
    ete: { ... }
    toussaint: { ... }
  }
  planning: {
    dateConfirmation: date (2-3 sem avant)
    transportPlanner: Person // qui organise transport
    roomPrep: 'checklist pièce Lyam'
    activitiesPreplanned: Activity[]
  }
  externalCoord: {
    motherBelgium: { name, phone, email }
    updateFrequency: 'communication régulière'
  }
}
```

---

## 3. SPÉCIFICATIONS TECHNIQUES

### 3.1 Stack recommandé

**Frontend**
- React 18+ (TypeScript)
- UI: Shadcn/ui + Tailwind CSS (accessibilité WCAG AA minimum)
- État: Zustand ou TanStack Query
- Calendrier: TanStack React Calendar ou react-big-calendar
- Sync offline: service workers + IndexedDB cache

**Backend**
- Node.js (Express) | Fastify | Nest.js
- Base données: PostgreSQL (robustesse) | MongoDB (flexibilité)
- API: REST + WebSocket (sync temps réel)
- Auth: JWT + OAuth2 (Google Calendar)
- Queue: Bull (background jobs sync)

**Infrastructure**
- Hosting: Vercel | Netlify (frontend) + Railway | Render (backend)
- BBDD: Supabase | Railway PostgreSQL
- Storage: Cloudinary (images, PDFs exports)
- Monitoring: Sentry | LogRocket

---

### 3.2 Données critiques

**Sécurité**
- Authentification JWT refresh tokens
- Authorization rôles : Admin (Jay), Contributor (Ange, Gauthier), Viewer (optionnel)
- Chiffrement données sensibles (santé enfants)
- CONFIDENTIEL = jamais partage externe

**Backup & Récupération**
- Backup BBDD quotidien
- Export données utilisateur PDF/JSON sur demande
- Récupération version 30 jours

---

### 3.3 Intégrations externes

**Google Calendar API v3**
- Endpoint: `https://www.googleapis.com/calendar/v3/calendars`
- Permissions: `calendar.events`, `calendar.settings`
- Sync webhook: events.created, events.updated, events.deleted
- Rate limit: 10 QPS (queries per second) par utilisateur

**Optionnel futur**
- Google Tasks API (tâches)
- Stripe (billings)
- Slack/Discord (notifications)

---

## 4. USER FLOWS

### 4.1 Authentification & Setup initial

```
Utilisateur première visite
├─ Authentification Google OAuth
├─ Profil setup (nom, type Design Humain)
├─ Invitation cohabitants (Ange, Gauthier via email)
├─ Connexion Google Calendar permission
├─ Import événements existants Google Calendar
└─ Dashboard home
```

### 4.2 Cycle semain typique

```
LUNDI
├─ Ange/Jay planif menus semaine (MODULE 3a)
├─ Generación liste courses (MODULE 3b)
└─ Visualisation planning enfants (MODULE 5)

MARDI
├─ Validation/finalisation liste courses
└─ Affichage tâches semaine (MODULE 2)

MERCREDI-VENDREDI
├─ Logs biberons/couches Evy/Nami (MODULE 4)
├─ Updates tâches ménagères (complétées)
└─ Si crise enfant → protocole (MODULE 7)

HEBDO
├─ Reveue planning semaine suivante
├─ Coordination Lyam si pertinent (MODULE 8)
└─ Sync auto Google Calendar
```

### 4.3 Cas d'usage : Log biberon Evy

```
Jay 08h30 - Routine matinale
└─ Tap "Biberon Evy" (shortcut)
   ├─ Pré-remplissage temps = now (08:30)
   ├─ Quantité = 120ml (défaut)
   ├─ Type = formule (défaut)
   ├─ Durée = blank (optionnel)
   ├─ Tap "Sauvegarder" → BottleLog créé
   └─ Confirmation "Biberon Evy 120ml 08:30 ✓"
```

### 4.4 Cas d'usage : Assignation tâche

```
Ange sees "lessive" task
├─ Tap task "Lessive"
├─ Current status = "ouverte"
├─ Assign to : [Jay] [Ange] [Gauthier]
├─ Select "Ange" → status → "assignée"
└─ Notification Ange "Tâche Lessive te assignée"
```

### 4.5 Cas d'usage : Sync Google Calendar

```
Jay 17h crée event "Reunion The Ermite"
└─ Event créé dans Family Hub
   ├─ title: "Réunion The Ermite"
   ├─ start: 18:00, end: 19:00
   ├─ assigned: Jay
   └─ Sync → Google Calendar Jay
      ├─ API call: POST /calendars/primary/events
      ├─ Google retourne googleCalendarId
      ├─ Store in Family Hub DB
      └─ Status: SYNCED ✓

Gauthier modifie same event dans Google Calendar (18:30-19:30)
└─ Google webhook notify Family Hub
   ├─ Update detected: startTime changed
   ├─ Family Hub updates local DB
   ├─ Notification: "Réunion déplacée 18:30-19:30"
   └─ Status: SYNCED ✓
```

---

## 5. CONSIDÉRATIONS DESIGN HOLISTIQUE

### 5.1 Accessibilité & neurodiversité

**Pour Jay (Projecteur TDAH)**
- Invitations explicites avant actions attendues
- Blocage focus: mode "concentration" désactive notifications non-essentielles
- Cycles énergétiques visuels : gauge "énergie jour" 0-5h
- Pas de surcharge info : max 3 actions principales par vue
- Raccourcis clavier : J (accueil), C (calendrier), T (tâches), B (bébés)

**Pour Ange (Générateur)**
- Feedback instantané satisfaction travail réalisé
- Gamification légère : badges tâches complétées
- Vue données projets revenus disponible (engagement via invitation réponse)

**Pour Gauthier (Générateur)**
- Support operationnel : listes claires sans interprétation
- Notifications flexibles : suggestions vs obligations

**Pour enfants neurodiversifiés**
- Couleurs stables (pas d'effets de surcharge visuelle)
- Transitions douces (animation 200-300ms max)
- Mode hypersensibilité : espace blanc amplifié, typographie relaxée

### 5.2 Palette couleurs Shinkofa

| Couleur | Hex | Usage |
|---------|-----|-------|
| Bleu Profond | #192040 | Titres, éléments structurants |
| Bleu Royal | #0c2284 | Accents actions, focus |
| Bleu Clair | #0bb1f9 | Highlights info |
| Crème Blanc | #eaeaeb | Fonds sections, repos |
| Vert Émeraude | #008080 | Boutons action, validation |
| Jaune Moutarde | #d4a044 | Repères chaleureux, alerte douce |
| Rouge Bordeaux | #800020 | Alertes critiques, OFF mode |

---

## 6. ROADMAP DÉVELOPPEMENT

### Phase 1 : MVP (Semaines 1-3)
- ✅ Authentification Google OAuth
- ✅ Calendrier base + sync Google Calendar
- ✅ Tâches ménagères (CRUD simple)
- ✅ Suivi bébés logs (biberons + couches)

### Phase 2 : Core (Semaines 4-6)
- ✅ Planning menus + liste courses
- ✅ Planning enfants (affichage)
- ✅ Profils énergétiques dashboard
- ✅ Gestion crise proto basique

### Phase 3 : Polish & Optimisation (Semaines 7-8)
- ✅ Accessibilité WCAG AA audit
- ✅ Performance optimisation
- ✅ Offline mode testing
- ✅ Export PDF (courses, planning, logs bébés)

### Phase 4+ : Futur
- Notifications intelligentes (selon énergie Jay)
- Intégration Google Tasks
- Partage social familial (photos enfants)
- Budget tracker courses
- Recettes API intégration

---

## 7. CRITÈRES ACCEPTATION

✅ **Calendrier**
- Événements sync Google Calendar bidirectionnel
- Ajout/edit/delete events propre
- Couleurs personnalisées affichage correct
- Keyboard navigation accessible

✅ **Tâches**
- CRUD complet tâches
- Assignation manuelle 3 adultes
- Filtrage par assigné/statut
- Pas erreurs assignation données

✅ **Suivi bébés**
- Logs biberon + couches temps réel
- Historique semaine affichage
- Export jour PDF pour pédiatre
- Aucune perte données sync

✅ **Sécurité**
- Auth JWT tokens refresh correct
- Données sensibles chiffrées
- Rate limiting API en place
- RGPD compliance (droit oubli)

✅ **Performance**
- Home load < 2 secondes
- Offline mode fonction 24h
- Sync background jobs sans lag UI

---

## 8. NOTES DÉVELOPPEUR

**Priorité absolue**
- Respect cycles énergétiques Jay = design fondamental
- Zéro pression obligatoire actions (invitations explicites)
- Perte données = CRITIQUE (backup rigoureux)
- Confidentialité foyer ABSOLUE

**Patterns recommandés**
- Offline-first architecture (cache-first strategy)
- Optimistic updates (UI réactive)
- Error boundaries robustes
- Logs détaillés (debugging futur)

**Testing**
- Unit tests CRUD core
- Integration tests Google Calendar sync
- E2E tests user flows critiques (logs bébés)
- Accessibility testing WCAG AA

---

## 9. CONTACTS & ESCALADE

**Point de contact principal**
- Jay (Projecteur) : Invitations & design décisions
- Ange : Coordination fonctionnalités enfants/courses

**Confidentialité absolue**
- Aucun sharing données foyer
- Accès développeur = production only
- Suppression données post-livraison

---

## 10. VERSIONING & CHANGELOG

**V1.0 - 2025-11-13**
- Document initial complet
- Modules 1-8 spécifiés
- Stack technique décidé
- Roadmap établi

---

**Document confidentiel - Usage interne foyer Goncalves uniquement**