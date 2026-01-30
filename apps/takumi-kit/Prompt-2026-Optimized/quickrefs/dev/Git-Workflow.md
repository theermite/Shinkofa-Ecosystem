# QuickRef: Git Workflow

> Référence rapide pour commits, branches et PR.

---

## Commits Conventionnels

```
[TYPE] description courte (max 72 chars)

Types:
FEAT     → Nouvelle fonctionnalité
FIX      → Correction bug
DOCS     → Documentation
REFACTOR → Refactoring sans changement fonctionnel
CHORE    → Maintenance (deps, config)
TEST     → Ajout/modification tests
PERF     → Optimisation performance
```

**Exemples** :
```bash
git commit -m "[FEAT] Add user authentication"
git commit -m "[FIX] Resolve login redirect loop"
git commit -m "[DOCS] Update API documentation"
```

---

## Workflow Branches

```
main
 └── feature/nom-feature    # Nouvelles features
 └── fix/nom-bug            # Corrections
 └── hotfix/urgent          # Corrections prod urgentes
```

**Règles** :
- `main` = production stable
- Branches feature = courte durée (max 3-5 jours)
- PR obligatoire pour merge vers main (sauf hotfix critique)

---

## Commandes Fréquentes

```bash
# Status et diff
git status
git diff --staged

# Commit atomique
git add -p                  # Staging interactif
git commit -m "[TYPE] desc"
git push origin [branch]

# Sync avec remote
git fetch origin
git pull --rebase origin main

# Rollback
git reset --soft HEAD~1     # Annule commit, garde changes
git reset --hard HEAD~1     # Annule commit ET changes (danger!)
git revert [commit-hash]    # Crée commit inverse (safe)

# Stash
git stash push -m "WIP: description"
git stash pop
```

---

## Checklist Pré-Commit

- [ ] Code testé localement
- [ ] Pas de console.log/print debug
- [ ] Pas de secrets hardcodés
- [ ] Linting passé
- [ ] Message commit clair

---

**Version** : 1.0 | **Trigger** : Avant commit, merge, PR
