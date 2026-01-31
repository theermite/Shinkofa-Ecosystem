---
description: Synchroniser repo local avec remote (fetch, pull, push safe)
---

# Slash Command: /sync-repo

## 🎯 Objectif

Synchroniser le repository local avec remote (origin) de manière sécurisée:
- Fetch derniers changements remote
- Pull avec rebase ou merge selon situation
- Push changements locaux safe
- Résoudre conflits basiques
- Vérifier divergences branches

Adapté profil Jay (TDAH) : Sync rapide sans confusion.

## 📋 Arguments

**Syntaxe** : `/sync-repo [--strategy <rebase|merge>] [--force]`

**Arguments** :
- `--strategy` : Stratégie sync (défaut: rebase)
  - `rebase` : Pull avec rebase (historique linéaire)
  - `merge` : Pull avec merge (préserve historique branches)
- `--force` : Force push (⚠️ DANGEREUX, utiliser seulement si sûr)

**Exemples** :
```bash
/sync-repo
/sync-repo --strategy merge
/sync-repo --strategy rebase
/sync-repo --force  # ⚠️ Utiliser avec précaution
```

## 🚀 Ce que fait le Command

### Étape 1 : Vérification État Local

**Check uncommitted changes** :
```bash
# Check if working directory clean
if ! git diff --quiet || ! git diff --cached --quiet; then
  echo "⚠️ Changements non commités détectés"
  git status --short

  echo ""
  echo "Options:"
  echo "1. Commiter changements (recommandé)"
  echo "2. Stash changements (temporaire)"
  echo "3. Annuler sync"
  read -p "Choix (1/2/3): " choice

  case $choice in
    1)
      echo "💬 Commit message:"
      read commit_msg
      git add .
      git commit -m "$commit_msg"
      echo "✅ Changements commités"
      ;;
    2)
      git stash push -m "Auto-stash before sync $(date)"
      echo "✅ Changements stashed"
      STASHED=true
      ;;
    3)
      echo "❌ Sync annulé"
      exit 0
      ;;
  esac
fi
```

### Étape 2 : Fetch Remote Changes

**Récupérer infos remote sans merger** :
```bash
echo "🔄 Fetching remote changes..."

# Fetch all remotes
git fetch --all --prune

# Show fetch result
CURRENT_BRANCH=$(git branch --show-current)
echo "✅ Fetch completed"

# Check if remote branch exists
if git rev-parse --verify origin/$CURRENT_BRANCH >/dev/null 2>&1; then
  echo "📡 Remote branch: origin/$CURRENT_BRANCH exists"
else
  echo "⚠️ Remote branch origin/$CURRENT_BRANCH doesn't exist"
  echo "💡 Create with: git push -u origin $CURRENT_BRANCH"
  exit 0
fi
```

### Étape 3 : Analyze Divergence

**Comparer local vs remote** :
```bash
# Get commit hashes
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})
BASE=$(git merge-base @ @{u})

echo ""
echo "📊 Divergence Analysis:"

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ Local et remote identiques (déjà sync)"
  exit 0

elif [ "$LOCAL" = "$BASE" ]; then
  # Remote ahead (pull needed)
  COMMITS_BEHIND=$(git rev-list --count HEAD..@{u})
  echo "⬇️  Remote ahead: $COMMITS_BEHIND commits"
  echo "📝 Nouveaux commits remote:"
  git log --oneline HEAD..@{u} | head -5

  ACTION="pull"

elif [ "$REMOTE" = "$BASE" ]; then
  # Local ahead (push needed)
  COMMITS_AHEAD=$(git rev-list --count @{u}..HEAD)
  echo "⬆️  Local ahead: $COMMITS_AHEAD commits"
  echo "📝 Commits locaux à push:"
  git log --oneline @{u}..HEAD | head -5

  ACTION="push"

else
  # Diverged (both ahead)
  COMMITS_AHEAD=$(git rev-list --count @{u}..HEAD)
  COMMITS_BEHIND=$(git rev-list --count HEAD..@{u})
  echo "↔️  Diverged: $COMMITS_AHEAD ahead, $COMMITS_BEHIND behind"
  echo "📝 Commits locaux:"
  git log --oneline @{u}..HEAD | head -3
  echo "📝 Commits remote:"
  git log --oneline HEAD..@{u} | head -3

  ACTION="pull_diverged"
fi
```

### Étape 4 : Pull Strategy

