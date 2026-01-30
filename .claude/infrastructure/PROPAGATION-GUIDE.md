# Guide Propagation Automatisée - Méthodologie v4.0

> **Propagation one-command** de la méthodologie Claude Code vers tous les projets.

---

## 🎯 Objectif

Ce guide décrit comment propager automatiquement la méthodologie v4.0 depuis `Instruction-Claude-Code` (source) vers tous vos projets actifs en **une seule commande**.

---

## ⚡ Quick Start (One-Command)

```bash
# Propagation complète (validation + sync + vérification)
bash scripts/propagate-all.sh

# Preview (dry-run)
bash scripts/propagate-all.sh --dry-run

# Force (skip confirmation)
bash scripts/propagate-all.sh --force
```

C'est tout ! Le script gère automatiquement :
- ✅ Validation pré-propagation (score ≥95/100)
- ✅ Synchronisation vers tous les projets
- ✅ Vérification post-propagation
- ✅ Rapports détaillés (JSON)

---

## 📋 Workflow Complet

### Étape 1 : Préparation

```bash
# 1. Vérifier que vous êtes dans Instruction-Claude-Code
cd /path/to/Instruction-Claude-Code
pwd  # Doit afficher le chemin correct

# 2. Vérifier configuration sync
cat scripts/sync-config.json
# OU copier depuis exemple
cp scripts/sync-config.example.json scripts/sync-config.json
vim scripts/sync-config.json
```

**Configurer `sync-config.json`** :
```json
{
  "source_repo": ".",
  "target_projects": [
    "D:/30-Dev-Projects/Shinkofa-Platform",
    "D:/30-Dev-Projects/SLF-Esport",
    "D:/30-Dev-Projects/Social-Content-Master",
    "D:/30-Dev-Projects/Hibiki-Dictate"
  ],
  "sync_patterns": [
    ".claude/CLAUDE.md",
    ".claude/commands/*.md",
    "Prompt-2026-Optimized/core/**/*.md",
    "Prompt-2026-Optimized/agents/**/*.md",
    "Prompt-2026-Optimized/quickrefs/**/*.md",
    "Prompt-2026-Optimized/checklists/**/*.md"
  ],
  "exclude_patterns": [
    "**/node_modules/**",
    "**/.venv/**",
    "**/dist/**"
  ]
}
```

### Étape 2 : Validation Manuelle (Optionnel)

```bash
# Exécuter validation en amont
python scripts/validate-propagation.py

# Avec rapport
python scripts/validate-propagation.py --report reports/pre-validation.json
```

**Critères Validés** (100 points total, minimum 95 requis) :

| Check | Points | Description |
|-------|--------|-------------|
| Git Status | 10 | Repository clean (no uncommitted changes) |
| Tests | 15 | All integration tests pass |
| Pre-commit Hooks | 15 | Hooks configured and passing |
| Documentation | 10 | All required docs present |
| TODOs | 5 | No critical TODOs |
| Secrets | 15 | No credentials detected |
| Templates | 10 | All templates valid |
| Sync Config | 10 | Configuration valid |
| GitHub Actions | 5 | CI/CD workflows configured |
| Infra Docs | 5 | Infrastructure guide complete |

**Si validation échoue** (<95/100), corriger les issues avant de continuer.

### Étape 3 : Preview (Dry Run)

```bash
# Voir ce qui sera synchronisé SANS faire de changements
bash scripts/propagate-all.sh --dry-run
```

**Output exemple** :
```
========================================
  METHODOLOGY PROPAGATION v4.0
========================================

Source: D:/30-Dev-Projects/Instruction-Claude-Code
Mode: DRY RUN (no changes will be made)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 1: Pre-Propagation Validation
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ Checking Git status...
  ✅ Clean working directory

→ Running integration tests...
  ✅ test-templates.sh passed
  ✅ test-hooks.sh passed
  ✅ test-sync.sh passed

[... all checks ...]

Total Score: 98/100
Status: ✅ PASS

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Step 3: Preview Changes (Dry Run)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

→ Syncing to: Shinkofa-Platform
  [DRY RUN] Would copy: .claude/CLAUDE.md
  [DRY RUN] Would copy: Prompt-2026-Optimized/agents/Context-Guardian/AGENT.md
  [...]
  ✅ Copied: 5, Updated: 12

→ Syncing to: SLF-Esport
  [...]
```

