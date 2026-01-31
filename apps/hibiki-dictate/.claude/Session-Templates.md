# Session Templates & Versioning

**Contexte d'usage** : Consulter pour templates session summary, versioning strategy, breaking changes.

---

## 📋 Session Summary Template

**Utiliser à la fin de chaque session** :

```markdown
# Session Summary - [DATE] - [DURÉE]

## ✅ Accompli
- [Tâche 1] - Status: ✅ Terminé | Commit: [hash]
- [Tâche 2] - Status: ⏳ En cours (X% complété)
- [Tâche 3] - Status: ⏸️ Bloqué - Raison: [...]

## 🔧 Changements Techniques
**Fichiers modifiés** :
- `chemin/fichier1.py` - [Description changement]
- `chemin/fichier2.tsx` - [Description changement]

**Dépendances ajoutées/modifiées** :
- `package-name@version` - Raison: [...]

**Configurations modifiées** :
- `.env` - Nouvelles variables: [...]
- `nginx.conf` - [Changement]

## ⚠️ Blockers / Erreurs Rencontrées
- **[Blocker 1]** - Résolu: ❌ Non
  - Erreur: [Message]
  - Tentatives: [Ce qui a été essayé]
  - Next step: [Action nécessaire]

## 📋 Next Steps (par priorité)
1. **[Tâche prioritaire 1]** - Effort: [S/M/L] - Bloquée par: [si applicable]
2. **[Tâche prioritaire 2]** - Effort: [S/M/L]

## 💡 Leçons Apprises
- [Insight technique 1]
- [Pattern réutilisable découvert]
- [Erreur à éviter dans le futur]

## 📊 Métriques
- **Temps effectif** : [Durée réelle]
- **Commits** : [Nombre] commits
- **Tests coverage** : [%] (si applicable)
- **Lignes modifiées** : +[X] -[Y]
```

**Command** : `/session-summary` pour génération automatique

---

## 📌 Versioning Strategy (SemVer)

**Format** : `MAJOR.MINOR.PATCH` (ex: 2.3.1)

### Quand Bumper Version

**MAJOR (X.0.0)** - Breaking Changes :
- Suppression endpoint API
- Changement structure response API (fields renommés/supprimés)
- Changement signatures fonctions publiques
- Migration DB nécessitant intervention manuelle
- Exemple : v1.5.2 → v2.0.0

**MINOR (0.X.0)** - Nouvelles Features (backward-compatible) :
- Nouvel endpoint API
- Nouvelle fonctionnalité UI
- Nouvelles options config (avec defaults safe)
- Amélioration performance significative
- Exemple : v2.3.1 → v2.4.0

**PATCH (0.0.X)** - Bug Fixes (backward-compatible) :
- Correction bug
- Typo correction
- Optimisation mineure
- Mise à jour dépendances (patches sécurité)
- Exemple : v2.4.0 → v2.4.1

### Phases Développement

- **Initial Development** : `0.X.Y` (avant production stable, API peut changer)
- **First Stable Release** : `1.0.0` (API publique stabilisée)
- **Pre-release** : `1.0.0-alpha.1`, `1.0.0-beta.2`, `1.0.0-rc.1`

### CHANGELOG.md Format

```markdown
# Changelog

## [Unreleased]
### Added
- Nouvelle feature X

### Changed
- Amélioration Y

### Fixed
- Bug Z corrigé

## [2.1.0] - 2026-01-15
### Added
- Endpoint `/api/users/export` pour export CSV

### Security
- Patch vulnérabilité XSS dans formulaire contact
```

**Command** : `/bump-version major|minor|patch` pour bump automatique

---

## ⚠️ Breaking Changes Protocol

**AVANT d'introduire breaking change** :

### 1. Documentation
- [ ] Documenter le changement (Quoi, Pourquoi, Migration path)

### 2. Communication
- [ ] CHANGELOG.md : Section "BREAKING CHANGES" en haut
- [ ] README.md : Section "Migration Guide" si changement majeur
- [ ] Deprecation warning si possible (Version N : annonce, Version N+1 : suppression)

### 3. Versioning
- [ ] Bump MAJOR version : `X.0.0` (respecter SemVer strict)
- [ ] Git tag : `git tag -a v2.0.0 -m "Version 2.0.0"`

### 4. Alternative (Si Possible)
- [ ] Feature flags : Transition douce
- [ ] API versioning : `/api/v1/` + `/api/v2/`
- [ ] Backward compatibility temporaire : 1-2 versions

**Command** : `/breaking-changes-check` pour analyser commits récents

---

## 📁 Repo Etiquette

**Branch Naming** :
- `feature/nom-feature` : Nouvelles fonctionnalités
- `fix/nom-bug` : Corrections bugs
- `docs/sujet` : Documentation uniquement
- `refactor/composant` : Refactoring code

**Commits** :
- Format : `type(scope): description courte`
- Types : feat, fix, docs, refactor, test, chore
- Atomiques : 1 commit = 1 changement logique
- Descriptifs : Quoi + Pourquoi

**Merge vs Rebase** :
- Merge : Branches feature → main (historique préservé)
- Rebase : Commits locaux avant push (historique propre)
- Squash : Multiples commits feature → 1 commit main si pertinent

---

**Retour vers** : `CLAUDE.md` pour workflow principal
