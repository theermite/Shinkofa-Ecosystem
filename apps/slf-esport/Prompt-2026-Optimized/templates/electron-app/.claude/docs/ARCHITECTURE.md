# Architecture - [Nom Electron App]

> Vue d'ensemble architecture application Electron desktop.

**Dernière mise à jour** : [DATE]
**Version** : [VERSION]

---

## 🏗️ Vue d'Ensemble

### Type de Projet
**Electron Desktop Application** (Windows + Linux + macOS)

### Stack Technique

| Composant | Technologie | Version | Raison |
|-----------|-------------|---------|--------|
| **Framework** | Electron | 28+ | Cross-platform, Chromium + Node.js, maturité |
| **Frontend** | React 18 + TypeScript | 18.x / 5.x | UI moderne, type-safety, large écosystème |
| **Build Tool** | Vite | 5.x | Fast HMR, dev experience |
| **Bundler Electron** | electron-builder | 24.x | Package Windows/Linux/macOS, auto-update |
| **IPC** | electron-ipc-cat | - | Type-safe IPC main ↔ renderer |
| **Local DB** | SQLite (better-sqlite3) | 9.x | Embedded, zero-config, performant |
| **State** | Zustand | 4.x | Lightweight, simple, React integration |

---

## 📐 Architecture Electron

### Processus Electron

```
┌─────────────────────────────────────────────┐
│  Main Process (Node.js)                     │
│  - Gestion fenêtres (BrowserWindow)         │
│  - Menu natif (Menu)                        │
│  - Tray icon                                │
│  - Fichiers système (fs, path)              │
│  - Database SQLite                           │
│  - Auto-updater                              │
└────────────┬────────────────────────────────┘
             │ IPC (Inter-Process Communication)
             │
┌────────────▼────────────────────────────────┐
│  Renderer Process (Chromium)                │
│  - React UI                                  │
│  - CSS/TailwindCSS                           │
│  - Client state (Zustand)                   │
│  - IPC communication avec Main              │
└─────────────────────────────────────────────┘
```

---

## 🎯 Main Process

### Responsabilités
- Créer/gérer fenêtres (BrowserWindow)
- Menu application natif
- Tray icon (system tray)
- Gestion fichiers (fs, path)
- Database (SQLite)
- Auto-update (electron-updater)
- IPC handlers (receive messages from Renderer)

### Structure

```
src/
├── main/
│   ├── index.ts           # Entry point Main Process
│   ├── window.ts          # BrowserWindow creation
│   ├── menu.ts            # Application menu
│   ├── tray.ts            # Tray icon
│   ├── ipc/
│   │   ├── handlers.ts    # IPC handlers
│   │   └── database.ts    # DB operations
│   ├── db/
│   │   └── sqlite.ts      # SQLite connection
│   └── updater.ts         # Auto-update
```

---

### Code Exemple (Main Process)

```typescript
// src/main/index.ts
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { initializeIPC } from './ipc/handlers';
import { initializeDatabase } from './db/sqlite';
import { createApplicationMenu } from './menu';

let mainWindow: BrowserWindow | null = null;

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false, // IMPORTANT: Security
    },
  });

  // Load app
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173'); // Vite dev server
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(async () => {
  await initializeDatabase();
  initializeIPC();
  createApplicationMenu();
  await createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
```

---

## 🎨 Renderer Process

### Responsabilités
- UI React (composants, pages)
- État client (Zustand)
- Communication IPC avec Main Process (via preload script)
- Pas d'accès direct Node.js (sécurité)

### Structure

```
src/
├── renderer/
│   ├── index.tsx          # Entry point React
│   ├── App.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Settings.tsx
│   │   └── About.tsx
│   ├── components/
│   │   ├── ui/            # Atomic components
│   │   └── features/      # Feature components
│   ├── stores/
│   │   └── appStore.ts    # Zustand stores
│   ├── hooks/
│   │   └── useIPC.ts      # IPC communication hook
│   └── styles/
│       └── global.css
```

---

### Code Exemple (Renderer Process)

```typescript
// src/renderer/App.tsx
import { useEffect, useState } from 'react';
import { useIPC } from './hooks/useIPC';

export function App() {
  const [users, setUsers] = useState([]);
  const { invoke } = useIPC();

  useEffect(() => {
    // Fetch users from Main Process (via IPC)
    invoke('database:getUsers').then(setUsers);
  }, []);

  return (
    <div className="app">
      <h1>My Electron App</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🔗 IPC (Inter-Process Communication)

### Security Model

**⚠️ IMPORTANT** : Renderer Process JAMAIS accès direct Node.js (sécurité).

**Communication** : Renderer ↔ Preload Script ↔ Main Process

---

### Preload Script

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

// Expose safe API to Renderer
contextBridge.exposeInMainWorld('api', {
  // Invoke (Renderer → Main, avec retour)
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),

  // Send (Renderer → Main, sans retour)
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),

  // On (Main → Renderer, listener)
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});

// Type declaration
declare global {
  interface Window {
    api: {
      invoke: (channel: string, ...args: any[]) => Promise<any>;
      send: (channel: string, ...args: any[]) => void;
      on: (channel: string, callback: (...args: any[]) => void) => void;
    };
  }
}
```

