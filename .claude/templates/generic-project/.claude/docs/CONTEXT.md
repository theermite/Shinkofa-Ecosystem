# Context - [Nom Projet]

> Contexte métier, décisions clés, contraintes et règles business du projet.

**Dernière mise à jour** : [DATE]

---

## 🎯 Vision & Objectifs

### Raison d'Être

**Problème résolu** :
[Décrire le problème que ce projet résout]

**Solution proposée** :
[Décrire comment le projet résout ce problème]

**Valeur ajoutée** :
- [Bénéfice 1]
- [Bénéfice 2]
- [Bénéfice 3]

### Objectifs Mesurables

| Objectif | Métrique | Cible | Actuel |
|----------|----------|-------|--------|
| [Ex: Adoption utilisateurs] | Nombre users actifs | 10,000 | [valeur] |
| [Ex: Performance] | Temps réponse API | <200ms | [valeur] |
| [Ex: Disponibilité] | Uptime | 99.9% | [valeur] |

---

## 👥 Utilisateurs

### Personas

#### Persona 1 : [Nom Type Utilisateur]
- **Qui** : [Description]
- **Besoins** :
  - [Besoin 1]
  - [Besoin 2]
- **Pain Points** :
  - [Problème 1]
  - [Problème 2]
- **Use Cases** :
  - [Cas d'usage 1]
  - [Cas d'usage 2]

#### Persona 2 : [Autre Type]
- **Qui** : [Description]
- **Besoins** : [...]
- **Pain Points** : [...]

---

## 🏢 Contraintes Business

### Contraintes Légales/Réglementaires

| Contrainte | Impact | Implémentation |
|------------|--------|----------------|
| RGPD | Données personnelles | Chiffrement, droit à l'oubli, consentement |
| [Autre réglementation] | [Impact] | [Comment géré] |

### Contraintes Techniques

| Contrainte | Raison | Impact |
|------------|--------|--------|
| Budget serveur limité | [Raison] | Optimisation requise, pas de scaling auto illimité |
| Compatibilité IE11 | Clients legacy | Pas de features JS modernes |
| [Autre] | [Raison] | [Impact] |

### Contraintes Business

- **Budget** : [Budget disponible / coût max mensuel]
- **Timeline** : [Deadlines critiques]
- **Ressources** : [Équipe disponible]
- **Compétiteurs** : [Contexte concurrentiel]

---

## 📋 Règles Métier (Business Rules)

### Règle 1 : [Nom Règle]

**Description** : [Explication claire de la règle]

**Justification** : [Pourquoi cette règle existe]

**Implémentation** :
```python
# Exemple code illustrant la règle
if user.age < 18:
    raise ValidationError("User must be 18 or older")
```

**Tests** :
- ✅ User 18 ans → Accepté
- ❌ User 17 ans → Rejeté
- ✅ User 100 ans → Accepté

---

### Règle 2 : Validation Email Unique

**Description** : Chaque email ne peut être utilisé que par un seul compte

**Justification** : Éviter doublons, garantir unicité identité

**Implémentation** :
```sql
CREATE UNIQUE INDEX idx_users_email ON users(email);
```

**Tests** :
- ✅ Nouvel email → Compte créé
- ❌ Email existant → Erreur "Email already exists"

---

### Règle 3 : [Autre Règle Importante]

[Même structure...]

---

## 🔐 Sécurité & Permissions

### Matrice Permissions (RBAC)

| Action | Admin | User | Guest |
|--------|-------|------|-------|
| **Lire posts publics** | ✅ | ✅ | ✅ |
| **Créer post** | ✅ | ✅ | ❌ |
| **Modifier son post** | ✅ | ✅ | ❌ |
| **Modifier post autre** | ✅ | ❌ | ❌ |
| **Supprimer post** | ✅ | ❌ | ❌ |
| **Gérer users** | ✅ | ❌ | ❌ |

### Règles Accès

```python
# Exemple : Édition post
def can_edit_post(user: User, post: Post) -> bool:
    """
    User peut éditer post si :
    - Admin (peut tout éditer)
    - Auteur du post
    """
    return user.role == "admin" or post.author_id == user.id
```

---

## 💰 Modèle Économique (si applicable)

### Pricing

| Plan | Prix | Features | Target |
|------|------|----------|--------|
| **Free** | $0/mois | 10 projets, 1GB storage | Individus |
| **Pro** | $19/mois | Illimité projets, 100GB | PME |
| **Enterprise** | Custom | Support dédié, SLA 99.9% | Grandes entreprises |

### Métriques Business

- **CAC** (Customer Acquisition Cost) : [valeur]
- **LTV** (Lifetime Value) : [valeur]
- **Churn Rate** : [valeur]
- **MRR** (Monthly Recurring Revenue) : [valeur]

---

## 🗺️ Roadmap

### Phase 1 : MVP ✅ (TERMINÉ)
- [Feature 1]
- [Feature 2]
- [Feature 3]

### Phase 2 : Growth 🚧 (EN COURS)
- [Feature 4]
- [Feature 5]

### Phase 3 : Scale 📅 (À VENIR)
- [Feature 6]
- [Feature 7]

### Backlog / Futur
- [Idée 1]
- [Idée 2]

---

## 📊 KPIs (Key Performance Indicators)

### Métriques Techniques

| Métrique | Cible | Actuel | Tendance |
|----------|-------|--------|----------|
| **Temps réponse API** | <200ms | [valeur] | 📈 📉 → |
| **Uptime** | 99.9% | [valeur] | 📈 📉 → |
| **Error rate** | <0.1% | [valeur] | 📈 📉 → |
| **Tests coverage** | >80% | [valeur] | 📈 📉 → |

### Métriques Business

| Métrique | Cible | Actuel | Tendance |
|----------|-------|--------|----------|
| **MAU** (Monthly Active Users) | [cible] | [valeur] | 📈 📉 → |
| **Conversion rate** | [cible] | [valeur] | 📈 📉 → |
| **NPS** (Net Promoter Score) | >50 | [valeur] | 📈 📉 → |

---

## 🔄 Processus Métier

### Processus 1 : Création Compte Utilisateur

```
1. User remplit formulaire inscription
   ↓
2. Backend valide données (email format, password strength)
   ↓
3. Backend vérifie email unique
   ↓
4. Backend hash password (bcrypt)
   ↓
5. Backend crée user en DB
   ↓
6. Backend génère token vérification email
   ↓
7. Backend envoie email confirmation
   ↓
8. User clique lien dans email
   ↓
9. Backend marque email_verified = true
   ↓
10. User peut se connecter
```

### Processus 2 : [Autre Processus Important]

[Même structure...]

---

## 🤝 Intégrations Externes

### Service 1 : [Nom Service]

- **Purpose** : [Pourquoi on l'utilise]
- **Provider** : [Nom provider]
- **Coût** : [Modèle pricing]
- **SLA** : [Garanties disponibilité]
- **Fallback** : [Plan B si service down]
- **Docs** : [Lien documentation]

**Exemple** :

#### Stripe (Paiements)

- **Purpose** : Traiter paiements carte bancaire
- **Provider** : Stripe Inc.
- **Coût** : 2.9% + $0.30 par transaction
- **SLA** : 99.99% uptime
- **Fallback** : Queue paiements, retry automatique
- **Docs** : https://stripe.com/docs/api

### Service 2 : [Autre Service]

[Même structure...]

---

## 📝 Décisions Architecture (ADR - Architecture Decision Records)

### ADR-001 : Choix Base de Données

**Date** : [DATE]

**Status** : ✅ Accepté

**Contexte** :
Besoin base de données pour stocker users, posts, relations.

**Décision** :
PostgreSQL comme base de données principale.

**Alternatives considérées** :
1. **MongoDB** - Flexible mais moins de garanties transactionnelles
2. **MySQL** - Solide mais moins de features avancées que PostgreSQL
3. **PostgreSQL** ✅ - Relations complexes, ACID, JSON support, maturité

**Conséquences** :
- ✅ Garanties transactionnelles fortes
- ✅ Support JSON pour données flexibles
- ✅ Outils matures (pgAdmin, extensions)
- ❌ Schema rigide (migrations requises)
- ❌ Scaling horizontal plus complexe que NoSQL

---

### ADR-002 : JWT vs Sessions

**Date** : [DATE]

**Status** : ✅ Accepté

**Contexte** :
Choix mécanisme authentication pour API.

**Décision** :
JWT (JSON Web Tokens) avec refresh tokens.

**Alternatives considérées** :
1. **Sessions serveur** - Stateful, moins scalable
2. **JWT** ✅ - Stateless, mobile-friendly, scalable
3. **OAuth only** - Trop complexe pour nos besoins

**Conséquences** :
- ✅ Stateless → Facile à scaler horizontalement
- ✅ Mobile-friendly (pas de cookies)
- ✅ Microservices-ready
- ❌ Gestion refresh tokens complexe
- ❌ Impossible d'invalider token avant expiration (sauf blacklist)

---

### ADR-003 : [Autre Décision]

[Même structure...]

---

## 🌍 Localisation (i18n)

### Langues Supportées

- 🇫🇷 Français (défaut)
- 🇬🇧 Anglais
- 🇪🇸 Espagnol (futur)

### Règles i18n

- UI : Support multi-langues obligatoire
- Base de données : Stocker en langue neutre si possible
- Dates/heures : Format ISO 8601, timezone UTC en DB
- Nombres : Format local (1,234.56 vs 1 234,56)
- Devise : Support multi-devises (€, $, £)

---

## 🔗 Glossaire

### Termes Métier

| Terme | Définition |
|-------|------------|
| **User** | Compte utilisateur avec email + password |
| **Post** | Contenu créé par user (article, message) |
| **Admin** | User avec permissions élevées |
| [Terme spécifique] | [Définition] |

### Acronymes

| Acronyme | Signification |
|----------|---------------|
| **MAU** | Monthly Active Users |
| **RBAC** | Role-Based Access Control |
| **SLA** | Service Level Agreement |
| [Autre] | [Signification] |

---

## 🔗 Voir Aussi

- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture technique
- [API_REFERENCE.md](API_REFERENCE.md) - Documentation API
- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guide tests

---

**Maintenu par** : [Équipe Business + Tech]
**Revue recommandée** : Trimestrielle ou lors pivot stratégique

---

## 📌 Notes Importantes

### Risques Identifiés

| Risque | Probabilité | Impact | Mitigation |
|--------|-------------|--------|------------|
| [Risque 1] | Haute/Moyenne/Basse | Critique/Modéré/Faible | [Plan mitigation] |
| [Risque 2] | [Prob] | [Impact] | [Mitigation] |

### Assumptions (Hypothèses)

- [Hypothèse 1 sur laquelle le projet repose]
- [Hypothèse 2]
- [Hypothèse 3]

**⚠️ Si une hypothèse change, réévaluer architecture et roadmap.**
