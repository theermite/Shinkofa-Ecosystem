# /breaking-changes-check

Analyse les commits récents pour détecter d'éventuels breaking changes non documentés.

## Description

Cette commande scanne les commits depuis la dernière release pour identifier les changements qui pourraient être des breaking changes. Elle aide à décider si un bump MAJOR est nécessaire et à documenter correctement les breaking changes dans CHANGELOG.md.

## Usage

```bash
/breaking-changes-check [--since <tag|commit>] [--auto-document]
```

**Options** :
- `--since <tag>` : Analyser depuis ce tag/commit (défaut : dernière release tag)
- `--auto-document` : Ajouter automatiquement section BREAKING CHANGES dans CHANGELOG.md

## Comportement

### 1. **Récupération Commits**

```bash
# Depuis dernière release tag
git log v1.5.2..HEAD --oneline

# Ou depuis commit spécifique
git log abc123..HEAD --oneline
```

### 2. **Détection Patterns Breaking Changes**

Analyse commits et code changes pour patterns suivants :

#### **API Changes (Backend)**
- [ ] **Endpoint supprimé** :
  - Regex : `@(app|router)\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]` supprimé
  - Exemple : `/api/users` endpoint retiré

- [ ] **Endpoint renommé** :
  - Même path modifié
  - Exemple : `/users` → `/api/v2/users`

- [ ] **Response structure changée** :
  - Fields supprimés dans response JSON
  - Fields renommés
  - Type de données changé (string → number)

- [ ] **Request params obligatoires ajoutés** :
  - Nouveau param required sans default
  - Exemple : `user_id` devient required

#### **Function Signatures (Code Public)**
- [ ] **Function supprimée** :
  - `def function_name()` ou `export function functionName()` supprimé

- [ ] **Function renommée** :
  - Ancien nom retiré sans alias/decorator backward compat

- [ ] **Parameters modifiés** :
  - Param obligatoire ajouté
  - Param supprimé
  - Type param changé
  - Ordre params changé

#### **Database Migrations**
- [ ] **Column supprimée** :
  - Alembic : `op.drop_column('table', 'column')`

- [ ] **Table supprimée** :
  - Alembic : `op.drop_table('table_name')`

- [ ] **Migration non-réversible** :
  - Pas de `downgrade()` fonction ou `pass` uniquement

- [ ] **Data loss possible** :
  - Migration modifie/supprime données existantes

#### **Configuration Changes**
- [ ] **ENV var renommée/supprimée** :
  - Variable `.env` required supprimée
  - Exemple : `API_KEY` → `SECRET_API_KEY`

- [ ] **Config format changé** :
  - JSON → YAML
  - Structure config modifiée

#### **Dependencies**
- [ ] **Dependency MAJOR bump** :
  - package.json : `"react": "17.x"` → `"react": "18.x"`
  - requirements.txt : `django>=3.0` → `django>=4.0`

