# /new-nextjs-app

> Scaffold un projet Next.js 14 App Router production-ready en 2 minutes.

**Version** : 1.0.0
**Auteur** : TAKUMI
**Durée** : ~2 minutes

---

## 🎯 Objectif

Créer une application Next.js complète avec :
- **Framework** : Next.js 14 App Router
- **Styling** : TailwindCSS
- **Database** : Prisma + PostgreSQL
- **Auth** : NextAuth.js v5
- **Tests** : Vitest + Playwright
- **Docs** : 8 fichiers docs standard

---

## 📋 Usage

```bash
/new-nextjs-app my-nextjs-site
/new-nextjs-app my-site --skip-install --git-init
```

---

## 🔧 Workflow TAKUMI

### 1. Copier Template + Remplacer Placeholders

```bash
# Copy
cp -r Prompt-2026-Optimized/templates/nextjs-app/ ./<project-name>/

# Replace
cd <project-name>
PROJECT_NAME="My Next Site"
TODAY=$(date +%Y-%m-%d)

find . -type f \( -name "*.md" -o -name "*.json" \) -exec sed -i \
  -e "s/\[Nom Projet Next.js\]/$PROJECT_NAME/g" \
  -e "s/\[Nom Projet\]/$PROJECT_NAME/g" \
  -e "s/\[DATE\]/$TODAY/g" \
  -e "s/\[VERSION\]/0.1.0/g" {} +
```

---

### 2. Init Git (si --git-init)

```bash
git init
git add .
git commit -m "chore: initial commit from /new-nextjs-app

Stack: Next.js 14 + Prisma + NextAuth

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>"
```

---

### 3. Install Dependencies (si pas --skip-install)

```bash
npm install  # ~2min
```

---

### 4. Next Steps

```markdown
✅ Project created: <project-name>

🚀 Setup:

1. Configure .env.local:
   cp .env.example .env.local
   # Add DATABASE_URL, NEXTAUTH_SECRET

2. Run Prisma migrations:
   npx prisma migrate dev
   npx prisma db seed

3. Start dev:
   npm run dev

4. Access:
   http://localhost:3000

📚 Docs: .claude/docs/ARCHITECTURE.md
```

---

**Version** : 1.0.0
