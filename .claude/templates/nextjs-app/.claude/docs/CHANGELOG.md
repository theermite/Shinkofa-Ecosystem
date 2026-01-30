# Changelog - [Nom Projet Next.js]

> Historique des versions du projet.

**Format** : [Keep a Changelog](https://keepachangelog.com/)
**Versioning** : [Semantic Versioning](https://semver.org/) (MAJOR.MINOR.PATCH)

---

## [Unreleased]

### À venir
- Multi-langue (EN + ES)
- Analytics dashboard admin
- A/B testing contact form

---

## [1.0.0] - YYYY-MM-DD

### 🎉 Premier Release Production

#### Added
- Site vitrine complet (Homepage, About, Services, Contact)
- Blog intégré avec SSG + ISR
- CMS headless integration ([Contentful/Sanity])
- SEO optimization (metadata, sitemap, robots)
- Contact form avec validation + spam protection
- Image optimization (next/image + WebP)
- Font optimization (next/font)
- Analytics (Google Analytics 4)
- Déploiement Vercel production

#### Performance
- Lighthouse score >90 (mobile + desktop)
- First Contentful Paint <1.5s
- Largest Contentful Paint <2.5s
- Cumulative Layout Shift <0.1

#### Security
- HTTPS obligatoire (Vercel auto)
- Rate limiting contact form (5 req/10min)
- Spam protection (reCAPTCHA v3)
- CSP headers configured

---

## [0.3.0] - YYYY-MM-DD

### 🚀 Beta Release

#### Added
- Blog post editor (admin)
- Draft/publish workflow
- SEO metadata editable
- Image upload CMS

#### Changed
- Refactoring blog data fetching (SSG avec ISR)
- Migration Prisma schema (add `publishedAt` field)

#### Fixed
- Bug #45 : Blog pagination broken on mobile
- Performance : Lazy load images below fold

---

## [0.2.0] - YYYY-MM-DD

### Alpha Release

#### Added
- Next.js 14 App Router setup
- TailwindCSS styling
- Prisma ORM + PostgreSQL
- NextAuth.js admin authentication
- Server Components architecture

#### Changed
- Migration de Pages Router vers App Router

---

## [0.1.0] - YYYY-MM-DD

### 🌱 Initial Commit

#### Added
- Setup projet Next.js 14
- Docker configuration
- README.md avec instructions

---

## Format Commit Messages

**Convention** : Conventional Commits

```
<type>(scope): <description>

[optional body]

[optional footer]
```

**Types** :
- `feat` : Nouvelle feature
- `fix` : Bug fix
- `docs` : Documentation seule
- `style` : Formatting (pas de changement logique)
- `refactor` : Refactoring (ni feature ni fix)
- `perf` : Performance improvement
- `test` : Ajout/modification tests
- `chore` : Tâches maintenance (deps, config)

**Exemples** :
```
feat(blog): add draft/publish workflow
fix(contact): prevent duplicate form submissions
docs(readme): update deployment instructions
perf(images): lazy load below-fold images
```

---

## Notes de Version (Release Notes)

### Comment créer une release

1. **Update CHANGELOG.md** : Déplacer [Unreleased] vers [X.Y.Z]
2. **Update version** : `package.json`
3. **Commit** : `chore: bump version to X.Y.Z`
4. **Tag** : `git tag -a vX.Y.Z -m "Release X.Y.Z"`
5. **Push** : `git push origin main --tags`
6. **Deploy** : Vercel auto-deploy (ou trigger manual)

---

## Migration Guide

### v0.2.0 → v0.3.0

**Breaking Changes** : Aucun

**New Features** :
- Blog editor admin disponible `/admin/blog`

**Migration Steps** :
1. Run migration : `npx prisma migrate deploy`
2. Seed database si nécessaire : `npx prisma db seed`

---

### v0.3.0 → v1.0.0

**Breaking Changes** :
- ⚠️ Blog post `slug` field now required (auto-generated)
- ⚠️ Contact form validation rules stricter (min 10 chars message)

**Migration Steps** :
1. Backup database
2. Run migration : `npx prisma migrate deploy`
3. Update environment variables (add `RECAPTCHA_SECRET_KEY`)
4. Test contact form end-to-end

---

**Maintenu par** : Dev Team | **Dernière mise à jour** : [DATE]