---

### IPC Handlers (Main Process)

```typescript
// src/main/ipc/handlers.ts
import { ipcMain } from 'electron';
import { getUsers, createUser } from './database';

export function initializeIPC() {
  // Handle: Get users
  ipcMain.handle('database:getUsers', async () => {
    return getUsers();
  });

  // Handle: Create user
  ipcMain.handle('database:createUser', async (event, name: string, email: string) => {
    return createUser({ name, email });
  });

  // Listen: Log message (no return)
  ipcMain.on('log:info', (event, message: string) => {
    console.log(`[Renderer] ${message}`);
  });
}
```

---

### Usage Renderer (Hook)

```typescript
// src/renderer/hooks/useIPC.ts
export function useIPC() {
  return {
    invoke: window.api.invoke,
    send: window.api.send,
    on: window.api.on,
  };
}

// Usage dans composant
const { invoke } = useIPC();
const users = await invoke('database:getUsers');
```

---

## 💾 Local Database (SQLite)

### Setup

```typescript
// src/main/db/sqlite.ts
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'database.db');
const db = new Database(dbPath);

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      created_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
}

export function getUsers() {
  return db.prepare('SELECT * FROM users').all();
}

export function createUser({ name, email }: { name: string; email: string }) {
  return db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(name, email);
}

export { db };
```

**Location DB** :
- **Windows** : `%APPDATA%\YourApp\database.db`
- **macOS** : `~/Library/Application Support/YourApp/database.db`
- **Linux** : `~/.config/YourApp/database.db`

---

## 📦 Build & Distribution

### electron-builder Config

```json
// package.json
{
  "build": {
    "appId": "com.yourcompany.yourapp",
    "productName": "YourApp",
    "directories": {
      "output": "dist"
    },
    "files": [
      "dist-electron/**/*",
      "dist-renderer/**/*"
    ],
    "win": {
      "target": ["nsis"],
      "icon": "build/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "build/icon.icns"
    },
    "linux": {
      "target": ["AppImage", "deb"],
      "icon": "build/icon.png"
    }
  }
}
```

**Build** :
```bash
npm run build        # Build Renderer + Main
npm run dist         # Package (Windows/macOS/Linux)
```

**Output** :
```
dist/
├── YourApp-1.0.0.exe           # Windows installer
├── YourApp-1.0.0.dmg           # macOS disk image
├── YourApp-1.0.0.AppImage      # Linux AppImage
└── YourApp-1.0.0.deb           # Debian package
```

---

## 🔄 Auto-Update

### Setup (electron-updater)

```typescript
// src/main/updater.ts
import { autoUpdater } from 'electron-updater';
import { app } from 'electron';

export function initializeAutoUpdater() {
  if (process.env.NODE_ENV === 'production') {
    autoUpdater.checkForUpdatesAndNotify();

    autoUpdater.on('update-available', () => {
      console.log('Update available');
    });

    autoUpdater.on('update-downloaded', () => {
      autoUpdater.quitAndInstall();
    });
  }
}
```

**Hosting updates** : GitHub Releases, S3, ou custom server

---

## 🔐 Sécurité

### Best Practices

- ✅ `contextIsolation: true` (isoler Renderer de Node.js)
- ✅ `nodeIntegration: false` (pas d'accès direct Node.js)
- ✅ Preload script pour exposer API sécurisée
- ✅ Valider inputs IPC (jamais trust Renderer)
- ✅ CSP headers (Content Security Policy)
- ✅ HTTPS only pour remote content

---

## 📝 Décisions Architecture (ADR)

### ADR-001 : Electron vs Tauri
**Date** : [DATE]
**Décision** : Electron
**Raison** : Maturité, large écosystème, communauté, packages disponibles
**Alternatives** : Tauri (plus léger, Rust, mais moins mature)
**Conséquences** : Taille binaire plus lourde (~150MB vs ~15MB Tauri)

### ADR-002 : SQLite vs NeDB
**Date** : [DATE]
**Décision** : SQLite (better-sqlite3)
**Raison** : Performance, SQL standard, maturité
**Alternatives** : NeDB (JavaScript pure, mais lent), LevelDB (key-value only)
**Conséquences** : Native dependency (rebuild electron)

---

**Maintenu par** : [Équipe] | **Revue recommandée** : À chaque changement architecture majeur
