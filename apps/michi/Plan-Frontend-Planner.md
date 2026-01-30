# Plan Frontend - Planner UI

**Projet**: Shinkofa Platform - Frontend Next.js 15
**Date**: 2026-01-07
**Objectif**: Créer interface utilisateur pour consommer API Shizen-Planner (Tasks, Projects, Journals, Rituals)

---

## 🎯 Objectifs

### Fonctionnel
- ✅ Afficher et gérer Tasks (liste, création, édition, suppression)
- ✅ Afficher et gérer Projects (liste, création, édition, suppression, cascade tasks)
- ✅ Daily Journal (création quotidienne, energy tracking 0-10, gratitudes/successes)
- ✅ Rituals tracker (morning/evening/daily, completion tracking, reset feature)
- ✅ Filtres et recherche (par status, priority, category, date)
- ✅ Responsive mobile-first (breakpoints sm/md/lg/xl)
- ✅ Dark mode + Light mode toggle
- ✅ Intégration backend API (endpoints testés, 102 tests passing)

### Non-fonctionnel
- ⚡ Performance: Temps chargement < 2s, TTI < 3.5s
- ♿ Accessibilité: WCAG AAA (contraste ≥7:1, navigation clavier, ARIA labels)
- 🎨 UX cohérente avec design Shinkofa (vert/bleu/violet gradient)
- 📱 PWA-ready (Service Worker, offline-first prévu Phase 5)
- 🧪 Tests coverage ≥ 70% (Vitest + React Testing Library)

---

## 🏗️ Architecture Frontend

### Stack Confirmée
- **Next.js** 15.x (App Router, Server Components où pertinent)
- **React** 19.x (hooks, fonctionnel, 'use client' si interactif)
- **TypeScript** 5.x (strict mode, interfaces complètes)
- **Tailwind CSS** 3.x (design system, dark mode, responsive)
- **TanStack Query** 5.x (data fetching, caching, optimistic updates)
- **Zustand** 4.x (state management léger - auth, theme)
- **React Hook Form** + Zod (formulaires, validation)
- **date-fns** (manipulation dates, format localized)

### Patterns
- **Composants atomiques**: Button, Input, Select, Card, Badge
- **Composants composites**: TaskCard, TaskList, TaskForm, ProjectCard, etc.
- **Hooks custom**: useTasks, useProjects, useJournals, useRituals
- **API client**: Axios/fetch wrapper avec interceptors (auth, errors)
- **Error boundaries**: Fallback UI si crash composant
- **Loading states**: Skeleton loaders, spinners appropriés

---

## 📁 Structure Proposée

