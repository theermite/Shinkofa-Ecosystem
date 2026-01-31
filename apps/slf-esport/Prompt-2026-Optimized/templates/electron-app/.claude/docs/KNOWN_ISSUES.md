# Known Issues - [Nom Electron App]

> Problèmes connus, limitations, et workarounds.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🐛 Bugs Connus

### HIGH Priority

#### #001 : [Titre Bug]
**Status** : 🔴 Open | **Priorité** : HIGH | **Version** : 1.0.0

**Description** :
[Description]

**Steps to Reproduce** :
1. [Étape 1]
2. [Étape 2]

**Expected** : [Comportement attendu]
**Actual** : [Comportement actuel]

**Workaround** :
```
[Solution temporaire]
```

**Fix Planned** : v1.0.1 (ETA: YYYY-MM-DD)

---

### MEDIUM Priority

#### #002 : macOS : Window flicker lors du redimensionnement
**Status** : 🟡 Open | **Priorité** : MEDIUM | **Version** : 1.0.0

**Description** :
Sur macOS, fenêtre flicker (flash blanc) lors du resize rapide.

**Workaround** :
Désactiver transparency temporairement :
```typescript
const mainWindow = new BrowserWindow({
  transparent: false, // Au lieu de true
});
```

**Fix Planned** : v1.1 → Investigate Electron issue upstream

---

### LOW Priority

#### #003 : Linux : Tray icon pixelated sur HiDPI
**Status** : 🟢 Acknowledged | **Priorité** : LOW | **Version** : 1.0.0

**Description** :
Sur écrans HiDPI Linux, tray icon apparaît pixelisé.

**Workaround** :
Utiliser icon 48×48px (au lieu de 24×24px) :
```typescript
tray = new Tray('icon-48x48.png');
```

**Fix Planned** : v1.0.2 → Provide multiple icon sizes

---

## ⚠️ Limitations Techniques

### Limitation #1 : Binary size (150MB+)
**Impact** : Download + install time lent

**Context** :
Electron bundle Chromium + Node.js → taille incompressible ~150MB.

**Solution Future** : v2.0 → Explore Tauri (alternative légère)

**Workaround Actuel** :
- Auto-update (télécharge seulement diffs)
- Compression installeur (NSIS/DMG)

---

### Limitation #2 : Startup time (2-3s)
**Impact** : UX première ouverture

**Context** :
Electron cold start (initialisation Chromium).

**Solution Future** : v1.1 → Splash screen + lazy loading

**Workaround Actuel** :
- Keep app in tray (pas de full quit)
- Minimize instead of close

---

## 🔧 Workarounds Temporaires

### Workaround #1 : Database locked (SQLITE_BUSY)

**Problème** : Erreur "database is locked" si opérations simultanées.

**Workaround** :
Enable WAL mode :
```typescript
db.pragma('journal_mode = WAL');
```

**Fix Permanent** : v1.0.1 → Migrate to WAL mode by default

---

## 🚨 Security Considerations

### Consideration #1 : Preload script security
**Risk Level** : ⚠️ HIGH

**Context** :
Si preload script expose functions non sécurisées, Renderer peut accéder Node.js.

**Mitigation Actuelle** :
- `contextIsolation: true` TOUJOURS
- Valider inputs IPC côté Main Process

**Amélioration Future** : v1.1 → Audit preload script

---

## 📊 Performance Bottlenecks

### Bottleneck #1 : Large database queries (>10,000 rows)
**Impact** : UI freeze (200ms+)

**Root Cause** :
Query synchrone bloque Main Process.

**Workaround** :
Pagination :
```typescript
const users = db.prepare('SELECT * FROM users LIMIT ? OFFSET ?').all(100, 0);
```

**Fix Permanent** : v1.1 → Worker threads pour DB queries

---

## 🔗 Références

- **Issue Tracker** : [GitHub Issues]
- **Electron Docs** : https://www.electronjs.org/docs
- **Security Checklist** : https://www.electronjs.org/docs/tutorial/security

---

## 📝 Comment Reporter un Bug

1. **Vérifier Known Issues** (ce fichier)
2. **Chercher dans Issues** : [GitHub Issues]
3. **Créer nouveau issue** :
   - Template : `.github/ISSUE_TEMPLATE/bug_report.md`
   - Labels : `bug`, `priority:high/medium/low`
4. **Inclure** :
   - App version (Help → About)
   - OS + version
   - Steps to reproduce
   - Screenshots si applicable
   - Logs (`%APPDATA%\YourApp\logs\main.log`)

---

**Maintenu par** : Dev Team | **Review** : À chaque sprint
