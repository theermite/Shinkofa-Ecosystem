# Architecture - [Nom Projet Next.js]

> Vue d'ensemble de l'architecture Next.js 14 App Router.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🏗️ Vue d'Ensemble

### Type de Projet
**Next.js 14 Application** (SSR + SSG + ISR)

### Stack Technique

| Composant | Technologie | Version | Raison |
|-----------|-------------|---------|--------|
| **Framework** | Next.js | 14.x | App Router, Server Components, RSC, streaming |
| **Runtime** | Node.js | 18+ | ES modules, native fetch, performance |
| **Styling** | TailwindCSS | 3.x | Utility-first, tree-shakable, DX |
| **Base de données** | PostgreSQL | 15+ | Relations, ACID, maturité |
| **ORM** | Prisma | 5.x | Type-safe queries, migrations, DX moderne |
| **Auth** | NextAuth.js | 5.x | OAuth, credentials, session management |
| **State** | React Context + Zustand | - | Server state → RSC, client state → Zustand |
| **Cache** | Redis (optionnel) | 7+ | ISR cache, session store |

---

## 📐 Architecture Système

### Diagramme Haut Niveau

```
┌─────────────────┐
│  Client Browser │
└────────┬────────┘
         │
    ┌────▼────┐
    │ Vercel  │ (ou VPS Nginx)
    │  CDN    │
    └────┬────┘
         │
┌────────▼─────────┐
│   Next.js 14     │
│   App Router     │ ← Server Components (RSC)
│   (Node.js)      │ ← API Routes (/app/api)
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼──────┐
│Prisma │ │ Redis   │
│  ORM  │ │(Cache)  │
└───┬───┘ └─────────┘
    │
┌───▼──────────┐
│ PostgreSQL   │
│   Database   │
└──────────────┘
```

### Description des Composants

#### Next.js 14 App Router
- **Rôle** : Fullstack framework (frontend + backend)
- **Responsabilités** :
  - **Server Components (RSC)** : Render côté serveur, streaming, zero JS client
  - **Client Components** : Interactivité browser (useState, useEffect)
  - **API Routes** : Endpoints REST (`/app/api/[...]/route.ts`)
  - **Server Actions** : Mutations server-side (`use server` directive)
  - **Routing** : File-system based (`/app` directory)
  - **Caching** : Data cache, full route cache, request memoization
  - **ISR** : Incremental Static Regeneration (revalidation auto)
- **Patterns** :
  - Server Components par défaut (`page.tsx`, `layout.tsx`)
  - Client Components explicites (`'use client'`)
  - Data fetching dans Server Components (async/await)
  - Mutations via Server Actions (progressif enhancement)

#### Prisma ORM
- **Rôle** : Database toolkit
- **Responsabilités** :
  - Type-safe queries (génération types TypeScript)
  - Migrations (`prisma migrate`)
  - Schema modeling (`schema.prisma`)
  - Connection pooling
- **Avantages** :
  - DX excellent (autocomplete)
  - Pas de SQL raw (sauf cas complexes)
  - Migrations versionnées

#### NextAuth.js v5
- **Rôle** : Authentication
- **Responsabilités** :
  - OAuth providers (Google, GitHub, etc.)
  - Credentials provider (email/password)
  - Session management (JWT ou database)
  - CSRF protection
- **Integration** :
  - Middleware Next.js pour protection routes
  - Server Actions authentication context

#### Base de Données (PostgreSQL + Redis)
- **PostgreSQL** :
  - Persistence données relationnelles
  - Schéma : Voir [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md)
  - Migrations : Prisma Migrate
- **Redis (optionnel)** :
  - Cache ISR (si pas Vercel)
  - Session store (NextAuth database strategy)
  - Rate limiting

---

## 🎨 Rendering Strategies

### SSR (Server-Side Rendering)
**Quand** : Données dynamiques, personnalisées par user

```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  const session = await auth(); // NextAuth
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return <Dashboard user={user} />; // Render serveur, fresh data
}
```

**Avantages** : SEO, data fraîche, pas de flash content
**Inconvénients** : Latence serveur (TTFB)

---

### SSG (Static Site Generation)
**Quand** : Contenu statique, rarement modifié (blog, docs)

