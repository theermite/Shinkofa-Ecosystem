---
description: Annuler dernier commit ou changements (rollback sécurisé)
---

# Slash Command: /rollback-last

## 🎯 Objectif

Annuler le dernier commit ou les changements récents de manière sécurisée:
- Rollback dernier commit (preserving changes)
- Hard reset dernier commit (destructif)
- Revert commit (historique préservé)
- Restore fichiers spécifiques
- Stash changements non commités

Adapté profil Jay (TDAH) : Undo rapide sans perte de travail.

## 📋 Arguments

**Syntaxe** : `/rollback-last [--mode <soft|hard|revert>] [--file <path>]`

**Arguments** :
- `--mode` : Mode rollback (défaut: soft)
  - `soft` : Annule commit, garde changements staged
  - `hard` : Annule commit + supprime changements (⚠️ DESTRUCTIF)
  - `revert` : Crée nouveau commit annulant le dernier
- `--file` : Restaurer fichier spécifique uniquement

**Exemples** :
```bash
/rollback-last
/rollback-last --mode soft
/rollback-last --mode hard
/rollback-last --mode revert
/rollback-last --file src/components/TodoList.tsx
```

## 🚀 Ce que fait le Command

### Mode 1 : Soft Rollback (Par défaut)

**Annule dernier commit, garde changements** :
```bash
# Show last commit
echo "📝 Dernier commit à annuler:"
git log -1 --oneline --decorate

# Confirmation
echo "⚠️ Cela annulera le commit mais gardera les changements staged."
read -p "Confirmer? (y/n) " confirm

if [ "$confirm" = "y" ]; then
  # Soft reset
  git reset --soft HEAD~1

  echo "✅ Commit annulé (changements staged préservés)"
  echo "📊 Status:"
  git status --short
else
  echo "❌ Rollback annulé"
fi
```

**Use case** :
- Commit message incorrect → Annuler, corriger message, recommiter
- Oublié d'ajouter fichier → Annuler, ajouter fichier, recommiter

**Output exemple** :
```
📝 Dernier commit à annuler:
a1b2c3d (HEAD -> main) feat: Add EnergyCheckIn component

⚠️ Cela annulera le commit mais gardera les changements staged.
Confirmer? (y/n) y

✅ Commit annulé (changements staged préservés)
📊 Status:
A  src/components/EnergyCheckIn.tsx
M  src/App.tsx

💡 Vous pouvez maintenant:
- Modifier fichiers
- Corriger commit message
- Recommiter: git commit -m "nouveau message"
```

### Mode 2 : Hard Rollback (DESTRUCTIF ⚠️)

**Annule dernier commit + supprime changements** :
```bash
# Show last commit
echo "📝 Dernier commit à annuler:"
git log -1 --stat

# WARNING
echo "🚨 ATTENTION: Cela supprimera DÉFINITIVEMENT les changements!"
echo "🚨 Utilisez 'soft' si vous voulez garder les changements."
read -p "Vraiment continuer? (tapez 'yes' pour confirmer) " confirm

if [ "$confirm" = "yes" ]; then
  # Create backup branch (safety)
  BACKUP_BRANCH="backup-$(date +%Y%m%d-%H%M%S)"
  git branch $BACKUP_BRANCH
  echo "🔒 Backup créé: $BACKUP_BRANCH"

  # Hard reset
  git reset --hard HEAD~1

  echo "✅ Commit annulé + changements supprimés"
  echo "📊 Status:"
  git status --short
  echo ""
  echo "💡 Restore possible depuis backup: git checkout $BACKUP_BRANCH"
else
  echo "❌ Rollback annulé"
fi
```

**Use case** :
- Commit totalement incorrect → Supprimer complètement
- Expérimentation ratée → Revenir à état précédent

**Sécurité** :
- Crée automatiquement branche backup
- Double confirmation requise
- Message warning clair

### Mode 3 : Revert (Historique préservé)

**Crée nouveau commit annulant le dernier** :
```bash
# Show last commit
echo "📝 Dernier commit à reverter:"
git log -1 --oneline

# Revert (creates new commit)
git revert HEAD --no-edit

echo "✅ Commit reverté (nouveau commit créé)"
echo "📝 Historique:"
git log --oneline -3

echo ""
echo "💡 L'historique est préservé, bon pour branches partagées"
```

**Use case** :
- Branche déjà pushée (partagée) → Revert préserve historique
- Rollback transparent pour équipe
- Audit trail nécessaire

**Output exemple** :
```
📝 Dernier commit à reverter:
a1b2c3d feat: Add buggy feature

✅ Commit reverté (nouveau commit créé)
📝 Historique:
b2c3d4e Revert "feat: Add buggy feature"
a1b2c3d feat: Add buggy feature
e4f5g6h feat: Previous commit

💡 Branche safe pour push origin
```

