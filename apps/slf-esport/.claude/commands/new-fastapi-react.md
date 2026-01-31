# /new-fastapi-react

> Scaffold un projet FastAPI + React production-ready en 2 minutes.

**Version** : 1.0.0
**Auteur** : TAKUMI (Jay The Ermite)
**Durée** : ~2 minutes

---

## 🎯 Objectif

Créer une application fullstack complète avec :
- **Backend** : FastAPI + SQLAlchemy + Alembic + PostgreSQL
- **Frontend** : React 18 + TypeScript + Vite + TailwindCSS
- **Auth** : JWT (access + refresh tokens)
- **Tests** : pytest (backend) + Vitest (frontend)
- **Docs** : 8 fichiers docs standard
- **CI/CD** : GitHub Actions
- **Docker** : docker-compose.yml

---

## 📋 Usage

```bash
/new-fastapi-react my-awesome-app
/new-fastapi-react my-app --skip-install
/new-fastapi-react my-app --git-init
```

---

## 🔧 Workflow TAKUMI

### 1. Valider Arguments

```typescript
const projectName = args[0];
if (!projectName) {
  throw new Error("Project name required: /new-fastapi-react <project-name>");
}

// Valider format (kebab-case recommandé)
if (!/^[a-z0-9-]+$/.test(projectName)) {
  askUser("Project name should be kebab-case (e.g., my-app). Continue anyway?");
}
```

---

### 2. Copier Template

**Source** : `Prompt-2026-Optimized/templates/fastapi-react/`
**Destination** : `./<project-name>/`

```bash
# Copier tout le template
cp -r Prompt-2026-Optimized/templates/fastapi-react/ ./<project-name>/

# Vérifier copie
ls -la <project-name>/
```

**Fichiers copiés** :
```
<project-name>/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── tests/
│   ├── alembic/
│   ├── requirements.txt
│   └── pyproject.toml
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/
│   │   └── App.tsx
│   ├── package.json
│   └── vite.config.ts
├── .claude/
│   ├── docs/ (8 fichiers)
│   └── session-state.md
├── docker-compose.yml
├── .github/workflows/
└── README.md
```

---

### 3. Remplacer Placeholders

**Fichiers à modifier** :

#### `README.md`
```markdown
# [Nom Projet]  →  # My Awesome App
```

#### `backend/pyproject.toml`
```toml
name = "backend"  →  name = "my-awesome-app-backend"
```

#### `frontend/package.json`
```json
"name": "frontend"  →  "name": "my-awesome-app-frontend"
```

#### `.claude/docs/*.md`
```markdown
[Nom Projet]  →  My Awesome App
[DATE]  →  2026-01-29
[VERSION]  →  0.1.0
```

#### `docker-compose.yml`
```yaml
container_name: backend  →  container_name: my-awesome-app-backend
container_name: frontend  →  container_name: my-awesome-app-frontend
```

**Script Bash automatisé** :
```bash
cd <project-name>

# Variables
PROJECT_NAME_HUMAN="My Awesome App"
PROJECT_NAME_SLUG="my-awesome-app"
TODAY=$(date +%Y-%m-%d)

# Remplacements
find . -type f -name "*.md" -exec sed -i "s/\[Nom Projet\]/$PROJECT_NAME_HUMAN/g" {} +
find . -type f -name "*.md" -exec sed -i "s/\[DATE\]/$TODAY/g" {} +
find . -type f -name "*.md" -exec sed -i "s/\[VERSION\]/0.1.0/g" {} +

# pyproject.toml
sed -i "s/name = \"backend\"/name = \"$PROJECT_NAME_SLUG-backend\"/g" backend/pyproject.toml

# package.json
sed -i "s/\"name\": \"frontend\"/\"name\": \"$PROJECT_NAME_SLUG-frontend\"/g" frontend/package.json

# docker-compose.yml
sed -i "s/container_name: backend/container_name: $PROJECT_NAME_SLUG-backend/g" docker-compose.yml
sed -i "s/container_name: frontend/container_name: $PROJECT_NAME_SLUG-frontend/g" docker-compose.yml
```

---

### 4. Initialiser Git (optionnel)

```bash
cd <project-name>

git init
git add .
git commit -m "chore: initial commit from /new-fastapi-react template

Scaffolded with Claude Code /new-fastapi-react skill.

Stack:
- Backend: FastAPI + SQLAlchemy + PostgreSQL
- Frontend: React 18 + TypeScript + Vite
- Auth: JWT
- Tests: pytest + Vitest
- Docs: 8 standard docs

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### 5. Installer Dependencies (optionnel, si --skip-install pas fourni)

```bash
cd <project-name>

# Backend
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

**Durée** : ~2-3 minutes (download deps)

---

### 6. Afficher Next Steps

```markdown
✅ Project created: <project-name>

📁 Structure:
  backend/   → FastAPI application
  frontend/  → React application
  .claude/   → Documentation + session state

🚀 Next steps:

1. Configure environment:
   cp backend/.env.example backend/.env
   # Edit backend/.env (DATABASE_URL, SECRET_KEY)

2. Start development:
   docker-compose up -d        # Start PostgreSQL + Redis
   cd backend && uvicorn app.main:app --reload
   cd frontend && npm run dev

3. Access:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. Run tests:
   cd backend && pytest
   cd frontend && npm test

📚 Documentation: .claude/docs/
   - ARCHITECTURE.md → System overview
   - API_REFERENCE.md → API endpoints
   - TESTING_GUIDE.md → Test strategy

💡 Tip: Read README.md for complete setup guide
```

---

## ⚙️ Options

| Option | Description | Défaut |
|--------|-------------|--------|
| `--skip-install` | Skip npm/pip install | `false` |
| `--git-init` | Initialize git repo | `false` |
| `--docker` | Start docker-compose after creation | `false` |

**Exemples** :
```bash
/new-fastapi-react my-app --skip-install --git-init
/new-fastapi-react my-app --docker
```

---

## 🔐 Sécurité

**IMPORTANT** : Après création, configurer secrets :

1. **Backend `.env`** :
```bash
SECRET_KEY=<générer avec: openssl rand -hex 32>
DATABASE_URL=postgresql://user:password@localhost/dbname
REDIS_URL=redis://localhost:6379
```

2. **Frontend** :
```bash
VITE_API_URL=http://localhost:8000
```

---

## 📊 Checklist Post-Création

- [ ] `.env` configuré (backend + frontend)
- [ ] PostgreSQL + Redis running (docker-compose up)
- [ ] Database migrations run (alembic upgrade head)
- [ ] Tests passing (pytest + npm test)
- [ ] Git initialized + first commit
- [ ] README.md updated avec project-specific info

---

## 🐛 Troubleshooting

### Erreur : "Template not found"
**Solution** : Vérifier `Prompt-2026-Optimized/templates/fastapi-react/` existe.

### Erreur : "Permission denied" (Linux/macOS)
**Solution** : `chmod +x <script>` ou run avec `bash <script>`.

### Erreur : npm install fails
**Solution** : Vérifier Node.js 18+ installé (`node --version`).

---

**Version** : 1.0.0 | **Maintenu par** : TAKUMI
