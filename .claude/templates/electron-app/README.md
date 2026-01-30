# Electron App - Cross-Platform Desktop Application Template

> Template production-ready pour applications desktop cross-platform (Windows, macOS, Linux) avec Electron + React.

**Stack** :
- ⚡ **Framework** : Electron 28+
- ⚛️ **Frontend** : React 18 + TypeScript
- 🔨 **Build** : Electron Forge
- 🗄️ **Database** : SQLite (better-sqlite3)
- 🎨 **Styling** : Tailwind CSS

**Version** : 2.0
**Setup time** : ~12 minutes
**Production-ready** : ✅
**Platforms** : Windows, macOS, Linux

---

## 🎯 Features

### Electron

- ✅ Main Process + Renderer Process structure
- ✅ IPC (Inter-Process Communication)
- ✅ Context Bridge (secure)
- ✅ Native menus
- ✅ System tray icon
- ✅ Native dialogs (file picker, message box)
- ✅ Auto-updater
- ✅ Deep linking
- ✅ Window management
- ✅ Native notifications

### Frontend

- ✅ React 18 with TypeScript
- ✅ React Router (in-app navigation)
- ✅ Tailwind CSS
- ✅ Hot reload (dev mode)
- ✅ State management (Zustand)
- ✅ Forms (React Hook Form + Zod)

### Database

- ✅ SQLite local database
- ✅ Migrations
- ✅ Type-safe queries (Kysely)
- ✅ Encrypted storage (optional)

### Build & Distribution

- ✅ Electron Forge
- ✅ Code signing
- ✅ Installers (Windows: NSIS, macOS: DMG, Linux: Deb/RPM)
- ✅ Auto-updater (electron-updater)
- ✅ Portable builds

### Developer Experience

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Hot reload
- ✅ DevTools
- ✅ Tests (Jest + Spectron)

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Git
- **Windows** : Build Tools (Python, Visual Studio Build Tools)
- **macOS** : Xcode Command Line Tools
- **Linux** : build-essential

### 1. Clone Template

```bash
cp -r templates/electron-app ~/my-desktop-app
cd ~/my-desktop-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development

```bash
npm start
```

Application window opens with hot-reload enabled.

### 4. Build for Production

```bash
# Current platform
npm run make

# Windows (from Windows)
npm run make:win

# macOS (from macOS)
npm run make:mac

# Linux
npm run make:linux

# All platforms (requires setup)
npm run make:all
```

Builds are in `out/` directory.

---

## 📁 Project Structure

```
electron-app/
├── .claude/                      # Claude Code configuration
│   ├── CLAUDE.md
│   ├── docs/                     # Documentation
│   └── scripts/                  # Utility scripts
│
├── src/
│   ├── main/                     # Main Process (Node.js)
│   │   ├── index.ts              # Entry point
│   │   ├── window.ts             # Window management
│   │   ├── menu.ts               # Native menu
│   │   ├── tray.ts               # System tray
│   │   ├── ipc/                  # IPC handlers
│   │   │   ├── database.ts
│   │   │   ├── filesystem.ts
│   │   │   └── system.ts
│   │   ├── db/                   # Database
│   │   │   ├── client.ts
│   │   │   ├── migrations/
│   │   │   └── queries.ts
│   │   └── updater.ts            # Auto-updater
│   │
│   ├── renderer/                 # Renderer Process (Browser/React)
│   │   ├── App.tsx               # App component
│   │   ├── main.tsx              # Entry point
│   │   ├── pages/                # Pages
│   │   │   ├── HomePage.tsx
│   │   │   ├── SettingsPage.tsx
│   │   │   └── AboutPage.tsx
│   │   ├── components/           # Components
│   │   │   ├── ui/
│   │   │   ├── layout/
│   │   │   └── features/
│   │   ├── hooks/                # Custom hooks
│   │   │   └── useIpc.ts
│   │   ├── store/                # Zustand store
│   │   │   └── appStore.ts
│   │   ├── styles/               # Styles
│   │   │   └── globals.css
│   │   └── types/                # TypeScript types
│   │
│   ├── preload/                  # Preload Script (Context Bridge)
│   │   └── index.ts              # Exposed APIs
│   │
│   └── shared/                   # Shared code
│       ├── types.ts              # Shared types
│       └── constants.ts          # Constants
│
├── assets/                       # Static assets
│   ├── icons/                    # App icons
│   │   ├── icon.icns             # macOS
│   │   ├── icon.ico              # Windows
│   │   └── icon.png              # Linux
│   └── images/
│
├── tests/                        # Tests
│   ├── main/                     # Main process tests
│   ├── renderer/                 # Renderer tests
│   └── e2e/                      # E2E tests (Spectron)
│
├── forge.config.js               # Electron Forge config
├── webpack.main.config.js        # Webpack config (main)
├── webpack.renderer.config.js    # Webpack config (renderer)
├── webpack.preload.config.js     # Webpack config (preload)
├── tsconfig.json
├── package.json
└── README.md
```

---

## 🔧 Main Process

### Window Management

```typescript
// src/main/window.ts
import { BrowserWindow } from 'electron'

