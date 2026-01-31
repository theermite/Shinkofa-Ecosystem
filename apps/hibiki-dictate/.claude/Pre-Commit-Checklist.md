# Pre-Commit Checklist Automatique

**Contexte d'usage** : Consulter AVANT chaque commit pour vérifier qualité code.

---

## ✅ Code Quality

- [ ] **Linting pass** : `ruff check --fix .` (Python) ou `npm run lint -- --fix` (JS/TS)
- [ ] **Type-checking pass** : `mypy .` (Python) ou `tsc --noEmit` (TypeScript)
- [ ] **No debug statements** : Pas de `console.log()`, `print()`, `debugger` oubliés
- [ ] **No commented code** : Pas de blocs code commentés (supprimer ou documenter pourquoi)
- [ ] **No TODO/FIXME non documentés** : Si TODO, ajouter issue GitHub ou entry TECH-DEBT.md

---

## 🔒 Security

- [ ] **No hardcoded secrets** : Pas de API keys, passwords, tokens dans code
  - Vérifier regex : `(api[_-]?key|password|secret|token)\s*=\s*['"][^'"]+['"]`
- [ ] **No sensitive data in logs** : Pas de PII, passwords dans logs
- [ ] **`.env.example` à jour** : Si nouvelles variables env, documenter dans .env.example
- [ ] **Dependencies vulnerabilities** : `npm audit` (JS) ou `pip-audit` (Python) - Zéro vulnérabilités critiques

---

## 🧪 Tests

- [ ] **Tests pertinents passent** : Si modif backend/core, tests unitaires correspondants passent
- [ ] **No test.skip() ou test.only()** : Tous tests actifs
- [ ] **Coverage maintenu** : Coverage ≥ 80% (vérifier avec `pytest --cov` ou `npm test -- --coverage`)

---

## 📚 Documentation

- [ ] **README.md à jour** : Si changement usage/install/config
- [ ] **CHANGELOG.md entry** : Entrée ajoutée dans [Unreleased] section
- [ ] **Docstrings/JSDoc à jour** : Fonctions modifiées documentées
- [ ] **API docs régénérées** : Si changement endpoints (FastAPI auto-doc OK)

---

## 📦 Git

- [ ] **Message commit descriptif** : Format `type(scope): description` respecté
- [ ] **Fichiers pertinents uniquement** : Pas de `node_modules/`, `__pycache__/`, `.DS_Store`
- [ ] **Atomic commit** : 1 commit = 1 changement logique cohérent

---

## 🔧 Command Slash Disponible

- `/pre-commit-check` : Vérification automatique checklist

---

**Retour vers** : `CLAUDE.md` pour workflow principal
