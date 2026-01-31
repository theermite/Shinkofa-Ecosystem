# Session State - Michi

## Environnement Actuel

| Clé | Valeur |
|-----|--------|
| **Target** | LOCAL |
| **Branche** | master |
| **Projet** | Michi |
| **Port** | 3003 |
| **Backend** | localhost:8000 |

---

## Environnements Disponibles

| Env | Fichier | Backend URL | Usage |
|-----|---------|-------------|-------|
| LOCAL | `.env.local` | localhost:8000 | Dev quotidien |
| PRODUCTION | `.env.production` | app.shinkofa.com/api | Prod réelle |

> ⚠️ **PLUS D'ALPHA** : L'environnement alpha n'existe plus.

---

## Notes Session

- Frontend Next.js 15 du monorepo Shinkofa-Ecosystem
- Dépend de `@shinkofa/types`, `@shinkofa/utils`
- Backend api-shizen (FastAPI) sur port 8000 en local
- Auth bypass actif en local (`NEXT_PUBLIC_DEV_AUTH_BYPASS=true`)

---

## Commandes Rapides

```bash
# Dev
pnpm dev

# Build
pnpm build

# Lint
pnpm lint
```

---

**Dernière mise à jour** : 2026-01-31
