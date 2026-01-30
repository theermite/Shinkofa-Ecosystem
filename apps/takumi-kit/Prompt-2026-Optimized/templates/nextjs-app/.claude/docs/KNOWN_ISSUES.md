# Known Issues - [Nom Projet Next.js]

> Problèmes connus, limitations, et workarounds.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🐛 Bugs Connus

### HIGH Priority

#### #001 : [Titre Bug]
**Status** : 🔴 Open | **Priorité** : HIGH | **Version** : 1.0.0

**Description** :
[Description détaillée du bug]

**Steps to Reproduce** :
1. [Étape 1]
2. [Étape 2]
3. [Étape 3]

**Expected Behavior** :
[Ce qui devrait se passer]

**Actual Behavior** :
[Ce qui se passe réellement]

**Workaround** :
```
[Code ou actions pour contourner temporairement]
```

**Fix Planned** : v1.0.1 (ETA: YYYY-MM-DD)

---

### MEDIUM Priority

#### #002 : Blog ISR cache parfois pas invalidé après publication
**Status** : 🟡 In Progress | **Priorité** : MEDIUM | **Version** : 1.0.0

**Description** :
Quand admin publie nouveau blog post, page `/blog` montre parfois ancien contenu pendant plusieurs minutes (au lieu d'ISR revalidation immédiate).

**Root Cause** :
`revalidatePath()` dans Server Action ne flush pas toujours cache Vercel Edge Network.

**Workaround** :
Force revalidation manuelle :
```typescript
// app/admin/blog/actions.ts
'use server';

import { revalidatePath, revalidateTag } from 'next/cache';

export async function publishPost(postId: number) {
  await prisma.post.update({ where: { id: postId }, data: { published: true } });

  // Double revalidation
  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidateTag('blog-posts'); // Tag-based revalidation
}
```

**Fix Planned** : v1.1.0
- Implémenter tag-based revalidation systématique
- Ajouter webhook CMS → API route `/api/revalidate`

---

### LOW Priority

#### #003 : Dark mode toggle flicker sur hydration
**Status** : 🟢 Acknowledged | **Priorité** : LOW | **Version** : 1.0.0

**Description** :
Quand user visite site avec dark mode préférence système, flash de white screen avant dark mode s'applique (hydration delay).

**Root Cause** :
Theme state initié côté client (`useEffect`) → re-render après hydration.

**Workaround** :
Inline script dans `<head>` pour set theme AVANT hydration :
```typescript
// app/layout.tsx
export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') ||
                  (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.add(theme);
              })();
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**Fix Planned** : v1.0.2 (migrate vers `next-themes` library)

---

## ⚠️ Limitations Techniques

### Next.js 14

#### Limitation #1 : Server Actions timeout (10s max)
**Impact** : Operations longues (bulk import, exports) timeout

**Context** :
Vercel serverless functions timeout après 10s (hobby tier) ou 60s (pro).

**Solution Future** :
- v1.2 : Migrate operations longues vers Background Jobs (Inngest/Trigger.dev)
- Ou : Queue system (BullMQ + Redis)

**Workaround Actuel** :
- Paginate bulk operations (process 100 items/request)
- Afficher progress bar (polling API)

---

#### Limitation #2 : Edge Middleware limitations (1MB code, 4MB response)
**Impact** : Pas possible faire fetches complexes dans middleware (auth check DB)

**Context** :
Edge Middleware run sur Edge Network (pas Node.js) → limitations runtime.

**Solution Future** :
- v1.3 : Migrate auth check vers helper functions (appelé dans pages)

**Workaround Actuel** :
- Auth check dans middleware = JWT verification only (pas DB lookup)
- DB lookup dans page Server Component

---

### Vercel Deployment

#### Limitation #3 : Build time max 15min (hobby tier)
**Impact** : Si milliers de pages SSG, build timeout

**Context** :
`generateStaticParams` génère toutes pages build-time → timeout si >5000 pages.

**Solution Future** :
- v2.0 : Utiliser `dynamicParams = true` (fallback ISR)
- Ou : Incremental adoption (SSG seulement top 1000 pages)

**Workaround Actuel** :
- Limiter `generateStaticParams` à 1000 pages max
- Autres pages → SSR ou ISR on-demand

---

## 🔧 Workarounds Temporaires

### Workaround #1 : Contact form double submission

**Problème** : Users peuvent submit form multiple fois (spam).

**Workaround** :
Client-side disable button après submit + Server Action check duplicate :
```typescript
'use client';

import { useFormStatus } from 'react-dom';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending}>
      {pending ? 'Sending...' : 'Send'}
    </button>
  );
}
```

```typescript
'use server';

