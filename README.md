# 🌸 Shinkofa Ecosystem

> MonoRepo Turborepo + PNPM regroupant l'intégralité de l'écosystème Shinkofa

**Version** : 1.0.0
**Créé par** : Jay The Ermite
**Date** : Janvier 2026

---

## 📋 Vue d'ensemble

L'écosystème Shinkofa est un ensemble d'applications interconnectées conçues pour accompagner les neurodivergents vers l'épanouissement personnel et professionnel.

Ce MonoRepo regroupe **25+ applications** organisées selon la **Nomenclature Shinkofa V1.0** (noms japonais alignés sur les valeurs Shinkofa).

---

## 🏗️ Architecture

```
Shinkofa-Ecosystem/
├── apps/                    # Applications (25+ apps)
│   ├── michi-shinkofa/     # 🎯 Hub Central (app.shinkofa.com)
│   ├── site-vitrine/       # 🌐 Site vitrine (shinkofa.com)
│   ├── shizen-ia/          # 🧠 IA Holistique
│   ├── hibiki-dictate/     # 🎤 Dictée vocale
│   ├── sakusei-studio/     # 🎨 Création contenu
│   ├── hikari-stream/      # 📡 Streaming
│   ├── takumi-kit/         # 🛠️ Boîte à outils
│   ├── the-ermite/         # 🏔️ Site pro Jay (Sennin)
│   ├── slf-esport/         # 🎮 Gaming academy
│   ├── kazoku-hub/         # 👨‍👩‍👧‍👦 Hub famille
│   ├── nakama-hub/         # 🤝 Hub social
│   ├── gemu-dojo/          # 🏯 Gaming training
│   ├── musubu-hub/         # 💬 Communication
│   ├── tegami-mail/        # 📧 Email client
│   ├── kaigi-meet/         # 🎥 Visio
│   ├── kodo-hub/           # 💻 Dev Hub
│   ├── kankei-crm/         # 📊 CRM
│   ├── jimu-suite/         # 📄 Office suite
│   ├── dezain-suite/       # 🎨 Creative suite
│   ├── media-kura/         # 🎬 Media hub
│   ├── tobira-launcher/    # 📱 Android launcher
│   ├── keitai-hub/         # 📱 Mobile hub
│   ├── enkaku-connect/     # 🔌 Remote access
│   ├── seigyo-admin/       # 🖥️ Windows admin
│   ├── shirei-admin/       # 🐧 Linux admin
│   └── shin-os/            # 🚀 OS propriétaire
├── packages/               # Packages partagés
│   ├── ui/                 # Composants UI Shinkofa
│   ├── config/             # Configs ESLint, Prettier, Tailwind
│   ├── tsconfig/           # TypeScript configs
│   ├── morphic-engine/     # Moteur morphique (Design Humain)
│   ├── types/              # Types TypeScript partagés
│   ├── utils/              # Utilitaires communs
│   └── i18n/               # Système i18n FR/EN/ES
├── infrastructure/         # Infrastructure & DevOps
│   ├── vps/                # Configs VPS OVH
│   ├── docker/             # Dockerfiles
│   └── ci-cd/              # GitHub Actions
└── tools/                  # Outils dev
    ├── scripts/            # Scripts utilitaires
    └── generators/         # Générateurs de code
```

---

## 🚀 Quick Start

### Prérequis

- **Node.js** >= 20.0.0
- **PNPM** >= 8.0.0 (installé automatiquement via corepack)

### Installation

```bash
# Cloner le repo
git clone <url> Shinkofa-Ecosystem
cd Shinkofa-Ecosystem

# Installer toutes les dépendances
pnpm install

# Lancer tous les projets en dev
pnpm dev

# Build tout l'écosystème
pnpm build
```

---

## 📦 Applications

### 🎯 Priorité 1 - Fondations (En ligne)

| App | Description | Status | URL |
|-----|-------------|--------|-----|
| **Michi Shinkofa** | Hub central holistique | ✅ En ligne | https://app.shinkofa.com |
| **Site Vitrine** | Site vitrine Shinkofa | ✅ En ligne | https://shinkofa.com |
| **Shizen IA** | IA holistique coach | ✅ Beta | Intégré Michi |

### 🎨 Priorité 2 - Création & Visibilité

| App | Description | Status |
|-----|-------------|--------|
| **Hibiki Dictate** | Dictée vocale multilingue IA | 🚧 Alpha interne |
| **Sakusei Studio** | Suite création contenu | 📦 Planifié |
| **Hikari Stream** | Streaming multi-plateforme | 📦 Planifié |
| **Takumi Kit** | Boîte à outils multipurpose | 📦 Planifié |
| **The Ermite** | Site vitrine pro Jay | 📦 Planifié |

