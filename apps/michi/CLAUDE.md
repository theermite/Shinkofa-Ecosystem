# CLAUDE.md - Michi (道)

> Plateforme principale de coaching holistique Shinkofa.
>
> **Hérite de** : `../../.claude/CLAUDE.md` (monorepo) → `D:\30-Dev-Projects\.claude\CLAUDE.md` (workspace)

---

## 🎯 Identité

**Michi** (道 = "La Voie") — Application web Next.js 15 pour le coaching holistique.

| Aspect | Valeur |
|--------|--------|
| **Type** | PWA / Web App |
| **Framework** | Next.js 15, React 19, TypeScript |
| **Styling** | TailwindCSS 3.x |
| **API Backend** | api-shizen (FastAPI) |
| **Port dev** | 3003 |
| **Status** | 🟡 En développement actif |

---

## 📁 Structure

```
apps/michi/
├── src/
│   ├── app/              # App Router (Next.js 15)
│   ├── components/       # Composants React
│   ├── hooks/            # Custom hooks
│   ├── lib/              # Utilitaires
│   ├── services/         # API calls
│   └── types/            # TypeScript types
├── public/               # Assets statiques
├── .env.local            # Dev local (bypass auth)
├── .env.production       # Production (app.shinkofa.com)
└── CLAUDE.md             # CE FICHIER
```

---

## 🌐 Environnements

| Env | URL | Fichier | Backend |
|-----|-----|---------|---------|
| **LOCAL** | localhost:3003 | `.env.local` | localhost:8000 |
| **PRODUCTION** | app.shinkofa.com | `.env.production` | app.shinkofa.com/api |

> ⚠️ **IMPORTANT** : Il n'y a plus d'environnement "alpha". Uniquement LOCAL et PRODUCTION.

---

## 🚀 Commandes

```bash
# Dev local
pnpm dev                    # Port 3003

# Build production
pnpm build

# Lint
pnpm lint
```

---

## 🔗 Dépendances Internes

| Package | Usage |
|---------|-------|
| `@shinkofa/types` | Types partagés |
| `@shinkofa/utils` | Utilitaires communs |
| `api-shizen` | Backend IA/API |

---

## ⚠️ Points d'Attention

1. **Auth Bypass** : En local, `NEXT_PUBLIC_DEV_AUTH_BYPASS=true` simule un utilisateur
2. **API URLs** : Toujours vérifier que les URLs pointent vers le bon environnement
3. **Pas d'alpha** : L'environnement "alpha" n'existe plus, utiliser PRODUCTION pour tests réels

---

## 📋 Checklist Avant Commit

- [ ] `pnpm lint` passe
- [ ] `pnpm build` réussit
- [ ] Pas de secrets hardcodés
- [ ] URLs d'API correctes pour l'environnement cible

---

**Version** : 1.0.0 | **Date** : 2026-01-31
