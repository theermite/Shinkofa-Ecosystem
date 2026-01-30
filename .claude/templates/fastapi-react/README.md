# FastAPI + React - Fullstack Web App Template

> Template production-ready pour applications web fullstack avec API backend et SPA frontend.

**Stack** :
- 🐍 **Backend** : FastAPI (Python 3.11+)
- ⚛️ **Frontend** : React 18 + TypeScript + Vite
- 🗄️ **Database** : PostgreSQL 15
- 🔴 **Cache** : Redis 7
- 🔐 **Auth** : JWT (access + refresh tokens)

**Version** : 2.0
**Setup time** : ~10 minutes
**Production-ready** : ✅

---

## 🎯 Features

### Backend (FastAPI)

- ✅ API REST complète avec OpenAPI docs
- ✅ Authentication JWT + refresh tokens
- ✅ Authorization RBAC (roles: admin, user, guest)
- ✅ CRUD operations examples
- ✅ Database migrations (Alembic)
- ✅ Async SQLAlchemy ORM
- ✅ Pydantic validation models
- ✅ Rate limiting
- ✅ CORS configured
- ✅ Logging structured
- ✅ Error handling standardized
- ✅ Health check endpoint
- ✅ Tests (pytest + coverage)

### Frontend (React)

- ✅ TypeScript strict mode
- ✅ React Router v6 (routing)
- ✅ TanStack Query (API state)
- ✅ Zustand (global state)
- ✅ React Hook Form + Zod (forms validation)
- ✅ Tailwind CSS (styling)
- ✅ Authentication flow complete
- ✅ Protected routes
- ✅ API client (axios)
- ✅ Error boundaries
- ✅ Loading states
- ✅ Toast notifications
- ✅ Tests (Vitest + React Testing Library)
- ✅ E2E tests (Playwright)

### DevOps

- ✅ Docker dev + prod (centralisé `.claude/docker/`)
- ✅ Hot-reload (backend + frontend)
- ✅ CI/CD GitHub Actions
- ✅ Pre-commit hooks
- ✅ Environment variables management
- ✅ Database seed data
- ✅ Nginx reverse proxy (prod)
- ✅ SSL/TLS support

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- Node.js 20+
- Docker + Docker Compose
- Git

### 1. Clone Template

```bash
cp -r templates/fastapi-react ~/my-webapp
cd ~/my-webapp
```

### 2. Setup Environment

```bash
# Copier variables d'environnement
cp .claude/docker/.env.example .claude/docker/.env

# Éditer .env (database passwords, secret keys, etc.)
nano .claude/docker/.env
```

### 3. Start with Docker (Recommended)

```bash
# Démarrer tous les services
./claude/docker/dc.sh up

# Backend API : http://localhost:8000
# API Docs    : http://localhost:8000/docs
# Frontend    : http://localhost:3000
# pgAdmin     : http://localhost:5050
```

### 4. Setup Database

```bash
# Run migrations
docker-compose -f .claude/docker/docker-compose.yml exec backend alembic upgrade head

# Seed data (optional)
docker-compose -f .claude/docker/docker-compose.yml exec backend python scripts/seed.py
```

### 5. Access

- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:8000
- **API Docs (Swagger)** : http://localhost:8000/docs
- **API Docs (ReDoc)** : http://localhost:8000/redoc
- **pgAdmin** : http://localhost:5050 (admin@example.com / admin)

**Default credentials** :
- Email: `admin@example.com`
- Password: `admin123`

---

## 📁 Project Structure

