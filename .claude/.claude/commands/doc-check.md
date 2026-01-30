# /doc-check - Vérification Documentation Obsolète

> Vérifie si la documentation est synchronisée avec le code actuel et identifie les sections obsolètes.

**Agent déclenché** : `agents/Documentation-Generator/AGENT.md`
**Version** : 1.0
**Temps moyen** : 20-60 secondes

---

## 🎯 Objectif

Détecter automatiquement les **écarts entre documentation et code** pour maintenir la documentation toujours à jour.

**Détecte** :
- ✅ Endpoints documentés mais supprimés du code
- ✅ Nouveaux endpoints non documentés
- ✅ Paramètres API changés (ajoutés/supprimés/modifiés)
- ✅ Tables/colonnes database obsolètes
- ✅ Fonctions documentées mais n'existant plus
- ✅ Exemples code avec syntaxe incorrecte
- ✅ Liens internes brisés
- ✅ Versions dependencies obsolètes

---

## 🔧 Utilisation

### Vérification Standard

```bash
/doc-check
```

Analyse complète de toute la documentation et compare avec le code actuel.

---

### Vérification Fichier Spécifique

```bash
# Vérifier seulement API_REFERENCE.md
/doc-check --file API_REFERENCE.md

# Vérifier plusieurs fichiers
/doc-check --file API_REFERENCE.md,DATABASE_SCHEMA.md
```

---

### Vérification par Catégorie

```bash
# Vérifier seulement APIs
/doc-check --category api

# Vérifier seulement database
/doc-check --category database

# Vérifier plusieurs catégories
/doc-check --category api,database,architecture
```

**Catégories disponibles** :
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
# Mode silencieux (exit code only, pour CI/CD)
/doc-check --silent

# Détail maximum
/doc-check --verbose

# Ignorer certains types d'erreurs
/doc-check --ignore-warnings

# Output format JSON (pour automation)
/doc-check --format json

# Fail si score < threshold
/doc-check --min-score 90
```

---

## 📊 Processus de Vérification

### 1. SCAN (15 secondes)

```
🔍 Scanning documentation...

Fichiers documentation trouvés :
   ✅ API_REFERENCE.md (last modified: 2026-01-20)
   ✅ DATABASE_SCHEMA.md (last modified: 2026-01-22)
   ✅ ARCHITECTURE.md (last modified: 2026-01-15)
   ✅ CODING_STANDARDS.md (last modified: 2026-01-10)
   ✅ TESTING_GUIDE.md (last modified: 2026-01-18)
   ✅ CONTEXT.md (last modified: 2026-01-25)
   ✅ CHANGELOG.md (last modified: 2026-01-26)
   ✅ KNOWN_ISSUES.md (last modified: 2026-01-24)
```

### 2. COMPARE (30 secondes)

```
🔄 Comparing with codebase...

API Endpoints:
   ✅ 21/23 documentés (2 manquants)
   ⚠️  3 endpoints doc obsolètes

Database Schema:
   ✅ 8/8 tables documentées
   ⚠️  2 colonnes obsolètes
   ⚠️  1 nouvelle colonne non documentée

Functions/Classes:
   ✅ 156/168 documentées (93%)
   ⚠️  12 fonctions publiques non documentées

Examples:
   ✅ 19/21 exemples syntax valid
   ❌ 2 exemples avec erreurs
```

### 3. REPORT (5 secondes)

```
📊 Rapport Vérification

Score global : 87% ⚠️

Problèmes identifiés : 11
   - Critiques : 2 ❌
   - Warnings : 6 ⚠️
   - Infos : 3 ℹ️

Recommandation : /doc-update
```

---

## 🚨 Types de Problèmes Détectés

### 1. Endpoints Obsolètes (CRITIQUE)

**Détection** :
```markdown
❌ CRITIQUE: API_REFERENCE.md

Endpoint documenté mais n'existe plus :
- GET /api/posts → Supprimé du code

Location: API_REFERENCE.md:145
Last modified: 2026-01-20 (code modifié: 2026-01-25)

Action recommandée:
1. Supprimer documentation de cet endpoint
2. OU ajouter note "Deprecated" si sunset progressif
```

---

### 2. Endpoints Non Documentés (WARNING)

**Détection** :
```markdown
⚠️  WARNING: API_REFERENCE.md

Endpoint existe dans code mais pas documenté :
- POST /api/users/avatar

