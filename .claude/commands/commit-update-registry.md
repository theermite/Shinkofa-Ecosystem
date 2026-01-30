---
name: commit-update-registry
description: Smart Git commit with automatic lessons sync and conventional commit
agent: Code-Reviewer
model: sonnet
---

# /commit-update-registry — Commit Intelligent avec Sync

**Objectif** : Workflow commit complet avec synchronisation automatique des leçons apprises.

**Philosophie Shinkofa** : Documenter l'apprentissage, commit atomique, traçabilité totale.

---

## 🎯 Quand Utiliser

**Après avoir codé** :
- Nouvelle feature implémentée
- Bug corrigé
- Refactoring effectué
- Documentation mise à jour
- Configuration modifiée

**Au lieu de** :
```bash
# ❌ Workflow manuel (risque oubli sync)
git add .
git commit -m "update stuff"
git push
```

**Utilise** :
```bash
# ✅ Workflow intelligent (tout automatisé)
/commit-update-registry
```

---

## 🔄 Workflow (6 Étapes)

### Étape 0 : Pre-Flight Checks

**Vérifications initiales** :
```bash
# Check git status
git status --porcelain
```

**Scénarios** :

**A) Working tree clean** :
```
✅ Working tree clean

No changes to commit. Nothing to do.
```
→ Exit

**B) Fichiers modifiés, rien stagé** :
```
📝 Modified files detected:

  M src/services/email.py
  M src/components/Header.tsx
  ?? tests/test_email.py

Stage all changes? (Y/n)
```

Si oui → `git add -A`

**C) Fichiers déjà stagés** :
```
✅ Files already staged

  M src/services/email.py
  A tests/test_email.py

Proceeding with commit...
```

---

### Étape 1 : Sync Lessons Learned

**Objectif** : Synchroniser lessons learned avec changements récents

```
[1/6] Syncing lessons learned...
```

**Process** :

1. **Analyser changements** :
   ```bash
   # Lire diff pour détecter patterns intéressants
   git diff --cached
   ```

2. **Détecter lessons potentielles** :
   - Erreurs corrigées (fix commits)
   - Patterns répétés (refactor)
   - Nouvelle approche technique
   - Workaround créé

3. **Questions interactives** (si pertinent) :
   ```
   🎓 Lesson learned détectée

   Changements dans src/services/email.py :
   - Ajout retry logic avec exponential backoff
   - Gestion timeout SMTP

   Documenter cette approche dans lessons ? (Y/n)

   Si oui, catégorie :
     1. backend.md (Retry patterns)
     2. performance.md (Timeout handling)
     3. Skip
   ```

4. **Update lesson file** (si validé) :
   ```markdown
   ### [BACKEND] [RETRY] Retry Logic SMTP avec Exponential Backoff
   **Date** : 2026-01-28 | **Projet** : shinkofa-platform | **Sévérité** : 🟡

   **Contexte** :
   Envoi emails échouait aléatoirement (timeout SMTP).

   **Solution** :
   Retry logic avec exponential backoff (1s, 2s, 4s, 8s, max 3 retries).

   **Code** :
   ```python
   async def send_email_with_retry(to, subject, body, max_retries=3):
       for attempt in range(max_retries):
           try:
               await send_email(to, subject, body)
               return True
           except SMTPTimeoutError:
               if attempt == max_retries - 1:
                   raise
               await asyncio.sleep(2 ** attempt)
   ```

   **Prévention** :
   Utiliser ce pattern pour toutes opérations externes (API, DB, SMTP).
   ```

5. **Auto-stage lesson file** :
   ```bash
   git add Prompt-2026-Optimized/infrastructure/lessons/backend.md
   ```

**Output** :
```
Lessons sync completed:
  ✨ Updated: infrastructure/lessons/backend.md (+1 lesson)
  📁 Auto-staged lesson file
```

---

### Étape 2 : Validate Coherence

**Objectif** : Vérifier cohérence avant commit

```
[2/6] Validating coherence...
```

**Checks** :

**1. Secrets detection** :
```bash
# Check staged files pour patterns sensibles
git diff --cached --name-only | grep -E '\.(env|pem|key|p12)$|password|secret|credential'
```

