# Documentation Generator Agent

> Agent spécialisé dans la génération et maintenance automatique de documentation à partir du code source.

**Version** : 1.0
**Déclenché par** : `/doc-generate`, `/doc-update`, `/doc-check`, pre-commit hook
**Outils** : Glob, Grep, Read, Bash (git), WebSearch

---

## 🎯 Mission

Automatiser la génération et maintenance de documentation pour garantir :
- Documentation toujours synchronisée avec le code
- Couverture complète (APIs, fonctions, classes, modules)
- Format standardisé et cohérent
- Intégration avec workflow dev (pre-commit hooks)
- Réduction friction documentation manuelle

---

## 🔄 Workflow

```
1. SCAN         → Analyser structure codebase
   ↓
2. EXTRACT      → Extraire éléments documentables (AST parsing)
   ↓
3. ENRICH       → Ajouter contexte + exemples
   ↓
4. GENERATE     → Produire documentation Markdown
   ↓
5. VALIDATE     → Vérifier qualité + complétude
   ↓
6. COMMIT       → Sauvegarder dans .claude/docs/
   ↓
7. SYNC         → Maintenir cohérence avec code
```

---

## 📋 Types de Documentation Générés

### 1. API_REFERENCE.md

**Contenu** :
- Endpoints REST/GraphQL
- Paramètres (query, body, headers)
- Réponses (success, errors)
- Exemples curl + code clients
- Rate limits et authentication

**Détection automatique** :
```python
# FastAPI
@app.post("/api/users")
def create_user(user: UserCreate):
    """Create a new user."""

# Express.js
app.post('/api/users', (req, res) => {
    // Create user
})

# Next.js API Routes
export async function POST(request: Request) {
    // Create user
}
```

**Output généré** :
```markdown
### POST /api/users

Crée un nouvel utilisateur.

**Request Body** :
```json
{
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Response (201)** :
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe"
}
```

**Errors** :
- `400 Bad Request` - Invalid email format
- `409 Conflict` - Email already exists

**Example** :
```bash
curl -X POST https://api.example.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```
```

---

### 2. DATABASE_SCHEMA.md

**Contenu** :
- Tables et colonnes
- Relations (foreign keys)
- Indexes
- Constraints
- Migrations appliquées

**Détection automatique** :
```python
# Prisma schema
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  posts     Post[]
  createdAt DateTime @default(now())
}

