# CLAUDE.md - Shinkofa-Ecosystem

> Monorepo de l'écosystème Shinkofa : toutes les applications réunies.
>
> **Hérite de** : `D:\30-Dev-Projects\.claude\CLAUDE.md` (instructions communes)

---

## ⚠️ SOURCE DE VÉRITÉ MÉTHODOLOGIE — OBLIGATOIRE

> **IMPORTANT** : Ce monorepo n'a PAS de copie locale de la méthodologie.
> La source unique est **Instruction-Claude-Code**.

### Règle Absolue

```
AVANT toute action de développement dans ce monorepo :
1. Charger D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\
2. Consulter les Maîtres pertinents dans Master-Agents/
3. Appliquer les conventions de Core-System/Conventions.md
```

### Fichiers à Consulter Systématiquement

| Besoin | Fichier Source (Instruction-Claude-Code) |
|--------|------------------------------------------|
| **Workflow** | `Prompt-2026-Optimized/Core-System/Workflow.md` |
| **Conventions** | `Prompt-2026-Optimized/Core-System/Conventions.md` |
| **Agents/Maîtres** | `Prompt-2026-Optimized/Master-Agents/INDEX-MAITRES.md` |
| **Skills** | `Prompt-2026-Optimized/Master-Skills/` |
| **Checklists** | `Prompt-2026-Optimized/Process-Checklists/` |
| **Leçons** | `Prompt-2026-Optimized/Infrastructure/Lessons/` |

### Chemin Complet

```
D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\
├── Core-System/           # Profil, Workflow, Conventions
├── Master-Agents/         # 31 Maîtres
├── Master-Skills/         # 20 Skills
├── Quick-References/      # Références rapides
├── Process-Checklists/    # Pre-commit, Pre-deploy
└── Infrastructure/        # Lessons, VPS, etc.
```

---

## 📁 Structure du Monorepo

```
Shinkofa-Ecosystem/
├── apps/                   # 25+ applications
├── packages/               # Packages partagés
│   ├── ui/                 # Design system
│   ├── config/             # Configs communes
│   └── database/           # Prisma schemas
├── docs/                   # Documentation centralisée
└── .claude/
    └── CLAUDE.md           # CE FICHIER
```

---

## 📚 DOCUMENTATION RAG - SOURCE DE VÉRITÉ

> ⚠️ **CONSULTER CES FICHIERS** pour toute question sur Shinkofa.

| Document | Contenu | Priorité |
|----------|---------|----------|
| `docs/Ecosysteme-Projets-Shinkofa.md` | Catalogue complet 25+ apps | CRITIQUE |
| `docs/Masterplan-Shinkofa.md` | Vision, mission, tarifs | CRITIQUE |
| `docs/Glossaire-Shinkofa.md` | Terminologie japonaise | HAUTE |
| `docs/Compendium-Shizen.md` | Spécifications IA Shizen | CRITIQUE |
| `docs/Systeme-Coaching-Shinkofa.md` | Méthodologie coaching | HAUTE |

---

## 🎯 Applications par Phase

### Phase 1 : Infrastructure Fondation (IA Shizen)

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **shizen** | 至善 | Frontend IA (React/Vite) | 🟡 En dev |
| **api-shizen** | 至善 | Backend IA (FastAPI) | 🟡 En dev |
| **hibiki-dictate** | 響き | Dictée vocale | 🔴 Stub |

> ℹ️ L'IA Shizen = `shizen` (frontend) + `api-shizen` (backend). Le dossier `shizen-ia` a été supprimé (doublon vide).

### Phase 2 : Plateforme Centrale

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **michi** | 道 | Plateforme coaching | 🟡 En dev |
| **sakusei** | 作成 | Suite création | 🟡 En dev |
| **takumi-kit** | 匠 | Toolbox | 🔴 Stub |

### Phase 3 : Gaming & Développement

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **slf-esport** | — | Académie gaming | 🟢 Actif |
| **gemu-dojo** | 道場 | Hub gaming | 🔴 Stub |

### Phase 4 : Création & Visibilité

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **hikari-stream** | 光 | Streaming | 🔴 Stub |
| **the-ermite** | 仙人 | Site vitrine Jay | 🔴 Stub |
| **site-vitrine** | — | Site Shinkofa | 🔴 Stub |

