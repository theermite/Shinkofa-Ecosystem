# Changelog - [Nom Electron App]

> Historique des versions application.

**Format** : [Keep a Changelog](https://keepachangelog.com/)
**Versioning** : [Semantic Versioning](https://semver.org/)

---

## [Unreleased]

### À venir
- Real-time collaboration (v1.1)
- Plugins system (v1.2)
- Mobile apps (v2.0)

---

## [1.0.0] - YYYY-MM-DD

### 🎉 Premier Release Stable

#### Added
- Application Electron multi-plateforme (Windows, macOS, Linux)
- Interface React 18 + TypeScript
- Base de données SQLite locale
- CRUD tâches offline-first
- Tray icon (system tray)
- Application menu natif
- Auto-update (electron-updater)
- Dark mode

#### Security
- contextIsolation enabled
- nodeIntegration disabled
- Preload script secure IPC

---

## [0.3.0] - YYYY-MM-DD

### 🚀 Beta Release

#### Added
- Auto-update système
- Notifications système
- Keyboard shortcuts (Cmd+N, Cmd+S, etc.)

#### Changed
- Refactoring IPC communication (type-safe)
- Migration SQLite schema (add `updated_at`)

#### Fixed
- Bug #8 : Window state not persisted
- Bug #12 : macOS menu shortcuts

---

## [0.2.0] - YYYY-MM-DD

### Alpha Release

#### Added
- Electron setup complet
- React UI
- SQLite database
- Basic CRUD operations

---

## [0.1.0] - YYYY-MM-DD

### 🌱 Initial Commit

#### Added
- Setup projet
- README.md

---

## Format Commit Messages

**Convention** : Conventional Commits

```
<type>(scope): <description>
```

**Types** :
- `feat` : Nouvelle feature
- `fix` : Bug fix
- `docs` : Documentation
- `refactor` : Refactoring
- `test` : Tests
- `chore` : Maintenance

**Exemples** :
```
feat(ipc): add database:getUsers handler
fix(window): persist window state on close
docs(readme): update installation instructions
```

---

## Notes de Version

### Comment créer une release

1. Update `CHANGELOG.md` : [Unreleased] → [X.Y.Z]
2. Update `package.json` : `"version": "X.Y.Z"`
3. Commit : `chore: bump version to X.Y.Z`
4. Tag : `git tag -a vX.Y.Z -m "Release X.Y.Z"`
5. Push : `git push origin main --tags`
6. Build : `npm run dist` (génère installers)
7. Upload : GitHub Releases (ou serveur update)

---

## Migration Guide

### v0.3.0 → v1.0.0

**Breaking Changes** :
- ⚠️ Database schema changed : add `updated_at` column

**Migration Steps** :
1. App auto-migrates database on launch
2. If manual migration needed : run SQL in `migrations/003_add_updated_at.sql`

---

**Maintenu par** : Dev Team | **Dernière mise à jour** : [DATE]