```
fastapi-react/
├── .claude/                      # Claude Code configuration
│   ├── CLAUDE.md
│   ├── docs/                     # Documentation (8 files)
│   ├── docker/                   # Docker centralisé
│   ├── knowledge/                # Knowledge Library
│   └── scripts/                  # Utility scripts
│
├── backend/                      # FastAPI Backend
│   ├── app/
│   │   ├── api/                  # API endpoints
│   │   │   ├── v1/
│   │   │   │   ├── auth.py       # Authentication routes
│   │   │   │   ├── users.py      # Users CRUD
│   │   │   │   └── posts.py      # Posts CRUD (example)
│   │   │   └── deps.py           # Dependencies (DB, auth, etc.)
│   │   ├── core/                 # Core functionality
│   │   │   ├── config.py         # Settings (Pydantic)
│   │   │   ├── security.py       # JWT, password hashing
│   │   │   └── database.py       # DB connection
│   │   ├── models/               # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   └── post.py
│   │   ├── schemas/              # Pydantic schemas
│   │   │   ├── user.py
│   │   │   ├── post.py
│   │   │   └── token.py
│   │   ├── services/             # Business logic
│   │   │   ├── user_service.py
│   │   │   └── auth_service.py
│   │   └── main.py               # FastAPI app entry
│   ├── alembic/                  # Database migrations
│   ├── tests/                    # Tests
│   │   ├── api/                  # API tests
│   │   ├── services/             # Service tests
│   │   └── conftest.py           # Pytest fixtures
│   ├── scripts/
│   │   └── seed.py               # Seed database
│   ├── requirements.txt          # Python dependencies
│   ├── requirements-dev.txt      # Dev dependencies
│   └── alembic.ini               # Alembic config
│
├── frontend/                     # React Frontend
│   ├── src/
│   │   ├── api/                  # API client
│   │   │   ├── client.ts         # Axios config
│   │   │   ├── auth.ts           # Auth API calls
│   │   │   └── users.ts          # Users API calls
│   │   ├── components/           # React components
│   │   │   ├── ui/               # UI components (Button, Input, etc.)
│   │   │   ├── layout/           # Layout components
│   │   │   └── auth/             # Auth components
│   │   ├── pages/                # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   └── NotFoundPage.tsx
│   │   ├── hooks/                # Custom hooks
│   │   │   ├── useAuth.ts
│   │   │   └── useApi.ts
│   │   ├── store/                # Zustand store
│   │   │   └── authStore.ts
│   │   ├── routes/               # Routing
│   │   │   ├── AppRouter.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── types/                # TypeScript types
│   │   │   ├── user.ts
│   │   │   └── api.ts
│   │   ├── utils/                # Utilities
│   │   │   ├── token.ts
│   │   │   └── validators.ts
│   │   ├── App.tsx               # App component
│   │   ├── main.tsx              # Entry point
│   │   └── index.css             # Global styles
│   ├── public/                   # Static assets
│   ├── tests/                    # Tests
│   │   ├── unit/                 # Unit tests (Vitest)
│   │   └── e2e/                  # E2E tests (Playwright)
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── playwright.config.ts
│
├── .github/                      # CI/CD
│   └── workflows/
│       ├── backend-tests.yml
│       ├── frontend-tests.yml
│       └── deploy.yml
│
├── .gitignore
└── README.md                     # This file
```

---

## 🔧 Development

### Backend

```bash
# Install dependencies
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements-dev.txt

# Run migrations
alembic upgrade head

# Run dev server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest
pytest --cov=app --cov-report=html

# Linting
ruff check .
mypy .

# Format
black .
isort .
```

### Frontend

```bash
# Install dependencies
cd frontend
npm install

# Run dev server
npm run dev

# Run tests
npm test
npm run test:e2e

# Linting
npm run lint
npm run type-check

# Format
npm run format

# Build
npm run build
npm run preview
```

---

## 🐳 Docker

### Development

```bash
# Start all services
./claude/docker/dc.sh up

# View logs
./claude/docker/dc.sh logs -f

# Stop
./claude/docker/dc.sh down

# Rebuild
./claude/docker/dc.sh build
```

### Production

```bash
# Build production images
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.prod.yml \
               build

# Deploy
docker-compose -f .claude/docker/docker-compose.yml \
               -f .claude/docker/docker-compose.prod.yml \
               up -d

# Check status
docker-compose -f .claude/docker/docker-compose.yml ps
```

---

## 🔐 Authentication Flow

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response** :
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "created_at": "2026-01-26T15:00:00Z"
}
```

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** :
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 900
}
```

### Protected Route

```http
GET /api/v1/users/me
Authorization: Bearer {access_token}
```

**Response** :
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "full_name": "John Doe",
  "role": "user",
  "is_active": true
}
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# All tests
pytest

# With coverage
pytest --cov=app --cov-report=html
open htmlcov/index.html

# Specific test file
pytest tests/api/test_users.py

# Specific test
pytest tests/api/test_users.py::test_create_user
```

### Frontend Tests

```bash
cd frontend

# Unit tests
npm test

# With coverage
npm run test:coverage

# E2E tests
npm run test:e2e