- [ ] **Dependency supprimée** :
  - Package retiré (peut casser si users l'utilisaient)

### 3. **Analyse Code Diffs**

Pour chaque commit suspect :

```bash
git show <commit-hash> --unified=5
```

Parse diffs pour patterns :
- Lignes supprimées (`-`) contenant `def`, `export function`, `@app.route`
- Lignes modifiées (`~`) changeant signatures

### 4. **Scoring & Classification**

Chaque pattern détecté reçoit un score :

**HIGH (Breaking Change Confirmé)** :
- Endpoint API supprimé (score: 10)
- Function publique supprimée (score: 10)
- Column DB supprimée (score: 10)

**MEDIUM (Probablement Breaking)** :
- Response structure changée (score: 7)
- Params function modifiés (score: 7)
- ENV var required changée (score: 7)

**LOW (Potentiellement Breaking)** :
- Dependency MAJOR bump (score: 4)
- Config format changé (score: 4)

**Seuil** : Score total ≥ 10 → **MAJOR bump recommandé**

## Exemple Output

```
🔍 Breaking Changes Check - 2026-01-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 ANALYSIS SCOPE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Analyzing commits: v1.5.2..HEAD (12 commits)
Date range: 2025-12-28 → 2026-01-03 (6 days)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 BREAKING CHANGES DETECTED (Score: 24)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ❌ ENDPOINT REMOVED (Score: 10)
   Commit: a3f2b1c - refactor(api): Remove legacy users endpoint
   File  : src/api/routes.py
   Line  : -@router.get("/users")
   Impact: API endpoint `/users` no longer available

   📝 Migration Guide:
   Replace: GET /users
   With   : GET /api/v2/users

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

2. ❌ RESPONSE STRUCTURE CHANGED (Score: 7)
   Commit: b4e8c2d - feat(api): Normalize user response format
   File  : src/api/schemas.py
   Change: Field "username" → "user_name"
   Impact: API response JSON structure changed

   📝 Migration Guide:
   Old response:
   {
     "id": 1,
     "username": "john_doe",
     "email": "..."
   }

   New response:
   {
     "id": 1,
     "user_name": "john_doe",  # renamed
     "email": "..."
   }

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

3. ❌ FUNCTION SIGNATURE CHANGED (Score: 7)
   Commit: c5f9d3e - refactor(auth): Update login function signature
   File  : src/auth/login.py
   Change: def login(username) → def login(username, device_id)
   Impact: New required parameter `device_id` added

   📝 Migration Guide:
   Old: login(username="john")
   New: login(username="john", device_id="device123")

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  POTENTIALLY BREAKING (Score: 4)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

4. ⚠️  DEPENDENCY MAJOR BUMP (Score: 4)
   Commit: d6g0e4f - chore(deps): Bump React 17 → 18
   File  : package.json
   Change: "react": "^17.0.2" → "^18.2.0"
   Impact: React 18 has breaking changes (batching, Suspense)

   📝 Note: Test app thoroughly, check React 18 migration guide

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ NO BREAKING CHANGES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- Commits: 8 commits with no breaking changes detected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total Score          : 24
Breaking Changes     : 3 confirmed
Potentially Breaking : 1

🚨 RECOMMENDATION: MAJOR VERSION BUMP (X.0.0)

Current version: 1.5.2
Next version   : 2.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CHANGELOG.md UPDATE REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Add this section to CHANGELOG.md [Unreleased]:

### BREAKING CHANGES
- **API**: Endpoint `/users` removed, use `/api/v2/users` instead
  - Migration: Replace all calls to `GET /users` with `GET /api/v2/users`

- **API**: User response field renamed `username` → `user_name`
  - Migration: Update client code to use `response.user_name` instead of `response.username`

- **Auth**: Function `login()` now requires `device_id` parameter
  - Migration: Pass `device_id` when calling `login(username, device_id)`

### Changed
- **Dependencies**: React upgraded from 17 to 18 (review React 18 migration guide)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚡ QUICK ACTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. Update CHANGELOG.md with breaking changes
   → /breaking-changes-check --auto-document

2. Bump version to 2.0.0
   → /bump-version major

3. Review migration guide
   → Open CHANGELOG.md and verify migration steps clear
```

## Auto-Documentation

Avec flag `--auto-document` :

1. Lit section `[Unreleased]` dans CHANGELOG.md
2. Ajoute section `### BREAKING CHANGES` si absente
3. Insère breaking changes détectés avec migration guides
4. Ouvre éditeur pour review/édition

```bash
/breaking-changes-check --auto-document
```

Output :
```
✅ CHANGELOG.md updated with BREAKING CHANGES section

📝 Review changes:
  - 3 breaking changes added
  - Migration guides generated

Next: Edit CHANGELOG.md to refine migration steps if needed
```

## False Positives

La commande peut avoir des faux positifs. Review toujours manuellement :

**Cas courants** :
- Function private renommée (pas breaking si pas public API)
- Endpoint interne supprimé (pas exposé publiquement)
- Migration DB avec backward compat (column nullable, default value)

**Comment gérer** :
1. Review output complet
2. Identifier faux positifs
3. Ignorer avec `# breaking-changes-check: ignore` dans commit message

Exemple :
```bash
git commit -m "refactor: Rename internal function

This is an internal refactor, not a breaking change.

# breaking-changes-check: ignore FUNCTION_RENAMED"
```

## Quand Utiliser

- **Avant release** : Vérifier si MAJOR bump nécessaire
- **Après feature branch merge** : Check si breaking changes introduits
- **En code review** : Valider impact changements
- **En CI/CD** : Gate merge si breaking changes non documentés

## CI/CD Integration

GitHub Actions example :

```yaml
name: Breaking Changes Check

on:
  pull_request:
    branches: [main]

jobs:
  breaking-changes:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0  # Full history

      - name: Check breaking changes
        run: claude breaking-changes-check --since origin/main

      - name: Fail if breaking changes undocumented
        run: |
          # Check if BREAKING CHANGES section exists in CHANGELOG
          if ! grep -q "### BREAKING CHANGES" CHANGELOG.md; then
            echo "❌ Breaking changes detected but not documented in CHANGELOG.md"
            exit 1
          fi
```

## Configuration

Fichier `.breaking-changes-config.yaml` (optionnel) :

```yaml
patterns:
  api_endpoint:
    enabled: true
    weight: 10

  function_signature:
    enabled: true
    weight: 7
    exclude_paths:
      - "src/internal/"
      - "tests/"

  dependency_bump:
    enabled: true
    weight: 4
    exclude_packages:
      - "eslint"  # Dev dependency, not breaking

thresholds:
  major_bump: 10
  warning: 5

auto_document: false
```

## Notes

- **Heuristic-based** : Détection basée patterns, pas analyse sémantique complète
- **Review required** : Toujours valider manuellement
- **False negatives possible** : Peut manquer breaking changes subtils
- **Best with clear commits** : Commits descriptifs facilitent détection
