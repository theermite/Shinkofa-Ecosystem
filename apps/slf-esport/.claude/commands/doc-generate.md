# /doc-generate - Génération Documentation Complète

> Génère la documentation complète du projet à partir du code source.

**Agent déclenché** : `agents/Documentation-Generator/AGENT.md`
**Version** : 1.0
**Temps moyen** : 3-5 minutes (selon taille projet)

---

## 🎯 Objectif

Analyser le code source et générer automatiquement une documentation structurée, complète et à jour dans `.claude/docs/`.

**Fichiers générés** :
1. `API_REFERENCE.md` - Endpoints REST/GraphQL
2. `DATABASE_SCHEMA.md` - Tables, relations, migrations
3. `ARCHITECTURE.md` - Stack, diagrammes, patterns
4. `CODING_STANDARDS.md` - Style guide, conventions
5. `TESTING_GUIDE.md` - Tests structure, commandes
6. `CONTEXT.md` - Décisions techniques, ADRs
7. `CHANGELOG.md` - Historique versions
8. `KNOWN_ISSUES.md` - Bugs connus, limitations

---

## 🔧 Utilisation

### Génération Complète (Défaut)

```bash
/doc-generate
```

Scanne tout le projet et génère/met à jour tous les fichiers documentation.

---

### Génération Sélective

```bash
# Générer seulement API_REFERENCE
/doc-generate --only api

# Générer seulement DATABASE_SCHEMA
/doc-generate --only database

# Générer plusieurs fichiers spécifiques
/doc-generate --only api,database,architecture
```

**Options disponibles** :
- `api` → API_REFERENCE.md
- `database` → DATABASE_SCHEMA.md
- `architecture` → ARCHITECTURE.md
- `standards` → CODING_STANDARDS.md
- `testing` → TESTING_GUIDE.md
- `context` → CONTEXT.md
- `changelog` → CHANGELOG.md
- `issues` → KNOWN_ISSUES.md

---

### Options Avancées

```bash
# Format de sortie
/doc-generate --format markdown   # Défaut
/doc-generate --format html        # HTML statique
/doc-generate --format json        # Données JSON

# Niveau de détail
/doc-generate --verbose            # Logs détaillés
/doc-generate --quiet              # Minimal output

# Répertoire de sortie custom
/doc-generate --output ./docs

# Inclure fichiers test
/doc-generate --include-tests

# Forcer régénération (même si à jour)
/doc-generate --force
```

---

## 📊 Processus de Génération

### 1. SCAN (30 secondes)

```
📂 Analyse structure projet...
   ├── backend/app/          (234 fichiers Python)
   ├── frontend/src/         (156 fichiers TypeScript)
   ├── database/migrations/  (12 fichiers SQL)
   └── tests/               (89 fichiers)

✅ Scan complet : 491 fichiers analysés
```

### 2. EXTRACT (1-2 minutes)

```
🔍 Extraction éléments documentables...

API Endpoints:
   ✅ 23 endpoints détectés (FastAPI)
   ✅ Request/Response models extraits
   ✅ Authentication middleware identifié

Database:
   ✅ 8 tables Prisma
   ✅ 15 relations
   ✅ 12 migrations appliquées

Functions/Classes:
   ✅ 156 fonctions publiques
   ✅ 42 classes
   ✅ 78 méthodes
```

### 3. ENRICH (1 minute)

```
💡 Enrichissement documentation...
   ✅ Génération exemples curl
   ✅ Génération exemples code (Python, TypeScript)
   ✅ Extraction docstrings/JSDoc
   ✅ Détection patterns architecturaux
   ✅ Analyse dépendances (package.json, requirements.txt)
```

### 4. GENERATE (1 minute)

```
📝 Génération fichiers Markdown...
   ✅ API_REFERENCE.md       (450 lignes)
   ✅ DATABASE_SCHEMA.md     (230 lignes)
   ✅ ARCHITECTURE.md        (180 lignes)
   ✅ CODING_STANDARDS.md    (320 lignes)
   ✅ TESTING_GUIDE.md       (270 lignes)
   ✅ CONTEXT.md            (150 lignes)
   ✅ CHANGELOG.md          (80 lignes)
   ✅ KNOWN_ISSUES.md       (45 lignes)
```

### 5. VALIDATE (30 secondes)

```
✅ Validation qualité...
   ✅ Markdown syntax valid
   ✅ Internal links checked
   ✅ Code blocks syntax highlighted
   ✅ Examples tested

Score qualité : 92% ✅

Détails:
   - Endpoints documentés : 23/25 (92%)
   - Functions documentées : 156/168 (93%)
   - Examples fournis : 21/23 (91%)
```

---

## 📄 Contenu Généré par Fichier

