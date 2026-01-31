# Next.js App - SSR/SSG Web Application Template

> Template production-ready pour applications Next.js avec Server-Side Rendering, Static Generation et SEO optimisé.

**Stack** :
- ⚡ **Framework** : Next.js 14 (App Router)
- 📘 **Language** : TypeScript
- 🎨 **Styling** : Tailwind CSS
- 🗄️ **Database** : PostgreSQL + Prisma ORM
- 🔐 **Auth** : NextAuth.js (v5)
- 🚀 **Deployment** : Vercel / Docker

**Version** : 2.0
**Setup time** : ~8 minutes
**Production-ready** : ✅

---

## 🎯 Features

### Next.js 14

- ✅ App Router (latest)
- ✅ Server Components
- ✅ Client Components
- ✅ Server Actions
- ✅ Streaming & Suspense
- ✅ Parallel Routes
- ✅ Intercepting Routes
- ✅ Route Groups
- ✅ Metadata API (SEO)
- ✅ Image Optimization
- ✅ Font Optimization
- ✅ API Routes
- ✅ Middleware

### Rendering Strategies

- ✅ SSR (Server-Side Rendering)
- ✅ SSG (Static Site Generation)
- ✅ ISR (Incremental Static Regeneration)
- ✅ CSR (Client-Side Rendering)

### Authentication

- ✅ NextAuth.js v5
- ✅ Credentials provider
- ✅ OAuth providers (Google, GitHub)
- ✅ Session management
- ✅ Protected routes
- ✅ Role-based access

### Database

- ✅ Prisma ORM
- ✅ Type-safe queries
- ✅ Migrations
- ✅ Seeding
- ✅ PostgreSQL

### SEO

- ✅ Dynamic metadata
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Sitemap generation
- ✅ robots.txt
- ✅ Schema.org structured data

### Developer Experience

- ✅ TypeScript strict mode
- ✅ ESLint configured
- ✅ Prettier
- ✅ Tailwind CSS
- ✅ Hot reload
- ✅ Tests (Vitest + Playwright)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL (or Docker)
- Git

### 1. Clone Template

```bash
cp -r templates/nextjs-app ~/my-nextjs-site
cd ~/my-nextjs-site
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment

```bash
# Copy environment template
cp .env.example .env.local

# Edit variables
nano .env.local
```

**Required variables** :
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/mydb"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 4. Setup Database

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed database (optional)
npx prisma db seed
```

### 5. Run Development Server

```bash
npm run dev
```

Open http://localhost:3000

---

## 📁 Project Structure

```
nextjs-app/
├── .claude/                      # Claude Code configuration
│   ├── CLAUDE.md
│   ├── docs/                     # Documentation
│   ├── docker/                   # Docker config
│   └── scripts/                  # Utility scripts
│
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group - Auth
│   │   ├── login/
│   │   │   └── page.tsx          # /login
│   │   └── register/
│   │       └── page.tsx          # /register
│   ├── (dashboard)/              # Route group - Dashboard
│   │   ├── layout.tsx            # Dashboard layout
│   │   ├── page.tsx              # /dashboard
│   │   ├── profile/
│   │   │   └── page.tsx          # /dashboard/profile
│   │   └── settings/
│   │       └── page.tsx          # /dashboard/settings
│   ├── api/                      # API Routes
│   │   ├── auth/
│   │   │   └── [...nextauth]/
│   │   │       └── route.ts      # NextAuth handler
│   │   ├── users/
│   │   │   └── route.ts          # GET /api/users
│   │   └── health/
│   │       └── route.ts          # Health check
│   ├── blog/                     # Blog (SSG example)
│   │   ├── page.tsx              # /blog (list)
│   │   └── [slug]/
│   │       └── page.tsx          # /blog/[slug] (detail)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Homepage /
│   ├── loading.tsx               # Global loading
│   ├── error.tsx                 # Global error
│   └── not-found.tsx             # 404 page
│
├── components/                   # React Components
│   ├── ui/                       # UI components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   └── Card.tsx
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   └── RegisterForm.tsx
│   └── providers/
│       └── Providers.tsx         # Client providers wrapper
│
├── lib/                          # Library code
│   ├── auth.ts                   # NextAuth config
│   ├── db.ts                     # Prisma client
│   ├── utils.ts                  # Utility functions
│   └── validations.ts            # Zod schemas
│
├── prisma/                       # Prisma
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # Database migrations
│   └── seed.ts                   # Seed script
│
├── public/                       # Static files
│   ├── images/
│   ├── favicon.ico
│   └── robots.txt
│
├── tests/                        # Tests
│   ├── unit/                     # Unit tests
│   └── e2e/                      # E2E tests (Playwright)
│
├── .env.example                  # Environment template
├── .env.local                    # Local environment (gitignored)
├── next.config.js                # Next.js config
├── tailwind.config.ts            # Tailwind config
├── tsconfig.json                 # TypeScript config
├── package.json
└── README.md
```

