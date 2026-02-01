# CLAUDE.md - Kazoku (Family Hub)

> Application de gestion familiale collaborative.
> **Hérite de** : `D:\30-Dev-Projects\.claude\CLAUDE.md` (workspace)

---

## Source de Vérité Méthodologie

```
D:\30-Dev-Projects\Instruction-Claude-Code\Prompt-2026-Optimized\
```

**TOUJOURS** consulter cette source avant développement.

---

## Projet

| Clé | Valeur |
|-----|--------|
| **Nom** | Kazoku (家族 = famille) |
| **Type** | Web App fullstack |
| **Statut** | Alpha MVP |
| **Stack** | React 18 + Express + MySQL |

---

## Stack Technique

### Backend
- **Runtime** : Node.js 18+
- **Framework** : Express 4.18
- **Database** : MySQL 8.0 (Docker)
- **Auth** : JWT + Bcrypt
- **Validation** : Joi 17

### Frontend
- **Framework** : React 18 + TypeScript 5.3
- **Build** : Vite 7
- **Styling** : Tailwind CSS 3.4
- **State** : Zustand + React Query

---

## Commands Fréquentes

```bash
# Backend
cd backend && npm run dev          # Dev server :8006

# Frontend
cd frontend && npm run dev         # Vite :3018

# Docker (MySQL)
docker-compose up -d               # Start MySQL
docker-compose down                # Stop

# Tests
cd backend && npm test             # Jest tests
cd frontend && npm test            # Vitest tests
```

---

## Architecture

```
kazoku/
├── backend/
│   ├── src/
│   │   ├── controllers/       # Business logic
│   │   ├── models/            # Database queries
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Auth, rate limit
│   │   ├── config/            # DB, JWT config
│   │   └── utils/             # Helpers
│   └── tests/                 # Jest tests
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── pages/             # Route pages
│   │   ├── contexts/          # Auth context
│   │   └── lib/               # API client
│   └── tests/                 # Vitest tests
├── database/
│   ├── schema.sql             # DB schema
│   └── seeds.sql              # Test data
└── docker-compose.yml         # MySQL service
```

---

## Règles Spécifiques

1. **Auth obligatoire** : Tous les endpoints (sauf /auth) requièrent JWT
2. **Ownership check** : Vérifier `user_id` ou `created_by` avant modification
3. **Rate limiting** : Appliqué sur toutes les routes API
4. **UTF-8** : Charset utf8mb4 obligatoire (caractères accentués)

---

## Bugs Connus

Voir `Known-Bugs.md` pour la liste des bugs à corriger.

---

**Version** : 1.0.0 | **Dernière mise à jour** : 2026-02-01