// Cache recent submissions (Redis ou in-memory Map)
const recentSubmissions = new Map<string, number>();

export async function submitContactForm(formData: FormData) {
  const email = formData.get('email') as string;
  const lastSubmit = recentSubmissions.get(email);

  if (lastSubmit && Date.now() - lastSubmit < 60000) {
    throw new Error('Please wait 1 minute before submitting again');
  }

  recentSubmissions.set(email, Date.now());
  // ... rest of logic
}
```

**Fix Permanent** : v1.0.1 → Rate limiting proper (Upstash Rate Limit)

---

### Workaround #2 : Images CMS pas optimisées (format, size)

**Problème** :
Admin upload images lourdes (5MB PNG) → slow page load.

**Workaround** :
Validation côté client avant upload :
```typescript
const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // Check size (max 2MB)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be < 2MB');
    return;
  }

  // Check format
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    alert('Only JPEG, PNG, WebP allowed');
    return;
  }

  // Upload...
};
```

**Fix Permanent** : v1.1 → Image optimization pipeline server-side (Sharp)

---

## 🚨 Security Considerations

### Consideration #1 : Server Actions CSRF protection
**Risk Level** : ⚠️ MEDIUM

**Context** :
Server Actions vulnérables CSRF si pas de token check.

**Mitigation Actuelle** :
- Next.js 14 built-in CSRF protection (origin check)
- SameSite=Lax cookies

**Amélioration Future** : v1.2 → Double Submit Cookie pattern (explicit)

---

### Consideration #2 : Rate limiting basé sur IP (proxy/NAT issue)
**Risk Level** : ⚠️ LOW

**Context** :
Users derrière proxy corporatif partagent IP → false positives rate limiting.

**Mitigation Actuelle** :
- Rate limit généreux (5 req/10min)
- Whiteliste IPs connus

**Amélioration Future** : v1.2 → Captcha v3 (score-based) au lieu de rate limiting strict

---

## 📊 Performance Bottlenecks

### Bottleneck #1 : CMS fetches non cachés (build time)
**Impact** : Build time >5min si >1000 blog posts

**Query Problématique** :
```typescript
// Fetch ALL posts at build (slow)
const posts = await cms.getPosts({ limit: 10000 });
```

**Workaround** :
Limiter fetch build-time, rest ISR on-demand :
```typescript
export async function generateStaticParams() {
  const posts = await cms.getPosts({ limit: 100 }); // Top 100 only
  return posts.map(post => ({ slug: post.slug }));
}

export const dynamicParams = true; // Autres posts ISR on-demand
```

**Fix Permanent** : v1.1 → Incremental Static Generation strategy

---

### Bottleneck #2 : Prisma Client queries lentes (missing indexes)
**Impact** : Admin dashboard slow (>2s load)

**Root Cause** :
Query filtrant sur `publishedAt` sans index.

**Workaround** :
Ajouter index Prisma schema :
```prisma
model Post {
  // ...
  publishedAt DateTime?

  @@index([publishedAt])
}
```

Run migration :
```bash
npx prisma migrate dev --name add_published_at_index
```

**Fix Permanent** : v1.0.1 → Audit toutes queries + indexes

---

## 🔗 Références

- **Issue Tracker** : [Lien vers GitHub Issues]
- **Vercel Status** : https://vercel-status.com
- **Next.js Discussions** : https://github.com/vercel/next.js/discussions

---

## 📝 Comment Reporter un Bug

1. **Vérifier Known Issues** (ce fichier)
2. **Chercher dans Issues** : [GitHub Issues](https://github.com/user/repo/issues)
3. **Créer nouveau issue** :
   - Template : `.github/ISSUE_TEMPLATE/bug_report.md`
   - Labels : `bug`, `priority:high/medium/low`
4. **Inclure** :
   - Next.js version (`npx next info`)
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots si applicable
   - Browser (Chrome, Firefox, Safari)

---

**Maintenu par** : Dev Team | **Review** : À chaque sprint