### 1. API_REFERENCE.md

**Contient** :
- Liste complète endpoints (méthode, path, description)
- Request parameters (query, body, headers)
- Response format (success + errors)
- Authentication requirements
- Rate limits
- Examples (curl, Python, TypeScript, JavaScript)

**Exemple section** :
```markdown
### POST /api/users

Crée un nouvel utilisateur.

**Authentication** : Required (Bearer token)

**Request Body** :
```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!"
}
```

**Response (201 Created)** :
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2026-01-26T10:00:00Z"
}
```

**Errors** :
- `400 Bad Request` - Invalid email or password format
- `409 Conflict` - Email already exists
- `401 Unauthorized` - Invalid or missing token

**Example** :
```bash
curl -X POST https://api.example.com/api/users \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe","password":"SecurePass123!"}'
```
```

---

### 2. DATABASE_SCHEMA.md

**Contient** :
- Tables (colonnes, types, constraints)
- Relations (one-to-one, one-to-many, many-to-many)
- Indexes
- Migrations historique
- ERD (Entity Relationship Diagram)

**Exemple section** :
```markdown
### Table: users

| Column | Type | Constraints | Default | Description |
|--------|------|-------------|---------|-------------|
| id | UUID | PRIMARY KEY | uuid() | Unique identifier |
| email | String(255) | UNIQUE, NOT NULL | - | User email |
| name | String(100) | NOT NULL | - | Full name |
| password_hash | String | NOT NULL | - | Hashed password |
| is_active | Boolean | NOT NULL | true | Account status |
| created_at | Timestamp | NOT NULL | now() | Creation date |
| updated_at | Timestamp | NOT NULL | now() | Last update |

**Relations** :
- `posts` → Post[] (one-to-many via author_id)
- `profile` → Profile (one-to-one via user_id)

**Indexes** :
- `email` (unique B-tree)
- `created_at` (B-tree for sorting)

**Used by endpoints** :
- POST /api/auth/register
- POST /api/auth/login
- GET /api/users/me
```

---

### 3. ARCHITECTURE.md

**Contient** :
- Vue d'ensemble système
- Stack technique détaillée
- Diagrammes architecture (ASCII)
- Patterns utilisés
- Décisions architecturales
- Infrastructure (hosting, CI/CD)

**Exemple section** :
```markdown
## Stack Technique

| Composant | Technologie | Version | Justification |
|-----------|-------------|---------|---------------|
| Frontend | React | 18.2.0 | UI library standard, large ecosystem |
| Backend | FastAPI | 0.109.0 | Async, auto docs, type safety |
| Database | PostgreSQL | 15.3 | Relational data, ACID compliance |
| Cache | Redis | 7.0 | Session storage, rate limiting |
| Hosting | Vercel + Railway | - | Serverless frontend, managed backend |

## Diagramme Architecture

```
┌────────────────────────────────────────────────┐
│                  CLIENT                        │
│            (Browser / Mobile)                  │
└────────────────┬───────────────────────────────┘
                 │
                 │ HTTPS
                 ▼
┌────────────────────────────────────────────────┐
│              NGINX (Reverse Proxy)             │
│           SSL Termination / Load Balancer      │
└────────────┬───────────────────┬────────────────┘
             │                   │
             │                   │
             ▼                   ▼
   ┌──────────────────┐  ┌──────────────────┐
   │   FRONTEND       │  │   BACKEND        │
   │   React (SPA)    │  │   FastAPI        │
   │   Vercel         │  │   Railway        │
   └──────────────────┘  └────────┬─────────┘
                                   │
                     ┌─────────────┼─────────────┐
                     │             │             │
                     ▼             ▼             ▼
            ┌────────────┐ ┌────────────┐ ┌────────────┐
            │ PostgreSQL │ │   Redis    │ │   S3       │
            │  (Railway) │ │ (Railway)  │ │   (AWS)    │
            └────────────┘ └────────────┘ └────────────┘
```
```

---

### 4. CODING_STANDARDS.md

**Contient** :
- Naming conventions
- Code style (linting rules)
- Best practices
- Examples (bon vs mauvais code)
- Testing patterns
- Git workflow

**Exemple section** :
```markdown
## Functions Naming

✅ **Bon** :
```python
def calculate_user_subscription_fee(user_id: str, plan: str) -> float:
    """
    Calculate monthly subscription fee for a user.

    Args:
        user_id: UUID of the user
        plan: Plan name ('basic', 'pro', 'enterprise')

    Returns:
        Monthly fee in EUR
    """
    return PLANS[plan]['price']
```

❌ **Mauvais** :
```python
def calc_fee(u, p):  # Noms trop courts, pas de docs
    return PLANS[p]['price']
```