```
apps/web/src/
├── app/
│   ├── planner/                     # Route principale /planner
│   │   ├── page.tsx                 # Dashboard Planner (overview)
│   │   ├── tasks/
│   │   │   ├── page.tsx             # Liste tasks + filters
│   │   │   ├── [id]/page.tsx        # Détails task (optionnel)
│   │   │   └── new/page.tsx         # Création task (optionnel - modal préféré)
│   │   ├── projects/
│   │   │   ├── page.tsx             # Liste projects
│   │   │   └── [id]/page.tsx        # Détails project + tasks liées
│   │   ├── journals/
│   │   │   ├── page.tsx             # Liste journals (calendrier ou liste)
│   │   │   └── [date]/page.tsx      # Journal spécifique date
│   │   └── rituals/
│   │       └── page.tsx             # Tracker rituals (daily checklist)
│   │
│   ├── layout.tsx                   # Layout global (Navbar, ThemeProvider)
│   └── page.tsx                     # Homepage (landing page)
│
├── components/
│   ├── ui/                          # Composants atomiques (shadcn/ui style)
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── Checkbox.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── Tooltip.tsx
│   │
│   ├── planner/                     # Composants Planner spécifiques
│   │   ├── tasks/
│   │   │   ├── TaskCard.tsx         # Affichage task unique
│   │   │   ├── TaskList.tsx         # Liste tasks
│   │   │   ├── TaskForm.tsx         # Formulaire création/édition
│   │   │   ├── TaskFilters.tsx      # Filtres (completed, priority, project)
│   │   │   └── TaskStats.tsx        # Stats (completion rate, etc.)
│   │   │
│   │   ├── projects/
│   │   │   ├── ProjectCard.tsx
│   │   │   ├── ProjectList.tsx
│   │   │   ├── ProjectForm.tsx
│   │   │   └── ProjectTasksView.tsx # Vue tasks d'un project
│   │   │
│   │   ├── journals/
│   │   │   ├── JournalDailyForm.tsx # Formulaire daily journal
│   │   │   ├── JournalCard.tsx      # Affichage journal unique
│   │   │   ├── JournalCalendar.tsx  # Vue calendrier (optionnel)
│   │   │   ├── EnergySlider.tsx     # Slider 0-10 energy
│   │   │   └── GratitudesInput.tsx  # Input array 3 items
│   │   │
│   │   ├── rituals/
│   │   │   ├── RitualCard.tsx       # Affichage ritual + checkbox
│   │   │   ├── RitualList.tsx       # Liste rituals groupés par category
│   │   │   ├── RitualForm.tsx       # Formulaire création/édition
│   │   │   └── RitualCategoryTabs.tsx # Tabs morning/evening/daily/custom
│   │   │
│   │   └── PlannerDashboard.tsx     # Dashboard vue d'ensemble (widgets)
│   │
│   ├── layout/                      # Composants layout
│   │   ├── Navbar.tsx               # Navigation principale
│   │   ├── Sidebar.tsx              # Sidebar (optionnel, desktop)
│   │   ├── Footer.tsx
│   │   └── ThemeToggle.tsx          # Dark/Light mode switch
│   │
│   └── ShizenChat.tsx               # Existant (chat IA)
│
├── hooks/
│   ├── api/                         # Hooks API (TanStack Query)
│   │   ├── useTasks.ts              # GET/POST/PUT/DELETE tasks
│   │   ├── useProjects.ts           # GET/POST/PUT/DELETE projects
│   │   ├── useJournals.ts           # GET/POST/PUT/DELETE journals
│   │   └── useRituals.ts            # GET/POST/PUT/DELETE rituals, reset
│   │
│   ├── useAuth.ts                   # Authentication (JWT, user context)
│   ├── useTheme.ts                  # Dark/Light theme toggle
│   └── useMediaQuery.ts             # Responsive breakpoints
│
├── lib/
│   ├── api/
│   │   ├── client.ts                # Axios/fetch client (base URL, interceptors)
│   │   ├── tasks.ts                 # API calls tasks
│   │   ├── projects.ts              # API calls projects
│   │   ├── journals.ts              # API calls journals
│   │   └── rituals.ts               # API calls rituals
│   │
│   ├── utils/
│   │   ├── cn.ts                    # classnames utility (clsx + tailwind-merge)
│   │   ├── dates.ts                 # Date formatters (date-fns wrappers)
│   │   └── validators.ts            # Zod schemas (TaskSchema, ProjectSchema, etc.)
│   │
│   └── constants.ts                 # Constants (API URL, priority levels, categories)
│
├── types/
│   ├── api.ts                       # Types API responses (Task, Project, Journal, Ritual)
│   ├── forms.ts                     # Types formulaires
│   └── index.ts                     # Exports centralisés
│
└── styles/
    └── globals.css                  # Tailwind imports + custom styles
```

---

## 🎨 Design System

### Couleurs (Shinkofa Theme)
```css
/* Light Mode */
--primary-green: #10b981 (emerald-500)
--primary-blue: #3b82f6 (blue-500)
--primary-purple: #8b5cf6 (violet-500)
--bg-light: #f9fafb (gray-50)
--text-dark: #111827 (gray-900)

/* Dark Mode */
--bg-dark: #111827 (gray-900)
--bg-dark-elevated: #1f2937 (gray-800)
--text-light: #f9fafb (gray-50)
--accent-green: #34d399 (emerald-400)
```

### Composants UI (shadcn/ui inspired)
- **Button**: Variants (primary, secondary, outline, ghost, destructive)
- **Input**: Label + error state + disabled
- **Select**: Dropdown avec search (React Select ou Headless UI)
- **Card**: Container avec header/content/footer
- **Badge**: Status (p0-p5 priority, completed/active)
- **Modal**: Overlay + Dialog (Headless UI Dialog)
- **Tooltip**: Hover info (Radix UI Tooltip)

### Responsive Breakpoints
```
sm: 640px   # Mobile landscape
md: 768px   # Tablet
lg: 1024px  # Desktop
xl: 1280px  # Large desktop
```

### Accessibilité
- Contraste ≥ 7:1 (WCAG AAA)
- Navigation clavier complète (Tab, Enter, Escape)
- ARIA labels (aria-label, aria-describedby)
- Focus visible (outline ring)
- Screen reader support (sr-only classes)

---

## 🔌 API Integration

### Base URL
```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001'
// Production: https://alpha.shinkofa.com/api/shizen
```

### Authentication
```typescript
// Header requis sur toutes requêtes
headers: {
  'Content-Type': 'application/json',
  'X-User-ID': userId // Dev/alpha (JWT en production)
}
```