### Mode 4 : Restore Fichier Spécifique

**Restaurer fichier à état dernier commit** :
```bash
FILE="$1"

# Show file status
echo "📁 Fichier: $FILE"
git diff HEAD -- "$FILE"

# Confirmation
read -p "Restaurer ce fichier? (y/n) " confirm

if [ "$confirm" = "y" ]; then
  # Restore file
  git restore "$FILE"

  echo "✅ Fichier restauré: $FILE"
else
  echo "❌ Restoration annulée"
fi
```

**Use case** :
- Modifications incorrectes sur 1 fichier → Restaurer ce fichier uniquement
- Garder autres changements

### Mode 5 : Stash Changements

**Sauvegarder changements temporairement** :
```bash
# Check if changes exist
if git diff --quiet && git diff --cached --quiet; then
  echo "✅ Aucun changement à stash"
  exit 0
fi

# Stash with message
STASH_MSG="Stash at $(date '+%Y-%m-%d %H:%M:%S')"
git stash push -m "$STASH_MSG"

echo "✅ Changements stashed: $STASH_MSG"
echo "📦 Stash list:"
git stash list | head -5

echo ""
echo "💡 Restaurer: git stash pop"
echo "💡 Voir contenu: git stash show -p"
echo "💡 Supprimer: git stash drop"
```

**Use case** :
- Changements à sauvegarder temporairement
- Switch branche rapide
- Expérimentation sans commit

## 🚀 Workflow Recommandé

### Scénario 1 : Commit Message Incorrect
```bash
# Dernier commit a mauvais message
git log -1  # Message: "fix bug" (pas assez descriptif)

# Rollback soft
/rollback-last --mode soft

# Recommit avec bon message
git commit -m "fix(todo): Correct validation error in TodoForm input"
```

### Scénario 2 : Expérimentation Ratée
```bash
# Test feature buggy committed
git log -1  # "feat: Add experimental feature"

# Hard rollback avec backup
/rollback-last --mode hard

# Ou si besoin revenir en arrière
git checkout backup-20251113-143000
```

### Scénario 3 : Branche Partagée
```bash
# Commit déjà pushé origin, besoin annuler
git log origin/main..HEAD  # 1 commit ahead

# Revert (safe pour remote)
/rollback-last --mode revert

# Push revert
git push origin main
```

### Scénario 4 : Fichier Spécifique
```bash
# Modifications incorrectes sur TodoList.tsx seulement
git diff src/components/TodoList.tsx

# Restore ce fichier uniquement
/rollback-last --file src/components/TodoList.tsx

# Garder autres changements
git status  # Autres fichiers encore modifiés
```

## ⚠️ Précautions de Sécurité

### 1. Backup Automatique
- Mode `hard` crée toujours branche backup
- Restore possible: `git checkout backup-YYYYMMDD-HHMMSS`

### 2. Double Confirmation
- Mode `hard` requiert taper "yes" (pas juste "y")
- Warning explicite avant actions destructives

### 3. Verification
- Affiche toujours contenu commit avant annuler
- Option preview avant action

### 4. Stash Alternative
- Suggère stash plutôt que hard reset si applicable
- Préserve travail en cours

## 📚 Commandes Git Équivalentes

```bash
# Soft reset (garde changements)
git reset --soft HEAD~1

# Hard reset (supprime changements)
git reset --hard HEAD~1

# Revert (nouveau commit)
git revert HEAD

# Restore fichier
git restore <file>

# Stash changements
git stash push -m "message"

# Unstage fichier
git restore --staged <file>
```

## 🎯 Decision Tree

```
Besoin rollback?
├── Commit pas encore pushé?
│   ├── Garder changements? → --mode soft
│   ├── Supprimer tout? → --mode hard (avec backup)
│   └── 1 fichier seulement? → --file <path>
│
├── Commit déjà pushé (branche partagée)?
│   └── → --mode revert (préserve historique)
│
└── Changements pas commités?
    ├── Temporaire? → git stash
    ├── 1 fichier? → --file <path>
    └── Tout supprimer? → git restore .
```

## ✅ Checklist Sécurité

Avant rollback, vérifier:
- [ ] Commit déjà pushé? (utiliser revert si oui)
- [ ] Changements à préserver? (utiliser soft)
- [ ] Backup créé? (automatique en mode hard)
- [ ] Double confirmation lue?

## 🚨 Situations d'Urgence

**Rollback accidentel hard** :
```bash
# Chercher commit perdu
git reflog

# Restore depuis reflog
git reset --hard HEAD@{1}
```

**Ou depuis backup branch** :
```bash
git checkout backup-20251113-143000
git checkout -b recovery
git cherry-pick <commit-hash>
```

---

**Version 1.0 | 2025-11-13 | Command /rollback-last**
