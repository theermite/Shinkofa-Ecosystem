# Coding Standards - [Nom Projet Next.js]

> Standards TypeScript + Next.js 14.

---

## 🎯 TypeScript (Next.js 14)

### Style Guide
**Base** : Airbnb TypeScript + Next.js conventions

**Formatter** : Prettier
**Linter** : ESLint (`eslint-config-next`)
**Type Checker** : TypeScript strict mode

### Conventions Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | camelCase | `userId`, `isActive` |
| Fonctions | camelCase | `getCurrentUser()` |
| Components | PascalCase | `UserProfile`, `DashboardLayout` |
| Server Actions | camelCase | `updateProfile()`, `createPost()` |
| API Routes | kebab-case (file) | `app/api/users/route.ts` |
| Types/Interfaces | PascalCase | `User`, `PostWithAuthor` |
| Enums | PascalCase | `UserRole` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT = 3` |
| Fichiers composants | PascalCase.tsx | `UserProfile.tsx` |
| Fichiers utils | camelCase.ts | `formatDate.ts` |
| Fichiers routes | lowercase | `page.tsx`, `layout.tsx`, `route.ts` |

---

## 🏗️ Structure Composants

### Server Component (par défaut)

```typescript
// app/dashboard/page.tsx
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// Server Component = async function
export default async function DashboardPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });

  return (
    <div className="dashboard">
      <h1>Welcome {user.name}</h1>
    </div>
  );
}
```

**Caractéristiques** :
- ✅ `async function` (fetch data server-side)
- ✅ Pas de `'use client'`
- ✅ Zero JS client
- ❌ Pas de hooks (`useState`, `useEffect`)
- ❌ Pas d'event handlers (`onClick`, etc.)

---

### Client Component

```typescript
// components/LoginForm.tsx
'use client'; // ⚠️ OBLIGATOIRE en haut

import { useState } from 'react';
import { signIn } from 'next-auth/react';

export function LoginForm() {
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn('credentials', { email });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Login</button>
    </form>
  );
}
```

**Caractéristiques** :
- ✅ `'use client'` directive
- ✅ Hooks autorisés
- ✅ Event handlers
- ❌ Pas de data fetching async (utiliser Server Components parents)

---

### Composition Server + Client

```typescript
// app/dashboard/page.tsx (Server Component)
import { auth } from '@/lib/auth';
import { UserProfile } from '@/components/UserProfile'; // Client Component

export default async function DashboardPage() {
  const session = await auth();
  // Data fetching server-side
  const user = await fetch(`/api/users/${session.user.id}`).then(r => r.json());

  return (
    <div>
      {/* Pass data as props to Client Component */}
      <UserProfile user={user} />
    </div>
  );
}
```

**Best Practice** : Fetch data dans Server Component, passer props aux Client Components.

---

## 🎯 Server Actions

### Structure

```typescript
// app/dashboard/actions.ts
'use server'; // ⚠️ OBLIGATOIRE en haut

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema validation Zod
const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
});

export async function updateProfile(formData: FormData) {
  // 1. Auth check
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  // 2. Validation
  const validated = updateProfileSchema.parse({
    name: formData.get('name'),
  });

  // 3. Mutation
  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: validated.name },
  });

  // 4. Revalidate cache
  revalidatePath('/dashboard');

  // 5. Return result
  return { success: true };
}
```

**Best Practices** :
- ✅ `'use server'` en haut de fichier
- ✅ Validation Zod systématique
- ✅ Auth check obligatoire
- ✅ Error handling (`try/catch`)
- ✅ Revalidate cache après mutation
- ✅ TypeScript strict (types retour explicites)

---

## 📂 Structure Fichiers

### App Router Convention

```
app/
├── (auth)/              # Route group (pas de /auth dans URL)
│   ├── login/page.tsx
│   └── layout.tsx       # Shared layout pour auth pages
├── dashboard/
│   ├── page.tsx         # /dashboard
│   ├── layout.tsx       # Layout avec sidebar
│   ├── actions.ts       # Server Actions
│   └── settings/
│       └── page.tsx     # /dashboard/settings
├── api/
│   └── users/
│       └── route.ts     # GET/POST /api/users
├── layout.tsx           # Root layout (global)
├── page.tsx             # Homepage /
└── globals.css
```

**Fichiers Spéciaux** :
- `page.tsx` : Route publique (URL)
- `layout.tsx` : Shared layout
- `loading.tsx` : Loading UI (Suspense auto)
- `error.tsx` : Error boundary
- `route.ts` : API Route (REST)
- `actions.ts` : Server Actions

---

## 🔐 Sécurité

### Auth Check (Server Component)

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await auth();
  if (!session) redirect('/login');

  // Page accessible seulement si authentifié
}
```

