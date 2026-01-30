# API Reference - [Nom Projet Next.js]

> Documentation complète API Routes + Server Actions.

**Base URL** : `https://domain.com` (prod) | `http://localhost:3000` (local)
**Version** : v1
**Format** : JSON
**Auth** : NextAuth.js Session

---

## 🏗️ Architecture API

### Deux Approches Disponibles

| Type | Usage | Exemple |
|------|-------|---------|
| **API Routes** | REST endpoints classiques, API publique | `app/api/users/route.ts` |
| **Server Actions** | Mutations server-side, forms | `'use server'` functions |

**Recommandation** :
- ✅ **Server Actions** pour mutations internes (forms, CRUD)
- ✅ **API Routes** pour :
  - API publique/externe
  - Webhooks
  - Intégrations tierces

---

## 🔐 Authentication

### NextAuth.js Session

**Headers** : Cookie `next-auth.session-token` (httpOnly, auto)

**Server Component** :
```typescript
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth();
  if (!session) redirect('/login');

  // session.user.id, session.user.email, etc.
}
```

**Client Component** :
```typescript
'use client';
import { useSession } from 'next-auth/react';

export function Component() {
  const { data: session, status } = useSession();
  if (status === 'loading') return <Spinner />;
  if (!session) return <LoginButton />;

  return <div>Hello {session.user.name}</div>;
}
```

---

## 🚀 Server Actions

### POST /dashboard/profile (Server Action)
Mettre à jour profil utilisateur.

**Fichier** : `app/dashboard/actions.ts`

```typescript
'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const updateProfileSchema = z.object({
  name: z.string().min(2).max(100),
});

export async function updateProfile(formData: FormData) {
  const session = await auth();
  if (!session) throw new Error('Unauthorized');

  const validated = updateProfileSchema.parse({
    name: formData.get('name'),
  });

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: validated.name },
  });

  revalidatePath('/dashboard');
  return { success: true };
}
```

**Usage (Client Component)** :
```typescript
'use client';

import { updateProfile } from './actions';
import { useFormStatus } from 'react-dom';

export function ProfileForm() {
  return (
    <form action={updateProfile}>
      <input name="name" type="text" required />
      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button disabled={pending}>Save</button>;
}
```

**Avantages** :
- ✅ Progressif enhancement (fonctionne sans JS)
- ✅ Pas besoin d'endpoint REST
- ✅ Type-safe (TypeScript)
- ✅ Revalidation cache facile

---

## 📡 API Routes

### GET /api/users
Liste utilisateurs (exemple API publique).

**Fichier** : `app/api/users/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const skip = parseInt(searchParams.get('skip') || '0');
  const take = parseInt(searchParams.get('take') || '10');

  const users = await prisma.user.findMany({
    skip,
    take,
    select: { id: true, name: true, email: true },
  });

  return NextResponse.json({ users, skip, take });
}
```

**Request** :
```bash
GET /api/users?skip=0&take=10
```

**Response 200** :
```json
{
  "users": [
    { "id": 1, "name": "John Doe", "email": "john@example.com" },
    { "id": 2, "name": "Jane Doe", "email": "jane@example.com" }
  ],
  "skip": 0,
  "take": 10
}
```

---

### POST /api/users
Créer utilisateur (inscription).

**Fichier** : `app/api/users/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hash } from 'bcrypt';
import { z } from 'zod';

const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createUserSchema.parse(body);

    const hashedPassword = await hash(validated.password, 10);

    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        password: hashedPassword,
      },
      select: { id: true, email: true, name: true },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
```

**Request** :
```json
POST /api/users
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePass123!",
  "name": "New User"
}
```

**Response 201** :
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "name": "New User"
}
```

---

### GET /api/users/[id]
Récupérer utilisateur par ID.

**Fichier** : `app/api/users/[id]/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(params.id) },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json(user);
}
```

**Request** :
```bash
GET /api/users/1
```

**Response 200** :
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "createdAt": "2026-01-28T10:00:00.000Z"
}
```

---

## 🚨 Codes d'Erreur

| Code | Signification | Exemple |
|------|---------------|---------|
| 200 | OK | Succès GET |
| 201 | Created | Ressource créée |
| 204 | No Content | Suppression succès |
| 400 | Bad Request | Validation error (Zod) |
| 401 | Unauthorized | Session manquante/invalide |
| 403 | Forbidden | Permissions insuffisantes |
| 404 | Not Found | Ressource inexistante |
| 500 | Internal Server Error | Bug serveur |

**Format erreur** :
```json
{
  "error": "Error message",
  "errors": [...]  // Si validation Zod
}
```

---

## 📊 Rate Limiting

**Vercel** : Built-in Edge Middleware

**VPS/Custom** : Upstash Rate Limit

```typescript
// middleware.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export default async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Too Many Requests', { status: 429 });
  }
}
```

**Limites** :
- **API publique** : 30 req/10s par IP
- **API authentifiée** : 100 req/10s par user

---

## 🔄 Cache & Revalidation

### Cache Stratégies

| Méthode | Usage | Exemple |
|---------|-------|---------|
| **Time-based** | Revalidate après X secondes | `export const revalidate = 3600` |
| **On-demand** | Revalidate via Server Action | `revalidatePath('/dashboard')` |
| **Tag-based** | Revalidate par tag | `revalidateTag('users')` |

**Exemple Time-based** :
```typescript
// app/blog/page.tsx
export const revalidate = 3600; // 1 heure

export default async function BlogPage() {
  const posts = await prisma.post.findMany();
  return <PostList posts={posts} />;
}
```

**Exemple On-demand** :
```typescript
// app/dashboard/actions.ts
'use server';

import { revalidatePath } from 'next/cache';

export async function createPost(formData: FormData) {
  await prisma.post.create({ ... });
  revalidatePath('/blog'); // Invalide cache /blog
}
```

**Exemple Tag-based** :
```typescript
// Fetch avec tag
const posts = await fetch('https://api.example.com/posts', {
  next: { tags: ['posts'] }
});

// Revalidate tag
import { revalidateTag } from 'next/cache';
revalidateTag('posts');
```

---

## 🔗 Documentation Interactive

**Swagger** : Non supporté nativement (pas de OpenAPI auto comme FastAPI)

**Alternative** : Storybook pour composants, Postman collection pour API Routes

---

## 📝 Webhooks

### POST /api/webhooks/stripe
Exemple webhook Stripe (paiements).

**Fichier** : `app/api/webhooks/stripe/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      // Handle payment success
      await prisma.order.update({
        where: { id: session.metadata.orderId },
        data: { status: 'paid' },
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
}
```

---

**Version** : 1.0 | **Maintenu par** : Backend Team
