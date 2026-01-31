# Templates Projets

> Templates production-ready pour démarrer rapidement différents types de projets.

**Version** : 2.0
**Dernière mise à jour** : 2026-01-26

---

## 🎯 Objectif

Réduire le temps de setup d'un nouveau projet de **2-3 heures** à **5-10 minutes**.

Chaque template inclut **TOUT** ce qui est nécessaire :
- ✅ Structure fichiers complète
- ✅ Configuration dev/prod
- ✅ Documentation pré-remplie (8 fichiers `.claude/docs/`)
- ✅ Docker centralisé
- ✅ Tests + CI/CD
- ✅ Scripts utilitaires
- ✅ Knowledge Library initialisée
- ✅ Git hooks (optionnel)

---

## 📦 Templates Disponibles

| Template | Type | Stack | Use Case |
|----------|------|-------|----------|
| **generic-project** | Universel | Agnostique | Base pour tout projet |
| **fastapi-react** | Fullstack | FastAPI + React | Web app SPA |
| **nextjs-app** | Fullstack | Next.js 14 | SSR/SSG app, SEO |
| **electron-app** | Desktop | Electron + React | App cross-platform |
| **cli-tool** | CLI | Python/TypeScript | Outil ligne de commande |

---

## 🚀 Quick Start

### 1. Choisir Template

```bash
# Lister templates
ls Prompt-2026-Optimized/templates/

# Voir détails template
cat Prompt-2026-Optimized/templates/fastapi-react/README.md
```

### 2. Copier Template

```bash
# Copier template vers nouveau projet
cp -r Prompt-2026-Optimized/templates/fastapi-react ~/my-new-project
cd ~/my-new-project
```

### 3. Personnaliser

```bash
# Remplacer placeholders
find . -type f -exec sed -i 's/\[Nom Projet\]/My Project/g' {} +
find . -type f -exec sed -i 's/\[DATE\]/2026-01-26/g' {} +

# OU utiliser script
python .claude/scripts/init-project.py --name "My Project"
```

### 4. Initialiser

```bash
# Git
git init
git add .
git commit -m "feat: Initialize project from template"

# Dependencies
npm install  # ou pip install -r requirements.txt

# Documentation
/rag-status
# Si < 100% : compléter fichiers .claude/docs/

# Knowledge Library
/knowledge init
```

### 5. Développer

```bash
# Dev
npm run dev

# Tests
npm test

# Build
npm run build

# Docker
./claude/docker/dc.sh up
```

---

## 📁 Structure Template Standard

Tous les templates suivent cette structure :

```
template-name/
├── .claude/                      # Configuration Claude Code
│   ├── CLAUDE.md                 # Instructions projet
│   ├── session-state.md          # État session (généré)
│   │
│   ├── docs/                     # 📚 Documentation (8 fichiers)
│   │   ├── ARCHITECTURE.md
│   │   ├── API_REFERENCE.md
│   │   ├── DATABASE_SCHEMA.md
│   │   ├── CODING_STANDARDS.md
│   │   ├── TESTING_GUIDE.md
│   │   ├── CONTEXT.md
│   │   ├── CHANGELOG.md
│   │   └── KNOWN_ISSUES.md
│   │
│   ├── docker/                   # 🐳 Configuration Docker
│   │   ├── README.md
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   ├── docker-compose.prod.yml
│   │   ├── Dockerfile
│   │   ├── .env.example
│   │   ├── dc.sh / dc.ps1
│   │   └── nginx/
│   │
│   ├── knowledge/                # 🧠 Knowledge Library
│   │   ├── README.md
│   │   ├── config.json
│   │   ├── index.json
│   │   ├── coaching/
│   │   ├── business/
│   │   └── technical/
│   │
│   └── scripts/                  # 🛠️ Scripts utilitaires
│       ├── rag-manager.py
│       ├── knowledge-manager.py
│       └── init-project.py
│
├── src/                          # Code source (structure varie)
├── tests/                        # Tests
├── public/                       # Assets statiques
├── .github/                      # CI/CD workflows
├── .gitignore
├── README.md
└── package.json / requirements.txt
```

---

## 🔧 Templates Détaillés