### Auth Check (Server Action)

```typescript
'use server';

import { auth } from '@/lib/auth';

export async function deletePost(postId: number) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (post.authorId !== session.user.id) {
    throw new Error('Forbidden'); // Pas owner
  }

  await prisma.post.delete({ where: { id: postId } });
}
```

### Input Validation (Zod)

```typescript
import { z } from 'zod';

const createPostSchema = z.object({
  title: z.string().min(5).max(200),
  content: z.string().max(10000),
  published: z.boolean().default(false),
});

export async function createPost(formData: FormData) {
  const validated = createPostSchema.parse({
    title: formData.get('title'),
    content: formData.get('content'),
    published: formData.get('published') === 'true',
  });

  // validated est type-safe
}
```

---

## 🎨 Styling (TailwindCSS)

### Conventions

```typescript
// ✅ Préférer Tailwind classes
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// ✅ Utiliser cn() helper pour conditional classes
import { cn } from '@/lib/utils';

<div className={cn(
  "base-class",
  isActive && "active-class",
  isDisabled && "opacity-50"
)}>
  Content
</div>

// ⚠️ CSS Modules si besoin (rare)
import styles from './Component.module.css';
<div className={styles.container}>...</div>
```

---

## 📊 Performance

### Image Optimization

```typescript
import Image from 'next/image';

// ✅ Toujours utiliser <Image> (pas <img>)
<Image
  src="/avatar.jpg"
  alt="User avatar"
  width={200}
  height={200}
  priority // Si above fold
/>
```

### Font Optimization

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
```

### Code Splitting

```typescript
// ✅ Dynamic imports pour lazy loading
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
  loading: () => <Spinner />,
});

// Charge seulement quand utilisé
<HeavyComponent />
```

---

## 🧪 Tests

### Fichiers Tests

```
components/
├── UserProfile.tsx
└── UserProfile.test.tsx    # Colocated test
```

### Convention Nommage

```typescript
describe('UserProfile', () => {
  it('should display user name', () => {
    // Test...
  });

  it('should call onEdit when edit button clicked', () => {
    // Test...
  });
});
```

---

## 🚨 Anti-Patterns

### Next.js 14

- ❌ `'use client'` partout (utiliser Server Components par défaut)
- ❌ Data fetching dans Client Components (faire dans Server Components)
- ❌ `useEffect` pour fetch data (utiliser Server Components)
- ❌ API Routes pour mutations internes (utiliser Server Actions)

### TypeScript

- ❌ `any` type (utiliser `unknown` si vraiment nécessaire)
- ❌ Non-null assertion `!` (utiliser optional chaining `?.`)
- ❌ Ignorer errors TypeScript (`@ts-ignore`)

### Général

- ❌ `console.log` en production (utiliser logger)
- ❌ Secrets hardcodés (utiliser `.env.local`)
- ❌ Nested ternaries (utiliser if/else)

---

## 🔧 Tools Config

### ESLint (`.eslintrc.json`)

```json
{
  "extends": "next/core-web-vitals",
  "rules": {
    "react/no-unescaped-entities": "off",
    "@next/next/no-html-link-for-pages": "off"
  }
}
```

### Prettier (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100
}
```

### TypeScript (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

---

## ✅ Pre-Commit Checklist

- [ ] `npm run lint` (ESLint)
- [ ] `npm run type-check` (TypeScript)
- [ ] `npm run test` (Tests)
- [ ] Pas de `console.log` debug
- [ ] Pas de secrets hardcodés

---

**Version** : 1.0 | **Maintenu par** : Dev Team