Si trouvé :
```
🚨 SECURITY WARNING

Potentially sensitive files staged:
  - .env
  - config/credentials.json

These files may contain secrets!

Remove from staging? (Y/n)
```

Si oui → `git reset HEAD .env config/credentials.json`

**2. Tests manquants** (si code modifié) :
```bash
# Si fichiers code modifiés sans tests correspondants
# Avertissement (pas bloquant)
```

```
⚠️ Tests missing

Code modified but no tests added/updated:
  M src/services/email.py

Consider adding tests before committing.

Continue anyway? (Y/n)
```

**3. TODO/FIXME non résolus** (optionnel) :
```bash
git diff --cached | grep -E 'TODO|FIXME|XXX|HACK'
```

Si trouvé :
```
ℹ️ TODO markers found in staged code:

  src/services/email.py:45  # TODO: Add rate limiting

This is informational only.
```

---

### Étape 3 : Analyze Changes & Generate Message

**Objectif** : Générer commit message intelligent

```
[3/6] Analyzing changes for commit message...
```

**Process** :

1. **Catégoriser fichiers** :
   ```bash
   git diff --cached --name-status
   ```

   | Catégorie | Patterns | Priorité |
   |-----------|----------|----------|
   | Code | `src/**/*.{py,ts,tsx,js}` | 1 |
   | Tests | `tests/`, `**/*.test.{ts,tsx,py}` | 2 |
   | Docs | `*.md` (hors lessons) | 3 |
   | Config | `*.json`, `*.yml`, `.env.example` | 4 |
   | Lessons | `infrastructure/lessons/*.md` | 5 |

2. **Déterminer type commit** :

   | Condition | Type |
   |-----------|------|
   | Nouveau fichier `src/` | `feat:` |
   | Modifié fichier + "fix" dans diff | `fix:` |
   | Modifié fichier + "refactor" | `refactor:` |
   | Tests only | `test:` |
   | Docs only | `docs:` |
   | Config only | `chore:` |
   | Lessons only | `docs:` ou `chore:` |

3. **Déterminer scope** :

   ```
   Fichiers dans */auth/* ou */Auth/*     → (auth)
   Fichiers dans */api/* ou */API/*       → (api)
   Fichiers dans */components/*           → (ui)
   Fichiers dans */services/*             → (services)
   Fichiers dans infrastructure/          → (infra)
   Multiples directories                  → (multiple) ou omit
   ```

4. **Générer description** :

   **Lire diff pour extraire** :
   - Nouvelles fonctions ajoutées (def, function, const)
   - Fichiers créés (A dans git diff)
   - Changements majeurs (lignes modifiées)

5. **Composer message** :

   ```
   Analyzing staged changes...

   Code changes:
     A src/services/email.py (send_email_with_retry)
     M src/utils/retry.py (exponential_backoff helper)
     A tests/test_email.py (test_retry_logic)

   Lessons updated:
     M infrastructure/lessons/backend.md (+1 retry pattern)

   Suggested commit message:
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   feat(services): add email retry logic with exponential backoff

   - Add send_email_with_retry() with max 3 retries
   - Add exponential_backoff() helper (1s, 2s, 4s, 8s)
   - Add tests for retry logic
   - Document retry pattern in lessons/backend.md

   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

   Accept this message?
     [Y] Yes, use this message
     [E] Edit message
     [C] Custom message from scratch
     [A] Abort commit
   ```

---

### Étape 4 : Create Commit

**Objectif** : Créer commit avec co-author attribution

```
[4/6] Creating commit...
```

**Si message accepté** :
```bash
git commit -m "$(cat <<'EOF'
feat(services): add email retry logic with exponential backoff

- Add send_email_with_retry() with max 3 retries
- Add exponential_backoff() helper (1s, 2s, 4s, 8s)
- Add tests for retry logic
- Document retry pattern in lessons/backend.md

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"
```

**Si "Edit"** → Ouvrir éditeur :
```bash
# Utilise éditeur git par défaut
git commit
```

**Si "Custom"** → Demander message :
```
Enter custom commit message:
(Type message, end with Ctrl+D)

> _
```

