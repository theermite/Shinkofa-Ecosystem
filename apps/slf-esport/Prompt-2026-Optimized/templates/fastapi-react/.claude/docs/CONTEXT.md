# Context - [Nom Projet]

> Contexte business, règles métier, et décisions projet.

**Dernière mise à jour** : [DATE]
**Propriétaire** : Product Owner / Tech Lead

---

## 🎯 Vision & Objectifs

### Vision Produit
**Mission** : [Description courte de la raison d'être du projet]

**Exemple** :
> Créer une plateforme SaaS pour PME permettant de gérer leurs clients et projets de manière simple et efficace, avec un focus sur l'accessibilité et la performance.

### Objectifs Business

| Objectif | Métrique | Cible | Deadline |
|----------|----------|-------|----------|
| Acquisition utilisateurs | Users actifs | 1000 | Q2 2026 |
| Rétention | Taux rétention 30j | 60% | Q3 2026 |
| Performance | Time to First Byte | < 200ms | Q1 2026 |
| Accessibilité | Score WCAG | AA (min) | Q1 2026 |

---

## 👥 Utilisateurs & Personas

### Persona 1 : [Nom]
- **Rôle** : [ex: Manager PME]
- **Besoins** :
  - [Besoin prioritaire 1]
  - [Besoin prioritaire 2]
- **Pain points** :
  - [Point de douleur 1]
  - [Point de douleur 2]
- **Tech savviness** : ⭐⭐⚪⚪⚪ (2/5)

### Persona 2 : [Nom]
- **Rôle** : [ex: Admin technique]
- **Besoins** :
  - Configuration avancée
  - Exports/Imports en masse
- **Pain points** :
  - Interfaces trop simplifiées
  - Manque d'automatisation
- **Tech savviness** : ⭐⭐⭐⭐⚪ (4/5)

---

## 🏗️ Règles Métier

### Authentification
- ✅ Email **doit être unique** dans le système
- ✅ Mot de passe minimum **8 caractères** (1 majuscule, 1 chiffre, 1 spécial)
- ✅ Session expire après **30 minutes d'inactivité**
- ✅ Refresh token valide **7 jours**
- ⚠️ Maximum **5 tentatives login** avant blocage 15 minutes

### Autorisation (RBAC)
- **admin** :
  - CRUD complet sur users
  - Accès settings système
  - Export données
- **user** :
  - CRUD sur propres ressources
  - Lecture ressources publiques
  - Invitation collaborateurs (si feature activée)
- **guest** :
  - Lecture seule
  - Pas d'API write access

### [Autres Règles Métier]

**Exemple : Gestion Projets** (si applicable) :
- Un projet **doit avoir** au moins 1 owner (user)
- Un projet peut avoir **max 10 collaborateurs** (limitation business)
- Suppression projet = **soft delete** (flag `deleted_at`, archivage)
- Restauration possible **30 jours** après suppression

---

## 🔒 Contraintes Techniques

### Performance
- **Page load** : < 2 secondes (3G)
- **API response time** : < 300ms (p95)
- **Database queries** : < 100ms (p95)

### Scalabilité
- Support **jusqu'à 10,000 users** avec architecture actuelle
- Si > 10K users → migration vers architecture distribuée (voir [ARCHITECTURE.md](ARCHITECTURE.md))

### Sécurité
- **HTTPS obligatoire** en production
- **CORS** : Whitelist origins uniquement
- **Rate limiting** : 100 req/min par user (auth), 30 req/min par IP (public)
- **Audit logs** : Toutes actions critiques (create/update/delete users, settings)

### Accessibilité
- **Standard** : WCAG 2.1 AA minimum
- **Navigation clavier** complète
- **Screen readers** compatibles
- **Contraste** : Ratio 4.5:1 minimum (texte normal)

---

## 🌍 Internationalisation

### Langues Supportées (v1)
- 🇫🇷 Français (par défaut)
- 🇬🇧 Anglais

### Langues Futures (v2+)
- 🇪🇸 Espagnol
- 🇩🇪 Allemand

### Format Données
- **Dates** : ISO 8601 (2026-01-28T10:00:00Z)
- **Nombres** : Locale-aware formatting
- **Devise** : EUR par défaut (si applicable)

---

## 🚫 Hors Scope (v1)

Ce qui **n'est PAS** dans le scope actuel :

- ❌ Intégrations tierces (Stripe, Slack, etc.) → v2
- ❌ Mobile apps natives (iOS/Android) → v2
- ❌ Multi-tenancy (organisations isolées) → v3
- ❌ Real-time collaboration (WebSockets) → v2
- ❌ Advanced analytics/reporting → v2

**Raison** : Focus v1 sur **core features** + stabilité.

---

## 📈 Métriques Suivi

### Techniques
- Uptime : > 99.5%
- Error rate : < 1%
- Build time : < 5 minutes

### Business
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Conversion rate (signup → active)
- Churn rate

**Dashboard** : [Lien vers Grafana/Analytics]

---

## 🤝 Stakeholders

| Rôle | Personne | Contact | Responsabilités |
|------|----------|---------|-----------------|
| Product Owner | [Nom] | [Email] | Vision, priorités features |
| Tech Lead | [Nom] | [Email] | Architecture, décisions techniques |
| Designer | [Nom] | [Email] | UX/UI, accessibilité |
| QA | [Nom] | [Email] | Tests, validation |

---

## 🗓️ Roadmap (High-Level)

### Q1 2026
- ✅ MVP Core features (auth, users)
- ✅ Déploiement staging
- 🔄 Tests utilisateurs (beta)

### Q2 2026
- [ ] Feature X
- [ ] Feature Y
- [ ] Déploiement production

### Q3 2026
- [ ] Intégrations tierces (v2)
- [ ] Mobile apps (v2)

---

## 💡 Décisions Clés

### Pourquoi FastAPI ?
- **Performance** : Async Python, comparable à Node.js/Go
- **DX** : OpenAPI auto, validation Pydantic, type hints
- **Écosystème** : SQLAlchemy, Alembic, pytest matures

### Pourquoi React 18 ?
- **Adoption** : Large communauté, packages matures
- **Performance** : Concurrent rendering, Suspense
- **DX** : TypeScript first-class, hooks API

### Pourquoi PostgreSQL ?
- **Maturité** : 30+ ans, battle-tested
- **Features** : JSONB, full-text search, extensions (PostGIS)
- **ACID** : Transactions robustes

---

## 📚 Ressources

- **Figma** : [Lien vers designs]
- **Confluence/Notion** : [Lien vers wiki]
- **Analytics** : [Lien vers dashboard]
- **Support** : [Email support]

---

**Version** : 1.0 | **Maintenu par** : Product Team