**Analyser output** :
- Fichiers qui seront copiés
- Fichiers qui seront mis à jour
- Fichiers ignorés (déjà à jour)

### Étape 4 : Propagation Réelle

```bash
# Propagation avec confirmation
bash scripts/propagate-all.sh

# OU propagation sans confirmation (automatique)
bash scripts/propagate-all.sh --force
```

**Le script va** :
1. Valider (score ≥95/100)
2. Demander confirmation (sauf si `--force`)
3. Synchroniser vers tous les projets
4. Vérifier que sync a réussi
5. Générer rapports JSON

**Output exemple** :
```
========================================
  METHODOLOGY PROPAGATION v4.0
========================================

Step 1: Pre-Propagation Validation
✅ Validation passed! (Score: 98/100)

Step 2: Confirmation
Target projects:
  1. D:/30-Dev-Projects/Shinkofa-Platform
  2. D:/30-Dev-Projects/SLF-Esport
  3. D:/30-Dev-Projects/Social-Content-Master
  4. D:/30-Dev-Projects/Hibiki-Dictate

Do you want to proceed? (yes/no): yes

Step 3: Synchronization
→ Syncing to: Shinkofa-Platform
  📄 .claude/CLAUDE.md
  📄 Prompt-2026-Optimized/agents/Context-Guardian/AGENT.md
  ✅ Copied: 5, Updated: 12

[... pour chaque projet ...]

✅ Synchronization completed!

Step 4: Post-Propagation Verification
✅ All projects are up-to-date!

========================================
  PROPAGATION COMPLETE
========================================
```

### Étape 5 : Vérification Manuelle

```bash
# 1. Vérifier changements dans chaque projet
cd ~/Shinkofa-Platform
git status
git diff .claude/CLAUDE.md
git diff Prompt-2026-Optimized/agents/

# 2. Tester localement
npm test  # ou pytest

# 3. Commit si OK
git add .
git commit -m "chore: sync methodology v4.0"
git push
```

**Répéter pour tous les projets cibles**.

---

## 🔧 Options Avancées

### Skip Validation (Non Recommandé)

```bash
# Sync sans validation (urgence uniquement)
bash scripts/propagate-all.sh --skip-validation
```

**⚠️ Risques** :
- Peut propager code cassé
- Secrets non détectés
- Documentation incomplète

**Utiliser seulement si** :
- Validation faite manuellement
- Urgence critique (hotfix)
- Vous savez ce que vous faites

### Sync Sélectif (Certains Projets)

```bash
# Sync vers projets spécifiques
python scripts/sync-methodology.py \
  --projects "D:/30-Dev-Projects/Shinkofa-Platform" "D:/30-Dev-Projects/SLF-Esport" \
  --check-git
```

### Custom Minimum Score

```bash
# Validation avec score minimum custom
python scripts/validate-propagation.py --min-score 90
```

---

## 📊 Rapports Générés

### Structure Rapports

```
reports/
├── propagation-validation-20260129-143000.json  # Pré-validation
├── sync-20260129-143500.json                    # Sync détails
└── health-check-20260129.json                    # Post-monitoring
```

### Validation Report

```json
{
  "timestamp": "2026-01-29T14:30:00",
  "total_score": 98,
  "max_score": 100,
  "passed": true,
  "summary": {
    "total_checks": 10,
    "passed_checks": 9,
    "failed_checks": 1,
    "total_errors": 0,
    "total_warnings": 2
  },
  "checks": [
    {
      "name": "Git Status",
      "weight": 10,
      "score": 10,
      "passed": true,
      "errors": [],
      "warnings": []
    },
    {
      "name": "TODOs",
      "weight": 5,
      "score": 2,
      "passed": false,
      "errors": [],
      "warnings": ["8 TODOs found"]
    }
  ]
}
```

### Sync Report

```json
{
  "timestamp": "2026-01-29T14:35:00",
  "summary": {
    "total_projects": 4,
    "successful": 4,
    "failed": 0,
    "total_files_copied": 12,
    "total_files_updated": 35,
    "total_files_skipped": 120
  },
  "projects": [
    {
      "path": "D:/30-Dev-Projects/Shinkofa-Platform",
      "success": true,
      "files_copied": 3,
      "files_updated": 10,
      "files_skipped": 30,
      "errors": []
    }
  ]
}
```

