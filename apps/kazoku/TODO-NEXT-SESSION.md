# TODO PROCHAINE SESSION - Family Hub

**Date** : 2025-12-31
**Prochaine session** : Après correction bugs BUGS.md

---

## 🎯 PRIORITÉS IMMÉDIATES (Session 2)

### 1. 🔧 **CORRIGER LES 3 BUGS CRITIQUES** (30-40 min)

Voir fichier `BUGS.md` pour détails :
- [ ] Fixer encodage UTF-8 (charset MySQL)
- [ ] Débugger pourquoi CREATE semble ne rien faire (validation backend)
- [ ] Corriger routes Crisis & Meals (confusion getById vs getAll)

**Validation** : Créer un événement, une tâche et une liste → doit fonctionner

---

### 2. 🎨 **FLOATING BUTTON GLOBAL** (20-30 min)

**Objectif** : Bouton "+" flottant visible partout avec menu contextuel

**Spécifications Jay** :
- Visible sur toutes les pages
- Menu contextuel avec actions principales :
  - 📅 Nouvel événement
  - ✅ Nouvelle tâche
  - 🛒 Nouvelle liste de courses
  - 👶 Actions bébés (sous-menu : Evy / Nami → Repas / Couche / Bien-être)

**Implémentation** :

```typescript
// frontend/src/components/layout/MainLayout.tsx
import FloatingButton from '../ui/FloatingButton';
import { Calendar, CheckSquare, ShoppingCart, Baby } from 'lucide-react';

// Dans le return, après <Outlet />
<FloatingButton
  actions={[
    {
      icon: <Calendar className="w-5 h-5" />,
      label: 'Nouvel événement',
      onClick: () => navigate('/calendar?create=true'),
      color: 'text-blue-600',
    },
    {
      icon: <CheckSquare className="w-5 h-5" />,
      label: 'Nouvelle tâche',
      onClick: () => navigate('/tasks?create=true'),
      color: 'text-green-600',
    },
    {
      icon: <ShoppingCart className="w-5 h-5" />,
      label: 'Liste de courses',
      onClick: () => navigate('/shopping?create=true'),
      color: 'text-purple-600',
    },
    {
      icon: <Baby className="w-5 h-5" />,
      label: 'Bébés (Evy/Nami)',
      onClick: () => navigate('/baby?create=true'),
      color: 'text-pink-600',
    },
  ]}
/>
```

**Note** : Pour sous-menu Bébés, créer composant `FloatingButtonNested` ou utiliser query params :
```
/baby?create=repas&enfant=Evy
/baby?create=couche&enfant=Nami
```

---

### 3. 👶 **COMPLÉTER BABY TRACKING PAGE** (30 min)

**État actuel** : Lecture seule (affichage logs)

**À ajouter** :
- [ ] Modal "Logger repas" (FormField type, enfant, quantité, etc.)
- [ ] Modal "Logger couche" (FormField enfant, type, notes)
- [ ] Modal "Logger bien-être" (FormField enfant, catégorie, observation)
- [ ] Mutations POST pour `/api/v1/baby/repas`, `/couches`, `/bien-etre`

**Pattern** : Copier CalendarPage (Modal + FormField + useMutation)

---

### 4. 🍽️ **COMPLÉTER MEALS PAGE** (30 min)

**État actuel** : Lecture seule (affichage planning)

**À ajouter** :
- [ ] Bouton "Ajouter repas" par jour + type (déjeuner/dîner/goûter)
- [ ] Modal création avec FormField (date, type, nom plat, cuisinier, ingrédients, notes)
- [ ] Mutations POST/PUT/DELETE pour `/api/v1/meals`
- [ ] Affichage grid hebdomadaire amélioré

---

### 5. ✅ **TÂCHES RÉCURRENTES** (Feature suggestion Jay) (20 min)

**Spécification** :
- Ajouter checkbox "Tâche récurrente ?" dans TasksPage modal
- Si coché, afficher select "Fréquence" :
  - Quotidienne
  - Hebdomadaire (avec sélection jour)
  - Mensuelle
  - Personnalisée (iCal RRULE)

**Backend** : Déjà supporté (`recurrence_rule` field existe)