```typescript
// app/blog/[slug]/page.tsx
export async function generateStaticParams() {
  const posts = await prisma.post.findMany();
  return posts.map(post => ({ slug: post.slug }));
}

export default async function BlogPost({ params }) {
  const post = await prisma.post.findUnique({ where: { slug: params.slug } });
  return <Article post={post} />;
}
```

**Avantages** : Performance maximale (CDN), coût serveur minimal
**Inconvénients** : Build time si milliers de pages

---

### ISR (Incremental Static Regeneration)
**Quand** : Mélange statique + mise à jour périodique

```typescript
// app/products/page.tsx
export const revalidate = 3600; // Revalidate toutes les heures

export default async function ProductsPage() {
  const products = await prisma.product.findMany();
  return <ProductList products={products} />;
}
```

**Avantages** : Best of both (SSG performance + SSR freshness)
**Inconvénients** : Cache invalidation complexe

---

## 🔐 Sécurité

### Authentification (NextAuth.js)
- **Providers** :
  - OAuth : Google, GitHub (social login)
  - Credentials : Email/password (custom backend)
- **Sessions** :
  - **Strategy JWT** (par défaut) : Token signé dans cookie httpOnly
  - **Strategy Database** (optionnel) : Session table PostgreSQL
- **Protection Routes** :
  - Middleware Next.js (`middleware.ts`)
  - Server Components : `await auth()` check
  - Client Components : `useSession()` hook

**Exemple Middleware** :
```typescript
// middleware.ts
import { auth } from '@/auth';

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', req.url));
  }
});

export const config = { matcher: ['/dashboard/:path*'] };
```

### Autorisation (RBAC)
- **Modèle** : Role-Based Access Control
- **Rôles** :
  - `admin` : CRUD complet
  - `user` : CRUD propres ressources
  - `guest` : Lecture seule
- **Implémentation** : Helper `authorize(user, action, resource)`