### Analyser Rapports

```bash
# Voir score validation
cat reports/propagation-validation-*.json | jq '.total_score'

# Voir projets échoués
cat reports/sync-*.json | jq '.projects[] | select(.success == false)'

# Compter fichiers synchronisés
cat reports/sync-*.json | jq '.summary.total_files_copied + .summary.total_files_updated'
```

---

## 🐛 Troubleshooting

### Validation Échoue : Git Status

**Erreur** :
```
❌ Git Status (0/10 points)
   5 uncommitted changes detected
```

**Solution** :
```bash
# Voir changements
git status

# Option 1: Commit
git add .
git commit -m "chore: prepare for propagation"

# Option 2: Stash
git stash
# Après propagation
git stash pop
```

### Validation Échoue : Tests

**Erreur** :
```
❌ Integration Tests (0/15 points)
   2 tests failed: test-templates.sh, test-hooks.sh
```

**Solution** :
```bash
# Run tests manuellement pour voir détails
bash tests/integration/test-templates.sh
bash tests/integration/test-hooks.sh

# Fix issues
# Re-run validation
python scripts/validate-propagation.py
```

### Validation Échoue : Secrets

**Erreur** :
```
❌ Secrets Detection (0/15 points)
   Secrets detected by gitleaks
```

**Solution** :
```bash
# Voir secrets détectés
gitleaks detect --config .gitleaks.toml --no-git --verbose

# Options:
# 1. Supprimer secrets
vim <file>  # Remplacer par variable env

# 2. Ajouter à allowlist (.gitleaks.toml)
[[allowlist]]
paths = ['^tests/fixtures/']

# 3. Ajouter inline comment
API_KEY = "sk-test"  # gitleaks:allow
```

### Sync Échoue : Permission Denied

**Erreur** :
```
❌ Synchronization failed!
   Permission denied: D:/30-Dev-Projects/Shinkofa-Platform/.claude/
```

**Solution** :
```bash
# Vérifier ownership
ls -la ~/Shinkofa-Platform/.claude/

# Corriger
sudo chown -R $USER:$USER ~/Shinkofa-Platform/

# OU sur Windows
# Vérifier propriétés → Sécurité → Permissions
```

### Sync Échoue : Uncommitted Changes

**Erreur** :
```
❌ Cannot sync: projects have uncommitted changes
   Shinkofa-Platform: 3 uncommitted changes
```

**Solution** :
```bash
# Option 1: Commit dans projet cible
cd ~/Shinkofa-Platform
git add .
git commit -m "wip: save before sync"

# Option 2: Stash
git stash

# Option 3: Skip check (pas recommandé)
python scripts/sync-methodology.py --projects ~/Shinkofa-Platform
# (sans --check-git)
```

### Post-Validation Échoue

**Erreur** :
```
⚠️  Some projects may need manual review
```

**Solution** :
```bash
# Voir détails
python scripts/validate-sync.py

# Identifier projets obsolètes
python scripts/validate-sync.py --report reports/post-sync.json
cat reports/post-sync.json | jq '.projects[] | select(.success == false)'

# Re-sync projet spécifique
python scripts/sync-methodology.py --projects <path>
```

---

## 🤖 Automatisation

### GitHub Actions (Recommended)

```yaml
# .github/workflows/propagate-methodology.yml
name: Propagate Methodology

on:
  workflow_dispatch:  # Manual trigger
  push:
    branches: [main]
    paths:
      - 'Prompt-2026-Optimized/**'
      - '.claude/**'

jobs:
  propagate:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Validate
        run: |
          python scripts/validate-propagation.py \
            --report reports/validation.json

      - name: Propagate
        run: |
          bash scripts/propagate-all.sh --force

      - name: Upload Reports
        uses: actions/upload-artifact@v3
        with:
          name: propagation-reports
          path: reports/*.json

      - name: Notify
        if: failure()
        run: |
          # Send notification (Slack, Discord, email, etc.)
          curl -X POST $WEBHOOK_URL \
            -d "Propagation failed! Check GitHub Actions logs."
```

