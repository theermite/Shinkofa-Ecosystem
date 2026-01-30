# Guide des Commandes Claude Code

> Référence rapide de toutes les commandes slash disponibles.

---

## Commandes de Session

| Commande | Description |
|----------|-------------|
| `/session-summary` | Génère un résumé structuré de la session de dev actuelle |
| `/resume-dev` | Reprendre développement après déconnexion (contexte restauré) |
| `/project-status` | Génère rapport statut projet (progrès, budget, next steps) |

---

## Commandes de Code Quality

| Commande | Description |
|----------|-------------|
| `/lint-fix` | Lance linters et auto-fix (Python: Ruff, JS/TS: ESLint) |
| `/pre-commit-check` | Checklist vérification pre-commit automatique |
| `/test-coverage` | Lance tests unitaires + rapport coverage (pytest/Jest) |
| `/breaking-changes-check` | Analyse commits récents pour breaking changes non documentés |

---

## Commandes de Sécurité & Performance

| Commande | Description |
|----------|-------------|
| `/security-scan` | Scan sécurité complet code + dépendances + rapport vulnérabilités |
| `/performance-audit` | Audit performance frontend/backend + recommandations |
| `/db-health` | Check santé database complet + rapport recommandations |

---

## Commandes de Déploiement

| Commande | Description |
|----------|-------------|
| `/deployment-check` | Checklist vérification pré-déploiement par environnement |
| `/bump-version` | Bump version SemVer + mise à jour CHANGELOG automatique |
| `/sync-repo` | Synchroniser repo local avec remote (fetch, pull, push safe) |
| `/rollback-last` | Annuler dernier commit ou changements (rollback sécurisé) |

---

## Commandes de Scaffold

| Commande | Description |
|----------|-------------|
| `/new-react-component` | Scaffold composant React production-ready (TS, tests, styles) |
| `/new-fastapi-endpoint` | Scaffold endpoint FastAPI CRUD (Pydantic, auth JWT, tests) |
| `/new-electron-app` | Scaffold app Electron cross-platform (Windows + Linux) |
| `/new-pwa-app` | Scaffold Progressive Web App production-ready (React) |
| `/setup-database` | Configure PostgreSQL + Alembic migrations |

---

## Commandes Utilitaires

| Commande | Description |
|----------|-------------|
| `/estimate-cost` | Estime coût crédit Claude Code pour un projet |

---

## Skills Disponibles

Les skills sont des agents spécialisés dans `Prompt-2026-Optimized/skills/` :

| Skill | Description |
|-------|-------------|
| `Code-Review` | Revue de code approfondie |
| `Debug-Expert` | Diagnostic et résolution de bugs |
| `Deployment` | Gestion des déploiements |
| `Knowledge-Capture` | Capture et documentation des apprentissages |
| `Project-Registry-Update` | Mise à jour du registre des projets |
| `Refactoring-Planner` | Planification de refactoring |
| `Session-Manager` | Gestion des sessions de travail |
| `Test-Writer` | Écriture de tests automatisés |

---

## Agents Disponibles

Les agents sont dans `Prompt-2026-Optimized/agents/` :

| Agent | Usage |
|-------|-------|
| `Ai-Ml-Agent` | Travail sur projets IA/ML |
| `Codebase-Explorer` | Exploration et compréhension de codebase |
| `Dependency-Auditor` | Audit des dépendances |
| `Desktop-App-Agent` | Développement apps desktop |
| `Electron-Agent` | Spécialiste Electron |
| `Frontend-Auditor` | Audit frontend |
| `Security-Auditor` | Audit sécurité |

---

## Usage

```bash
# Dans Claude Code, tape simplement la commande
/session-summary
/lint-fix
/security-scan
```

---

**Version** : 1.0 | **Date** : 2026-01-20