### Hooks TanStack Query Pattern
```typescript
// Example: useTasks.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getTasks, createTask, updateTask, deleteTask } from '@/lib/api/tasks'

export function useTasks(filters?: TaskFilters) {
  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => getTasks(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

// Usage dans composant
function TaskList() {
  const { data: tasks, isLoading, error } = useTasks({ completed: false })
  const createTaskMutation = useCreateTask()

  // ...
}
```

---

## 📋 Phases de Développement

### Phase 1: Infrastructure (Jour 1)
**Priorité**: Haute | **Effort**: 4-6h

✅ **Objectifs**:
- Setup structure dossiers (`components/`, `hooks/`, `lib/`, `types/`)
- Installer dépendances:
  ```bash
  npm install @tanstack/react-query zustand react-hook-form zod date-fns
  npm install -D @testing-library/react @testing-library/jest-dom vitest
  ```
- Créer API client (`lib/api/client.ts` avec Axios)
- Créer types TypeScript (`types/api.ts` - Task, Project, Journal, Ritual)
- Setup TanStack Query Provider (`app/layout.tsx`)
- Créer composants UI atomiques (Button, Input, Card, Badge)
- Créer ThemeToggle + intégrer dark mode (Tailwind + localStorage)

**Livrables**:
- [ ] Structure dossiers complète
- [ ] Dépendances installées
- [ ] API client fonctionnel (test GET /health)
- [ ] Types TypeScript définis
- [ ] Composants UI atomiques (5 minimum)
- [ ] Dark mode fonctionnel

---

### Phase 2: Tasks & Projects (Jours 2-3)
**Priorité**: Haute | **Effort**: 12-16h

✅ **Objectifs**:
- Créer hooks API: `useTasks`, `useProjects` (GET, POST, PUT, DELETE)
- Composants Tasks:
  - `TaskCard.tsx`: Affichage task (checkbox, title, priority badge, due date)
  - `TaskList.tsx`: Liste tasks avec filtres (completed, priority, project_id)
  - `TaskForm.tsx`: Formulaire création/édition (React Hook Form + Zod validation)
  - `TaskFilters.tsx`: Filtres sidebar/dropdown
- Composants Projects:
  - `ProjectCard.tsx`: Affichage project (color, icon, status badge, tasks count)
  - `ProjectList.tsx`: Grid/liste projects
  - `ProjectForm.tsx`: Formulaire création/édition
  - `ProjectTasksView.tsx`: Affichage tasks d'un project
- Page `/planner/tasks` (liste + création + filtres)
- Page `/planner/projects` (liste + création)
- Page `/planner/projects/[id]` (détails project + tasks liées)

**Livrables**:
- [ ] Hooks `useTasks` et `useProjects` fonctionnels
- [ ] CRUD Tasks complet (create, read, update, delete, filter)
- [ ] CRUD Projects complet
- [ ] Vue tasks d'un project spécifique
- [ ] Formulaires validés (Zod schemas)
- [ ] Responsive mobile-first
- [ ] Dark mode appliqué

---

### Phase 3: Journals & Rituals (Jours 4-5)
**Priorité**: Haute | **Effort**: 12-16h

✅ **Objectifs**:
- Créer hooks API: `useJournals`, `useRituals` (GET, POST, PUT, DELETE, reset rituals)
- Composants Journals:
  - `JournalDailyForm.tsx`: Formulaire daily journal (date, energy sliders, intentions, gratitudes/successes arrays, learning, adjustments)
  - `EnergySlider.tsx`: Slider 0-10 avec labels (0: Épuisé, 5: Normal, 10: Peak)
  - `GratitudesInput.tsx`: Input dynamique 3 items (array)
  - `JournalCard.tsx`: Affichage journal existant (read-only ou éditable)
  - `JournalCalendar.tsx`: Vue calendrier (optionnel - peut être Phase 4)
- Composants Rituals:
  - `RitualCard.tsx`: Affichage ritual (checkbox completed, icon, label)
  - `RitualList.tsx`: Liste rituals groupés par category (morning/evening/daily/custom)
  - `RitualForm.tsx`: Formulaire création/édition ritual
  - `RitualCategoryTabs.tsx`: Tabs pour filtrer par category
- Page `/planner/journals` (création daily + historique)
- Page `/planner/journals/[date]` (journal spécifique date)
- Page `/planner/rituals` (tracker daily rituals + création)
- Feature bonus: Bouton "Reset All Rituals" (appel POST /rituals/reset)

**Livrables**:
- [ ] Hooks `useJournals` et `useRituals` fonctionnels
- [ ] Daily journal form complet (tous champs + validation)
- [ ] Energy tracking sliders (0-10)
- [ ] Rituals tracker (morning/evening/daily/custom tabs)
- [ ] Reset rituals feature
- [ ] Get journal by date feature
- [ ] Responsive + dark mode