**Capture output** :
```
[main abc123d] feat(services): add email retry logic with exponential backoff
 4 files changed, 123 insertions(+), 12 deletions(-)
 create mode 100644 src/services/email.py
 create mode 100644 tests/test_email.py
```

---

### Étape 5 : Push to Remote

**Objectif** : Push avec gestion erreurs

```
[5/6] Pushing to remote...
```

**Check remote config** :
```bash
git remote get-url origin
git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null
```

**Scénarios** :

**A) No remote configured** :
```
⚠️ No remote repository configured

Commit created locally: abc123d

To push later:
  git remote add origin <url>
  git push -u origin main
```

**B) Branch not tracked (first push)** :
```
📍 Branch: feature/email-retry
🔗 Remote: origin (not yet tracked)

First push for this branch.
Push with upstream tracking? (Y/n)
```

Si oui :
```bash
git push -u origin feature/email-retry
```

**C) Branch tracked** :
```
📍 Branch: main
🔗 Tracking: origin/main

Push to origin? (Y/n)
```

Si oui :
```bash
git push
```

**Handle push failures** :

**Non-fast-forward** :
```
❌ Push rejected (non-fast-forward)

Remote has newer commits.

Options:
  1. Pull and rebase: git pull --rebase origin main
  2. Pull and merge: git pull origin main
  3. Skip push (commit stays local)

Choose: [1/2/3]
```

**Authentication failed** :
```
❌ Push failed: authentication required

Check SSH key or credentials.

See: /check-ssh for SSH diagnostics
```

---

### Étape 6 : Generate Summary

**Objectif** : Afficher résumé clair

```
[6/6] Complete!
```

**Success output** :
```
╔═══════════════════════════════════════════════════════════════╗
║                    COMMIT COMPLETE ✓                          ║
╚═══════════════════════════════════════════════════════════════╝

COMMIT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hash:     abc123d
Branch:   main
Type:     feat(services)
Message:  add email retry logic with exponential backoff

FILES COMMITTED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Code (2 files):
  A src/services/email.py (+85 lines)
  M src/utils/retry.py (+23 lines)

Tests (1 file):
  A tests/test_email.py (+56 lines)

Lessons (1 file):
  M infrastructure/lessons/backend.md (+15 lines)

SYNC SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ Lessons updated: 1
📚 Pattern documented: Retry logic avec exponential backoff

REMOTE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✓ Pushed to origin/main

🔗 View commit:
   git show abc123d

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 📊 Exemples d'Usage

### Exemple 1 : Feature Complète

```
User: (Vient de coder une feature email avec tests)

/commit-update-registry

[1/6] Syncing lessons learned...
  🎓 Retry pattern detected
  📝 Updated: infrastructure/lessons/backend.md

[2/6] Validating coherence...
  ✅ No secrets found
  ✅ Tests present

[3/6] Analyzing changes...
  Suggested: feat(services): add email retry logic

  Accept? [Y/E/C/A]: Y

[4/6] Creating commit...
  ✓ Commit created: abc123d

[5/6] Pushing to remote...
  Push to origin/main? (Y/n): Y
  ✓ Pushed successfully

[6/6] Complete!
  ✓ 4 files committed
  ✓ 1 lesson documented
  ✓ Pushed to origin/main
```

---

### Exemple 2 : Bugfix Simple

```
User: (Fixed bug, pas de test additionnel nécessaire)

/commit-update-registry

[1/6] Syncing lessons learned...
  ℹ️ No new lessons detected

[2/6] Validating coherence...
  ⚠️ No tests modified
  Continue anyway? (Y/n): Y

[3/6] Analyzing changes...
  Suggested: fix(auth): handle null user in logout

  Accept? [Y/E/C/A]: Y

[4/6] Creating commit...
  ✓ Commit created: def456a

[5/6] Pushing to remote...
  ✓ Pushed to origin/main

[6/6] Complete!
  ✓ 1 file committed
  ✓ Pushed successfully
```

---

### Exemple 3 : Refactor avec Documentation

```
User: (Refactor code + update docs)

/commit-update-registry

[1/6] Syncing lessons learned...
  🎓 Refactor pattern detected
  Documenter? (Y/n): n (Skip)