---

## 🧩 App Router Concepts

### Server Components (Default)

```tsx
// app/page.tsx - Server Component by default
export default async function HomePage() {
  // Fetch data on server
  const data = await fetch('https://api.example.com/data')
  const json = await data.json()

  return <div>{json.title}</div>
}
```

### Client Components

```tsx
// components/Counter.tsx
'use client' // Required for client components

import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

### Server Actions

```tsx
// app/actions.ts
'use server'

export async function createPost(formData: FormData) {
  const title = formData.get('title')
  // Save to database
  await db.post.create({ data: { title } })
  revalidatePath('/blog')
}

// app/blog/new/page.tsx
import { createPost } from '../actions'

export default function NewPostPage() {
  return (
    <form action={createPost}>
      <input name="title" />
      <button type="submit">Create</button>
    </form>
  )
}
```

---

## 🔐 Authentication

### NextAuth.js Configuration

```typescript
// lib/auth.ts
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from './db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Validate credentials
        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })
        if (user && verifyPassword(credentials.password, user.password)) {
          return user
        }
        return null
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
})
```

### Protected Routes

```typescript
// middleware.ts
import { auth } from './lib/auth'

export default auth((req) => {
  if (!req.auth && req.nextUrl.pathname.startsWith('/dashboard')) {
    return Response.redirect(new URL('/login', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

---

## 🎨 Styling

### Tailwind CSS

```tsx
// components/ui/Button.tsx
export function Button({ children, variant = 'primary' }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded-lg font-medium transition-colors',
        variant === 'primary' && 'bg-blue-600 text-white hover:bg-blue-700',
        variant === 'secondary' && 'bg-gray-200 text-gray-900 hover:bg-gray-300'
      )}
    >
      {children}
    </button>
  )
}
```

### Global Styles

```css
/* app/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
  }
}
```

---

## 📊 Database (Prisma)

### Schema

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  password  String
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        String   @id @default(cuid())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### Queries

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const db = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Usage
const users = await db.user.findMany()
const user = await db.user.create({ data: { email: 'user@example.com' } })
```

---

## 🔍 SEO

### Metadata API

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next'

export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await db.post.findUnique({ where: { slug: params.slug } })

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.coverImage],
    },
  }
}
```

### Sitemap

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await db.post.findMany({ where: { published: true } })

  return [
    {
      url: 'https://example.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...posts.map((post) => ({
      url: `https://example.com/blog/${post.slug}`,
      lastModified: post.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ]
}
```

---

## 🧪 Testing

### Unit Tests (Vitest)

```bash
npm test
npm run test:watch
npm run test:coverage
```

### E2E Tests (Playwright)

```bash
npm run test:e2e
npm run test:e2e:ui
```

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Production
vercel --prod
```

### Docker

```bash
# Build
docker build -t nextjs-app .

# Run
docker run -p 3000:3000 nextjs-app
```

### Environment Variables

**Production** :
- Set `DATABASE_URL` to production database
- Set `NEXTAUTH_SECRET` to secure random string
- Set `NEXTAUTH_URL` to production domain
- Configure OAuth providers

---

## 📚 Documentation

See `.claude/docs/` for complete documentation :
- **ARCHITECTURE.md** - System architecture
- **API_REFERENCE.md** - API endpoints
- **DATABASE_SCHEMA.md** - Database schema
- **CODING_STANDARDS.md** - Code standards
- **TESTING_GUIDE.md** - Testing practices

---

## 🛠️ Customization

### Add New Page

1. Create `app/my-page/page.tsx`
2. Add metadata
3. Add navigation link

### Add New API Route

1. Create `app/api/my-endpoint/route.ts`
2. Export handlers (GET, POST, etc.)
3. Add tests

---

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [App Router](https://nextjs.org/docs/app)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**Created by** : Jay The Ermite
**Template Version** : 2.0
**Last Updated** : 2026-01-26