### Protection
- ✅ HTTPS obligatoire (Vercel auto, ou Let's Encrypt)
- ✅ CSRF protection (NextAuth built-in)
- ✅ CSP headers (Content Security Policy)
- ✅ Rate limiting (Vercel Edge Middleware ou Upstash)
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS prevention (React auto-escaping)

---

## 🚀 Déploiement

### Environnements

| Env | URL | Purpose | Deploy |
|-----|-----|---------|--------|
| **LOCAL** | localhost:3000 | Dev | `npm run dev` |
| **PREVIEW** | [branch]-[project].vercel.app | PR review | Auto (push branch) |
| **STAGING** | staging.domain.com | Pre-prod | Auto (push develop) |
| **PRODUCTION** | domain.com | Production | Auto (push main) |

### Architecture Déploiement (Vercel)

```
┌─────────────────────────────────┐
│  Vercel Edge Network (CDN)      │ ← Static assets, ISR cache
└────────────┬────────────────────┘
             │
    ┌────────▼────────┐
    │  Next.js        │ ← Serverless Functions (API Routes, SSR)
    │  Lambdas        │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──────┐     ┌───▼────┐
│PostgreSQL│     │ Redis  │
│ (Vercel  │     │(Upstash│
│Postgres) │     │ ou ext)│
└──────────┘     └────────┘
```

### Architecture Déploiement (VPS/Docker)

```
┌─────────────────────────────────┐
│  Nginx (Reverse Proxy + SSL)    │
│  Port 80/443                     │
└────────────┬────────────────────┘
             │
    ┌────────▼────────┐
    │  Next.js        │ ← Node.js standalone output
    │  (Docker)       │
    │  Port 3000      │
    └────────┬────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼──────┐     ┌───▼────┐
│PostgreSQL│     │ Redis  │
│ :5432    │     │ :6379  │
└──────────┘     └────────┘
```

**Docker Compose** : Voir `.claude/docker/docker-compose.yml`

---

## 📊 Performance

### Stratégies

| Technique | Implémentation | Impact |
|-----------|----------------|--------|
| **Server Components** | `page.tsx` par défaut | Zero JS client → FCP rapide |
| **Streaming** | `<Suspense>` boundaries | TTFB rapide, progressive loading |
| **Image Optimization** | `<Image>` component | Lazy load, WebP auto, responsive |
| **Font Optimization** | `next/font` | Self-host, preload, zero CLS |
| **Code Splitting** | Automatic (route-based) | Smaller bundles |
| **Data Cache** | `fetch()` cache auto | Reduce DB queries |

### Métriques Cibles

| Métrique | Cible | Actuel |
|----------|-------|--------|
| **First Contentful Paint** | < 1.5s | [MEASURE] |
| **Largest Contentful Paint** | < 2.5s | [MEASURE] |
| **Time to Interactive** | < 3.5s | [MEASURE] |
| **Cumulative Layout Shift** | < 0.1 | [MEASURE] |
| **First Input Delay** | < 100ms | [MEASURE] |

**Monitoring** : Vercel Analytics ou Google Lighthouse CI

---

## 🗂️ Structure Fichiers

```
nextjs-app/
├── app/                      # App Router (Next.js 14)
│   ├── (auth)/               # Route group (layout sans /auth path)
│   │   ├── login/
│   │   └── register/
│   ├── dashboard/            # Protected route
│   │   ├── page.tsx          # /dashboard
│   │   ├── layout.tsx        # Shared layout
│   │   └── settings/
│   ├── api/                  # API Routes
│   │   ├── auth/[...nextauth]/route.ts
│   │   └── users/route.ts
│   ├── layout.tsx            # Root layout
│   ├── page.tsx              # Homepage /
│   └── globals.css
├── components/
│   ├── ui/                   # Atomic components (Button, Input)
│   └── features/             # Feature components (UserProfile)
├── lib/
│   ├── prisma.ts             # Prisma client singleton
│   ├── auth.ts               # NextAuth config
│   └── utils.ts
├── prisma/
│   ├── schema.prisma         # Database schema
│   └── migrations/
├── public/                   # Static assets
├── middleware.ts             # Edge middleware (auth, redirects)
├── next.config.js
└── package.json
```

---

## 🔄 Flux de Données

### Exemple : Page Dashboard (SSR)

```
1. User → GET /dashboard
   ↓
2. Middleware → Check auth (NextAuth JWT cookie)
   ↓
3. Server Component → Fetch user data (Prisma)
   ↓
4. Server → Render HTML
   ↓
5. Client → Hydrate (minimal JS)
```

### Exemple : Mutation (Server Action)

```
1. Client → Form submit (progressif enhancement, works sans JS)
   ↓
2. Server Action → Validate input (Zod)
   ↓
3. Server Action → Prisma mutation (create/update)
   ↓
4. Server Action → Revalidate cache (revalidatePath)
   ↓
5. Client → Redirect ou update UI
```

**Code Exemple** :
```typescript
// app/dashboard/actions.ts
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
  const name = formData.get('name') as string;

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name }
  });

  revalidatePath('/dashboard'); // Invalide cache
}
```

---

## 📝 Décisions Architecture (ADR)

### ADR-001 : Next.js 14 vs React SPA (Vite)
**Date** : [DATE]
**Décision** : Next.js 14
**Raison** : SEO critical, SSR/SSG benefits, App Router modern, full-stack
**Alternatives** : Vite SPA (pas de SSR), Remix (complexe)
**Conséquences** : Vendor lock-in Vercel (ou config Docker complexe)

### ADR-002 : Prisma vs Drizzle ORM
**Date** : [DATE]
**Décision** : Prisma
**Raison** : DX mature, migrations robustes, type-safety excellent
**Alternatives** : Drizzle (plus léger, moins mature)
**Conséquences** : Runtime overhead léger (acceptable pour projet)

### ADR-003 : NextAuth.js vs Clerk
**Date** : [DATE]
**Décision** : NextAuth.js
**Raison** : Open-source, flexible, self-hosted, pas de coût par MAU
**Alternatives** : Clerk (UI pré-fait, payant), Auth0 (cher)
**Conséquences** : Plus de setup manuel (OAuth config, UI custom)

---

## 🔗 Voir Aussi

- [API_REFERENCE.md](API_REFERENCE.md) - API Routes & Server Actions
- [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) - Prisma schema
- [CODING_STANDARDS.md](CODING_STANDARDS.md) - TypeScript + Next.js conventions
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Vitest + Playwright E2E

---

**Maintenu par** : [Équipe] | **Revue recommandée** : À chaque changement architecture majeur
