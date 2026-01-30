# Shinkofa Ecosystem - MonoRepo

> Écosystème complet Shinkofa - Turborepo + PNPM

## 🎯 Vue d'Ensemble

MonoRepo centralisé pour tous les projets de l'écosystème Shinkofa, utilisant **Turborepo** pour l'orchestration et **PNPM** pour la gestion des dépendances.

### ✅ Apps Migrées (Production)

| App | Port(s) | Domaine | Stack | Status |
|-----|---------|---------|-------|--------|
| **Site Vitrine** | 3002 | shinkofa.com | React 18 + Vite | ✅ MIGRÉ |
| **Plateforme Michi** | 3003 | app.shinkofa.com | Next.js 15 + React 18 | ✅ MIGRÉ |
| **API Shizen** | 8000 | api.shinkofa.com | FastAPI | ✅ MIGRÉ |
| **Sakusei Studio** | 3016 | - | Next.js 16 + Prisma + BullMQ | ✅ MIGRÉ |
| **SLF eSport** | 3015 / 8005 | - | Vite + React 18 / FastAPI | ✅ MIGRÉ |
| **Kazoku (Family Hub)** | 3018 / 8006 | - | Vite + React 18 / Node.js/Express | ✅ MIGRÉ |
| **Takumi Kit** | 3017 | - | Vite + Widgets Monorepo | ✅ MIGRÉ |
| **Hibiki Dictate** | - | - | Python Desktop App | ✅ MIGRÉ |

### 🎨 Apps Templates (Développement)

| App | Port | Description |
|-----|------|-------------|
| **Shizen** | 3000 | Compagnon IA personnalisé (template) |
| **Kosei** | 3001 | Profil holistique builder (template) |

## 🚀 Quick Start

```bash
# Installer PNPM globalement
npm install -g pnpm

# Installer toutes les dépendances
pnpm install

# Lancer Site Vitrine (port 3002)
pnpm --filter @shinkofa/site-vitrine dev

# Lancer Plateforme Michi (port 3003)
pnpm --filter @shinkofa/michi dev

# Lancer Sakusei Studio (port 3016)
pnpm --filter @shinkofa/sakusei dev

# Lancer Kazoku Frontend (port 3018)
pnpm --filter @shinkofa/kazoku-frontend dev

# Lancer API Shizen (port 8000)
pnpm --filter @shinkofa/api-shizen dev
```

## 📋 Documentation

- **[PORTS.md](./PORTS.md)** - Répartition complète des ports
- Voir README.md de chaque app pour détails spécifiques

## 📦 Packages Partagés

- `@shinkofa/types` - Types TypeScript
- `@shinkofa/utils` - 60+ utilitaires
- `@shinkofa/ui` - Composants React
- `@shinkofa/i18n` - Multilingue FR/EN/ES
- `@shinkofa/morphic-engine` - Moteur adaptatif

## 🏗️ Structure

```
apps/          # Applications
packages/      # Packages partagés
PORTS.md       # Documentation ports
turbo.json     # Config Turborepo
```

---

**Version** : 1.1.0 | **Migration** : Option A complète ✅ | **Apps** : 8 migrées