# E2E with UI
npm run test:e2e:ui
```

---

## 📚 API Documentation

### Endpoints Overview

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/v1/auth/register` | POST | No | Register new user |
| `/api/v1/auth/login` | POST | No | Login user |
| `/api/v1/auth/refresh` | POST | Yes | Refresh token |
| `/api/v1/auth/logout` | POST | Yes | Logout user |
| `/api/v1/users/me` | GET | Yes | Get current user |
| `/api/v1/users/me` | PUT | Yes | Update current user |
| `/api/v1/users/me` | DELETE | Yes | Delete current user |
| `/api/v1/users` | GET | Yes (Admin) | List all users |
| `/api/v1/users/{id}` | GET | Yes (Admin) | Get user by ID |
| `/api/v1/posts` | GET | No | List posts |
| `/api/v1/posts` | POST | Yes | Create post |
| `/api/v1/posts/{id}` | GET | No | Get post |
| `/api/v1/posts/{id}` | PUT | Yes | Update post |
| `/api/v1/posts/{id}` | DELETE | Yes | Delete post |
| `/health` | GET | No | Health check |

**Full documentation** : http://localhost:8000/docs

---

## 🚀 Deployment

### Environment Variables

**Backend** :
```env
# Database
DATABASE_URL=postgresql://user:pass@db:5432/dbname

# Security
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# CORS
BACKEND_CORS_ORIGINS=["http://localhost:3000","https://yourdomain.com"]

# Redis
REDIS_URL=redis://redis:6379
```

**Frontend** :
```env
VITE_API_URL=http://localhost:8000
```

### Production Checklist

- [ ] Set secure `SECRET_KEY`
- [ ] Configure `BACKEND_CORS_ORIGINS`
- [ ] Set strong database passwords
- [ ] Enable SSL/TLS (nginx)
- [ ] Configure production database
- [ ] Set up backup strategy
- [ ] Configure monitoring
- [ ] Set up logging aggregation
- [ ] Configure rate limiting
- [ ] Test disaster recovery

---

## 🛠️ Customization

### Add New Endpoint

1. **Create model** (`backend/app/models/item.py`)
2. **Create schema** (`backend/app/schemas/item.py`)
3. **Create service** (`backend/app/services/item_service.py`)
4. **Create endpoint** (`backend/app/api/v1/items.py`)
5. **Add tests** (`backend/tests/api/test_items.py`)

### Add New Frontend Page

1. **Create page component** (`frontend/src/pages/ItemPage.tsx`)
2. **Add route** (`frontend/src/routes/AppRouter.tsx`)
3. **Create API calls** (`frontend/src/api/items.ts`)
4. **Add tests** (`frontend/tests/unit/ItemPage.test.tsx`)

---

## 🐛 Troubleshooting

### Backend won't start

**Check logs** :
```bash
docker-compose -f .claude/docker/docker-compose.yml logs backend
```

**Common issues** :
- Database not ready → Wait 10s and retry
- Port 8000 in use → Change port in `.env`
- Missing migrations → Run `alembic upgrade head`

### Frontend won't connect to API

**Check** :
1. Backend running? → `curl http://localhost:8000/health`
2. CORS configured? → Check `BACKEND_CORS_ORIGINS` in backend `.env`
3. API URL correct? → Check `VITE_API_URL` in frontend `.env`

### Database connection failed

**Check** :
1. PostgreSQL running? → `docker-compose ps`
2. Credentials correct? → Verify `.env`
3. Port 5432 available? → `lsof -i :5432`

---

## 📖 Learn More

### Backend (FastAPI)

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [Alembic Migrations](https://alembic.sqlalchemy.org/)
- [Pydantic Validation](https://docs.pydantic.dev/)

### Frontend (React)

- [React Documentation](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Guide](https://vitejs.dev/guide/)
- [TanStack Query](https://tanstack.com/query/latest)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

## 📝 TODO / Enhancements

Potential improvements :

- [ ] Add websockets support (FastAPI WebSocket)
- [ ] Add file upload (images, documents)
- [ ] Add email verification flow
- [ ] Add password reset flow
- [ ] Add 2FA (TOTP)
- [ ] Add social auth (Google, GitHub)
- [ ] Add admin dashboard
- [ ] Add API rate limiting per user
- [ ] Add request logging
- [ ] Add performance monitoring (Sentry)

---

## 🤝 Contributing

1. Fork the project
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'feat: Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

[Your License] - See LICENSE file

---

## 🙏 Acknowledgments

- FastAPI by Sebastián Ramírez
- React by Meta
- Vite by Evan You
- Template structure inspired by best practices

---

**Created by** : Jay The Ermite
**Template Version** : 2.0
**Last Updated** : 2026-01-26