### Phase 5 : Famille & Communication

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **kazoku** | 家族 | Hub famille | 🟡 En dev (alpha) |
| **tegami-mail** | 手紙 | Client email | 🔴 Stub |
| **musubu-hub** | 結ぶ | Messaging unifié | 🔴 Stub |
| **kaigi-meet** | 会議 | Visioconférence | 🔴 Stub |
| **nakama-hub** | 仲間 | Hub communautaire | 📋 Réservé |

### Phase 6 : Développement & Business

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **kodo-hub** | コード | Hub développement | 🔴 Stub |
| **kankei-crm** | 関係 | CRM coaching | 🔴 Stub |

### Phase 7 : Media

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **media-kura** | 蔵 | Hub media | 🔴 Stub |

### Phase 8 : Bureautique & Créativité

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **jimu-suite** | 事務 | Suite bureautique | 🔴 Stub |
| **dezain-suite** | デザイン | Suite créative | 🔴 Stub |

### Phase 9 : Administration Système

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **seigyo-admin** | 制御 | Admin Windows | 🔴 Stub |
| **shirei-admin** | 司令 | Admin Linux | 🔴 Stub |

### Phase 10 : Mobile & Système

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **tobira-launcher** | 扉 | Launcher Android | 🔴 Stub |
| **keitai-hub** | 携帯 | Hub mobile | 🔴 Stub |
| **enkaku-connect** | 遠隔 | Accès distant | 🔴 Stub |

### Phase 11 : Révolution Finale

| App | Kanji | Type | Status |
|-----|-------|------|--------|
| **shin-os** | 真 | OS propriétaire | 📋 2030 |

### Autres Apps

| App | Type | Status |
|-----|------|--------|
| **kosei** | Profil utilisateur | 🔴 Stub |
| **toolbox-theermite** | Legacy toolbox | ⚠️ Migré vers takumi-kit |

---

## 🚦 Légende Statuts

| Icône | Statut | Description |
|-------|--------|-------------|
| 🟢 | Actif | En production |
| 🟡 | En dev | Développement actif |
| 🔴 | Stub | Structure créée, pas de code |
| 📋 | Planifié | Réservé pour le futur |
| ⚠️ | Legacy | À migrer/nettoyer |

---

## 🛠️ Stack Technique Commun

| Technologie | Version | Usage |
|-------------|---------|-------|
| Next.js | 15+ | Framework React |
| TypeScript | 5.x | Typage strict |
| TailwindCSS | 3.x | Styling |
| Prisma | 5.x | ORM |
| PostgreSQL | 17 | Database |
| Python | 3.12 | IA/Backend Shizen |
| LangChain | 1.2+ | IA orchestration |

---

## 🚀 Commandes Monorepo

```bash
# Installation
pnpm install

# Dev (app spécifique)
pnpm --filter michi dev
pnpm --filter sakusei dev
pnpm --filter kazoku dev

# Build
pnpm build

# Tests
pnpm test
```

---

## 🔄 CI/CD (GitHub Actions)

### Workflows Configurés

| Workflow | Fichier | Déclencheur |
|----------|---------|-------------|
| **CI** | `.github/workflows/ci.yml` | Push/PR sur main, develop |
| **Deploy** | `.github/workflows/deploy.yml` | Après CI réussi sur main |

### Pipeline CI (Standard)

```
Setup → Lint + Type-Check + Tests (parallel) → Build → Summary
```

### Pipeline Deploy (Complet)

```
Check CI → Build → Deploy Michi → Deploy API-Shizen → Deploy Shizen → Summary
```

### Déploiement Manuel

1. Actions > "Deploy - Shinkofa Ecosystem"
2. "Run workflow"
3. Sélectionner app (all, michi, api-shizen, shizen)

### Secrets Requis

Voir `.github/SECRETS-REQUIRED.md` pour configurer:
- `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`

---

## 🔗 Ressources

- **Catalogue complet** : `docs/Ecosysteme-Projets-Shinkofa.md`
- **Instructions workspace** : `../../.claude/CLAUDE.md`
- **Méthodologie** : `../../Instruction-Claude-Code/.claude/CLAUDE.md`

---

**Version** : 4.0.0 | **Date** : 2026-02-01 | **Apps** : 25+ | **Change** : Source de vérité unique (Instruction-Claude-Code)
