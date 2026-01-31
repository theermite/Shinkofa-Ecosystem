---
title: Cahier des Charges - [Nom Projet]
date: YYYY-MM-DD
author: Jay The Ermite
priority: [Critique/Haute/Moyenne/Basse]
phase_roadmap: [Phase 0/1/2/3/etc.]
budget_estime: [X-Y$]
duree_estimee: [durée]
status: draft
version: 1.0
---

# Cahier des Charges : [Nom Projet]

---

## 📋 Métadonnées Projet

| Champ | Valeur |
|-------|--------|
| **Nom projet** | [Nom complet] |
| **Nom code** | [slug-name] |
| **Priorité** | [Critique/Haute/Moyenne/Basse] |
| **Phase roadmap** | [Phase X] |
| **Owner** | Jay The Ermite |
| **Budget estimé** | [X-Y$] crédit Claude Code |
| **Durée estimée** | [X jours/semaines] |
| **Date début souhaitée** | [YYYY-MM-DD] |
| **Deadline** | [YYYY-MM-DD] (si applicable) |

---

## 1. Contexte & Objectif

### 1.1 Contexte

**Problème à résoudre** :
- [Décrire le problème actuel, pain point, besoin non couvert]
- [Quel est le contexte? Pourquoi maintenant?]

**Objectif global** :
- [Décrire en 1-2 phrases l'objectif principal du projet]
- [Quel impact attendu? Quelle transformation?]

### 1.2 Utilisateurs Cibles

**Persona principal** :
- [Qui utilisera l'application? Profil type]
- [Besoins spécifiques, contraintes, contexte d'usage]

**Personas secondaires** (si applicable) :
- [Autres utilisateurs potentiels]

### 1.3 Valeur Ajoutée

**Ce projet apporte** :
1. [Bénéfice 1]
2. [Bénéfice 2]
3. [Bénéfice 3]

---

## 2. Périmètre Fonctionnel

### 2.1 Fonctionnalités Core (MVP Obligatoire)

#### Feature 1 : [Nom Feature]
**Description** : [Description détaillée]
**User stories** :
- En tant que [persona], je veux [action] afin de [bénéfice]
- En tant que [persona], je veux [action] afin de [bénéfice]

**Critères d'acceptation** :
- [ ] [Critère 1]
- [ ] [Critère 2]
- [ ] [Critère 3]

**Priorité** : 🔴 CRITIQUE / 🟡 HAUTE / 🟢 MOYENNE

---

#### Feature 2 : [Nom Feature]
[Même structure que Feature 1]

---

#### Feature N : [Nom Feature]
[Même structure]

---

### 2.2 Fonctionnalités Nice-to-Have (Post-MVP)

**Optionnelles** (si temps/budget restant) :
- [ ] [Feature optionnelle 1 - description courte]
- [ ] [Feature optionnelle 2 - description courte]
- [ ] [Feature optionnelle 3 - description courte]

**Future roadmap** (Phases ultérieures) :
- [ ] [Feature future 1]
- [ ] [Feature future 2]

---

## 3. Spécifications Techniques

### 3.1 Stack Technique Proposé

**Frontend** :
- Framework : [React 18+ / Next.js / Electron / React Native]
- Language : [JavaScript / TypeScript]
- UI Library : [Tailwind / Material-UI / Ant Design / Native]
- État global : [Context API / Redux / Zustand]

**Backend** :
- Framework : [FastAPI / Flask / Express.js]
- Language : [Python 3.11+ / Node.js 18+]
- API Style : [REST / GraphQL / WebSocket]

**Database** :
- Type : [PostgreSQL 15+ / SQLite / MongoDB / Redis]
- ORM : [SQLAlchemy / Prisma / Mongoose]
- Migrations : [Alembic / Prisma Migrate]

**Infrastructure** :
- Déploiement : [Docker / Vercel / Netlify / VPS]
- CI/CD : [GitHub Actions / GitLab CI]
- Monitoring : [Sentry / LogRocket] (si applicable)

**Services externes** (si applicable) :
- [Service 1 - utilité]
- [Service 2 - utilité]

### 3.2 Architecture Logicielle

**Pattern** : [MVC / Clean Architecture / Hexagonal / etc.]

**Modules principaux** :
1. [Module 1 - responsabilité]
2. [Module 2 - responsabilité]
3. [Module 3 - responsabilité]

**APIs & Intégrations** :
- [API externe 1 - utilité]
- [API externe 2 - utilité]

### 3.3 Modèles de Données

**Entités principales** :

#### Entité 1 : `[nom_table]`
```
Champs :
- id : Integer (PK)
- field1 : String (description)
- field2 : DateTime
- ...

Relations :
- 1-N avec [Entité 2]
- N-N avec [Entité 3]
```

#### Entité 2 : `[nom_table]`
[Même structure]

---

## 4. Spécifications UX/UI

### 4.1 Design System

**Palette couleurs** :
- Primaire : [Couleur + code hex] (utilité)
- Secondaire : [Couleur + code hex]
- Accent : [Couleur + code hex]
- Neutre : [Couleur + code hex]

**Si projet Shinkofa** : Utiliser Charte Graphique Shinkofa V2.0

**Typographie** :
- Headings : [Police - taille]
- Body : [Police - taille]
- Code : [Police monospace]

### 4.2 Wireframes / Maquettes

**Écrans principaux** :
1. [Écran 1 - nom - description]
2. [Écran 2 - nom - description]
3. [Écran 3 - nom - description]

**Liens maquettes** (si disponibles) :
- [Figma / Sketch / Adobe XD URL]

### 4.3 Accessibilité

**Standards** : WCAG 2.1 AA minimum
**Adaptations TDAH/neurodivergence** :
- [ ] Interface claire, peu chargée
- [ ] Feedback visuel immédiat
- [ ] Navigation simple, logique
- [ ] Gestion erreurs bienveillante

---

## 5. Contraintes & Exigences

### 5.1 Contraintes Techniques

- [ ] Compatible Windows 11 (Ermite-Game) + Kubuntu 24.04 (Dell-Ermite)
- [ ] Responsive mobile-first (si web/PWA)
- [ ] Performance : Chargement < 3s, API < 200ms (p95)
- [ ] Offline support (si applicable - PWA)
- [ ] Cross-platform (si applicable - Electron / React Native)

### 5.2 Contraintes Qualité

- [ ] Tests coverage ≥ 80%
- [ ] Zéro warnings linting (Ruff Python, ESLint JS)
- [ ] Type hints complets (Python 3.11+, TypeScript strict)
- [ ] Documentation inline (docstrings Google style, JSDoc)
- [ ] README.md complet (install, usage, tests)

### 5.3 Contraintes Sécurité

- [ ] Authentification sécurisée (JWT + bcrypt)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (escape HTML, CSP headers)
- [ ] Input validation systématique (Pydantic, Zod)
- [ ] Secrets jamais hardcodés (.env template fourni)
- [ ] HTTPS obligatoire production

### 5.4 Contraintes Budget & Temps

**Budget crédit** :
- Maximum : [X$]
- Alerte si dépassement : [Y$]

**Temps développement** :
- Estimation : [X jours/semaines]
- Deadline : [Date] (si applicable)

**Adaptation énergie Jay** :
- Sessions courtes 30-90 min
- Pauses 15 min / 90 min
- Résultats visibles fréquents (commits atomiques)

---

## 6. Découpage Étapes & Estimation

### Étape 1 : Setup & Infrastructure
**Durée** : [X heures]
**Coût** : [Y$]
**Tâches** :
- [ ] Initialiser projet (structure dossiers)
- [ ] Setup Git + branches
- [ ] Config linting/formatting
- [ ] Setup database (si applicable)
- [ ] Setup Docker (si applicable)

### Étape 2 : Backend Core
**Durée** : [X heures]
**Coût** : [Y$]
**Tâches** :
- [ ] Modèles database + migrations
- [ ] Endpoints API CRUD
- [ ] Authentification JWT
- [ ] Tests API (coverage ≥80%)

### Étape 3 : Frontend Core
**Durée** : [X heures]
**Coût** : [Y$]
**Tâches** :
- [ ] Setup React/Next.js/Electron
- [ ] Composants principaux
- [ ] Intégration API
- [ ] Tests composants

### Étape 4 : Intégration & Tests
**Durée** : [X heures]
**Coût** : [Y$]
**Tâches** :
- [ ] Tests intégration
- [ ] Tests e2e (si applicable)
- [ ] Fix bugs
- [ ] Documentation README

### Étape 5 : Déploiement & Handoff
**Durée** : [X heures]
**Coût** : [Y$]
**Tâches** :
- [ ] Setup CI/CD
- [ ] Déploiement staging
- [ ] Déploiement production
- [ ] Handoff rapport

---

### Estimation Totale

| Composant | Durée | Coût |
|-----------|-------|------|
| Étape 1 | [X h] | [Y$] |
| Étape 2 | [X h] | [Y$] |
| Étape 3 | [X h] | [Y$] |
| Étape 4 | [X h] | [Y$] |
| Étape 5 | [X h] | [Y$] |
| **TOTAL** | **[X h]** | **[Y$]** |

**Marge sécurité (+20%)** : [Z$]

---

## 7. Optimisations Suggérées (par TAKUMI)

### 7.1 Améliorations Architecture

**Suggérées par rapport cahier initial** :
1. [Amélioration 1 - justification]
2. [Amélioration 2 - justification]
3. [Amélioration 3 - justification]

### 7.2 Edge Cases Identifiés

**Cas limites à gérer** :
1. [Edge case 1 - solution proposée]
2. [Edge case 2 - solution proposée]
3. [Edge case 3 - solution proposée]

### 7.3 Risques & Mitigation

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| [Risque 1] | [Faible/Moyenne/Haute] | [Faible/Moyen/Élevé] | [Action mitigation] |
| [Risque 2] | [Faible/Moyenne/Haute] | [Faible/Moyen/Élevé] | [Action mitigation] |

---

## 8. Questions Clarification (si nécessaire)

**Avant démarrer code** :
1. [ ] [Question 1] ?
   - Réponse : [À compléter par Jay]

2. [ ] [Question 2] ?
   - Réponse : [À compléter par Jay]

3. [ ] [Question 3] ?
   - Réponse : [À compléter par Jay]

---

## 9. Critères de Succès (Done Definition)

**Le projet sera considéré livré si** :
- [ ] Toutes features MVP fonctionnelles
- [ ] Tests coverage ≥ 80%, tous passent
- [ ] Zéro warnings linting
- [ ] README.md complet testé
- [ ] Documentation architecture claire
- [ ] Déploiement production réussi (si applicable)
- [ ] Accessibilité WCAG 2.1 AA validée (si frontend)
- [ ] Handoff rapport généré

---

## 10. Validation & Approbation

**Statut** : 🟡 Draft / 🟢 Validé / 🔴 Bloqué

**Validé par** : [Jay The Ermite]
**Date validation** : [YYYY-MM-DD]

**Commentaires** :
- [Commentaire validation]

---

**✅ Validation requise avant démarrer code (stratégie Projecteur)**

---

**Version 1.0 | YYYY-MM-DD | Cahier des Charges Template**