**Pull avec rebase (par défaut)** :
```bash
if [ "$ACTION" = "pull" ] || [ "$ACTION" = "pull_diverged" ]; then
  STRATEGY="${1:-rebase}"  # rebase or merge

  echo ""
  echo "🔄 Pulling with $STRATEGY..."

  if [ "$STRATEGY" = "rebase" ]; then
    # Pull rebase (historique linéaire)
    git pull --rebase origin $CURRENT_BRANCH

    if [ $? -eq 0 ]; then
      echo "✅ Pull rebase successful"
    else
      echo "❌ Rebase conflicts detected"
      echo "📝 Conflicted files:"
      git diff --name-only --diff-filter=U

      echo ""
      echo "💡 Resolve conflicts:"
      echo "1. Edit conflicted files"
      echo "2. git add <resolved-files>"
      echo "3. git rebase --continue"
      echo "4. Or abort: git rebase --abort"
      exit 1
    fi

  else
    # Pull merge (préserve historique)
    git pull origin $CURRENT_BRANCH

    if [ $? -eq 0 ]; then
      echo "✅ Pull merge successful"
    else
      echo "❌ Merge conflicts detected"
      echo "📝 Conflicted files:"
      git diff --name-only --diff-filter=U

      echo ""
      echo "💡 Resolve conflicts:"
      echo "1. Edit conflicted files"
      echo "2. git add <resolved-files>"
      echo "3. git commit"
      echo "4. Or abort: git merge --abort"
      exit 1
    fi
  fi
fi
```

### Étape 5 : Push Strategy

**Push changements locaux** :
```bash
if [ "$ACTION" = "push" ] || [ "$ACTION" = "pull_diverged" ]; then
  echo ""
  echo "⬆️  Pushing local commits..."

  # Check if force flag present
  if [ "$FORCE" = "true" ]; then
    echo "🚨 FORCE PUSH (--force flag detected)"
    read -p "⚠️ Confirmer force push? (tapez 'yes') " confirm

    if [ "$confirm" = "yes" ]; then
      git push --force-with-lease origin $CURRENT_BRANCH

      if [ $? -eq 0 ]; then
        echo "✅ Force push successful"
      else
        echo "❌ Force push failed"
        exit 1
      fi
    else
      echo "❌ Force push annulé"
      exit 0
    fi

  else
    # Normal push
    git push origin $CURRENT_BRANCH

    if [ $? -eq 0 ]; then
      echo "✅ Push successful"
    else
      echo "❌ Push failed (remote ahead?)"
      echo "💡 Pull d'abord: /sync-repo"
      exit 1
    fi
  fi
fi
```

### Étape 6 : Restore Stash (si applicable)

**Restaurer changements stashed** :
```bash
if [ "$STASHED" = "true" ]; then
  echo ""
  echo "📦 Restoring stashed changes..."

  git stash pop

  if [ $? -eq 0 ]; then
    echo "✅ Stash restored"
  else
    echo "❌ Stash conflicts detected"
    echo "💡 Resolve conflicts manually"
    echo "💡 Voir stash: git stash show -p"
  fi
fi
```

### Étape 7 : Final Status

**Afficher état final** :
```bash
echo ""
echo "╔═══════════════════════════════════════════╗"
echo "║           ✅ SYNC COMPLETED               ║"
echo "╚═══════════════════════════════════════════╝"

echo ""
echo "📊 Final Status:"
git status --short

echo ""
echo "📝 Recent commits:"
git log --oneline -5 --decorate

echo ""
echo "🌿 Branch: $CURRENT_BRANCH"
echo "📡 Remote: origin/$CURRENT_BRANCH"

# Check if still diverged
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u})

if [ "$LOCAL" = "$REMOTE" ]; then
  echo "✅ Local and remote in sync"
else
  echo "⚠️ Still diverged (conflicts may need resolution)"
fi
```

## 🚀 Workflows Typiques

### Workflow 1 : Simple Pull (Remote Ahead)

```bash
# Situation: Remote a nouveaux commits
/sync-repo

# Output:
# 🔄 Fetching remote changes...
# ✅ Fetch completed
# 📊 Divergence Analysis:
# ⬇️  Remote ahead: 3 commits
# 📝 Nouveaux commits remote:
#   a1b2c3d feat: Add new feature
#   e4f5g6h fix: Bug fix
#   i7j8k9l docs: Update README
#
# 🔄 Pulling with rebase...
# ✅ Pull rebase successful
# ✅ SYNC COMPLETED
```

