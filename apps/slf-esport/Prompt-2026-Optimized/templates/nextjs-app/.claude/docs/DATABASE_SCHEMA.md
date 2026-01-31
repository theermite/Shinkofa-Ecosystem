# Database Schema - [Nom Projet Next.js]

> Schéma PostgreSQL via Prisma ORM.

**Database** : PostgreSQL 15+
**ORM** : Prisma 5.x
**Migrations** : Prisma Migrate

---

## 📊 Schema (Prisma)

### Fichier `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ============================================
// Users
// ============================================

model User {
  id            Int       @id @default(autoincrement())
  email         String    @unique
  name          String
  password      String?   // Nullable si OAuth only
  role          Role      @default(USER)
  emailVerified DateTime?
  image         String?   // Avatar URL
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  // Relations
  accounts      Account[]
  sessions      Session[]
  posts         Post[]    // Exemple relation

  @@index([email])
  @@index([role])
}

enum Role {
  ADMIN
  USER
  GUEST
}

// ============================================
// NextAuth.js Tables
// ============================================

model Account {
  id                String  @id @default(cuid())
  userId            Int
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@index([userId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       Int
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ============================================
// Application Tables (Exemple)
// ============================================

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?  @db.Text
  published Boolean  @default(false)
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([authorId])
  @@index([published])
}
```

---

## 🔗 Relations

```
User (1) ──────< Account (N)   // OAuth accounts
  │
  ├──────< Session (N)          // Active sessions
  │
  └──────< Post (N)             // User posts (exemple)
```

---

## 🚀 Migrations

### Créer Migration

```bash
# 1. Modifier prisma/schema.prisma
# 2. Créer migration
npx prisma migrate dev --name add_post_table

# 3. Apply migration (auto en dev)
# 4. Generate Prisma Client (auto)
```

**Production** :
```bash
npx prisma migrate deploy
```

### Rollback

Prisma ne supporte pas rollback direct.

**Workaround** :
1. Créer nouvelle migration inverse
2. Ou reset DB : `npx prisma migrate reset` (⚠️ PERTE DONNÉES)

### Seed Database

**Fichier** : `prisma/seed.ts`

```typescript
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hash('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Seed complete');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Run** :
```bash
npx prisma db seed
```

---

## 📝 Conventions

- **Modèles** : PascalCase (`User`, `Post`)
- **Champs** : camelCase (`createdAt`, `userId`)
- **Primary keys** : `id` Integer auto-increment
- **Foreign keys** : `[model]Id` (ex: `userId`)
- **Timestamps** : `createdAt`, `updatedAt` sur tous modèles
- **Soft deletes** : Ajouter `deletedAt DateTime?` si nécessaire

---

## 🔒 Sécurité

- ✅ Passwords **JAMAIS** en clair (bcrypt hash)
- ✅ Foreign keys avec `onDelete: Cascade` (cleanup auto)
- ✅ Indexes sur champs filtrés fréquemment (email, role)
- ✅ `@db.Text` pour longs strings (>255 chars)

---

## 🛠️ Prisma Client Usage

### Singleton Pattern

**Fichier** : `lib/prisma.ts`

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Pourquoi** : Next.js Hot Reload crée nouvelles instances → connection pool exhausted.

### Queries Exemples

**Create** :
```typescript
const user = await prisma.user.create({
  data: {
    email: 'user@example.com',
    name: 'John Doe',
    password: hashedPassword,
  },
});
```

**Read** :
```typescript
const users = await prisma.user.findMany({
  where: { role: 'USER' },
  include: { posts: true },
  orderBy: { createdAt: 'desc' },
  take: 10,
});
```

**Update** :
```typescript
await prisma.user.update({
  where: { id: 1 },
  data: { name: 'Jane Doe' },
});
```

**Delete** :
```typescript
await prisma.user.delete({
  where: { id: 1 },
});
```

**Transactions** :
```typescript
await prisma.$transaction([
  prisma.user.update({ where: { id: 1 }, data: { name: 'New Name' } }),
  prisma.post.create({ data: { title: 'New Post', authorId: 1 } }),
]);
```

---

**Maintenu par** : Backend Team | **Revue recommandée** : À chaque migration
