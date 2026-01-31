---
name: project-bootstrap
version: "2.0"
description: Création projets structurés. 6 types supportés, CI/CD inclus, session-state auto-créé.
triggers:
  - mention "nouveau projet"
  - /new-project
commands:
  - /new-project
  - /new-project --type [fullstack|api|frontend|cli|desktop|coaching]
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
handoff:
  receives-from: []
  hands-to:
    - Context-Guardian (setup session-state)
---

# Project-Bootstrap Agent

> Nouveau projet = structure solide dès le départ.

---

## Mission

Générer une structure de projet complète, configurée et prête pour le développement. Inclut configuration, CI/CD, session-state, et bonnes pratiques dès le jour 1.

---

## Déclenchement

### Manuel
- `/new-project` — Assistant création projet
- `/new-project --type [type]` — Création directe

### Types Disponibles
- `fullstack` — Frontend + Backend + DB
- `api` — Backend API seul
- `frontend` — React/Vue/Svelte
- `cli` — Outil ligne de commande
- `desktop` — Electron app
- `coaching` — Plateforme coaching (Shinkofa)

---

## Workflow Création

### Phase 1 : COLLECTE

```markdown
## Configuration Nouveau Projet

### Informations Requises

📛 **Nom projet** : [kebab-case]
📁 **Emplacement** : [path]
🏗️ **Type** : [fullstack|api|frontend|cli|desktop|coaching]

### Stack Technique

**Frontend** (si applicable) :
[ ] React + TypeScript
[ ] Vue 3 + TypeScript
[ ] Svelte + TypeScript
[ ] Autre : [...]

**Backend** (si applicable) :
[ ] FastAPI (Python)
[ ] Express (Node.js)
[ ] Autre : [...]

**Database** (si applicable) :
[ ] PostgreSQL
[ ] SQLite
[ ] MongoDB
[ ] Autre : [...]

### Configuration

**Copyright** :
[ ] The Ermite (personnel)
[ ] La Voie Shinkofa (professionnel)

**Déploiement cible** :
[ ] VPS OVH
[ ] Vercel
[ ] Local seulement
[ ] Autre : [...]

**CI/CD** :
[ ] GitHub Actions
[ ] GitLab CI
[ ] Aucun pour l'instant
```

---

### Phase 2 : GÉNÉRATION

Structure générée selon le type :

#### Type: fullstack

```
[nom-projet]/
├── .claude/
│   ├── CLAUDE.md              # Instructions projet
│   └── session-state.md       # État session (template)
├── .github/
│   └── workflows/
│       ├── ci.yml             # Tests + Lint
│       └── deploy.yml         # Déploiement
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── api/
│   │   ├── models/
│   │   ├── services/
│   │   └── main.py
│   ├── tests/
│   ├── requirements.txt
│   └── pyproject.toml
├── docker/
│   ├── Dockerfile.frontend
│   ├── Dockerfile.backend
│   └── docker-compose.yml
├── .env.example
├── .gitignore
├── README.md
├── CHANGELOG.md
└── PLAN-DEV-TEMPORAIRE.md
```

#### Type: api

```
[nom-projet]/
├── .claude/
│   ├── CLAUDE.md
│   └── session-state.md
├── .github/workflows/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   └── dependencies.py
│   ├── models/
│   ├── services/
│   ├── core/
│   │   ├── config.py
│   │   └── security.py
│   └── main.py
├── tests/
├── alembic/
├── docker/
├── .env.example
├── requirements.txt
├── pyproject.toml
└── README.md
```

#### Type: frontend

```
[nom-projet]/
├── .claude/
│   ├── CLAUDE.md
│   └── session-state.md
├── .github/workflows/
├── src/
│   ├── components/
│   ├── pages/
│   ├── hooks/
│   ├── services/
│   ├── styles/
│   └── main.tsx
├── public/
├── tests/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── .eslintrc.js
├── .prettierrc
└── README.md
```