### Workflow 2 : Simple Push (Local Ahead)

```bash
# Situation: Local a commits non pushés
/sync-repo

# Output:
# 🔄 Fetching remote changes...
# ✅ Fetch completed
# 📊 Divergence Analysis:
# ⬆️  Local ahead: 2 commits
# 📝 Commits locaux à push:
#   m0n1o2p feat: New component
#   q3r4s5t fix: Validation bug
#
# ⬆️  Pushing local commits...
# ✅ Push successful
# ✅ SYNC COMPLETED
```

### Workflow 3 : Diverged (Local + Remote Ahead)

```bash
# Situation: Local et remote ont commits différents
/sync-repo --strategy rebase

# Output:
# 📊 Divergence Analysis:
# ↔️  Diverged: 2 ahead, 3 behind
#
# 🔄 Pulling with rebase...
# ✅ Pull rebase successful
# ⬆️  Pushing local commits...
# ✅ Push successful
# ✅ SYNC COMPLETED
```

### Workflow 4 : Uncommitted Changes

```bash
# Situation: Changements non commités localement
/sync-repo

# Output:
# ⚠️ Changements non commités détectés
#  M src/components/TodoList.tsx
#  A src/components/NewComponent.tsx
#
# Options:
# 1. Commiter changements (recommandé)
# 2. Stash changements (temporaire)
# 3. Annuler sync
# Choix (1/2/3): 1
#
# 💬 Commit message: feat: Add TodoList improvements
# ✅ Changements commités
# 🔄 Fetching remote changes...
# ...
```

### Workflow 5 : Conflicts Resolution

```bash
# Situation: Conflicts pendant pull rebase
/sync-repo

# Output:
# 🔄 Pulling with rebase...
# ❌ Rebase conflicts detected
# 📝 Conflicted files:
#   src/components/TodoList.tsx
#
# 💡 Resolve conflicts:
# 1. Edit conflicted files
# 2. git add <resolved-files>
# 3. git rebase --continue
# 4. Or abort: git rebase --abort

# Après résolution manuelle:
git add src/components/TodoList.tsx
git rebase --continue

# Puis re-sync:
/sync-repo
```

## ⚠️ Précautions Force Push

**Force push UNIQUEMENT si** :
- Branche personnelle (pas partagée)
- Rebase local nécessaire cleanup
- Commit sensible à supprimer

**JAMAIS force push sur** :
- `main` / `master` branch
- Branches partagées équipe
- Remote public

**Alternative safe** :
```bash
# Utiliser --force-with-lease (vérifie remote avant force)
git push --force-with-lease origin branch-name
```

## 📚 Commandes Git Équivalentes

```bash
# Fetch remote
git fetch --all --prune

# Pull rebase
git pull --rebase origin branch-name

# Pull merge
git pull origin branch-name

# Push
git push origin branch-name

# Force push (safe)
git push --force-with-lease origin branch-name

# Check divergence
git rev-list --count HEAD..@{u}  # Commits behind
git rev-list --count @{u}..HEAD  # Commits ahead
```

## 🎯 Decision Tree

```
Sync repo?
├── Uncommitted changes?
│   ├── Commit d'abord → Option 1
│   ├── Stash temporaire → Option 2
│   └── Annuler sync → Option 3
│
├── Remote ahead?
│   └── Pull (rebase ou merge)
│
├── Local ahead?
│   └── Push
│
├── Diverged?
│   ├── Pull first (rebase/merge)
│   └── Then push
│
└── Already in sync?
    └── ✅ Nothing to do
```

## ✅ Checklist Avant Sync

- [ ] Changements commités ou stashed?
- [ ] Branche correcte? (git branch --show-current)
- [ ] Remote configured? (git remote -v)
- [ ] Conflicts attendus? (communiquer équipe)
- [ ] Backup si force push? (git branch backup-branch)

## 🚨 Recovery Situations

**Pull/push failed** :
```bash
# Check remote URL
git remote -v

# Check network
ping github.com

# Re-authenticate
gh auth login  # GitHub CLI
```

**Rebase conflicts complexes** :
```bash
# Abort rebase
git rebase --abort

# Use merge strategy instead
/sync-repo --strategy merge
```

**Force push regret** :
```bash
# Find lost commits
git reflog

# Restore
git reset --hard HEAD@{1}
```

---

**Version 1.0 | 2025-11-13 | Command /sync-repo**