### generic-project (Universel)

**Usage** : Base pour tout projet, agnostique du langage/framework.

**Inclus** :
- Structure `.claude/` complète
- Documentation standard (8 fichiers)
- Docker centralisé
- Scripts RAG + Knowledge Library
- Git hooks optionnels

**Quand utiliser** :
- Nouveau projet type inconnu
- Base à personnaliser
- Projet expérimental

**Quick Start** :
```bash
cp -r templates/generic-project ~/my-project
```

---

### fastapi-react (Fullstack Web App)

**Stack** :
- **Backend** : FastAPI (Python 3.11+)
- **Frontend** : React 18 + TypeScript + Vite
- **Database** : PostgreSQL 15
- **Cache** : Redis
- **Auth** : JWT

**Inclus** :
- API REST complète avec exemples
- Frontend SPA avec routing
- Authentication + authorization (RBAC)
- Tests (pytest + Jest)
- Docker dev + prod
- CI/CD GitHub Actions
- Documentation pré-remplie

**Quand utiliser** :
- Web app avec API backend
- Dashboard / admin
- SaaS MVP

**Quick Start** :
```bash
cp -r templates/fastapi-react ~/my-webapp
cd ~/my-webapp
./claude/docker/dc.sh up
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000/docs
```

---

### nextjs-app (Next.js SSR/SSG)

**Stack** :
- **Framework** : Next.js 14 (App Router)
- **Language** : TypeScript
- **Styling** : Tailwind CSS
- **Database** : PostgreSQL (Prisma ORM)
- **Auth** : NextAuth.js

**Inclus** :
- App Router structure
- Server/Client components
- API routes
- SSR + SSG examples
- SEO optimisé
- Middleware auth
- Tests (Vitest + Playwright)

**Quand utiliser** :
- Site web avec SEO
- Blog / marketing site
- E-commerce
- App nécessitant SSR

**Quick Start** :
```bash
cp -r templates/nextjs-app ~/my-nextjs-site
cd ~/my-nextjs-site
npm install
npm run dev
# http://localhost:3000
```

---

### electron-app (Desktop Cross-Platform)

**Stack** :
- **Framework** : Electron 28+
- **Frontend** : React 18 + TypeScript
- **Build** : Electron Forge
- **Database** : SQLite (local)

**Inclus** :
- Main process + Renderer structure
- IPC communication examples
- Auto-updater
- Menu + tray icon
- Native dialogs
- Packaging Windows/Linux/macOS
- Tests (Jest + Spectron)

**Quand utiliser** :
- Application desktop
- Outil développeur
- App nécessitant accès système

**Quick Start** :
```bash
cp -r templates/electron-app ~/my-desktop-app
cd ~/my-desktop-app
npm install
npm start
# Build: npm run make
```

---

### cli-tool (Command Line Tool)

**Stack Options** :
- **Python** : Click/Typer + Rich
- **TypeScript** : Commander + Inquirer + Chalk

**Inclus** :
- Commands structure
- Arguments + options parsing
- Interactive prompts
- Progress bars
- Colored output
- Config file support
- Tests (pytest / Jest)
- Packaging (PyPI / npm)

**Quand utiliser** :
- Outil automation
- Dev tool
- Script complexe avec UI

**Quick Start** :
```bash
# Python
cp -r templates/cli-tool-python ~/my-cli
cd ~/my-cli
pip install -e .
my-cli --help

# TypeScript
cp -r templates/cli-tool-ts ~/my-cli
cd ~/my-cli
npm install
npm link
my-cli --help
```

---

## ⚙️ Personnalisation

### Remplacer Placeholders

Chaque template contient des placeholders à remplacer :

| Placeholder | Remplacer par |
|-------------|---------------|
| `[Nom Projet]` | Nom projet réel |
| `[DATE]` | Date actuelle |
| `[VERSION]` | Version initiale (ex: 0.1.0) |
| `[AUTHOR]` | Ton nom |
| `[EMAIL]` | Ton email |

**Script automatique** :
```bash
python .claude/scripts/init-project.py \
  --name "My Project" \
  --author "Jay" \
  --email "jay@example.com"
```

