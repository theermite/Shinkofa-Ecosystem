# Michi

> Plateforme Michi - Shizen + Questionnaire + Planner (app.shinkofa.com)

Application web Next.js 15 pour la plateforme Shinkofa, incluant le questionnaire holistique Shizen et le planner personnel.

## Stack Technique

- **Framework**: Next.js 15 (App Router)
- **UI**: React 18 + TailwindCSS
- **State**: Zustand + React Query
- **Forms**: React Hook Form + Zod
- **i18n**: next-intl
- **Drag & Drop**: dnd-kit

## Installation

```bash
# Depuis la racine du monorepo
pnpm install

# Ou depuis ce dossier
cd apps/michi
pnpm install
```

## Scripts

```bash
pnpm dev          # Démarrer en développement (port 3003)
pnpm build        # Build production
pnpm start        # Démarrer en production
pnpm lint         # Linter
pnpm lint:fix     # Linter avec auto-fix
pnpm type-check   # Vérification TypeScript
pnpm test         # Tests unitaires
pnpm test:watch   # Tests en mode watch
pnpm test:coverage # Tests avec coverage
```

## Variables d'Environnement

Copier `.env.example` vers `.env.local` et configurer :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8001
NEXT_PUBLIC_APP_NAME=Shinkofa Platform
NEXT_PUBLIC_APP_VERSION=1.0.0
```

## Structure

```
src/
├── app/              # Next.js App Router
│   └── [locale]/     # Routes internationalisées
├── components/       # Composants React
├── contexts/         # Contextes React
├── hooks/            # Hooks personnalisés
├── lib/              # Utilitaires et API client
├── types/            # Types TypeScript
├── i18n/             # Configuration i18n
└── messages/         # Traductions
```

## Workspace

Ce projet fait partie du monorepo `@shinkofa/*` et utilise :
- `@shinkofa/types` - Types partagés
- `@shinkofa/utils` - Utilitaires partagés
- `@shinkofa/tsconfig` - Configuration TypeScript

## Licence

Propriétaire - La Voie Shinkofa
