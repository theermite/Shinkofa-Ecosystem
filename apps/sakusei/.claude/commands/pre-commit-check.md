# /pre-commit-check

Lance la checklist de vérification pre-commit automatique avant de commiter du code.

## Description

Cette commande vérifie automatiquement la qualité, sécurité, tests et documentation avant un commit Git. Elle exécute tous les checks nécessaires et génère un rapport avec statuts ✅ ou ❌.

## Usage

```bash
/pre-commit-check
```

## Comportement

Exécute les vérifications suivantes dans l'ordre :

### 1. **Code Quality**
- [ ] **Linting pass** :
  - Python : `ruff check --fix .`
  - JS/TS : `npm run lint -- --fix`
- [ ] **Type-checking pass** :
  - Python : `mypy .`
  - TypeScript : `tsc --noEmit`
- [ ] **No debug statements** : Scan pour `console.log()`, `print()`, `debugger`
- [ ] **No commented code** : Détecte blocs code commentés (regex)
- [ ] **No TODO/FIXME non documentés** : Si TODO trouvé, vérifier présence dans TECH-DEBT.md ou GitHub issue

### 2. **Security**
- [ ] **No hardcoded secrets** :
  - Scan regex : `(api[_-]?key|password|secret|token|bearer)\s*=\s*['"][^'"]{8,}['"]`
  - Patterns : API keys, passwords, tokens dans code
- [ ] **No sensitive data in logs** : Scan logs pour PII, passwords
- [ ] **.env.example à jour** : Si nouvelles vars `.env`, vérifier présence dans `.env.example`
- [ ] **Dependencies vulnerabilities** :
  - Python : `pip-audit` (si installé, sinon skip)
  - JS/TS : `npm audit --audit-level=high`
  - Fail si vulnérabilités critiques

### 3. **Tests**
- [ ] **Tests pertinents passent** :
  - Si modifs backend/core : Lancer tests unitaires correspondants
  - Python : `pytest -v [fichiers_modifiés]`
  - JS/TS : `npm test -- [fichiers_modifiés]`
- [ ] **No test.skip() ou test.only()** : Scan fichiers tests
- [ ] **Coverage maintenu** : Coverage ≥ 80%
  - Python : `pytest --cov --cov-report=term-missing`
  - JS/TS : `npm test -- --coverage`

### 4. **Documentation**
- [ ] **README.md à jour** : Si changement usage/install/config, vérifier section pertinente mise à jour
- [ ] **CHANGELOG.md entry** : Vérifier entrée dans section `[Unreleased]`
- [ ] **Docstrings/JSDoc à jour** : Fonctions modifiées documentées
- [ ] **API docs régénérées** : Si endpoints modifiés (FastAPI auto-OK, autres vérifier)

### 5. **Git**
- [ ] **Message commit descriptif** : Format `type(scope): description` respecté
- [ ] **Fichiers pertinents uniquement** : Pas de `node_modules/`, `__pycache__/`, `.DS_Store` staged
- [ ] **Atomic commit** : 1 commit = 1 changement logique cohérent

## Exemple Output

```
🔍 Pre-Commit Check - 2026-01-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 CODE QUALITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Linting pass (ruff check --fix .)
✅ Type-checking pass (mypy .)
✅ No debug statements
✅ No commented code
⚠️  TODO found: src/utils.py:45 (not in TECH-DEBT.md)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔒 SECURITY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ No hardcoded secrets
✅ No sensitive data in logs
✅ .env.example up-to-date
✅ Dependencies vulnerabilities (0 critical, 2 moderate)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🧪 TESTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Tests pass (12 passed, 0 failed)
✅ No test.skip() or test.only()
✅ Coverage maintained (85%)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📚 DOCUMENTATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ README.md up-to-date
❌ CHANGELOG.md missing entry for [Unreleased]
✅ Docstrings/JSDoc up-to-date
✅ API docs OK (FastAPI auto-generated)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 GIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Commit message descriptive
✅ Relevant files only
✅ Atomic commit

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Passed : 18/20 checks
⚠️  Warnings: 1 (TODO not documented)
❌ Failed  : 1 (CHANGELOG.md missing entry)

⚠️ RECOMMANDATIONS :
1. Ajouter TODO src/utils.py:45 dans TECH-DEBT.md ou créer GitHub issue
2. Ajouter entrée dans CHANGELOG.md [Unreleased] section

❌ COMMIT BLOQUÉ : Corrige 1 erreur critique avant de commiter.
```

## Actions Auto-Fix

La commande peut **auto-fix** certains problèmes si option `--fix` :

```bash
/pre-commit-check --fix
```

**Auto-fixable** :
- Linting errors (ruff/eslint --fix)
- Formatage (black, prettier)
- Imports triés (isort, organize-imports)
- .env.example génération automatique

**Non auto-fixable** (require manual) :
- Tests failures
- CHANGELOG.md entries
- Docstrings manquantes
- Hardcoded secrets (require code refactoring)

## Exit Codes

- **0** : Tous checks passent ✅
- **1** : Warnings uniquement ⚠️ (commit autorisé mais review recommandé)
- **2** : Erreurs critiques ❌ (commit bloqué)

## Quand Utiliser

- **Avant CHAQUE commit** (idéalement via Git hook)
- **Après modifications majeures** (nouvelle feature, refactoring)
- **Avant PR/MR** (validation finale)
- **En CI/CD** (GitHub Actions pre-merge check)

## Configuration

Fichier `.pre-commit-config.yaml` (optionnel) :

```yaml
skip_checks:
  - dependencies_vulnerabilities  # Skip si trop lent
  - test_coverage                 # Skip si tests désactivés

severity:
  missing_changelog: warning      # Downgrade de error à warning

auto_fix: true                    # Auto-fix par défaut
```

## Notes

- **Performance** : Exécution parallèle des checks indépendants (linting + type-checking + security scan)
- **Cache** : Résultats cachés 5 min (si aucun fichier modifié)
- **Skippable** : Utiliser `git commit --no-verify` pour bypass (déconseillé)
