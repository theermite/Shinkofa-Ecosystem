# Pre-commit Hooks Quick Reference

> **Référence rapide** pour les hooks pre-commit avancés.

---

## 📋 Installation 1-Ligne

```bash
# Linux/macOS
bash scripts/setup-hooks.sh

# Windows PowerShell
.\scripts\setup-hooks.ps1
```

---

## ⚡ Commandes Essentielles

| Commande | Action |
|----------|--------|
| `pre-commit run --all-files` | Exécuter tous les hooks sur tous les fichiers |
| `pre-commit run ruff` | Exécuter un hook spécifique |
| `pre-commit autoupdate` | Mettre à jour les hooks vers dernières versions |
| `git commit --no-verify` | Skipper les hooks (urgence uniquement) |
| `SKIP=mypy git commit -m "msg"` | Skipper un hook spécifique |

---

## 🛡️ Hooks Actifs (par catégorie)

### Git Hygiene
- ✅ Prévention commit vers main/master
- ✅ Détection fichiers volumineux (>500KB)
- ✅ Détection conflits merge
- ✅ Fins de ligne normalisées (LF)
- ✅ Détection clés privées

### Sécurité
- 🔒 **Gitleaks** : Scan secrets (API keys, tokens, credentials)
- 🔒 **detect-secrets** : Double couche détection secrets

### Python
- 🐍 **Ruff** : Lint + format (remplace black, flake8, isort)
- 🐍 **mypy** : Type checking statique

### JavaScript/TypeScript
- 🟨 **ESLint** : Linting JavaScript/TypeScript
- 🟨 **Prettier** : Formatage code

### Markdown/YAML
- 📝 **markdownlint** : Validation Markdown
- 📝 **yamllint** : Validation YAML

### Shell
- 💻 **shellcheck** : Validation scripts Bash

### Commits
- 📨 **Conventional Commits** : Format obligatoire (feat, fix, docs, etc.)

### Custom (spécifiques projet)
- 🔧 **check-docs-sync** : Docs à jour avec code
- 🔧 **check-template-structure** : Structure templates valide
- 🔧 **check-todos** : Détection TODO/FIXME (warning)
- 🔧 **protect-critical-files** : Confirmation fichiers critiques

---

## 🎯 Conventional Commits (obligatoire)

### Format
```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types Autorisés
| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction bug |
| `docs` | Documentation |
| `style` | Formatage (sans changement logique) |
| `refactor` | Refactoring code |
| `perf` | Amélioration performance |
| `test` | Tests |
| `chore` | Maintenance |
| `ci` | CI/CD |

### Exemples Valides
```bash
git commit -m "feat(dashboard): add dark mode toggle"
git commit -m "fix(monitoring): correct dependency count"
git commit -m "docs(hooks): update installation guide"
git commit -m "chore(deps): update pre-commit hooks"
```

### ❌ Invalides
```bash
git commit -m "updated dashboard"          # Missing type
git commit -m "feat: add feature"          # Missing scope (--force-scope)
git commit -m "Added new feature"          # Uppercase subject
```

---

## 🔐 Secrets Detection

### Détectés Automatiquement
- API Keys : OpenAI, Anthropic, AWS, GitHub, Google, Stripe
- Tokens : JWT, OAuth, Slack, Discord
- Clés SSH privées
- Database credentials
- AWS Access Keys

### False Positive ?

**Option 1 - Comment inline (Gitleaks)** :
```python
API_KEY = "sk-test-example"  # gitleaks:allow
```

**Option 2 - Allowlist (.gitleaks.toml)** :
```toml
[allowlist]
paths = [
    '''^tests/fixtures/''',
    '''\.example\.json$''',
]
```

**Option 3 - Baseline (detect-secrets)** :
```bash
detect-secrets audit .secrets.baseline
# Marquer comme faux positif dans l'interface
```

---

## 🚨 Fichiers Critiques Protégés

Les fichiers suivants nécessitent **confirmation explicite** :

- `.github/workflows/*.yml`
- `.claude/CLAUDE.md`
- `scripts/monitor-projects.py`
- `scripts/dashboard/app.js`
- `.pre-commit-config.yaml`
- `.gitleaks.toml`

**Raison** : Impact critique sur infrastructure/méthodologie.

---

## 🐛 Troubleshooting

### "command not found: gitleaks"
```bash
# macOS
brew install gitleaks

# Windows
choco install gitleaks

# Linux
wget https://github.com/gitleaks/gitleaks/releases/download/v8.18.2/gitleaks_8.18.2_linux_x64.tar.gz
tar -xzf gitleaks_8.18.2_linux_x64.tar.gz
sudo mv gitleaks /usr/local/bin/
```

### "command not found: ruff"
```bash
pip install ruff mypy detect-secrets
```

### Hooks trop lents
```bash
# Exécuter seulement sur fichiers modifiés
pre-commit run --files file1.py file2.py

# Skipper checks coûteux (local)
SKIP=mypy git commit -m "wip: work in progress"
```

### Windows "Permission denied"
```bash
# Rendre scripts exécutables
chmod +x scripts/hooks/*.py
```

---

## 📊 Workflow Recommandé

### Développement Local
```bash
# 1. Faire vos changements
vim file.py

# 2. Stager
git add file.py

# 3. Commit (hooks s'exécutent automatiquement)
git commit -m "feat(api): add new endpoint"

# 4. Si hooks échouent, corriger et recommiter
# Les hooks auto-fix certains problèmes (ruff, prettier)
git add .
git commit -m "feat(api): add new endpoint"
```

### Avant Push
```bash
# Exécuter tous les hooks manuellement
pre-commit run --all-files

# Vérifier status
git status

# Push
git push
```

### Urgence (skip hooks)
```bash
# Urgence critique uniquement
git commit --no-verify -m "hotfix(prod): critical security patch"

# Corriger ensuite lors du prochain commit normal
```

---

## 🔄 Mise à Jour

### Automatique (recommandé)
```bash
# Mettre à jour vers dernières versions
pre-commit autoupdate

# Tester
pre-commit run --all-files

# Committer
git add .pre-commit-config.yaml
git commit -m "chore(hooks): update pre-commit hooks"
```

### Configuration Hebdomadaire (CI)
```yaml
# .pre-commit-config.yaml (ci section)
ci:
  autoupdate_schedule: weekly
  autoupdate_commit_msg: 'chore: update pre-commit hooks'
```

---

## 📚 Documentation Complète

- **Installation** : `scripts/hooks/README.md`
- **Configuration** : `.pre-commit-config.yaml`
- **Secrets Detection** : `.gitleaks.toml`
- **Tests** : `tests/integration/test-hooks.sh`

---

## ✅ Checklist Installation

- [ ] Python 3.9+ installé
- [ ] `pip install pre-commit` exécuté
- [ ] `pre-commit install` exécuté
- [ ] `pre-commit install --hook-type commit-msg` exécuté
- [ ] Gitleaks installé (optionnel mais recommandé)
- [ ] Node.js 18+ installé (si projets JS/TS)
- [ ] `pre-commit run --all-files` testé
- [ ] Commit test avec message conventionnel réussi

---

**Version** : 1.0.0 | **Date** : 2026-01-29