**Frontend** : Ajouter dans formulaire TasksPage
```typescript
<FormField
  label="Récurrence"
  name="recurrence_rule"
  type="select"
  options={[
    { value: '', label: 'Aucune (ponctuelle)' },
    { value: 'FREQ=DAILY', label: '📆 Quotidienne' },
    { value: 'FREQ=WEEKLY', label: '📅 Hebdomadaire' },
    { value: 'FREQ=MONTHLY', label: '📆 Mensuelle' },
  ]}
/>
```

---

## 🚀 FEATURES AVANCÉES (Session 3+)

### 6. 🔔 **Notifications** (40-60 min)
- [ ] Intégration Discord webhook (service existe déjà)
- [ ] Intégration Telegram bot (service existe déjà)
- [ ] Toggle ON/OFF par utilisateur dans ProfilePage
- [ ] Notifications pour : nouvelle tâche assignée, événement proche, etc.

### 7. 📥 **Export Obsidian** (30 min)
- [ ] Bouton "Exporter vers Obsidian" dans chaque page
- [ ] Générer fichiers Markdown formatés
- [ ] Service existe déjà (`backend/src/services/obsidian.service.ts`)

### 8. 🔄 **Google Calendar Sync** (60 min)
- [ ] OAuth2 flow pour connecter Google Calendar
- [ ] Sync bidirectionnel événements
- [ ] Service existe déjà (`backend/src/services/googleCalendar.service.ts`)

### 9. 🌙 **Dark Mode** (20 min)
- [ ] Toggle dark/light dans ProfilePage
- [ ] Sauvegarder préférence localStorage
- [ ] Classes Tailwind `dark:` déjà disponibles

### 10. ✅ **Tests** (120+ min)
- [ ] Tests unitaires backend (Jest) - Coverage 80%
- [ ] Tests composants frontend (Vitest + React Testing Library)
- [ ] Tests E2E (Playwright) - Flow complet auth → create → edit → delete

---

## 📊 ROADMAP COMPLÈTE

**Phase 1 - MVP Fonctionnel** ✅ (Session 1 - FAIT)
- [x] Setup Docker MySQL
- [x] Backend API opérationnel
- [x] Frontend React + composants UI
- [x] 5 pages principales (Calendar, Tasks, Shopping, Baby, Meals)
- [x] Auth JWT

**Phase 2 - Bug Fixes & Polish** (Session 2 - NEXT)
- [ ] Corriger 3 bugs critiques
- [ ] FloatingButton global
- [ ] Baby & Meals pages complètes
- [ ] Tâches récurrentes

**Phase 3 - Features Avancées** (Sessions 3-5)
- [ ] Notifications (Discord/Telegram)
- [ ] Export Obsidian
- [ ] Google Calendar sync
- [ ] Dark mode

**Phase 4 - Production** (Sessions 6-8)
- [ ] Tests (80% coverage)
- [ ] Déploiement VPS OVH
- [ ] SSL/HTTPS
- [ ] Monitoring & logs
- [ ] Backup automatique base de données

---

## 🎓 LEÇONS SESSION 1

**Ce qui a bien fonctionné** ✅ :
- Architecture backend solide et cohérente
- Composants UI réutilisables (Modal, FormField, FloatingButton)
- Pattern CRUD standardisé (CalendarPage → TasksPage → ShoppingPage)
- Charte graphique Shinkofa bien intégrée
- Workflow Git atomique (commits fréquents)

**Ce qui doit être amélioré** 🔧 :
- Validation backend mieux documentée (champs requis, formats)
- Tests dès le début (TDD pour éviter régressions)
- Gestion erreurs frontend plus visible (toasts/alerts)
- Logs frontend plus verbeux en dev
- Encodage UTF-8 vérifié dès le setup MySQL

**Temps estimés réalistes** ⏱️ :
- Setup initial (Docker + config) : 15-20 min
- Page CRUD complète (avec tests) : 40-50 min
- Bug critique (debug + fix) : 20-30 min
- Feature avancée (Google Calendar, etc.) : 60-90 min

---

**Prochaine session** : Commencer par BUGS.md, puis continuer cette TODO list dans l'ordre.
