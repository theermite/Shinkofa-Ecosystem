# Shinkofa Studio

**Social Content Master** - Plateforme de gestion de contenu multi-plateformes pour The Ermite

## 🚀 Quick Start

### Prérequis

- Node.js 20+
- Docker (PostgreSQL + Redis)
- npm

### Installation

```bash
# Install dependencies
npm install

# Start Docker services (PostgreSQL + Redis)
docker compose up -d

# Push database schema
npm run db:push

# Start development server
npm run dev
```

L'application sera accessible sur **http://localhost:3000**

## 📁 Stack Technique

**Frontend**
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Shadcn/ui

**Backend**
- Prisma ORM
- PostgreSQL 16
- Redis 7
- BullMQ (queues)
- NextAuth.js (OAuth à venir)

**Processing**
- Groq API (Whisper v3 - transcription)
- AssemblyAI (backup)
- FFmpeg (server-side - à venir)
- basic-ftp (O2Switch CDN)

## 🗂️ Structure

```
shinkofa-studio/
├── app/                       # Next.js App Router
│   ├── (dashboard)/media/     # Module 1: Media Library
│   └── api/upload/            # Upload API
├── src/
│   ├── components/
│   │   ├── ui/                # Shadcn/ui components
│   │   └── media/             # Media components
│   ├── hooks/                 # Custom hooks (useUpload)
│   ├── lib/                   # Utils (db, utils)
│   └── services/              # Business logic (à venir)
├── prisma/                    # Prisma schema + migrations
└── docker-compose.yml         # PostgreSQL + Redis
```

## 📊 Base de Données

**Tables créées** :
- `users`, `accounts` - Authentication (NextAuth)
- `media_files` - Module 1 (Media Library)
- `edited_clips`, `exports` - Module 2 (Video Editor - à venir)
- `posts`, `publications` - Module 3 (Publication - à venir)
- `templates` - Migration localStorage (à venir)

## 🔧 Scripts disponibles

```bash
npm run dev          # Start dev server
npm run build        # Build production
npm run start        # Start production server
npm run lint         # Lint code

npm run db:generate  # Generate Prisma Client
npm run db:push      # Push schema to DB
npm run db:migrate   # Create migration
npm run db:studio    # Open Prisma Studio
```

## 🌐 Services

**PostgreSQL** : `localhost:5433`
**Redis** : `localhost:6380`
**Next.js** : `http://localhost:3000`

## 🎯 Roadmap

### ✅ Semaine 1 - Foundation + Upload (COMPLÉTÉ)
- Next.js 15 setup
- Prisma schema (12 tables)
- Upload API route
- Media Library page
- Docker services

### 🔜 Semaine 2 - FTP O2Switch + Filters
- BullMQ FTP worker
- Transfer to O2Switch CDN
- Media filters (folder, tags, status)
- Media player component

### 🔜 Semaines 3-6 - Video Editor + Publication
- Module 2: Video Timeline Editor
- Module 3: Multi-platform Publication (TikTok, LinkedIn, YouTube)

## 📝 Environment Variables

Créer un fichier `.env.local` avec :

```env
DATABASE_URL="postgresql://postgres:postgres_dev_2026@localhost:5433/shinkofa_studio?schema=public"
REDIS_URL="redis://localhost:6380"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-here"

# VPS OVH
VPS_HOST="217.182.206.127"
VPS_USER="ubuntu"

# O2Switch FTP
FTP_HOST="ftp.sc5evmi4071.universe.wf"
FTP_USER="cdn-media@media.shinkofa.com"
FTP_PASSWORD="your-password"
CDN_BASE_URL="https://media.shinkofa.com/cdn-media"

# Transcription APIs
GROQ_API_KEY="your-groq-key"
ASSEMBLYAI_API_KEY="your-assemblyai-key"
DEEPSEEK_API_KEY="your-deepseek-key"
```

## 📄 License

Copyright © 2026 The Ermite - Tous droits réservés

---

**Version** : 2.0.0
**Migration** : PWA React → Next.js 15 Full-Stack