## Testing Pattern (AAA)

```python
def test_create_user_success():
    # Arrange
    user_data = {
        'email': 'test@example.com',
        'name': 'Test User'
    }

    # Act
    user = create_user(user_data)

    # Assert
    assert user.email == 'test@example.com'
    assert user.name == 'Test User'
    assert user.id is not None
```
```

---

## 🔍 Détection Automatique

### Frameworks API Supportés

- **FastAPI** (Python)
- **Express.js** (JavaScript/TypeScript)
- **Next.js API Routes** (TypeScript)
- **Flask** (Python)
- **Django REST Framework** (Python)

### ORMs Database Supportés

- **Prisma** (TypeScript)
- **SQLAlchemy** (Python)
- **Django ORM** (Python)
- **TypeORM** (TypeScript)
- **Sequelize** (JavaScript)

### Langages Supportés

- **TypeScript** (ts-morph parser)
- **JavaScript** (Babel parser)
- **Python** (AST module)
- **SQL** (migrations, schemas)

---

## 📊 Score Qualité

Le score qualité est calculé ainsi :

```
Score = (
    (endpoints_documentés / endpoints_totaux) × 30% +
    (functions_documentées / functions_totales) × 30% +
    (examples_fournis / endpoints_totaux) × 20% +
    (tables_documentées / tables_totales) × 20%
) × 100
```

**Interprétation** :
- **100%** : 🏆 Excellent - Documentation complète
- **90-99%** : ✅ Très bon - Quelques éléments manquants
- **80-89%** : ✅ Bon - Acceptable
- **70-79%** : ⚠️  Moyen - Amélioration nécessaire
- **< 70%** : ❌ Insuffisant - Documentation incomplète

---

## ✅ Checklist Post-Génération

Après avoir généré la documentation :

- [ ] Vérifier API_REFERENCE.md (tous endpoints documentés)
- [ ] Vérifier DATABASE_SCHEMA.md (ERD clair)
- [ ] Vérifier exemples code (testés et fonctionnels)
- [ ] Vérifier liens internes (pas de liens brisés)
- [ ] Vérifier CHANGELOG.md (version actuelle)
- [ ] Valider score qualité (> 90%)
- [ ] Commit documentation avec message approprié
- [ ] Partager avec équipe si applicable

---

## 🔄 Intégration Workflow

### Workflow Recommandé

```
1. Développer feature
   ↓
2. Écrire tests
   ↓
3. /doc-generate (générer/mettre à jour docs)
   ↓
4. Vérifier documentation générée
   ↓
5. /pre-commit (Code-Reviewer)
   ↓
6. git commit -m "feat: Add user avatar feature"
   ↓
7. git push
```

### Automatisation (Optionnel)

**Pre-commit hook** :
```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "🔍 Checking documentation..."

# Vérifier si documentation à jour
/doc-check --silent

if [ $? -ne 0 ]; then
  echo "⚠️  Documentation obsolète"
  echo ""
  echo "Générer documentation maintenant? (y/n)"
  read response
  if [ "$response" = "y" ]; then
    /doc-generate
  fi
fi
```

---

## 💡 Tips

1. **Première fois** : Utiliser `/doc-generate --force` pour générer tout
2. **Incrémental** : Utiliser `/doc-update` après modifications
3. **Vérification** : Lancer `/doc-check` régulièrement
4. **Docstrings** : Ajouter docstrings/JSDoc dans code pour meilleure qualité
5. **Examples** : Fournir exemples dans tests pour génération automatique
6. **Commit** : Committer documentation avec code dans même PR

---

## 🐛 Troubleshooting

**Problème** : Score qualité < 70%
**Solution** :
- Ajouter docstrings/JSDoc manquants
- Documenter endpoints dans code source
- Fournir exemples dans tests

**Problème** : Parser échoue
**Solution** :
- Vérifier syntaxe code (linter)
- Installer dépendances parser (`pip install ast`, `npm install ts-morph`)

**Problème** : Documentation incomplète
**Solution** :
- Vérifier que fichiers sont dans scope (pas dans `exclude`)
- Utiliser `--include-tests` si nécessaire
- Vérifier logs avec `--verbose`

**Problème** : Exemples générés incorrects
**Solution** :
- Fournir exemples manuels dans tests
- Utiliser fixtures réalistes
- Configurer `.claude/doc-config.json`

---

## 📚 Ressources

- **Agent complet** : `agents/Documentation-Generator/AGENT.md`
- **Configuration** : `.claude/doc-config.json`
- **Mise à jour** : `.claude/commands/doc-update.md`
- **Vérification** : `.claude/commands/doc-check.md`

---

**Créé** : 2026-01-26
**Version** : 1.0
**Maintenu par** : Système Agents
