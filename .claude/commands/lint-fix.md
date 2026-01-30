---
description: Lance linters et auto-fix sur Python (Ruff) et JavaScript/TypeScript (ESLint)
---

# Lint & Auto-Fix

Lance les linters avec auto-fix automatique sur le projet actuel.

**Linters utilisés** :

**Python (Ruff)** :
- Vérifie style PEP 8
- Type hints validation
- Import sorting
- Unused imports/variables
- Docstrings manquantes
- Security issues (bandit rules)
- Performance anti-patterns

**JavaScript/TypeScript (ESLint)** :
- Style consistent (Airbnb/Standard)
- Type validation (TypeScript)
- React best practices (hooks rules)
- Accessibilité (jsx-a11y)
- Unused imports/variables
- Console logs production

**Commands exécutées** :

```bash
# Python
ruff check --fix .
ruff format .

# JavaScript/TypeScript
eslint . --ext .js,.jsx,.ts,.tsx --fix
prettier --write "**/*.{js,jsx,ts,tsx,json,css,scss,md}"
```

**Fichiers traités** :
- Python : `**/*.py`
- JavaScript : `**/*.js`, `**/*.jsx`
- TypeScript : `**/*.ts`, `**/*.tsx`
- Styles : `**/*.css`, `**/*.scss`
- Config : `**/*.json`

**Rapports générés** :
- Affiche nombre warnings/erreurs corrigés
- Liste erreurs non auto-fixables (action manuelle requise)
- Suggestions amélioration code

**Configuration requise** :
- Python : `pyproject.toml` ou `ruff.toml`
- JavaScript : `.eslintrc.json` + `.prettierrc`

**Exemple utilisation** :
```bash
/lint-fix
```

**Note** : Commit code avant lancer pour pouvoir revert si problème.

**Standards visés** :
- Zéro warnings linting
- Style 100% cohérent
- Imports optimisés
- Code formatted uniform