---

### Phase 4: Dashboard & Polish (Jour 6)
**Priorité**: Moyenne | **Effort**: 6-8h

✅ **Objectifs**:
- `PlannerDashboard.tsx`: Vue d'ensemble (widgets)
  - Widget: Tasks du jour (non complétées)
  - Widget: Energy tracker rapide (graphique simple ou badges)
  - Widget: Rituals completion today (barre progression)
  - Widget: Projects actifs (3-5 premiers)
  - Widget: Quick actions (boutons "New Task", "Daily Journal", etc.)
- Page `/planner` (dashboard principal)
- Navbar navigation (liens: Dashboard, Tasks, Projects, Journals, Rituals)
- Amélioration UX:
  - Loading skeletons (Tailwind Pulse animation)
  - Error states (messages user-friendly)
  - Empty states (illustrations + CTA)
  - Success notifications (toast/snackbar)
- Optimisations performance:
  - React.memo sur composants lourds
  - Lazy loading routes (Next.js dynamic imports)
  - Optimistic updates (TanStack Query)

**Livrables**:
- [ ] Dashboard Planner fonctionnel (4+ widgets)
- [ ] Navbar navigation complète
- [ ] Loading/error/empty states partout
- [ ] Notifications success/error (toast)
- [ ] Performance optimisée (Lighthouse ≥90)

---

### Phase 5: Tests & Documentation (Jour 7)
**Priorité**: Haute | **Effort**: 6-8h

✅ **Objectifs**:
- Setup Vitest + React Testing Library
- Tests composants critiques:
  - `TaskCard.test.tsx`: Affichage, interactions checkbox
  - `TaskForm.test.tsx`: Validation, submit
  - `ProjectCard.test.tsx`: Affichage, navigation
  - `JournalDailyForm.test.tsx`: Validation, sliders, arrays
  - `RitualList.test.tsx`: Grouping, filters
- Tests hooks API:
  - `useTasks.test.ts`: Queries, mutations, cache invalidation
  - `useProjects.test.ts`: CRUD + cascade delete warning
- Tests intégration (optionnel):
  - Playwright E2E: User flow (create task → complete task)
- Documentation:
  - `FRONTEND-GUIDE.md`: Architecture, patterns, conventions
  - Storybook (optionnel): Catalogue composants UI
  - README frontend: Install, dev, build, test

**Livrables**:
- [ ] Tests coverage ≥ 70% (composants + hooks)
- [ ] Tests E2E critiques (optionnel)
- [ ] Documentation architecture
- [ ] README frontend complet

---

## 🚀 Commandes Dev

```bash
# Development
cd apps/web
npm install
npm run dev              # http://localhost:3000

# Build
npm run build            # Production build
npm run start            # Production server

# Tests
npm run test             # Vitest unit tests
npm run test:coverage    # Coverage report
npm run test:e2e         # Playwright E2E (optionnel)

# Linting
npm run lint             # ESLint
npm run type-check       # TypeScript
npm run format           # Prettier
```

---

## 📊 Métriques de Succès

### Performance
- ⚡ Lighthouse score ≥ 90 (Performance, Accessibility, Best Practices, SEO)
- ⏱️ Time to Interactive < 3.5s
- 📦 Bundle size < 500KB (sans lazy loading), < 200KB (avec lazy loading)
- 🔄 API response time < 200ms (P95)

### Qualité
- ✅ Tests coverage ≥ 70%
- 🎨 WCAG AAA (contraste ≥ 7:1)
- 📱 Responsive 100% (mobile/tablet/desktop)
- 🌓 Dark mode fonctionnel
- 🧪 Zéro console errors/warnings

### UX
- 🎯 User flow complet sans blocage
- 💬 Messages erreurs user-friendly
- 📝 Formulaires validés temps réel
- ⚡ Optimistic updates (mutations instantanées)
- 🔄 Loading states partout

---

## 🔄 Prochaines Étapes (Post-MVP)

### Version 2 - Statistiques
- Dashboard Stats (graphiques Recharts: énergie 7 jours, completion rate)
- Export données (CSV, JSON)
- Calendrier vue mois (React Big Calendar)

### Version 3 - IA Integration
- Chat Shizen IA intégré dans Planner (sidebar)
- Recommandations tasks basées sur énergie
- Auto-génération routines

### Version 4 - Collaboration
- Partage projects (liens publics)
- Invitations collaborateurs
- Comments sur tasks

---

**Version**: 1.0.0
**Auteur**: Jay "The Ermite" Goncalves + TAKUMI AI
**Date**: 2026-01-07
**Status**: 📋 Plan initial - Prêt à implémenter