[2/6] Validating coherence...
  ✅ Clean

[3/6] Analyzing changes...
  Code changes:
    M src/services/user.py (extract validation)
    M src/utils/validators.py (new validators)

  Docs changes:
    M README.md (update usage)

  Suggested: refactor(services): extract user validation logic

  Accept? [Y/E/C/A]: Y

[4/6] Creating commit...
  ✓ Commit created: 789gh12

[5/6] Pushing to remote...
  ✓ Pushed to origin/main

[6/6] Complete!
  ✓ 3 files committed (2 code, 1 docs)
```

---

## ⚙️ Configuration

### Sensitive Files Patterns

**Fichiers déclenchant warning sécurité** :
```bash
.env*
*.pem
*.key
*.p12
*password*
*secret*
*credential*
*token*
config/database.*
```

### Commit Types

**Convention Conventional Commits** :
```
feat:      Nouvelle fonctionnalité
fix:       Correction bug
docs:      Documentation seule
style:     Formatage (pas de changement logique)
refactor:  Refactoring (pas de feat/fix)
perf:      Amélioration performance
test:      Ajout/correction tests
chore:     Maintenance, dépendances, config
```

### Co-Author

**Format automatique** :
```
Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
```

---

## 🎯 Intégration Workflow Jay

### Workflow Standard

```
1. AUDIT   → Comprendre besoin
2. PLAN    → Proposer options + validation Jay
3. CODE    → Implémenter (TAKUMI + agents)
4. REVIEW  → /pre-commit (Code-Reviewer Agent)
5. COMMIT  → /commit-update-registry (CE SKILL)
6. BILAN   → Résumé + next steps
```

**Position** : `/commit-update-registry` à l'étape 5 (après review, avant bilan).

---

## 🚨 Règles Critiques

1. **TOUJOURS sync lessons learned** — Capture apprentissage
2. **JAMAIS commit secrets** — Détection obligatoire
3. **TOUJOURS Conventional Commits** — Cohérence historique
4. **TOUJOURS co-author Claude** — Attribution transparente
5. **Proposer message, JAMAIS imposer** — Validation Jay (Projecteur 1/3)

---

## 💡 Tips

**Pour Jay** :
- ✅ Utilise `/commit-update-registry` au lieu de `git commit` manuel
- ✅ Fais confiance au message suggéré (analyse intelligente)
- ✅ Édite si besoin (option "E")
- ✅ Les lessons sont synchronisées automatiquement

**Pour TAKUMI** :
- ✅ Analyse diff VRAIMENT (pas de generic message)
- ✅ Suggère type/scope correct (Conventional Commits)
- ✅ Détecte patterns intéressants pour lessons
- ✅ Respecte validation Jay (jamais forcer)

---

## 🔗 Intégration Exomondo

**Inspiré de** : `claude-methodology-exomondo/methodology/commands/commit-update-registry.md`

**Adaptations Jay** :
- ✅ Sync lessons learned (au lieu de registres modulaires complets)
- ✅ Workflow simplifié solo (moins verbeux qu'équipe)
- ✅ Focus patterns apprentissage (philosophie Shinkofa)
- ✅ Validation Jay respectée (invitation, pas imposition)

**Différences clés** :
| Exomondo | Nous (Jay) |
|----------|------------|
| Deep registry sync (functions, database, api) | Lessons learned sync (patterns, erreurs) |
| Très interactif (équipe) | Streamlined (solo Jay) |
| Gitea-specific | Git generic + GitHub |
| Cohérence check complexe | Checks essentiels (secrets, tests) |

---

## 📚 Commandes Liées

**Avant commit** :
- `/pre-commit` — Review code avant commit
- `/check-duplicate` — Vérifier doublons avant créer

**Après commit** :
- `git show <hash>` — Voir détails commit
- `/deploy` — Déployer si PROD ready

**Alternatives** :
- `git commit` — Commit manuel (sans sync automatique)
- `/search-registry` — Chercher dans lessons avant commit

---

**Version** : 1.0.0
**Date** : 2026-01-28
**Agent** : Code-Reviewer
**Philosophie** : Shinkofa — Documenter l'apprentissage, commit atomique, traçabilité
