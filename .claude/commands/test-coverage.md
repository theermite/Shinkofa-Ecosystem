---
description: Lance tests unitaires et génère rapport coverage (Python pytest, JavaScript Jest)
---

# Tests & Coverage Report

Lance tests unitaires complets et génère rapport coverage détaillé.

**Tests Python (pytest)** :

```bash
# Tests avec coverage
pytest --cov --cov-report=html --cov-report=term

# Rapports générés
htmlcov/index.html  # Rapport HTML interactif
.coverage           # Données coverage
```

**Tests JavaScript/TypeScript (Jest)** :

```bash
# Tests avec coverage
npm test -- --coverage --watchAll=false

# Ou
jest --coverage --verbose

# Rapports générés
coverage/lcov-report/index.html  # Rapport HTML
coverage/coverage-summary.json   # Résumé JSON
```

**Métriques rapportées** :
- **Statements coverage** : % lignes exécutées
- **Branches coverage** : % branches conditionnelles testées
- **Functions coverage** : % fonctions appelées
- **Lines coverage** : % lignes code couvertes

**Objectif minimal** : ≥ 80% sur toutes métriques

**Rapport inclut** :
- Coverage global projet
- Coverage par fichier/module
- Lignes non couvertes (rouge dans rapport HTML)
- Branches non testées
- Fonctions jamais appelées

**Fichiers exclus automatiquement** :
- `tests/` directories
- `__pycache__/` cache Python
- `node_modules/` dépendances
- `dist/`, `build/` builds
- `*.test.js`, `*.spec.js` fichiers tests
- Configuration files

**Exemple utilisation** :
```bash
/test-coverage
```

Génère rapports :
- Python : `htmlcov/index.html`
- JavaScript : `coverage/lcov-report/index.html`

**Actions si coverage < 80%** :
1. Ouvrir rapport HTML (fichiers non couverts listés)
2. Identifier fonctions/branches non testées
3. Ajouter tests manquants
4. Re-lancer jusqu'à ≥ 80%

**Tests types inclus** :
- **Unitaires** : Fonctions isolées
- **Intégration** : Modules combinés
- **Composants** : React components (React Testing Library)
- **API** : Endpoints FastAPI (httpx)
- **Edge cases** : Erreurs, validations, limites

**Configuration requise** :
- Python : `pytest.ini` ou `pyproject.toml` section [tool.pytest]
- JavaScript : `jest.config.js`

**Standards visés** :
- Coverage ≥ 80% (OBLIGATOIRE)
- 100% fonctions critiques (auth, paiement, sécurité)
- Tests rapides (< 30s suite complète)
- Tests isolés (pas dépendances externes non mockées)