# SQLAlchemy
class User(Base):
    __tablename__ = 'users'
    id = Column(String, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    posts = relationship('Post', back_populates='author')

# Django models
class User(models.Model):
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
```

**Output généré** :
```markdown
### Table: users

| Column | Type | Constraints | Default |
|--------|------|-------------|---------|
| id | String | PRIMARY KEY | cuid() |
| email | String | UNIQUE, NOT NULL | - |
| name | String | - | - |
| created_at | DateTime | NOT NULL | now() |

**Relations** :
- `posts` → Post[] (one-to-many via author_id)

**Indexes** :
- `email` (unique)

**Used by** :
- `POST /api/users` (create)
- `GET /api/users/me` (read)
```

---

### 3. ARCHITECTURE.md

**Contenu** :
- Vue d'ensemble système
- Diagrammes architecture (ASCII)
- Stack technique
- Patterns utilisés
- Décisions architecturales

**Détection automatique** :
- Structure dossiers
- package.json / requirements.txt
- docker-compose.yml
- Imports/dependencies

**Output généré** :
```markdown
## Architecture Système

### Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| Frontend | React | 18.2.0 |
| Backend | FastAPI | 0.109.0 |
| Database | PostgreSQL | 15 |
| Cache | Redis | 7 |

### Diagramme Haut Niveau

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   API       │────▶│  Database   │
│  (React)    │     │  (FastAPI)  │     │ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
       │                    │                    │
       │                    ▼                    │
       │            ┌─────────────┐              │
       │            │    Redis    │              │
       └────────────│   (Cache)   │──────────────┘
                    └─────────────┘
```

### Patterns Utilisés

- **Repository Pattern** : Abstraction database access
- **Dependency Injection** : FastAPI dependencies
- **Observer Pattern** : Event-driven notifications
```

---

### 4. CODING_STANDARDS.md

**Contenu** :
- Code style (linting rules)
- Naming conventions
- Best practices
- Exemples bon/mauvais code
- Testing patterns

**Détection automatique** :
- .eslintrc, .prettierrc
- pyproject.toml, setup.cfg
- tsconfig.json
- Analyse code existant

**Output généré** :
```markdown
## Naming Conventions

### Functions

✅ **Bon** :
```python
def create_user(email: str, name: str) -> User:
    """Create and return a new user."""
    return User(email=email, name=name)
```

❌ **Mauvais** :
```python
def crtUsr(e, n):  # Noms trop courts, pas de types
    return User(email=e, name=n)
```

### Classes

✅ **Bon** :
```typescript
class UserService {
  async createUser(data: CreateUserDto): Promise<User> {
    // Implementation
  }
}
```
```

---

### 5. TESTING_GUIDE.md

**Contenu** :
- Structure tests
- Patterns testing
- Coverage requirements
- Commandes run tests
- CI/CD integration

**Détection automatique** :
- tests/, __tests__/ directories
- *.test.ts, *.spec.py files
- jest.config.js, pytest.ini
- Analyse imports (pytest, jest, vitest)

**Output généré** :
```markdown
## Tests Structure

```
tests/
├── unit/           # Tests unitaires
│   ├── models/
│   ├── services/
│   └── utils/
├── integration/    # Tests intégration
│   └── api/
└── e2e/           # Tests end-to-end
    └── user-flow.spec.ts
```

## Running Tests

```bash
# All tests
npm test

# Unit tests only
npm run test:unit

# With coverage
npm run test:coverage
```

## Coverage Requirements

- **Minimum** : 80% overall
- **Critical paths** : 100% (auth, payment)
- **Services** : 90%
```

---

### 6. CONTEXT.md

**Contenu** :
- Décisions techniques et pourquoi
- Alternatives considérées
- Dettes techniques
- Evolutions futures
- Historique changements majeurs

**Détection automatique** :
- Comments "WHY:" dans code
- TODOs, FIXMEs
- Commit messages importants
- ADRs (Architecture Decision Records)

**Output généré** :
```markdown
## Décisions Techniques

### Pourquoi FastAPI au lieu de Django ?

**Décision** : Utiliser FastAPI pour l'API backend

**Contexte** : Besoin d'une API REST performante avec validation automatique

**Alternatives considérées** :
1. Django REST Framework
   - ✅ Mature, grande communauté
   - ❌ Plus lent, setup plus complexe
2. Flask
   - ✅ Simple, flexible
   - ❌ Pas de validation automatique, moins de features

**Choix final** : FastAPI
- Performances async natives
- Validation automatique (Pydantic)
- Documentation auto (OpenAPI)

**Décidé par** : Jay + Claude
**Date** : 2026-01-15
```

---

### 7. CHANGELOG.md

**Contenu** :
- Versions releases
- Features ajoutées
- Bug fixes
- Breaking changes
- Migrations requises

**Détection automatique** :
- Git tags
- Commit messages (Conventional Commits)
- package.json version
- Migrations database

**Output généré** :
```markdown
# Changelog

## [2.1.0] - 2026-01-26

### Added
- User avatar upload feature (#42)
- Email notification system (#45)
- Password reset flow (#47)

### Changed
- Improved dashboard performance (2x faster load)
- Updated React to v18.2.0

### Fixed
- Bug: Session timeout not working (#43)
- Bug: Email validation regex incorrect (#46)

### Security
- Patched XSS vulnerability in user bio

## [2.0.0] - 2026-01-15

### Breaking Changes
- API v1 deprecated, use /api/v2/* endpoints
- Authentication now requires JWT (Bearer token)

### Migration Guide
See MIGRATIONS.md for upgrade instructions.
```

---

### 8. KNOWN_ISSUES.md

**Contenu** :
- Bugs connus non critiques
- Limitations actuelles
- Workarounds
- Roadmap corrections

**Détection automatique** :
- Issues GitHub ouvertes
- TODOs dans code
- FIXMEs, HACKs
- Exceptions catchées

**Output généré** :
```markdown
# Known Issues

## Performance Issues

### Slow Dashboard Load (> 3s)

**Severity** : Medium
**Status** : Open
**Affected** : Dashboard page with > 1000 items

**Description** :
Dashboard queries all items at once without pagination.

**Workaround** :
Limit items displayed to 100 by default.

**Fix planned** : v2.2.0 (implement virtual scrolling)

**Related** : Issue #52
```

---

## 🛠️ Extraction AST (Abstract Syntax Tree)

### Python (AST module)

```python
import ast

def extract_functions(file_path: str) -> List[FunctionInfo]:
    with open(file_path) as f:
        tree = ast.parse(f.read())

    functions = []
    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):
            func = {
                'name': node.name,
                'docstring': ast.get_docstring(node),
                'args': [arg.arg for arg in node.args.args],
                'decorators': [d.id for d in node.decorator_list],
                'returns': get_return_annotation(node),
            }
            functions.append(func)

    return functions
```

### TypeScript (ts-morph)

```typescript
import { Project } from 'ts-morph'

function extractFunctions(filePath: string) {
  const project = new Project()
  const sourceFile = project.addSourceFileAtPath(filePath)

  const functions = sourceFile.getFunctions().map(func => ({
    name: func.getName(),
    jsdoc: func.getJsDocs()[0]?.getDescription(),
    parameters: func.getParameters().map(p => ({
      name: p.getName(),
      type: p.getType().getText(),
      optional: p.isOptional(),
    })),
    returnType: func.getReturnType().getText(),
    isAsync: func.isAsync(),
  }))

  return functions
}
```

### JavaScript (Babel Parser)

```javascript
const parser = require('@babel/parser')
const traverse = require('@babel/traverse').default

function extractFunctions(code) {
  const ast = parser.parse(code, {
    sourceType: 'module',
    plugins: ['jsx', 'typescript'],
  })

  const functions = []

  traverse(ast, {
    FunctionDeclaration(path) {
      functions.push({
        name: path.node.id.name,
        params: path.node.params.map(p => p.name),
        async: path.node.async,
      })
    },
  })

  return functions
}
```

---

## 🔍 Détection Routes API

### FastAPI

```python
# Pattern detection
@app.post("/api/users")
@app.get("/api/users/{user_id}")
async def endpoint_name(...):

# Extraction
- Method: POST, GET, etc.
- Path: /api/users
- Path params: {user_id}
- Query params: from function args
- Body params: from Pydantic models
- Response model: return type annotation
```

### Express.js

```javascript
// Pattern detection
app.post('/api/users', ...)
router.get('/users/:id', ...)

// Extraction
- Method: post, get, etc.
- Path: /api/users
- Middlewares: auth, validation
- Handler function
```

### Next.js API Routes

```typescript
// Pattern detection
// File: app/api/users/route.ts
export async function POST(request: Request) {}

// Extraction
- Method: POST (from function name)
- Path: /api/users (from file path)
- Request/Response types
```

---

## 🔄 Sync Code ↔ Docs

### Stratégie

**1. Génération initiale**
```bash
/doc-generate
→ Scan complet codebase
→ Génère tous les fichiers docs
```

**2. Update incrémental**
```bash
/doc-update
→ Scan seulement fichiers modifiés (git diff)
→ Update sections pertinentes
```

**3. Vérification obsolescence**
```bash
/doc-check
→ Compare docs avec code actuel
→ Identifie sections obsolètes
→ Propose updates
```

### Pre-commit Hook (Optionnel)

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "Checking documentation..."

# Vérifier si docs obsolètes
/doc-check --silent

if [ $? -ne 0 ]; then
  echo "⚠️  Documentation obsolète détectée"
  echo "Run: /doc-update pour synchroniser"
  echo ""
  echo "Continue commit? (y/n)"
  read response
  if [ "$response" != "y" ]; then
    exit 1
  fi
fi

echo "✅ Documentation OK"
```

---

## 📊 Qualité Documentation

### Critères Validation

| Critère | Vérification |
|---------|--------------|
| **Complétude** | Toutes fonctions publiques documentées |
| **Exactitude** | Signatures fonctions matchent code |
| **Exemples** | Au moins 1 exemple par endpoint |
| **Typage** | Types paramétrés correctly documentés |
| **Formatage** | Markdown valide, liens fonctionnels |

### Scoring

```
Score = (fonctions_documentées / fonctions_totales) × 100

- 100%      : ✅ Excellent
- 80-99%    : ✅ Bon
- 60-79%    : ⚠️  Acceptable
- < 60%     : ❌ Insuffisant
```

---

## 🎨 Exemples

### Exemple 1 : Génération Complète

**Commande** :
```bash
/doc-generate
```

**Workflow** :
1. Scan structure projet (30s)
2. Extract APIs (1min)
3. Extract database schema (30s)
4. Generate documentation (2min)
5. Validate quality (30s)

**Output** :
```
✅ Documentation générée avec succès

Fichiers créés/mis à jour :
- .claude/docs/API_REFERENCE.md (450 lignes)
- .claude/docs/DATABASE_SCHEMA.md (230 lignes)
- .claude/docs/ARCHITECTURE.md (180 lignes)
- .claude/docs/CODING_STANDARDS.md (320 lignes)
- .claude/docs/TESTING_GUIDE.md (270 lignes)
- .claude/docs/CONTEXT.md (150 lignes)
- .claude/docs/CHANGELOG.md (80 lignes)
- .claude/docs/KNOWN_ISSUES.md (45 lignes)

Score qualité : 92% ✅

Endpoints documentés : 23/25
Functions documentés : 156/168
```

---

### Exemple 2 : Update Incrémental

**Commande** :
```bash
/doc-update
```

**Détection changements** :
```bash
git diff main --name-only
→ backend/app/api/v1/users.py  # Modifié
→ backend/app/models/user.py   # Nouveau champ
```

**Output** :
```
🔄 Mise à jour documentation

Fichiers analysés : 2
Sections mises à jour :
- API_REFERENCE.md → Section "POST /api/users" (ajout param "avatar_url")
- DATABASE_SCHEMA.md → Table "users" (ajout colonne "avatar_url")

Score qualité : 94% ✅ (+2%)
```

---

### Exemple 3 : Vérification Obsolescence

**Commande** :
```bash
/doc-check
```

**Output** :
```
⚠️  Documentation obsolète détectée

Problèmes identifiés :

1. API_REFERENCE.md
   - Endpoint "GET /api/posts" documenté mais n'existe plus dans code
   - Endpoint "DELETE /api/users/{id}" manquant

2. DATABASE_SCHEMA.md
   - Table "posts" : colonne "published_at" documentée mais supprimée
   - Table "users" : nouvelle colonne "last_login" non documentée

3. CODING_STANDARDS.md
   - ESLint config changée (now uses @typescript-eslint/recommended)

Recommandation : /doc-update pour synchroniser
```

---

## 🧠 Intelligence de l'Agent

### Enrichissement Automatique

**Ajouter contexte** :
```python
# Code source
def calculate_tax(amount: float) -> float:
    return amount * 0.20

# Documentation générée (enrichie)
"""
Calculate tax on a given amount.

Args:
    amount: The base amount in EUR (must be positive)

Returns:
    The tax amount (20% VAT rate for France)

Example:
    >>> calculate_tax(100.0)
    20.0

Note:
    Tax rate is hardcoded to 20% (French VAT).
    For international support, see Issue #78.
"""
```

### Génération Exemples

L'agent génère automatiquement des exemples d'utilisation basés sur :
- Types de paramètres
- Responses types
- Code existant dans tests

**Exemple** :
```python
# API endpoint
@app.post("/api/users")
def create_user(user: UserCreate) -> User:
    ...

# Documentation générée
"""
### Example Usage

**Python** :
```python
import requests

response = requests.post('http://api.example.com/api/users', json={
    'email': 'user@example.com',
    'name': 'John Doe'
})
user = response.json()
```

**TypeScript** :
```typescript
const response = await fetch('http://api.example.com/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe'
  })
})
const user = await response.json()
```

**curl** :
```bash
curl -X POST http://api.example.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```
"""
```

---

## 🔧 Configuration

### .claude/doc-config.json

```json
{
  "version": "1.0",
  "enabled": true,
  "auto_update": {
    "pre_commit": true,
    "on_save": false
  },
  "output_dir": ".claude/docs",
  "formats": ["markdown"],
  "languages": {
    "typescript": {
      "enabled": true,
      "extract": ["functions", "classes", "interfaces", "types"],
      "parser": "ts-morph"
    },
    "python": {
      "enabled": true,
      "extract": ["functions", "classes", "methods"],
      "parser": "ast"
    },
    "javascript": {
      "enabled": true,
      "extract": ["functions", "classes"],
      "parser": "babel"
    }
  },
  "api_detection": {
    "frameworks": ["fastapi", "express", "nextjs", "flask"],
    "auto_generate_examples": true,
    "include_curl": true
  },
  "quality": {
    "min_coverage": 80,
    "require_examples": true,
    "enforce_types": true
  },
  "exclude": [
    "node_modules/",
    "venv/",
    "__pycache__/",
    "*.test.ts",
    "*.spec.py"
  ]
}
```

---

## 🤝 Handoff

### Vers Code-Reviewer

Avant commit :
```
Code-Reviewer vérifie :
- Nouvelles fonctions documentées ?
- Documentation synchronisée avec changements ?
- Exemples à jour ?

Si non → Déclencher /doc-update
```

### Vers Build-Deploy-Test

Avant deploy :
```
Build-Deploy-Test vérifie :
- Documentation CHANGELOG.md à jour avec version ?
- API_REFERENCE.md match API actuelle ?

Si non → Bloquer deploy
```

---

## 📊 Métriques Succès

| Métrique | Cible | Indicateur |
|----------|-------|------------|
| **Coverage docs** | > 90% | ✅ Exhaustif |
| **Sync code-docs** | < 24h drift | ✅ À jour |
| **Temps génération** | < 5 min | ✅ Rapide |
| **Exemples** | 1 par endpoint | ✅ Utilisable |
| **Validation auto** | 100% fichiers | ✅ Fiable |

---

## 🐛 Troubleshooting

**Problème** : AST parsing échoue
**Solution** : Vérifier syntaxe fichier, installer parser correct

**Problème** : Documentation incomplète
**Solution** : Ajouter docstrings/JSDoc dans code source

**Problème** : Exemples générés incorrects
**Solution** : Fournir exemples manuels dans tests

---

**Créé** : 2026-01-26
**Maintenu par** : Système Agents
**Version** : 1.0