**Manuel (sed)** :
```bash
find . -type f -exec sed -i 's/\[Nom Projet\]/My Project/g' {} +
find . -type f -exec sed -i 's/\[DATE\]/2026-01-26/g' {} +
find . -type f -exec sed -i 's/\[VERSION\]/0.1.0/g' {} +
```

### Supprimer Éléments Non Nécessaires

```bash
# Pas besoin Docker
rm -rf .claude/docker/

# Pas besoin Knowledge Library
rm -rf .claude/knowledge/

# Pas besoin CI/CD
rm -rf .github/
```

---

## 📊 Comparaison Templates

| Critère | generic | fastapi-react | nextjs | electron | cli-tool |
|---------|---------|---------------|--------|----------|----------|
| **Setup time** | 5 min | 10 min | 8 min | 12 min | 5 min |
| **Complexity** | Low | Medium | Medium | High | Low |
| **Use cases** | Any | Web API + SPA | SEO sites | Desktop | Automation |
| **Learning curve** | Minimal | Medium | Medium | High | Low |
| **Production-ready** | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## 🎯 Choisir le Bon Template

### Flowchart

```
Quel type de projet ?
│
├─ Web app avec backend API ?
│  └─ fastapi-react
│
├─ Site web avec SEO ?
│  └─ nextjs-app
│
├─ Application desktop ?
│  └─ electron-app
│
├─ Outil CLI ?
│  └─ cli-tool
│
└─ Autre / Incertain ?
   └─ generic-project
```

### Questions

1. **Besoin interface graphique ?**
   - Oui web → fastapi-react ou nextjs
   - Oui desktop → electron-app
   - Non (CLI) → cli-tool

2. **Besoin SEO / SSR ?**
   - Oui → nextjs-app
   - Non → fastapi-react

3. **Besoin API backend complexe ?**
   - Oui → fastapi-react
   - Non (simple) → nextjs-app (API routes)

4. **Cross-platform desktop ?**
   - Oui → electron-app

5. **Aucune idée claire ?**
   - generic-project

---

## 🔄 Maintenance Templates

### Mettre à Jour Template

```bash
# Update dependencies
cd templates/fastapi-react
npm update
pip list --outdated | pip install -U

# Test
npm test
pytest

# Commit
git add .
git commit -m "chore(template): update dependencies"
```

### Ajouter Nouveau Template

1. Copier `generic-project`
2. Personnaliser structure
3. Ajouter stack-specific files
4. Tester thoroughly
5. Documenter README
6. Ajouter à ce fichier

---

## 📚 Ressources

### Documentation Templates

- [generic-project/README.md](generic-project/README.md)
- [fastapi-react/README.md](fastapi-react/README.md)
- [nextjs-app/README.md](nextjs-app/README.md)
- [electron-app/README.md](electron-app/README.md)
- [cli-tool/README.md](cli-tool/README.md)

### Scripts Utilitaires

- [init-project.py](generic-project/.claude/scripts/init-project.py)
- [rag-manager.py](generic-project/.claude/scripts/rag-manager.py)
- [knowledge-manager.py](generic-project/.claude/scripts/knowledge-manager.py)

---

**Maintenu par** : Jay The Ermite
**Support** : [Contact]

---

## 💡 Tips

### Premier Projet

Si c'est ton premier projet avec ces templates :

1. **Commence simple** : `generic-project` ou `cli-tool`
2. **Explore la structure** : Lis les README
3. **Teste les commandes** : `/rag-status`, `/knowledge`
4. **Personnalise progressivement**

### Projets Complexes

Pour projets complexes (ex: plateforme complète) :

1. **Commence avec template approprié** (ex: `fastapi-react`)
2. **Documente dès le début** : Complete `.claude/docs/`
3. **Utilise Knowledge Library** : Ingère business plan
4. **Iterate progressivement** : Ajoute features une par une

### Best Practices

✅ **À FAIRE** :
- Lire README template avant utilisation
- Compléter documentation (`.claude/docs/`)
- Committer souvent
- Tester avant production

❌ **À ÉVITER** :
- Utiliser template sans le comprendre
- Ignorer documentation
- Big bang refactoring
- Sauter tests
