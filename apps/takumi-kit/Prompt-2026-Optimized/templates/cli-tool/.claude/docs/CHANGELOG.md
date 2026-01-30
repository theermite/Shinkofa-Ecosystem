# Changelog - [Nom CLI Tool]

> Historique des versions du CLI tool.

**Format** : [Keep a Changelog](https://keepachangelog.com/)
**Versioning** : [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### À venir
- Rollback automatique (v1.1)
- Plugins system (v1.2)
- Cloud-hosted config (v2.0)

---

## [1.0.0] - YYYY-MM-DD

### 🎉 Premier Release Stable

#### Added
- Command `mycli init` (initialize config)
- Command `mycli deploy` (deploy to environments)
- Command `mycli db migrate` (run migrations)
- Command `mycli db seed` (seed database)
- Command `mycli db backup` (backup database)
- Command `mycli logs` (view application logs)
- Command `mycli config` (manage configuration)
- Config file support (`~/.mycli/config.yaml`)
- Rich output (colors, progress bars, tables)
- Dry-run mode (`--dry-run` flag)
- Verbose mode (`--verbose` flag)
- Distribution PyPI/npm

#### Security
- Config file permissions (600)
- API key storage secure
- HTTPS only API calls

---

## [0.3.0] - YYYY-MM-DD

### 🚀 Beta Release

#### Added
- Command `mycli db backup`
- Command `mycli logs --follow` (realtime streaming)
- JSON output format (`--format json`)

#### Changed
- Refactoring CLI structure (subcommands)
- Migration `mycli.core.config` (typed config)

#### Fixed
- Bug #12 : Deploy timeout (increased to 5min)
- Bug #15 : Windows path handling

---

## [0.2.0] - YYYY-MM-DD

### Alpha Release

#### Added
- Commands `mycli deploy`, `mycli db migrate`
- Config management (`config.yaml`)
- Tests (pytest/vitest, 70% coverage)

#### Changed
- CLI framework Python: Click (was argparse)
- CLI framework TypeScript: Commander (was yargs)

---

## [0.1.0] - YYYY-MM-DD

### 🌱 Initial Commit

#### Added
- Setup projet (structure)
- README.md avec usage

---

## Format Commit Messages

**Convention** : Conventional Commits

```
<type>(scope): <description>

[optional body]
```

**Types** :
- `feat` : Nouvelle feature/command
- `fix` : Bug fix
- `docs` : Documentation
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Maintenance

**Exemples** :
```
feat(deploy): add --dry-run flag
fix(config): handle missing config file
docs(readme): update installation instructions
```

---

## Notes de Version

### Comment créer une release

**Python (PyPI)** :
1. Update `CHANGELOG.md` : [Unreleased] → [X.Y.Z]
2. Update `pyproject.toml` : `version = "X.Y.Z"`
3. Commit : `chore: bump version to X.Y.Z`
4. Tag : `git tag -a vX.Y.Z -m "Release X.Y.Z"`
5. Push : `git push origin main --tags`
6. Build : `python -m build`
7. Upload : `twine upload dist/*`

**TypeScript (npm)** :
1. Update `CHANGELOG.md` : [Unreleased] → [X.Y.Z]
2. Update `package.json` : `"version": "X.Y.Z"`
3. Commit : `chore: bump version to X.Y.Z`
4. Tag : `git tag -a vX.Y.Z -m "Release X.Y.Z"`
5. Push : `git push origin main --tags`
6. Publish : `npm publish`

---

## Migration Guide

### v0.3.0 → v1.0.0

**Breaking Changes** :
- ⚠️ Config format changed : `api_key` now required (was optional)
- ⚠️ Command `mycli deploy` : `--env` now required (was optional with default)

**Migration Steps** :
1. Backup config : `cp ~/.mycli/config.yaml ~/.mycli/config.yaml.bak`
2. Run `mycli init --force` (regenerate config)
3. Restore `api_key` from backup

---

**Maintenu par** : Dev Team | **Dernière mise à jour** : [DATE]
