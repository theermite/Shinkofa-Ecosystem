# CLAUDE.md - Shinkofa-Ecosystem

> Monorepo de l'écosystème Shinkofa : toutes les applications réunies.
>
> **Hérite de** : `D:\30-Dev-Projects\.claude\CLAUDE.md` (instructions communes)

---

## 📁 Structure du Monorepo

```
Shinkofa-Ecosystem/
├── apps/
│   ├── michi/              # Plateforme principale Shinkofa
│   ├── hibiki-dictate/     # Application dictée vocale
│   ├── slf-esport/         # Plateforme SLF eSport
│   ├── kazoku/             # Family Hub (alpha, famille uniquement)
│   ├── takumi-kit/         # Toolbox développement
│   └── sakusei/            # Social Content Master
│
├── packages/               # Packages partagés (à venir)
│   └── ui/                 # Composants UI partagés
│
├── docs/                   # Documentation Shinkofa
│   ├── Masterplan-Shinkofa.md
│   ├── Glossaire-Shinkofa.md
│   ├── Compendium-Shizen.md
│   └── Systeme-Coaching-Shinkofa.md
│
└── .claude/
    └── CLAUDE.md           # CE FICHIER
```

---

## 📚 DOCUMENTATION RAG - SOURCE DE VÉRITÉ SHINKOFA

> ⚠️ **CONSULTER CES FICHIERS** pour toute question sur Shinkofa, coaching, tarifs, philosophie.

| Document | Contenu | Priorité |
|----------|---------|----------|
| `docs/Masterplan-Shinkofa.md` | Vision, mission, stratégie, tarifs officiels, roadmap | CRITIQUE |
| `docs/Glossaire-Shinkofa.md` | Terminologie japonaise, définitions, prononciation | HAUTE |
| `docs/Compendium-Shizen.md` | Spécifications IA Shizen, architecture, intégrations | CRITIQUE |
| `docs/Systeme-Coaching-Shinkofa.md` | Méthodologie tri-dimensionnelle, 7 sphères, profil holistique | HAUTE |
| `docs/Citations-Shinkofa.md` | Citations fondatrices pour réseaux sociaux | NORMALE |

### Règles RAG

```
✅ Tarifs → Masterplan-Shinkofa.md (Musha 0€, Samurai 19.99€, Sensei 39.99€)
✅ Termes japonais → Glossaire-Shinkofa.md
✅ Shizen/IA → Compendium-Shizen.md
✅ Coaching → Systeme-Coaching-Shinkofa.md
✅ Philosophie 4 piliers → Sankofa, Bushido/Ninjutsu, Neuroplasticité, Sagesses Ancestrales
```

---

## 🎯 Applications

### Michi (`apps/michi/`)

**Plateforme principale Shinkofa**

- Stack : Next.js, TypeScript, TailwindCSS
- Auth : Clerk ou Auth.js
- DB : PostgreSQL + Prisma
- Déploiement : VPS OVH

### Hibiki-Dictate (`apps/hibiki-dictate/`)

**Application de dictée vocale**

- Stack : Electron + React
- Speech-to-Text : Whisper (local via Ollama)
- Focus : Accessibilité, offline-first

### SLF eSport (`apps/slf-esport/`)

**Plateforme eSport communautaire**

- Stack : Next.js, TypeScript
- Features : Tournois, équipes, matchmaking

### Kazoku (`apps/kazoku/`)

**Family Hub - Application familiale**

- Status : **Alpha** (utilisateurs = famille Jay uniquement)
- Stack : Next.js, TypeScript
- Features : Calendrier partagé, tâches, communication

### Takumi-Kit (`apps/takumi-kit/`)

**Toolbox développement**

- Outils internes pour productivité dev
- Scripts, snippets, automatisation

### Sakusei (`apps/sakusei/`)

**Social Content Master**

- Gestion contenu réseaux sociaux
- Planification, templates, analytics

---

## 🛠️ Stack Technique Commun

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 15+ | Framework React |
| TypeScript | 5.x | Typage strict |
| TailwindCSS | 3.x | Styling |
| Prisma | 5.x | ORM |
| PostgreSQL | 17 | Database |

---

## 🚀 Commandes Monorepo

```bash
# Installation
pnpm install

# Dev (toutes les apps)
pnpm dev

# Dev (app spécifique)
pnpm --filter michi dev
pnpm --filter hibiki-dictate dev

# Build
pnpm build

# Tests
pnpm test
```

---

## 📝 Conventions Spécifiques

### Imports entre apps

```typescript
// ✅ Utiliser les alias
import { Button } from '@shinkofa/ui'

// ❌ Pas d'imports relatifs entre apps
import { Button } from '../../packages/ui/Button'
```

### Variables d'environnement

Chaque app a son propre `.env.local` :
- `apps/michi/.env.local`
- `apps/hibiki-dictate/.env.local`

Variables partagées dans `.env` à la racine (non sensibles uniquement).

---

## 🔗 Ressources

- **Méthodologie complète** : `../Instruction-Claude-Code/.claude/CLAUDE.md`
- **Instructions workspace** : `../../.claude/CLAUDE.md`

---

**Version** : 2.0.0 | **Date** : 2026-01-31 | **Refactored** : Héritage workspace CLAUDE.md
