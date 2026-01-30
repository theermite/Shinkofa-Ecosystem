# Context - [Nom Projet Next.js]

> Contexte business, règles métier, et décisions projet.

**Dernière mise à jour** : [DATE]
**Propriétaire** : Product Owner / Tech Lead

---

## 🎯 Vision & Objectifs

### Vision Produit
**Mission** : [Description courte de la raison d'être du projet]

**Exemple** :
> Créer un site vitrine moderne avec blog intégré pour PME, optimisé SEO, avec CMS headless pour gestion contenu autonome par l'équipe marketing.

### Objectifs Business

| Objectif | Métrique | Cible | Deadline |
|----------|----------|-------|----------|
| SEO Google ranking | Position mots-clés cibles | Top 3 | Q2 2026 |
| Performance | Lighthouse score | >90 | Q1 2026 |
| Conversions | Contact forms submitted | +50% vs site actuel | Q3 2026 |
| Accessibilité | WCAG score | AA | Q1 2026 |

---

## 👥 Utilisateurs & Personas

### Persona 1 : Visiteur prospect
- **Rôle** : Potentiel client découvrant l'entreprise
- **Besoins** :
  - Information claire sur services/produits
  - Temps chargement rapide (mobile 3G)
  - Navigation intuitive
- **Pain points** :
  - Sites lents (bounce rate élevé)
  - Information difficile à trouver
- **Tech savviness** : ⭐⭐⚪⚪⚪ (2/5)

### Persona 2 : Admin contenu
- **Rôle** : Marketing manager gérant contenu blog/pages
- **Besoins** :
  - CMS intuitif (sans code)
  - Preview avant publication
  - SEO metadata editable
- **Pain points** :
  - Dépendance dev pour updates simples
  - Workflows complexes
- **Tech savviness** : ⭐⭐⭐⚪⚪ (3/5)

---

## 🏗️ Règles Métier

### Pages & Routing

#### Pages Publiques (SSG)
- Homepage (`/`)
- About (`/about`)
- Services (`/services`)
- Contact (`/contact`)
- Blog listing (`/blog`)
- Blog posts (`/blog/[slug]`)

**Render Strategy** : SSG avec ISR (revalidate 3600s = 1h)

**Raison** : SEO critique + contenu change peu → static generation.

---

#### Pages Privées (SSR)
- Dashboard admin (`/admin`)
- Blog editor (`/admin/blog/edit/[id]`)

**Render Strategy** : SSR (auth required)

**Raison** : Data dynamique par user, auth check.

---

### Blog Posts

**Règles** :
- ✅ Slug auto-généré depuis titre (kebab-case)
- ✅ Slug **doit être unique**
- ✅ Draft posts visibles seulement par admins
- ✅ Published posts cachés jusqu'à `publishedAt` date
- ✅ SEO metadata obligatoire (title, description, OG image)
- ✅ Featured image obligatoire (1200×630px min, WebP)

**Workflow Publication** :
1. Admin crée draft dans CMS
2. Preview disponible `/admin/preview/[id]`
3. Admin publie → status = `published`, `publishedAt` = NOW
4. ISR revalidation auto (`revalidatePath('/blog')`)
5. Post visible publiquement

---

### Contact Form

**Règles** :
- ✅ Email validation (format + MX record check optionnel)
- ✅ Rate limiting : 5 submissions / 10min par IP
- ✅ Spam protection : Google reCAPTCHA v3 (score > 0.5)
- ✅ Email notification admin (via SendGrid/Resend)
- ✅ Auto-reply utilisateur

**Champs obligatoires** :
- `name` (2-100 chars)
- `email` (valid email)
- `message` (10-5000 chars)

---

## 🔒 Contraintes Techniques

### Performance

| Métrique | Cible | Actuel |
|----------|-------|--------|
| **Lighthouse Performance** | >90 | [MEASURE] |
| **First Contentful Paint** | <1.5s | [MEASURE] |
| **Largest Contentful Paint** | <2.5s | [MEASURE] |
| **Cumulative Layout Shift** | <0.1 | [MEASURE] |
| **Time to Interactive** | <3.5s | [MEASURE] |

**Stratégie** :
- Server Components par défaut (zero JS client)
- Image optimization (`next/image` + WebP)
- Font optimization (`next/font`)
- Code splitting automatique (route-based)

---

### SEO

**Metadata Obligatoire** :
```typescript
// app/page.tsx
export const metadata = {
  title: 'Page Title | Site Name',
  description: 'Page description (150-160 chars)',
  openGraph: {
    title: 'OG Title',
    description: 'OG Description',
    images: ['/og-image.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

**Sitemap** : Auto-généré (`app/sitemap.ts`)

**Robots** : Auto-généré (`app/robots.ts`)

---

### Accessibilité

- **Standard** : WCAG 2.1 AA minimum
- **Navigation clavier** complète
- **Screen readers** compatibles (ARIA labels)
- **Contraste** : Ratio 4.5:1 minimum (texte normal)
- **Focus indicators** visibles (outline ou ring)

---

## 🌍 Internationalisation

### Langues v1
- 🇫🇷 Français (par défaut)

### Langues Futures (v2+)
- 🇬🇧 Anglais
- 🇪🇸 Espagnol

**Implémentation** : `next-intl` ou i18n routing Next.js 14

---

## 🚫 Hors Scope (v1)

- ❌ E-commerce (panier, paiements) → v2
- ❌ Espace membre / authentification publique → v2
- ❌ Multi-langue → v2
- ❌ Analytics avancées (heatmaps, A/B testing) → v2
- ❌ Chatbot → v3

**Raison** : Focus v1 sur **site vitrine + blog** performant et SEO-optimisé.

---

## 📈 Métriques Suivi

### Techniques
- Uptime : > 99.9% (Vercel auto)
- Core Web Vitals : All green
- Lighthouse score : >90 (mobile + desktop)

### Business
- Google Analytics :
  - Page views
  - Bounce rate (target: <50%)
  - Session duration (target: >2min)
  - Conversion rate contact form (target: 3-5%)
- Google Search Console :
  - Impressions
  - Clicks
  - CTR
  - Position moyenne

---

## 🤝 Stakeholders

| Rôle | Personne | Contact | Responsabilités |
|------|----------|---------|-----------------|
| Product Owner | [Nom] | [Email] | Vision, priorités |
| Tech Lead | [Nom] | [Email] | Architecture, décisions tech |
| Designer | [Nom] | [Email] | UI/UX, branding |
| Marketing Manager | [Nom] | [Email] | Contenu, SEO strategy |

---

## 🗓️ Roadmap (High-Level)

### Q1 2026
- ✅ MVP Site vitrine (Homepage, About, Services, Contact)
- ✅ Blog intégré (SSG + ISR)
- ✅ CMS headless (Contentful/Sanity)
- ✅ SEO optimization
- ✅ Déploiement Vercel

### Q2 2026
- [ ] Multi-langue (EN + ES)
- [ ] Analytics dashboard admin
- [ ] A/B testing contact form

### Q3 2026
- [ ] E-commerce basique (v2)
- [ ] Espace membre

---

## 💡 Décisions Clés

### Pourquoi Next.js 14 ?
- **SSG + ISR** : Performance maximale + freshness
- **SEO** : Server-side rendering + metadata API
- **DX** : App Router, Server Components, TypeScript
- **Déploiement** : Vercel zero-config

### Pourquoi Headless CMS ?
- **Flexibilité** : Marketing peut changer contenu sans dev
- **Performance** : Data fetched build-time (SSG)
- **Scalable** : CMS séparé du frontend

**CMS Choix** : [Contentful / Sanity / Strapi]

### Pourquoi TailwindCSS ?
- **Performance** : Tree-shaking → CSS minimal
- **DX** : Utility-first, pas de context switching
- **Maintainability** : Design system via config

---

## 📚 Ressources

- **Figma** : [Lien vers designs]
- **CMS** : [Lien vers dashboard]
- **Analytics** : [Lien vers Google Analytics]
- **GSC** : [Lien vers Search Console]

---

**Version** : 1.0 | **Maintenu par** : Product Team