Location: backend/app/api/v1/users.py:42
Created: 2026-01-26

Action recommandée:
/doc-update → Ajoutera automatiquement documentation
```

---

### 3. Paramètres Changés (WARNING)

**Détection** :
```markdown
⚠️  WARNING: API_REFERENCE.md

Endpoint: POST /api/users
Paramètre changé :

Code actuel :
{
  "email": "string",
  "name": "string",
  "password": "string",
  "avatar_url": "string (optional)"  ← NOUVEAU
}

Documentation actuelle :
{
  "email": "string",
  "name": "string",
  "password": "string"
}

Location: API_REFERENCE.md:89

Action recommandée:
/doc-update → Synchronisera paramètres
```

---

### 4. Schema Database Obsolète (WARNING)

**Détection** :
```markdown
⚠️  WARNING: DATABASE_SCHEMA.md

Table: users
Colonne documentée mais n'existe plus :
- "temporary_token" (VARCHAR(255))

Colonne existe mais pas documentée :
- "avatar_url" (VARCHAR(500))

Location: DATABASE_SCHEMA.md:34

Action recommandée:
/doc-update --only database
```

---

### 5. Exemples Code Invalides (CRITIQUE)

**Détection** :
```markdown
❌ CRITIQUE: API_REFERENCE.md

Exemple code avec syntaxe incorrecte :

```python
response = requests.post('http://api.example.com/api/users', json={
    'email': 'user@example.com'
    'name': 'John Doe'  ← Virgule manquante
})
```

Location: API_REFERENCE.md:156
Error: SyntaxError: invalid syntax

Action recommandée:
Corriger exemple manuellement OU régénérer avec /doc-generate
```

---

### 6. Liens Internes Brisés (WARNING)

**Détection** :
```markdown
⚠️  WARNING: ARCHITECTURE.md

Lien interne brisé :
[Database Schema](./DATABASE_SCHMEA.md)  ← Typo: SCHMEA vs SCHEMA

