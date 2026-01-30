# API Shizen - Backend FastAPI

> API Backend pour Shizen Planner (Tâches, Rituels, Journals)

## 🎯 Description

API FastAPI pour la plateforme Shizen avec:
- Gestion tâches adaptatives
- Rituels énergétiques
- Journals quotidiens
- Intégration Design Humain
- Base de données PostgreSQL

## 🚀 Développement

### Prérequis
- Python 3.11+
- PostgreSQL
- (Optionnel) GPU NVIDIA pour inference IA locale

### Installation

```bash
# Créer environnement virtuel
python -m venv venv

# Activer (Windows)
.\venv\Scripts\activate

# Installer dépendances
pip install -r requirements.txt

# OU avec GPU
pip install -r requirements-gpu.txt

# Configurer .env
cp .env.example .env
# Éditer .env avec vos credentials DB
```

### Lancer

```bash
# Depuis la racine du MonoRepo
pnpm --filter @shinkofa/api-shizen dev

# OU directement
python -m uvicorn app.main:app --reload --port 8000
```

## 📦 Endpoints Principaux

- `GET /` - Health check
- `GET /docs` - Swagger UI
- `POST /api/v1/tasks` - Créer tâche
- `GET /api/v1/tasks` - Liste tâches
- `POST /api/v1/rituals` - Créer rituel
- `POST /api/v1/journals` - Créer journal

## 🗄️ Database

PostgreSQL avec Alembic pour migrations:

```bash
# Appliquer migrations
alembic upgrade head

# Créer nouvelle migration
alembic revision --autogenerate -m "description"
```

## 🌐 URLs

- **Dev**: http://localhost:8000
- **Docs**: http://localhost:8000/docs
- **ALPHA**: https://api.alpha.shinkofa.com
- **PROD**: https://api.shinkofa.com

## 🧪 Tests

```bash
pnpm --filter @shinkofa/api-shizen test

# OU
pytest tests/ -v
```

## 📝 Notes

- Port 8000 (configuré dans package.json)
- Variables d'environnement dans `.env`
- Base de données PostgreSQL requise
- Intégration future avec @shinkofa/types (types Python générés depuis TypeScript)
