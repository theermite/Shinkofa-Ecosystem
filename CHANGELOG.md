# Changelog - Shinkofa Ecosystem

Toutes les modifications importantes de ce MonoRepo sont documentées ici.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.1.0] - 2026-01-30

### ✨ Ajouté

#### Apps Production (Nouvelles Migrations)
- `@shinkofa/hibiki-dictate` - Application desktop Python de dictée vocale IA (pas de port web)
- `@shinkofa/sakusei` (port 3016) - Sakusei Studio (Social Content Master)
  - Stack: Next.js 16 + React 18 + Prisma + BullMQ + Redis
  - Fonctions: Gestion contenu social, transcription vidéo, workers FTP, transcodage
- `@shinkofa/slf-esport` (frontend: 3015, backend: 8005) - Plateforme SLF eSport (partenaire)
  - Frontend: Vite + React 18 + Tailwind + Charts (Konva, Recharts)
  - Backend: FastAPI + PostgreSQL
  - Fonctions: Entraînement e-sport, brain training widgets
- `@shinkofa/takumi-kit` (port 3017) - Takumi Kit (Ermite Toolbox)
  - Monorepo interne: widgets/*, shared packages
  - Stack: Vite + React 18 + TypeScript
  - Widgets: Reaction time, brain training mini-apps
- `@shinkofa/kazoku` (frontend: 3018, backend: 8006) - Kazoku (Family Hub)
  - Frontend: Vite + React 18 + Tailwind
  - Backend: Node.js + Express + TypeScript + MySQL
  - Fonctions: Calendrier familial, tâches, planification repas, Design Humain adaptatif

### 🔧 Configuration

#### Ports Assignés
- Port 3015: SLF eSport Frontend
- Port 3016: Sakusei Studio
- Port 3017: Takumi Kit Platform
- Port 3018: Kazoku Frontend
- Port 8005: SLF eSport Backend (FastAPI)
- Port 8006: Kazoku Backend (Node.js/Express)
- Port 3306/3307: MySQL (Kazoku database)

### 📝 Documentation

- PORTS.md mis à jour avec 5 nouvelles applications
- Section "Applications Desktop" ajoutée pour Hibiki-Dictate
- Documentation infrastructure: MySQL pour Kazoku, Redis pour Sakusei/SLF

### 📊 Métriques

- **Apps migrées totales**: 8/8 (100%)
- **Packages partagés**: 7/7 (100%)
- **Apps templates**: 2 (Shizen, Kosei)
- **Apps production**: 6 (Site Vitrine, Michi, API Shizen, SLF, Sakusei, Kazoku)
- **Apps desktop**: 1 (Hibiki-Dictate)
- **Widgets monorepo**: 1 (Takumi Kit)

---

## [1.0.0] - 2026-01-29

### ✨ Ajouté

#### Infrastructure MonoRepo
- Création structure MonoRepo complète (Turborepo + PNPM)
- Configuration Turborepo pipeline (build/dev/lint/test)
- Configuration PNPM workspaces
- Documentation PORTS.md (répartition ports)
- Documentation DEPLOYMENT.md (stratégie déploiement VPS)
- Documentation CONTRIBUTING.md (guide contribution)
- CI/CD GitHub Actions (build/test automatiques)

#### Packages Partagés (7)
- `@shinkofa/tsconfig` - Configurations TypeScript (base, react, nextjs, node)
- `@shinkofa/types` - Types centralisés (UserProfile, DesignHumainProfile, MorphicProfile)
- `@shinkofa/config` - Configs ESLint, Prettier, Tailwind avec design tokens
- `@shinkofa/utils` - 60+ fonctions utilitaires (date, string, validation, type-guards)
- `@shinkofa/ui` - Composants React (Button, Card, Input, Badge, Loading, Skeleton)
- `@shinkofa/i18n` - Système multilingue i18next (FR/EN/ES)
- `@shinkofa/morphic-engine` - Moteur adaptatif Design Humain + neurodivergence

#### Apps Production (Migrées)
- `@shinkofa/site-vitrine` (port 3002) - Site marketing shinkofa.com
  - Stack: React 18 + Vite 7 + TailwindCSS
  - Build time: 4.76s
  - Multilingue FR/EN/ES
- `@shinkofa/michi` (port 3003) - Plateforme app.shinkofa.com
  - Stack: Next.js 15 + React 18
  - Fonctions: Questionnaire DH, Shizen Chat, Planner, Profil holistique
  - Installation: 5min 10s (448 packages)
- `@shinkofa/api-shizen` (port 8000) - API Backend api.shinkofa.com
  - Stack: FastAPI + PostgreSQL
  - Endpoints: Tasks, Rituels, Journals

#### Apps Templates (Développement)
- `@shinkofa/shizen` (port 3000) - Template compagnon IA personnalisé
- `@shinkofa/kosei` (port 3001) - Template profil holistique builder

### 🔧 Configuration

#### Design Tokens Shinkofa
- Couleurs: bleu-profond, bleu-fonce, beige-sable, blanc-pur, accent-lumineux, accent-doux, dore-principal
- Ombres: shinkofa, shinkofa-lg
- Fonts: Inter (sans), Merriweather (serif)

#### Cache Busting
- Hash automatique dans noms fichiers (Vite)
- Format: `assets/[name].[hash].js`

### 📝 Documentation

- README.md principal avec guide Quick Start
- README.md par app (site-vitrine, michi, api-shizen, shizen, kosei)
- PORTS.md avec documentation complète ports
- DEPLOYMENT.md avec stratégie VPS
- CONTRIBUTING.md avec workflow Git et conventions

### 🚀 CI/CD

- GitHub Actions workflow pour build/test automatique
- Support Node.js 18.x et 20.x
- Cache PNPM pour builds rapides
- Upload artifacts de build

### 📊 Métriques

- **Temps total migration**: ~2h
- **Packages installés**: 1017 (total workspace)
- **Taille MonoRepo**: ~3GB (avec node_modules)
- **Apps migrées**: 3/3 (100%)
- **Packages créés**: 7/7 (100%)

---

## [À Venir] - Roadmap

### Version 1.1.0
- [ ] Migration apps restantes (Tokei, Keikaku, Kodo)
- [ ] Tests E2E avec Playwright
- [ ] Storybook pour @shinkofa/ui
- [ ] Optimisation Turborepo remote cache

### Version 1.2.0
- [ ] Docker Compose pour dev local complet
- [ ] Scripts déploiement automatisés
- [ ] Monitoring et alertes

### Version 2.0.0
- [ ] Micro-frontends avec Module Federation
- [ ] GraphQL API Gateway
- [ ] Intégration Koshin (système IA local)

---

## Notes de Migration

### Depuis shinkofa-platform/ vers Shinkofa-Ecosystem/

**Apps migrées**:
- `site-vitrine-2026/` → `apps/site-vitrine/`
- `apps/web/` → `apps/michi/`
- `apps/api-shizen-planner/` → `apps/api-shizen/`

**Changements breaking**:
- Noms packages: `website-shinkofa` → `@shinkofa/site-vitrine`
- Ports: Site vitrine 3000 → 3002, Michi auto → 3003
- React version: 19 → 18 (compatibilité packages)

**Migration sans perte**:
- ✅ Toutes fonctionnalités préservées
- ✅ Traductions intactes
- ✅ Composants fonctionnels
- ✅ Build réussis

---

[1.0.0]: https://github.com/shinkofa/ecosystem/releases/tag/v1.0.0