Target: DATABASE_SCHMEA.md (n'existe pas)
Did you mean: DATABASE_SCHEMA.md ?

Location: ARCHITECTURE.md:78

Action recommandée:
Corriger lien manuellement
```

---

### 7. Versions Dependencies Obsolètes (INFO)

**Détection** :
```markdown
ℹ️  INFO: ARCHITECTURE.md

Version documentée différente de package.json :

Documenté: React 18.0.0
Actuel: React 18.2.0

Location: ARCHITECTURE.md:23

Action recommandée:
/doc-update --only architecture
```

---

### 8. Fonctions Non Documentées (INFO)

**Détection** :
```markdown
ℹ️  INFO: Coverage

12 fonctions publiques sans docstrings :

- calculate_user_score() (backend/app/services/scoring.py:45)
- format_currency() (backend/app/utils/formatting.py:12)
- validate_phone() (backend/app/utils/validators.py:67)
...

Action recommandée:
Ajouter docstrings dans code source puis /doc-update
```

---

## 📊 Score de Qualité

### Calcul du Score

```
Score = (
    (endpoints_sync / endpoints_total) × 30% +
    (params_sync / params_total) × 20% +
    (database_sync / tables_total) × 20% +
    (examples_valid / examples_total) × 15% +
    (links_valid / links_total) × 10% +
    (functions_documented / functions_public) × 5%
) × 100
```

### Interprétation

| Score | État | Action |
|-------|------|--------|
| **95-100%** | 🏆 Excellent | Maintenir |
| **90-94%** | ✅ Très bon | Corrections mineures |
| **80-89%** | ✅ Bon | /doc-update recommandé |
| **70-79%** | ⚠️  Moyen | /doc-update requis |
| **60-69%** | ⚠️  Faible | /doc-generate conseillé |
| **< 60%** | ❌ Critique | /doc-generate IMMÉDIAT |

---

## 📋 Output Formats

### Format Standard (Human-Readable)

```
📊 Rapport Vérification Documentation

Score global : 87% ⚠️

══════════════════════════════════════════════════════

❌ PROBLÈMES CRITIQUES (2)

1. API_REFERENCE.md:145
   Endpoint obsolète : GET /api/posts
   → Supprimé du code le 2026-01-25

2. API_REFERENCE.md:156
   Exemple code invalide (SyntaxError)
   → Corriger syntaxe Python

══════════════════════════════════════════════════════

⚠️  WARNINGS (6)

1. API_REFERENCE.md:89
   Paramètre manquant : "avatar_url" (optional)
   → Endpoint POST /api/users

2. DATABASE_SCHEMA.md:34
   Colonne obsolète : "temporary_token"
   → Table users

...

══════════════════════════════════════════════════════

ℹ️  INFORMATIONS (3)

1. 12 fonctions publiques sans docstrings
2. Version React obsolète dans ARCHITECTURE.md
3. 2 endpoints nouveaux non documentés

══════════════════════════════════════════════════════

📝 ACTIONS RECOMMANDÉES

1. /doc-update --only api,database
   → Synchronisera automatiquement 8/11 problèmes

2. Corriger manuellement :
   - Exemple Python ligne 156 (syntax error)
   - Lien brisé ARCHITECTURE.md:78

3. Ajouter docstrings :
   - calculate_user_score()
   - format_currency()
   - validate_phone()
   ...

══════════════════════════════════════════════════════

Dernière vérification : 2026-01-26 10:30:15
Durée : 47 secondes
```

---

### Format JSON (Automation)

```bash
/doc-check --format json
```

```json
{
  "timestamp": "2026-01-26T10:30:15Z",
  "duration_seconds": 47,
  "score": 87,
  "status": "warning",
  "problems": {
    "critical": 2,
    "warning": 6,
    "info": 3
  },
  "issues": [
    {
      "severity": "critical",
      "type": "obsolete_endpoint",
      "file": "API_REFERENCE.md",
      "line": 145,
      "message": "Endpoint documented but removed from code",
      "details": {
        "endpoint": "GET /api/posts",
        "removed_date": "2026-01-25"
      },
      "action": "Remove documentation or mark deprecated"
    },
    {
      "severity": "warning",
      "type": "missing_parameter",
      "file": "API_REFERENCE.md",
      "line": 89,
      "message": "Parameter exists in code but not documented",
      "details": {
        "endpoint": "POST /api/users",
        "parameter": "avatar_url",
        "type": "string",
        "optional": true
      },
      "action": "/doc-update --only api"
    }
  ],
  "recommendations": [
    "/doc-update --only api,database",
    "Fix syntax error at API_REFERENCE.md:156",
    "Add docstrings to 12 public functions"
  ],
  "can_auto_fix": 8,
  "requires_manual": 3
}
```

---

### Format CI/CD (Silent)

```bash
/doc-check --silent
```

**Exit codes** :
- `0` : Documentation OK (score ≥ 90%)
- `1` : Warnings (score 70-89%)
- `2` : Critique (score < 70%)

**Output** :
```
Documentation check: WARNING (score: 87%)
```

**Usage dans CI** :
```yaml
# .github/workflows/check-docs.yml
- name: Check Documentation
  run: /doc-check --silent --min-score 90
  continue-on-error: true  # Warning mais pas fail build
```

---

## 🔄 Intégration Workflow

### Workflow Local

```
1. Développer feature
   ↓
2. /doc-check  ← Vérifier état docs
   ↓
3. Si score < 90% → /doc-update
   ↓
4. /doc-check  ← Re-vérifier après update
   ↓
5. Si OK → Commit
```

### Pre-commit Hook

```bash
# .git/hooks/pre-commit
#!/bin/bash

echo "🔍 Checking documentation..."

/doc-check --silent --min-score 85

if [ $? -eq 2 ]; then
  echo "❌ Documentation critique (score < 70%)"
  echo ""
  echo "Run: /doc-update pour synchroniser"
  echo ""
  echo "Continue commit anyway? (y/n)"
  read response
  if [ "$response" != "y" ]; then
    exit 1
  fi
elif [ $? -eq 1 ]; then
  echo "⚠️  Documentation warnings (score 70-89%)"
  echo "Consider running: /doc-update"
fi

echo "✅ Documentation check passed"
```

### CI/CD Pipeline

```yaml
# .github/workflows/docs-check.yml
name: Documentation Check

on: [push, pull_request]

jobs:
  check-docs:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Claude Code
        run: |
          # Install Claude Code CLI
          ...

      - name: Check Documentation
        run: /doc-check --format json > doc-report.json

      - name: Upload Report
        uses: actions/upload-artifact@v3
        with:
          name: doc-report
          path: doc-report.json

      - name: Comment PR
        if: github.event_name == 'pull_request'
        uses: actions/github-script@v6
        with:
          script: |
            const report = require('./doc-report.json')
            github.rest.issues.createComment({
              issue_number: context.issue.number,
              owner: context.repo.owner,
              repo: context.repo.repo,
              body: `📊 Documentation Score: ${report.score}%

              ${report.problems.critical > 0 ? '❌' : '✅'} Critical: ${report.problems.critical}
              ${report.problems.warning > 0 ? '⚠️' : '✅'} Warnings: ${report.problems.warning}

              See full report in artifacts.`
            })
```

---

## ⚙️ Configuration

### .claude/doc-config.json

```json
{
  "check": {
    "enabled": true,
    "min_score": 90,
    "fail_on_critical": true,
    "fail_on_warnings": false
  },
  "rules": {
    "obsolete_endpoints": {
      "enabled": true,
      "severity": "critical"
    },
    "missing_endpoints": {
      "enabled": true,
      "severity": "warning"
    },
    "parameter_mismatch": {
      "enabled": true,
      "severity": "warning"
    },
    "invalid_examples": {
      "enabled": true,
      "severity": "critical"
    },
    "broken_links": {
      "enabled": true,
      "severity": "warning"
    },
    "outdated_versions": {
      "enabled": true,
      "severity": "info"
    },
    "missing_docstrings": {
      "enabled": true,
      "severity": "info",
      "scope": "public_only"
    }
  },
  "ignore": {
    "files": [],
    "endpoints": [],
    "functions": []
  }
}
```

---

## 🎯 Cas d'Usage

### Cas 1 : Avant Pull Request

```bash
git checkout feature/new-endpoint
# [Développer feature]
git add .

# Vérifier docs avant commit
/doc-check

# Score: 82% ⚠️
# → /doc-update

/doc-check
# Score: 96% ✅

git add .claude/docs/
git commit -m "feat: Add new endpoint + update docs"
```

---

### Cas 2 : Review PR Externe

```bash
git checkout pr-123
/doc-check --verbose > doc-review.txt

# Reviewer envoie doc-review.txt au contributeur:
# "Merci pour la PR ! Docs à synchroniser (voir report)"
```

---

### Cas 3 : Audit Mensuel

```bash
# 1er du mois, check global
/doc-check --verbose > audit-$(date +%Y-%m).txt

# Si score < 85%
/doc-update
/doc-check

# Commit audit
git commit -am "docs: Monthly documentation audit"
```

---

## ✅ Checklist

### Avant Commit

- [ ] `/doc-check` exécuté
- [ ] Score ≥ 90% OU raisons justifiées
- [ ] Problèmes critiques résolus
- [ ] Warnings adressés si possible

### Avant Merge

- [ ] CI docs check ✅ passed
- [ ] Reviewer a approuvé documentation
- [ ] CHANGELOG.md mis à jour

### Audit Régulier

- [ ] /doc-check mensuel
- [ ] Tendance score (amélioration vs dégradation)
- [ ] Backlog problèmes priorisés

---

## 💡 Tips

1. **Régularité** : Check avant chaque commit (via hook)
2. **CI/CD** : Intégrer dans pipeline (fail si critique)
3. **Metrics** : Tracker score over time (amélioration continue)
4. **Auto-fix** : Utiliser `/doc-update` pour 80% des problèmes
5. **Manual** : Garder 20% pour review humaine (contexte)
6. **Ignore judicieux** : Certains warnings peuvent être ignored (config)

---

## 🐛 Troubleshooting

**Problème** : Faux positifs (endpoint détecté obsolète mais existe)
**Solution** :
- Vérifier patterns détection dans config
- Ajouter endpoint à `ignore.endpoints` si nécessaire
- Reporter bug si pattern détection incorrect

**Problème** : Score bas mais docs semblent OK
**Solution** :
- Utiliser `--verbose` pour détails
- Vérifier docstrings dans code source
- Vérifier exemples syntax

**Problème** : Check trop lent
**Solution** :
- Utiliser `--category` pour scope limité
- Vérifier `exclude` patterns
- Disable certaines rules non critiques

---

## 📚 Ressources

- **Agent complet** : `agents/Documentation-Generator/AGENT.md`
- **Génération** : `.claude/commands/doc-generate.md`
- **Mise à jour** : `.claude/commands/doc-update.md`
- **Configuration** : `.claude/doc-config.json`

---

**Créé** : 2026-01-26
**Version** : 1.0
**Maintenu par** : Système Agents