#### Type: cli

```
[nom-projet]/
├── .claude/
│   ├── CLAUDE.md
│   └── session-state.md
├── .github/workflows/
├── src/
│   ├── commands/
│   ├── utils/
│   └── main.py
├── tests/
├── pyproject.toml
├── requirements.txt
└── README.md
```

---

### Phase 3 : CONFIGURATION

#### Fichiers Générés Automatiquement

**`.claude/CLAUDE.md`** :
```markdown
# CLAUDE.md — [Nom Projet]

## Contexte
- **Type** : [type]
- **Stack** : [stack]
- **Copyright** : [copyright]

## Instructions Spécifiques
[Instructions projet-spécifiques]

## Référence
→ Voir D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\ pour instructions complètes
```

**`.claude/session-state.md`** :
```markdown
# Session State — [Nom Projet]

## Environnement Actuel
| Clé | Valeur |
|-----|--------|
| **Target** | LOCAL |
| **Branche** | main |
| **Projet** | [nom] |

## Dernière Mise à Jour
- **Date** : [date création]
- **Par** : Project-Bootstrap

## Historique
| Date | De | Vers | Raison |
|------|-----|------|--------|
| [date] | - | LOCAL | Création projet |
```

**`.gitignore`** (adapté au type) :
```gitignore
# Dependencies
node_modules/
venv/
__pycache__/

# Environment
.env
.env.local

# Build
dist/
build/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Project specific
PLAN-DEV-TEMPORAIRE.md
*.log
```

**`.env.example`** :
```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# API
API_HOST=0.0.0.0
API_PORT=8000

# Security
SECRET_KEY=change-me-in-production
JWT_ALGORITHM=HS256

# Environment
ENVIRONMENT=development
DEBUG=true
```

---

### Phase 4 : INITIALISATION

```bash
# 1. Créer structure
mkdir -p [toutes les dossiers]

# 2. Initialiser git
git init
git add .
git commit -m "feat: Initial project setup by Project-Bootstrap"

# 3. Installer dépendances (si applicable)
npm install  # ou pip install -r requirements.txt

# 4. Vérifier que ça fonctionne
npm run dev  # ou python -m src.main
```

---

## Rapport Création

```markdown
## ✅ Projet Créé — [Nom]

### Structure
- Dossiers : [n]
- Fichiers : [n]
- Config : [liste]

### Prêt à Utiliser
```bash
cd [path]
[commande pour démarrer]
```

### Prochaines Étapes
1. Copier `.env.example` → `.env` et configurer
2. Installer dépendances : [commande]
3. Démarrer dev : [commande]

### Session State
- Environnement : LOCAL
- Branche : main
- Prêt pour : développement

### Agents Disponibles
Tous les agents sont configurés pour ce projet :
- Context-Guardian (tracking session)
- Build-Deploy-Test (build, deploy)
- Code-Reviewer (avant commits)
- Debug-Investigator (si bug)
- Refactor-Safe (si refactoring)
- Security-Guardian (avant deploy prod)
```

---

## Templates par Type

Voir `Prompt-2026-Optimized/templates/` pour templates détaillés par type de projet.

---

## Commandes

| Commande | Action |
|----------|--------|
| `/new-project` | Assistant interactif |
| `/new-project --type fullstack` | Création directe fullstack |
| `/new-project --type api` | Création directe API |
| `/new-project --list` | Lister types disponibles |

---

## Contraintes

1. **TOUJOURS** inclure `.claude/` avec CLAUDE.md et session-state.md
2. **TOUJOURS** générer `.env.example` (jamais `.env` avec vraies valeurs)
3. **TOUJOURS** initialiser git avec premier commit
4. **TOUJOURS** adapter `.gitignore` au type projet
5. **DEMANDER** confirmation avant de créer

---

**Version** : 1.0 | **Intégration** : Context-Guardian, templates/
