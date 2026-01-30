---
description: Reprendre développement après déconnexion (contexte restauré)
---

# Slash Command: /resume-dev

## 🎯 Objectif

Reprendre le développement après une déconnexion Claude Code en restaurant rapidement le contexte:
- État projet actuel (branche, commits récents)
- Fichiers modifiés non commités
- Tests/builds status
- TODO list en cours
- Dernière session de travail

Adapté profil Jay (TDAH) : Reprise rapide sans surcharge cognitive.

## 📋 Arguments

**Syntaxe** : `/resume-dev [--last-session]`

**Arguments** :
- `--last-session` : Affiche résumé dernière session (optionnel)

**Exemples** :
```bash
/resume-dev
/resume-dev --last-session
```

## 🚀 Ce que fait le Command

### Étape 1 : Contexte Git

**Afficher branche actuelle et status** :
```bash
# Branche courante
git branch --show-current

# Status (fichiers modifiés, staged, untracked)
git status --short

# 5 derniers commits
git log --oneline -5 --decorate

# Changements non commités
git diff --stat
```

**Output exemple** :
```
🌿 Branche: feature/todo-app-refactor

📊 Status:
 M src/components/TodoList.tsx (modified)
 A src/components/EnergyCheckIn.tsx (added, not staged)
?? src/utils/helpers.ts (untracked)

📝 5 derniers commits:
a1b2c3d (HEAD -> feature/todo-app-refactor) feat: Add EnergyCheckIn component
e4f5g6h feat: Refactor TodoList with TypeScript
i7j8k9l fix: Correct validation bug in TodoForm
m0n1o2p docs: Update README with new features
q3r4s5t chore: Update dependencies

📈 Changements non commités:
 src/components/TodoList.tsx    | 45 ++++---
 src/components/EnergyCheckIn.tsx | 120 +++++++++++++++++
 2 files changed, 150 insertions(+), 15 deletions(-)
```

### Étape 2 : Tests & Build Status

**Vérifier derniers tests** :
```bash
# Python tests
if [ -f "pytest.ini" ] || [ -f "pyproject.toml" ]; then
  echo "🧪 Running Python tests..."
  pytest --last-failed --last-failed-no-failures none --quiet
fi

# JavaScript tests
if [ -f "package.json" ]; then
  echo "🧪 Running JavaScript tests..."
  npm test -- --onlyFailures --silent 2>/dev/null || echo "No failing tests"
fi
```

**Vérifier build** :
```bash
# Check if build directory exists
if [ -d "dist" ] || [ -d "build" ]; then
  echo "✅ Build directory found (last build: $(stat -c %y dist 2>/dev/null || stat -f %Sm dist))"
else
  echo "⚠️ No build directory - run 'npm run build' or 'python -m build'"
fi
```

### Étape 3 : TODO List Active

**Lire TODO.md ou comments TODO dans code** :
```bash
# Find TODO comments in code
echo "📝 TODOs in code:"
rg "TODO:|FIXME:|HACK:" --no-heading --line-number --max-count 10

# Read TODO.md if exists
if [ -f "TODO.md" ]; then
  echo "\n📋 TODO.md:"
  cat TODO.md
fi
```

**Output exemple** :
```
📝 TODOs in code:
src/components/TodoList.tsx:45: // TODO: Add filtering by category
src/components/EnergyCheckIn.tsx:12: // TODO: Persist to localStorage
src/utils/api.ts:78: // FIXME: Handle 429 rate limit errors
src/App.tsx:23: // TODO: Add error boundary

📋 TODO.md:
- [ ] Implement energy check-in persistence
- [ ] Add unit tests for EnergyCheckIn component
- [ ] Fix TypeScript warnings in TodoList
- [x] Refactor TodoList component (DONE)
```

### Étape 4 : Résumé Dernière Session (--last-session)

**Lire `.claude/session-log.json`** :
```json
{
  "last_session": {
    "date": "2025-11-13T14:30:00Z",
    "duration_minutes": 45,
    "branch": "feature/todo-app-refactor",
    "commits": [
      "a1b2c3d feat: Add EnergyCheckIn component",
      "e4f5g6h feat: Refactor TodoList with TypeScript"
    ],
    "files_modified": [
      "src/components/TodoList.tsx",
      "src/components/EnergyCheckIn.tsx",
      "src/types/todo.ts"
    ],
    "tests_status": "passed (80% coverage)",
    "next_steps": [
      "Add unit tests for EnergyCheckIn",
      "Implement localStorage persistence",
      "Fix TypeScript warnings"
    ],
    "energy_level": 7
  }
}
```

**Générer résumé** :
```
🕐 Dernière session: 13 nov 2025, 14h30 (45 min)

✅ Réalisations:
- Ajout composant EnergyCheckIn
- Refactoring TodoList en TypeScript
- 2 commits pushés

📁 Fichiers modifiés:
- src/components/TodoList.tsx
- src/components/EnergyCheckIn.tsx
- src/types/todo.ts

🧪 Tests: Passed (80% coverage)

🎯 Next steps (session précédente):
1. Add unit tests for EnergyCheckIn
2. Implement localStorage persistence
3. Fix TypeScript warnings

⚡ Niveau énergie: 7/10
```

