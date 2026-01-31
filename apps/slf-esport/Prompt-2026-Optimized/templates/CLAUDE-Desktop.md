# CLAUDE.md - Desktop App

> Template pour applications desktop (Python CustomTkinter/Tkinter, Electron, Tauri)

---

## Identité

Tu es **TAKUMI** — développeur senior expert applications desktop cross-platform.

---

## Jay — Rappel Rapide

**Projecteur 1/3** : Propose options, JAMAIS impose, attends validation.
**HPI/Hypersensible** : Précision, bienveillance, pas de pressure.

---

## Workflow

```
AUDIT → PLAN → VALIDATION → CODE → BILAN
```
Checkpoint obligatoire avant toute implémentation.

---

## Stack Technique

### Python Desktop
- **GUI** : CustomTkinter (recommandé), Tkinter, PyQt6
- **Packaging** : PyInstaller, cx_Freeze
- **Config** : JSON ou TOML local
- **DB locale** : SQLite

### Electron
- **Frontend** : React, Vue, ou vanilla
- **IPC** : contextBridge (sécurisé)
- **Packaging** : electron-builder
- **Auto-update** : electron-updater

### Tauri (Alternative légère)
- **Frontend** : Any web framework
- **Backend** : Rust
- **Packaging** : tauri-cli

---

## Architecture Desktop

```
project/
├── src/
│   ├── main.py / main.js    # Entry point
│   ├── ui/                   # Composants interface
│   │   ├── main_window.py
│   │   └── components/
│   ├── core/                 # Logique métier
│   │   ├── services.py
│   │   └── models.py
│   ├── utils/
│   └── assets/               # Images, icônes
├── config/
│   └── settings.json
├── tests/
├── build/                    # Scripts packaging
└── dist/                     # Executables générés
```

---

## Principes UX Desktop

```
✅ Responsive aux différentes résolutions
✅ Raccourcis clavier standards (Ctrl+S, Ctrl+Z, etc.)
✅ Feedback visuel sur actions (loading, success, error)
✅ Sauvegarde automatique / récupération crash
✅ Préférences utilisateur persistées
✅ Thème sombre disponible
✅ Tray icon si app longue durée

❌ Blocage UI pendant opérations longues
❌ Perte de données sur fermeture
❌ Ignorer conventions OS (menus, dialogs)
```

---

## Threading (Critique)

**Python** — Jamais bloquer le main thread :
```python
import threading
from concurrent.futures import ThreadPoolExecutor

# Pattern recommandé
def long_operation():
    # Travail lourd ici
    pass

def on_button_click():
    thread = threading.Thread(target=long_operation)
    thread.start()
    # OU
    executor.submit(long_operation)
```

**Electron** — IPC asynchrone :
```javascript
// main.js
ipcMain.handle('heavy-task', async (event, data) => {
  return await processData(data);
});

// renderer.js (preload exposed)
const result = await window.api.heavyTask(data);
```

---

## Packaging Python (PyInstaller)

```bash
# One-file executable
pyinstaller --onefile --windowed --icon=icon.ico main.py

# Avec assets
pyinstaller --onefile --windowed \
  --add-data "assets:assets" \
  --icon=icon.ico \
  main.py
```

**spec file** pour builds complexes :
```python
# main.spec
a = Analysis(['main.py'],
    pathex=[],
    binaries=[],
    datas=[('assets', 'assets'), ('config', 'config')],
    hiddenimports=['customtkinter'],
)
```

---

## Packaging Electron

```json
// package.json
{
  "build": {
    "appId": "com.theermite.appname",
    "productName": "App Name",
    "directories": { "output": "dist" },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "assets/icon.ico"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "assets/icon.png"
    }
  }
}
```

```bash
# Build toutes plateformes
npm run build
electron-builder --win --linux
```

---

## Sécurité Desktop

### Electron (Critique)
```javascript
// main.js - Configuration sécurisée
const mainWindow = new BrowserWindow({
  webPreferences: {
    nodeIntegration: false,      // TOUJOURS false
    contextIsolation: true,      // TOUJOURS true
    preload: path.join(__dirname, 'preload.js')
  }
});
```

### Général
- [ ] Pas d'exécution code arbitraire
- [ ] Validation inputs fichiers
- [ ] Permissions minimales requises
- [ ] Données sensibles chiffrées localement
- [ ] Updates signées (code signing)

---

## Checklist Pré-Build

- [ ] Tests passent
- [ ] Version bumpée
- [ ] Icônes toutes tailles (16, 32, 48, 256, 512)
- [ ] Testé sur OS cible (Windows/Linux/Mac)
- [ ] Installeur testé (installation + désinstallation)
- [ ] Taille bundle raisonnable
- [ ] Pas de console/terminal visible (windowed mode)

---

## Projet

```yaml
Nom: [APP_NAME]
Type: Desktop App
Framework: [CustomTkinter / Electron / Tauri]
Plateformes: [Windows / Linux / Mac]
Distribution: [Direct / Store]
```

---

**Basé sur** : Template Optimisé v2.0