### 🤝 Priorité 3 - Social & Famille

| App | Description | Status |
|-----|-------------|--------|
| **Nakama Hub** | Hub social multi-utilisateurs | 📦 Planifié |
| **Kazoku Hub** | Gestion familiale | 📦 Planifié |
| **Gēmu Dōjō** | Gaming training | 📦 Planifié |

### 💼 Priorité 4+ - Productivité & Futur

| App | Description | Status |
|-----|-------------|--------|
| **Communication** | Musubu + Tegami + Kaigi | 🔮 Vision |
| **Productivity** | Jimu + Dezain Suites | 🔮 Vision |
| **Media & Admin** | Media Kura + Admin tools | 🔮 Vision |
| **Shin OS** | OS propriétaire Linux | 🔮 Vision finale |

---

## 🛠️ Développement

### Commandes globales

```bash
# Développement
pnpm dev                 # Lancer tous les projets en dev
pnpm dev --filter=michi  # Lancer une app spécifique

# Build
pnpm build               # Build tout l'écosystème
pnpm build --filter=site-vitrine  # Build une app

# Linting & Tests
pnpm lint                # Lint tout le code
pnpm test                # Tests unitaires
pnpm type-check          # Vérification types TypeScript

# Nettoyage
pnpm clean               # Nettoyer node_modules et builds
```

### Workflow développement

1. **Créer une branche** : `git checkout -b feature/ma-feature`
2. **Développer** : `pnpm dev --filter=mon-app`
3. **Tester** : `pnpm test --filter=mon-app`
4. **Commit** : Suivre [Conventional Commits](https://www.conventionalcommits.org/)
5. **Push & PR** : Créer une Pull Request

---

## 📚 Packages Partagés

### `@shinkofa/ui`

Composants React partagés (Design System Shinkofa)

```tsx
import { Button, Card } from '@shinkofa/ui';
```

### `@shinkofa/config`

Configurations ESLint, Prettier, TailwindCSS

```js
// eslint.config.js
import { baseConfig } from '@shinkofa/config/eslint';
```

### `@shinkofa/morphic-engine`

Moteur morphique adaptatif (Design Humain, neurodivergence)

```ts
import { MorphicEngine } from '@shinkofa/morphic-engine';
```

### `@shinkofa/i18n`

Système i18n multilingue (FR/EN/ES)

```ts
import { useTranslation } from '@shinkofa/i18n';
```

---

## 🌍 Multilingue (i18n)

**Langues supportées** : Français (défaut) + Anglais + Espagnol

Toutes les applications doivent supporter les 3 langues dès le départ.

---

## 🎨 Stack Technique

### Frontend
- **React 18** + **TypeScript**
- **Vite** / **Next.js** (selon l'app)
- **TailwindCSS** + **Design System Shinkofa**
- **i18next** (multilingue)

### Backend (selon apps)
- **FastAPI** (Python) pour APIs
- **PostgreSQL** + **Prisma** pour DB
- **Redis** pour cache

### Desktop
- **Qt6/PySide6** (Hibiki Dictate, Jimu Suite, etc.)

### DevOps
- **Turborepo** + **PNPM workspaces**
- **Docker** pour déploiement
- **GitHub Actions** pour CI/CD
- **VPS OVH** (8 cores, 22GB RAM)

---

## 🔐 Secrets & Environnement

Chaque app a son propre `.env.local` :

```bash
# apps/michi-shinkofa/.env.local
VITE_API_URL=https://api.shinkofa.com
VITE_SHIZEN_API_KEY=xxx
```

**⚠️ Ne jamais commiter les `.env.local` !**

---

## 📄 Documentation

- **Architecture** : [ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Contributing** : [CONTRIBUTING.md](./docs/CONTRIBUTING.md)
- **Nomenclature** : [Nomenclature-Shinkofa-2026-V1.0.md](./docs/Nomenclature-Shinkofa-2026-V1.0.md)
- **Changelog** : [CHANGELOG.md](./CHANGELOG.md)

---

## 🤝 Contribution

Voir [CONTRIBUTING.md](./docs/CONTRIBUTING.md) pour les guidelines.

---

## 📜 Licence

**Propriétaire** - Tous droits réservés © 2026 Jay The Ermite / La Voie Shinkofa

---

## 💚 Support

- **Site** : https://shinkofa.com
- **Email** : jay@shinkofa.com
- **Telegram** : https://t.me/shinkofa
- **Discord** : https://discord.gg/shinkofa

---

**Construit avec 💚 par Jay The Ermite pour la communauté neurodivergente**