### Étape 5 : Recommandations Reprise

**Générer plan reprise adapté Jay** :
```
🎯 Plan Reprise (adapté TDAH):

1️⃣ QUICK WIN (5-10 min) - Dopamine boost:
   → Commiter fichiers staged si présents
   → Fixer 1-2 TODOs rapides
   → Lancer tests pour validation

2️⃣ FOCUS SESSION (30-60 min):
   → Continuer feature en cours: EnergyCheckIn persistence
   → Objectif: localStorage save/load fonctionnel

3️⃣ VALIDATION (5 min):
   → Tests unitaires EnergyCheckIn
   → Commit atomique
   → Push branche

⏸️ PAUSE 15 MIN après 60 min MAX (règle Jay)

📌 Rappel Contexte:
Branche: feature/todo-app-refactor
Objectif: Refonte Todo App avec adaptation Projecteur Splénique
Deadline: Phase 1 roadmap (avant Phase 0 Koshin MVP)
```

### Étape 6 : Checks Santé Projet

**Vérifier cohérence projet** :
```bash
# Dependencies outdated
echo "📦 Checking dependencies..."
npm outdated --depth 0 2>/dev/null || pip list --outdated 2>/dev/null | head -5

# Linting warnings
echo "🔍 Checking linting..."
npm run lint --silent 2>/dev/null | head -10 || ruff check --quiet . 2>/dev/null | head -10

# Security vulnerabilities
echo "🔒 Checking security..."
npm audit --audit-level=high --silent 2>/dev/null | grep -A 5 "vulnerabilities" || echo "No security issues"
```

### Étape 7 : Actions Automatiques

**Si fichiers staged présents** :
```bash
if git diff --cached --quiet; then
  echo "✅ Aucun fichier staged"
else
  echo "⚠️ Fichiers staged détectés - Voulez-vous commiter? (y/n)"
  # Proposer commit rapide
fi
```

**Si branche diverge de origin** :
```bash
git fetch origin
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ $LOCAL != $REMOTE ]; then
  echo "⚠️ Branche locale diverge de origin - Sync recommandé (/sync-repo)"
fi
```

## ✅ Output Complet Exemple

```
╔═══════════════════════════════════════════╗
║   🔄 RESUME DEV - Todo App Refactor       ║
╚═══════════════════════════════════════════╝

🌿 Branche: feature/todo-app-refactor
📊 Status: 2 fichiers modifiés, 1 non tracké

📝 5 derniers commits:
  a1b2c3d feat: Add EnergyCheckIn component
  e4f5g6h feat: Refactor TodoList with TypeScript
  i7j8k9l fix: Correct validation bug
  m0n1o2p docs: Update README
  q3r4s5t chore: Update dependencies

🧪 Tests: ✅ All passed (80% coverage)
📦 Build: ⚠️ Build directory not found

📝 TODOs actifs (4):
  1. Add unit tests for EnergyCheckIn component
  2. Implement localStorage persistence
  3. Fix TypeScript warnings in TodoList
  4. Add error boundary in App.tsx

🎯 Plan Reprise Recommandé:
  1️⃣ Quick win: Commiter fichiers modifiés (5 min)
  2️⃣ Focus: localStorage persistence (30-60 min)
  3️⃣ Validation: Tests + commit + push (5 min)

⚡ Rappel: Pause 15 min après 60 min MAX

🚀 Prêt à continuer? Let's go!
```

## 📚 Configuration

**Créer `.claude/session-log.json`** (optionnel) :
```json
{
  "sessions": [
    {
      "date": "2025-11-13T14:30:00Z",
      "duration_minutes": 45,
      "branch": "feature/todo-app-refactor",
      "commits": ["a1b2c3d", "e4f5g6h"],
      "files_modified": ["src/components/TodoList.tsx"],
      "tests_status": "passed",
      "energy_level": 7,
      "next_steps": ["Add tests", "Implement persistence"]
    }
  ]
}
```

**Script automatique sauvegarde session** (optionnel) :
```bash
#!/bin/bash
# save-session.sh - Sauvegarder contexte session avant déconnexion

SESSION_LOG=".claude/session-log.json"

# Collect session data
BRANCH=$(git branch --show-current)
COMMITS=$(git log --oneline -5 --format="%h")
FILES=$(git diff --name-only HEAD)

# Append to session log
echo "Session saved at $(date)"
```

## 🚨 Notes

- **TDAH-friendly** : Résumé visuel rapide, pas de surcharge cognitive
- **Quick wins prioritaires** : Dopamine boost pour reprise facile
- **Rappels automatiques** : Pauses, temps focus, énergie
- **Contexte complet** : Aucune info perdue, reprise fluide

---

**Version 1.0 | 2025-11-13 | Command /resume-dev**