export function createMainWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false, // Security
    },
    titleBarStyle: 'hidden', // Custom title bar
    trafficLightPosition: { x: 20, y: 20 }, // macOS
  })

  // Load app
  if (MAIN_WINDOW_WEBPACK_ENTRY) {
    win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  }

  // Dev tools (dev mode only)
  if (!app.isPackaged) {
    win.webContents.openDevTools()
  }

  return win
}
```

### IPC Handlers

```typescript
// src/main/ipc/database.ts
import { ipcMain } from 'electron'
import { db } from '../db/client'

export function registerDatabaseHandlers() {
  ipcMain.handle('db:getAll', async (event, table) => {
    return db.selectFrom(table).selectAll().execute()
  })

  ipcMain.handle('db:insert', async (event, table, data) => {
    return db.insertInto(table).values(data).execute()
  })

  ipcMain.handle('db:update', async (event, table, id, data) => {
    return db.updateTable(table).set(data).where('id', '=', id).execute()
  })

  ipcMain.handle('db:delete', async (event, table, id) => {
    return db.deleteFrom(table).where('id', '=', id).execute()
  })
}
```

---

## 🌐 Renderer Process

### Using IPC from React

```typescript
// src/renderer/hooks/useIpc.ts
export function useIpc() {
  const getAll = async (table: string) => {
    return window.electron.db.getAll(table)
  }

  const insert = async (table: string, data: any) => {
    return window.electron.db.insert(table, data)
  }

  return { getAll, insert, update, delete }
}

// src/renderer/pages/HomePage.tsx
import { useIpc } from '../hooks/useIpc'

export function HomePage() {
  const { getAll } = useIpc()
  const [items, setItems] = useState([])

  useEffect(() => {
    getAll('items').then(setItems)
  }, [])

  return (
    <div>
      {items.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

---

## 🔐 Preload Script (Context Bridge)

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron'

// Expose safe APIs to renderer
contextBridge.exposeInMainWorld('electron', {
  // Database
  db: {
    getAll: (table: string) => ipcRenderer.invoke('db:getAll', table),
    insert: (table: string, data: any) =>
      ipcRenderer.invoke('db:insert', table, data),
    update: (table: string, id: number, data: any) =>
      ipcRenderer.invoke('db:update', table, id, data),
    delete: (table: string, id: number) =>
      ipcRenderer.invoke('db:delete', table, id),
  },

  // Filesystem
  fs: {
    selectFile: () => ipcRenderer.invoke('fs:selectFile'),
    readFile: (path: string) => ipcRenderer.invoke('fs:readFile', path),
    writeFile: (path: string, data: string) =>
      ipcRenderer.invoke('fs:writeFile', path, data),
  },

  // System
  system: {
    getInfo: () => ipcRenderer.invoke('system:getInfo'),
    openExternal: (url: string) => ipcRenderer.invoke('system:openExternal', url),
  },

  // App
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize'),
  },
})

// TypeScript declarations
declare global {
  interface Window {
    electron: {
      db: { ... }
      fs: { ... }
      system: { ... }
      app: { ... }
    }
  }
}
```

---

## 📊 Database (SQLite)

```typescript
// src/main/db/client.ts
import Database from 'better-sqlite3'
import { Kysely, SqliteDialect } from 'kysely'
import path from 'path'
import { app } from 'electron'

const dbPath = path.join(app.getPath('userData'), 'database.sqlite')
const sqliteDb = new Database(dbPath)

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({ database: sqliteDb }),
})

