# /bump-version

Bump la version du projet selon Semantic Versioning et met à jour CHANGELOG.md automatiquement.

## Description

Cette commande gère le versioning SemVer (MAJOR.MINOR.PATCH) automatiquement :
- Incrémente la version dans les fichiers de configuration
- Déplace les entrées CHANGELOG.md de `[Unreleased]` vers `[X.Y.Z]`
- Crée un tag Git annotated
- Commit les changements avec message standardisé

## Usage

```bash
/bump-version <major|minor|patch> [--dry-run] [--no-tag] [--no-commit]
```

**Arguments** :
- `major` : Breaking changes (X.0.0) - Exemple : 1.5.2 → 2.0.0
- `minor` : Nouvelles features backward-compatible (0.X.0) - Exemple : 1.5.2 → 1.6.0
- `patch` : Bug fixes backward-compatible (0.0.X) - Exemple : 1.5.2 → 1.5.3

**Options** :
- `--dry-run` : Simule bump sans modifier fichiers
- `--no-tag` : Skip création tag Git
- `--no-commit` : Skip commit automatique (manuel après)

## Comportement

### 1. **Détection Version Actuelle**

Parse fichiers de configuration dans cet ordre de priorité :

**Python** :
- `pyproject.toml` : `[project] version = "X.Y.Z"`
- `setup.py` : `version="X.Y.Z"`
- `__init__.py` : `__version__ = "X.Y.Z"`

**JavaScript/TypeScript** :
- `package.json` : `"version": "X.Y.Z"`

**Autres** :
- `VERSION` (fichier texte plain)
- `.bumpversion.cfg` (si utilise bump2version)

### 2. **Calcul Nouvelle Version**

Selon type de bump :
```
Current: 1.5.2

major → 2.0.0
minor → 1.6.0
patch → 1.5.3
```

### 3. **Mise à Jour Fichiers**

**Fichiers version** :
- `package.json` → `"version": "1.6.0"`
- `pyproject.toml` → `version = "1.6.0"`
- Etc.

**CHANGELOG.md** :
```markdown
# Changelog

## [Unreleased]
(vide - tout déplacé)

## [1.6.0] - 2026-01-03
### Added
- Nouvelle feature X
- Endpoint /api/export

### Changed
- Amélioration performance queries DB

### Fixed
- Bug affichage dashboard mobile

## [1.5.2] - 2025-12-28
...
```

**README.md** (si badge version) :
```markdown
![Version](https://img.shields.io/badge/version-1.6.0-blue)
```

### 4. **Git Commit & Tag**

**Commit** :
```bash
git add package.json CHANGELOG.md README.md
git commit -m "chore(release): v1.6.0

- Bump version from 1.5.2 to 1.6.0
- Update CHANGELOG.md with release notes

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

**Tag** :
```bash
git tag -a v1.6.0 -m "Version 1.6.0

Release notes:
- Nouvelle feature X
- Endpoint /api/export
- Amélioration performance queries DB
- Bug fix affichage dashboard mobile

🤖 Generated with [Claude Code](https://claude.com/claude-code)"
```

**Push** :
```bash
git push origin main
git push origin v1.6.0
```

## Exemple Output

```
🏷️  Bump Version - major - 2026-01-03

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📊 VERSION DETECTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Current version: 1.5.2 (from package.json)
New version    : 2.0.0 (MAJOR bump)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 FILES TO UPDATE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ package.json (version: "2.0.0")
✅ CHANGELOG.md ([2.0.0] - 2026-01-03)
✅ README.md (badge updated)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📜 CHANGELOG PREVIEW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
## [2.0.0] - 2026-01-03

### BREAKING CHANGES
- **API**: Endpoint `/users` renommé `/api/v2/users`
  - Migration: Remplacer tous appels `/users` par `/api/v2/users`
  - Raison: Versioning API explicite

### Added
- Nouveau endpoint `/api/v2/export` pour export CSV
- Feature flags support

### Changed
- Amélioration performance queries DB (indexes ajoutés)

### Fixed
- Bug affichage dashboard mobile responsive

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔧 GIT OPERATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Files staged: package.json, CHANGELOG.md, README.md
✅ Commit created: chore(release): v2.0.0
✅ Tag created: v2.0.0 (annotated)
✅ Pushed to origin/main
✅ Tag pushed: v2.0.0

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ VERSION BUMPED: 1.5.2 → 2.0.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 Next Steps:
1. Verify release on GitHub: https://github.com/user/repo/releases/tag/v2.0.0
2. Deploy to production (if applicable)
3. Announce release to users (if breaking changes)
```

## Gestion Breaking Changes

Si bump `major` détecté, la commande :

1. **Vérifie section BREAKING CHANGES** dans CHANGELOG.md [Unreleased]
   - Si absente → Warning + demande confirmation

2. **Propose migration guide** :
   ```
   ⚠️  MAJOR bump detected but no BREAKING CHANGES section in CHANGELOG.

   Add BREAKING CHANGES section? [y/N]:
   ```

3. **Si confirmé** : Ouvre éditeur pour ajouter breaking changes documentation

## Rollback

Si erreur après bump :

```bash
# Rollback commit
git reset --hard HEAD~1

# Supprimer tag
git tag -d v2.0.0

# Si déjà push
git push origin :refs/tags/v2.0.0
git push origin main --force-with-lease
```

Ou utiliser `/rollback-last` qui fait tout automatiquement.

## Pre-release Versions

Pour versions pre-release (alpha, beta, rc) :

```bash
/bump-version minor --pre alpha  # 1.5.2 → 1.6.0-alpha.1
/bump-version patch --pre alpha  # 1.6.0-alpha.1 → 1.6.0-alpha.2
/bump-version patch --pre beta   # 1.6.0-alpha.2 → 1.6.0-beta.1
/bump-version patch --pre rc     # 1.6.0-beta.1 → 1.6.0-rc.1
/bump-version patch              # 1.6.0-rc.1 → 1.6.0 (stable)
```

## Quand Utiliser

**MAJOR bump** (breaking changes) :
- Suppression endpoint API
- Changement structure response API
- Migration DB nécessitant intervention manuelle
- Changement signatures fonctions publiques

**MINOR bump** (nouvelles features) :
- Nouvel endpoint API
- Nouvelle fonctionnalité UI
- Amélioration performance significative
- Nouvelles options config (avec defaults safe)

**PATCH bump** (bug fixes) :
- Correction bug
- Typo correction
- Optimisation mineure
- Mise à jour dépendances (patches sécurité)

## Configuration

Fichier `.bumpversion.toml` (optionnel) :

```toml
[bumpversion]
current_version = "1.5.2"
commit = true
tag = true
tag_name = "v{new_version}"
message = "chore(release): v{new_version}"

[[bumpversion.files]]
filename = "package.json"
search = '"version": "{current_version}"'
replace = '"version": "{new_version}"'

[[bumpversion.files]]
filename = "README.md"
search = "version-{current_version}-blue"
replace = "version-{new_version}-blue"
```

## Notes

- **Atomic operation** : Si erreur, rollback automatique
- **Validation** : Vérifie format SemVer avant bump
- **Safety** : Demande confirmation si CHANGELOG vide (pas de changements documentés)
- **CI/CD** : Compatible GitHub Actions (auto-deploy on tag push)
