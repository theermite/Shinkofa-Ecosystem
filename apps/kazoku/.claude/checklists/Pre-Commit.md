# Checklist: Pré-Commit

> À vérifier AVANT chaque commit.

---

## Code Quality

- [ ] **Linting passé** sans warnings
  ```bash
  # Python
  ruff check . && ruff format --check .

  # JavaScript/TypeScript
  npm run lint
  ```

- [ ] **Types vérifiés** (si TypeScript/Python typé)
  ```bash
  # TypeScript
  npx tsc --noEmit

  # Python
  mypy .
  ```

- [ ] **Pas de console.log/print** de debug oubliés

- [ ] **Pas de TODO/FIXME** critiques non résolus

---

## Tests

- [ ] **Tests passent**
  ```bash
  # Python
  pytest

  # JavaScript
  npm test
  ```

- [ ] **Nouveaux tests** pour nouveau code (si applicable)

- [ ] **Coverage** maintenu (≥80% backend)

---

## Sécurité

- [ ] **Pas de secrets** dans le code
  - API keys, tokens, passwords → `.env`
  - `.env` dans `.gitignore`

- [ ] **Queries paramétrées** (pas de concaténation SQL)

- [ ] **Inputs validés** (si nouveaux endpoints)

---

## Documentation

- [ ] **Docstrings/JSDoc** pour nouvelles fonctions publiques

- [ ] **README** mis à jour si nouvelle feature

- [ ] **CHANGELOG** mis à jour si changement significatif

---

## Git

- [ ] **Message commit** clair et conventionnel
  ```
  [TYPE] description courte

  Types: FEAT, FIX, DOCS, REFACTOR, CHORE, TEST, PERF
  ```

- [ ] **Fichiers pertinents seulement** (pas de .env, node_modules, __pycache__)
  ```bash
  git status  # Vérifier ce qui sera commité
  git diff --staged  # Vérifier le contenu
  ```

- [ ] **Commit atomique** (une chose à la fois)

---

## Quick Check (Copier-Coller)

```bash
# Python
ruff check . && pytest -q && echo "✅ Ready to commit"

# JavaScript
npm run lint && npm test && echo "✅ Ready to commit"
```

---

**Usage** : Lire avant `git commit` | **Trigger** : Chaque commit