// Migrations
export function runMigrations() {
  db.schema
    .createTable('users')
    .ifNotExists()
    .addColumn('id', 'integer', (col) => col.primaryKey().autoIncrement())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.unique().notNull())
    .execute()
}
```

---

## 🍔 Native Menus

```typescript
// src/main/menu.ts
import { Menu, app, shell } from 'electron'

export function createMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        { label: 'New', accelerator: 'CmdOrCtrl+N', click: () => {} },
        { label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => {} },
        { label: 'Save', accelerator: 'CmdOrCtrl+S', click: () => {} },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
      ],
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
      ],
    },
    {
      label: 'Help',
      submenu: [
        {
          label: 'Documentation',
          click: () => shell.openExternal('https://docs.example.com'),
        },
      ],
    },
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}
```

---

## 🔔 System Tray

```typescript
// src/main/tray.ts
import { Tray, Menu, nativeImage } from 'electron'
import path from 'path'

export function createTray() {
  const icon = nativeImage.createFromPath(
    path.join(__dirname, '../assets/icons/tray.png')
  )
  const tray = new Tray(icon)

  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click: () => mainWindow.show() },
    { type: 'separator' },
    { label: 'Settings', click: () => {} },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ])

  tray.setToolTip('My App')
  tray.setContextMenu(contextMenu)

  // Click to show
  tray.on('click', () => {
    mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show()
  })

  return tray
}
```

---

## 🔄 Auto-Updater

```typescript
// src/main/updater.ts
import { autoUpdater } from 'electron-updater'
import { dialog } from 'electron'

export function checkForUpdates() {
  autoUpdater.checkForUpdatesAndNotify()

  autoUpdater.on('update-available', (info) => {
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Available',
      message: `Version ${info.version} is available. Downloading...`,
    })
  })

  autoUpdater.on('update-downloaded', (info) => {
    dialog
      .showMessageBox({
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded. Restart to install?',
        buttons: ['Restart', 'Later'],
      })
      .then((result) => {
        if (result.response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
  })
}
```

---

## 🔨 Building & Distribution

### Configuration

```javascript
// forge.config.js
module.exports = {
  packagerConfig: {
    name: 'My App',
    executableName: 'my-app',
    icon: './assets/icons/icon',
    appBundleId: 'com.example.myapp',
    appCopyright: 'Copyright © 2026',
    asar: true,
    extraResource: ['assets'],
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel', // Windows
      config: {
        name: 'MyApp',
        setupIcon: './assets/icons/icon.ico',
      },
    },
    {
      name: '@electron-forge/maker-dmg', // macOS
      config: {
        icon: './assets/icons/icon.icns',
        format: 'ULFO',
      },
    },
    {
      name: '@electron-forge/maker-deb', // Linux (Debian)
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm', // Linux (Red Hat)
      config: {},
    },
  ],
}
```

### Code Signing

**macOS** :
```bash
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="your-team-id"
npm run make:mac
```

**Windows** :
```bash
# Sign with certificate
signtool sign /f certificate.pfx /p password out/MyApp-Setup.exe
```

---

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests (Spectron)
npm run test:e2e
```

---

## 📦 Distribution

### Manual

1. Build: `npm run make`
2. Find installers in `out/make/`
3. Distribute

### Auto-Update

1. Configure update server
2. Publish releases with auto-updater metadata
3. App checks + downloads automatically

---

## 🛠️ Customization

### Add New IPC Handler

1. Create handler in `src/main/ipc/`
2. Register in `src/main/index.ts`
3. Expose in `src/preload/index.ts`
4. Use in React components

### Add New Page

1. Create component in `src/renderer/pages/`
2. Add route in `src/renderer/App.tsx`

---

## 📖 Learn More

- [Electron Documentation](https://www.electronjs.org/docs/latest)
- [Electron Forge](https://www.electronforge.io/)
- [Security Best Practices](https://www.electronjs.org/docs/latest/tutorial/security)
- [IPC Tutorial](https://www.electronjs.org/docs/latest/tutorial/ipc)

---

**Created by** : Jay The Ermite
**Template Version** : 2.0
**Last Updated** : 2026-01-26