### Cron Job (Optionnel)

```bash
# Propagation automatique hebdomadaire (dimanche 2h)
0 2 * * 0 cd /path/to/Instruction-Claude-Code && bash scripts/propagate-all.sh --force
```

**⚠️ Prudence** :
- Valider manuellement avant d'automatiser
- Tester d'abord avec --dry-run
- Configurer notifications d'erreur

### Pre-Push Hook (Optionnel)

```bash
# .git/hooks/pre-push
#!/bin/bash

# Valider avant push vers main
BRANCH=$(git rev-parse --abbrev-ref HEAD)

if [ "$BRANCH" = "main" ]; then
    echo "Validating before push to main..."
    python scripts/validate-propagation.py

    if [ $? -ne 0 ]; then
        echo "Validation failed! Fix issues before pushing to main."
        exit 1
    fi
fi
```

---

## 📈 Bonnes Pratiques

### Avant Propagation

1. **Commit everything** :
   ```bash
   git status  # Verify clean
   git add .
   git commit -m "feat: prepare v4.0 propagation"
   ```

2. **Run tests locally** :
   ```bash
   pre-commit run --all-files
   bash tests/integration/test-all.sh
   ```

3. **Dry-run first** :
   ```bash
   bash scripts/propagate-all.sh --dry-run
   ```

### Pendant Propagation

1. **Monitor output** : Vérifier erreurs en temps réel

2. **Save logs** :
   ```bash
   bash scripts/propagate-all.sh 2>&1 | tee propagation.log
   ```

3. **Don't interrupt** : Laisser terminer complètement

### Après Propagation

1. **Test each project** :
   ```bash
   for proj in ~/projets/*; do
       cd "$proj"
       npm test || pytest
   done
   ```

2. **Commit in each project** :
   ```bash
   cd <project>
   git add .
   git commit -m "chore: sync methodology v4.0"
   git push
   ```

3. **Monitor health** :
   ```bash
   python scripts/monitor-projects.py
   python scripts/serve-dashboard.py
   # Open http://localhost:8080
   ```

4. **Backup reports** :
   ```bash
   cp -r reports/ ~/backups/propagation-$(date +%Y%m%d)/
   ```

---

## 🎯 Checklist Complète

### Pré-Propagation

- [ ] Configuration `sync-config.json` à jour
- [ ] Git status clean (no uncommitted changes)
- [ ] All tests passing locally
- [ ] Pre-commit hooks configured
- [ ] Documentation up-to-date
- [ ] No secrets detected
- [ ] Dry-run executed and reviewed

### Propagation

- [ ] Validation score ≥95/100
- [ ] Confirmation donnée (ou --force)
- [ ] Sync completed without errors
- [ ] Post-validation passed

### Post-Propagation

- [ ] Git changes reviewed in each project
- [ ] Tests passing in each project
- [ ] Changes committed in each project
- [ ] Monitoring dashboard checked
- [ ] Reports archived

---

## 📚 Références

- **Script Principal** : `scripts/propagate-all.sh`
- **Validation** : `scripts/validate-propagation.py`
- **Synchronisation** : `scripts/sync-methodology.py`
- **Configuration** : `scripts/sync-config.json`
- **Tests** : `tests/integration/test-propagation-validation.sh`
- **Infrastructure Guide** : `Prompt-2026-Optimized/infrastructure/INFRASTRUCTURE-GUIDE.md`

---

## 🚀 TL;DR (Too Long; Didn't Read)

```bash
# 1. Configurer cibles
cp scripts/sync-config.example.json scripts/sync-config.json
vim scripts/sync-config.json

# 2. Preview
bash scripts/propagate-all.sh --dry-run

# 3. Propager
bash scripts/propagate-all.sh

# 4. Vérifier projets
cd <project> && git status && git diff

# 5. Commit
cd <project> && git add . && git commit -m "chore: sync methodology v4.0"

# 6. Monitor
python scripts/serve-dashboard.py  # http://localhost:8080
```

**Done!** 🎉

---

**Version** : 1.0.0
**Date** : 2026-01-29
**Auteur** : Jay The Ermite + Takumi (Claude Code)
