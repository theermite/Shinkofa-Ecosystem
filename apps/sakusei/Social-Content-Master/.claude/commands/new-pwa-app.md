---
description: Scaffold une Progressive Web App (PWA) production-ready avec React
---

# Slash Command: /new-pwa-app

## 🎯 Objectif

Scaffold une Progressive Web App (PWA) complète et production-ready avec:
- React 18+ + TypeScript
- Service Workers (offline support)
- Manifest.json (installable)
- Responsive design (mobile-first)
- Lighthouse score ≥ 90
- Adaptation neurodivergence (accessibilité WCAG 2.1 AA)

## 📋 Arguments

**Syntaxe** : `/new-pwa-app <app-name> [--template <basic|dashboard|todo>]`

**Arguments** :
- `<app-name>` : Nom de l'application PWA (requis)
- `--template` : Template base (optionnel, défaut: basic)
  - `basic` : PWA minimaliste
  - `dashboard` : Dashboard avec widgets
  - `todo` : Todo list avec offline sync

**Exemples** :
```bash
/new-pwa-app personal-dashboard --template dashboard
/new-pwa-app todo-app --template todo
/new-pwa-app family-hub --template basic
```

## 🚀 Ce que fait le Command

### Étape 1 : Setup Projet React PWA

**Créer projet avec Vite** :
```bash
npm create vite@latest app-name -- --template react-ts
cd app-name
npm install
```

**Installer dépendances PWA** :
```bash
npm install workbox-window workbox-precaching workbox-routing workbox-strategies
npm install -D vite-plugin-pwa
```

**Configurer `vite.config.ts`** :
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
      manifest: {
        name: 'My PWA App',
        short_name: 'PWA App',
        description: 'Progressive Web App built with React',
        theme_color: '#D4AF37',
        background_color: '#FFFDD0',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait-primary',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.example\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
      devOptions: {
        enabled: true, // Enable PWA in development
      },
    }),
  ],
});
```

### Étape 2 : Créer Manifest.json

**Fichier `public/manifest.json`** :
```json
{
  "name": "My Progressive Web App",
  "short_name": "My PWA",
  "description": "A production-ready PWA with offline support",
  "theme_color": "#D4AF37",
  "background_color": "#FFFDD0",
  "display": "standalone",
  "scope": "/",
  "start_url": "/",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "pwa-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "pwa-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "categories": ["productivity", "utilities"],
  "screenshots": [
    {
      "src": "screenshot-desktop.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    },
    {
      "src": "screenshot-mobile.png",
      "sizes": "750x1334",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "shortcuts": [
    {
      "name": "New Item",
      "short_name": "New",
      "description": "Create new item",
      "url": "/new",
      "icons": [{ "src": "shortcut-new.png", "sizes": "192x192" }]
    }
  ],
  "prefer_related_applications": false
}
```

### Étape 3 : Service Worker Registration

**Fichier `src/registerSW.ts`** :
```typescript
/**
 * Service Worker registration
 */
import { registerSW } from 'virtual:pwa-register';

const updateSW = registerSW({
  onNeedRefresh() {
    // Show prompt to user for update
    if (confirm('New version available! Reload to update?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('✅ App ready to work offline');
    // Show toast notification
    showNotification('App ready to work offline!', 'success');
  },
  onRegistered(r) {
    console.log('✅ Service Worker registered');
    // Optional: check for updates periodically
    r &&
      setInterval(() => {
        r.update();
      }, 60 * 60 * 1000); // Check every hour
  },
  onRegisterError(error) {
    console.error('❌ Service Worker registration error:', error);
  },
});

function showNotification(message: string, type: 'success' | 'error') {
  // Implement toast notification (use react-hot-toast or similar)
  console.log(`[${type}] ${message}`);
}
```

**Intégrer dans `src/main.tsx`** :
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './registerSW'; // Import Service Worker registration

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Étape 4 : Offline Storage (IndexedDB)

**Fichier `src/db.ts`** (Dexie.js wrapper) :
```typescript
/**
 * IndexedDB database configuration (Dexie.js)
 */
import Dexie, { Table } from 'dexie';

// Install: npm install dexie

export interface TodoItem {
  id?: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
  synced: boolean; // Sync status with backend
}

export class AppDatabase extends Dexie {
  todos!: Table<TodoItem>;

  constructor() {
    super('MyPWADatabase');

    this.version(1).stores({
      todos: '++id, title, completed, createdAt, synced',
    });
  }
}

export const db = new AppDatabase();

// Database helper functions

export async function addTodo(todo: Omit<TodoItem, 'id'>): Promise<number> {
  return await db.todos.add(todo);
}

export async function getTodos(): Promise<TodoItem[]> {
  return await db.todos.orderBy('createdAt').reverse().toArray();
}

export async function updateTodo(id: number, changes: Partial<TodoItem>): Promise<number> {
  return await db.todos.update(id, changes);
}

export async function deleteTodo(id: number): Promise<void> {
  await db.todos.delete(id);
}

export async function getUnsyncedTodos(): Promise<TodoItem[]> {
  return await db.todos.where('synced').equals(false).toArray();
}
```

### Étape 5 : Offline Sync Strategy

**Fichier `src/sync.ts`** :
```typescript
/**
 * Background sync for offline-first PWA
 */
import { db, getUnsyncedTodos, updateTodo } from './db';

export async function syncDataWithBackend(): Promise<void> {
  if (!navigator.onLine) {
    console.log('⚠️ Offline - sync skipped');
    return;
  }

  try {
    const unsyncedTodos = await getUnsyncedTodos();

    if (unsyncedTodos.length === 0) {
      console.log('✅ All data synced');
      return;
    }

    console.log(`🔄 Syncing ${unsyncedTodos.length} items...`);

    for (const todo of unsyncedTodos) {
      try {
        // POST to backend API
        const response = await fetch('https://api.example.com/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todo),
        });

        if (response.ok) {
          // Mark as synced
          await updateTodo(todo.id!, { synced: true });
          console.log(`✅ Synced todo ${todo.id}`);
        } else {
          console.error(`❌ Failed to sync todo ${todo.id}`);
        }
      } catch (error) {
        console.error(`❌ Sync error for todo ${todo.id}:`, error);
      }
    }

    console.log('✅ Sync completed');
  } catch (error) {
    console.error('❌ Sync failed:', error);
  }
}

// Listen to online event
window.addEventListener('online', () => {
  console.log('🌐 Connection restored - syncing...');
  syncDataWithBackend();
});

// Periodic sync (every 5 minutes)
setInterval(() => {
  if (navigator.onLine) {
    syncDataWithBackend();
  }
}, 5 * 60 * 1000);
```

### Étape 6 : App Shell Architecture

**Fichier `src/App.tsx`** :
```typescript
import React, { useState, useEffect } from 'react';
import { db, TodoItem, addTodo, getTodos, updateTodo, deleteTodo } from './db';
import { syncDataWithBackend } from './sync';
import './App.css';

function App() {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isLoading, setIsLoading] = useState(true);

  // Load todos from IndexedDB
  useEffect(() => {
    loadTodos();
  }, []);

  // Listen to online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncDataWithBackend();
    };

    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  async function loadTodos() {
    setIsLoading(true);
    const items = await getTodos();
    setTodos(items);
    setIsLoading(false);
  }

  async function handleAddTodo() {
    const title = prompt('Todo title:');
    if (!title) return;

    const newTodo: Omit<TodoItem, 'id'> = {
      title,
      description: '',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      synced: false,
    };

    await addTodo(newTodo);
    loadTodos();
  }

  async function handleToggleTodo(todo: TodoItem) {
    await updateTodo(todo.id!, {
      completed: !todo.completed,
      updatedAt: new Date(),
      synced: false,
    });
    loadTodos();
  }

  async function handleDeleteTodo(id: number) {
    await deleteTodo(id);
    loadTodos();
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>My PWA App</h1>
        <div className={`status ${isOnline ? 'online' : 'offline'}`}>
          {isOnline ? '🌐 Online' : '📵 Offline'}
        </div>
      </header>

      <main className="app-main">
        <button onClick={handleAddTodo} className="btn-primary">
          + Add Todo
        </button>

        {isLoading ? (
          <div className="loading">Loading...</div>
        ) : (
          <ul className="todo-list">
            {todos.map(todo => (
              <li key={todo.id} className="todo-item">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo)}
                />
                <span className={todo.completed ? 'completed' : ''}>{todo.title}</span>
                <button onClick={() => handleDeleteTodo(todo.id!)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

export default App;
```

### Étape 7 : Styles Responsive (Mobile-First)

**Fichier `src/App.css`** :
```css
/* Mobile-first responsive design */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --color-primary: #D4AF37;
  --color-secondary: #50C878;
  --color-background: #FFFDD0;
  --color-surface: #FFFFFF;
  --color-text: #2C3E50;
  --spacing: 16px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--color-background);
  color: var(--color-text);
  line-height: 1.6;
}

.app {
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  background-color: var(--color-primary);
  padding: var(--spacing);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.status.online {
  background-color: var(--color-secondary);
}

.status.offline {
  background-color: #E74C3C;
}

.app-main {
  flex: 1;
  padding: var(--spacing);
}

/* Responsive breakpoints */
@media (min-width: 768px) {
  .app {
    max-width: 768px;
    margin: 0 auto;
  }
}

@media (min-width: 1024px) {
  .app {
    max-width: 1024px;
  }
}
```

### Étape 8 : Icons & Assets

**Générer icons PWA** (https://realfavicongenerator.net/) :
- `public/pwa-192x192.png`
- `public/pwa-512x512.png`
- `public/apple-touch-icon.png`
- `public/favicon.ico`

### Étape 9 : Testing PWA

**Lighthouse audit** :
```bash
npm run build
npx serve dist
# Open Chrome DevTools > Lighthouse > Run audit
```

**Checklist Lighthouse** :
- [ ] Performance ≥ 90
- [ ] Accessibility ≥ 90
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90
- [ ] PWA ✅ (installable)

### Étape 10 : Deployment

**Build production** :
```bash
npm run build
```

**Deploy options** :
- **Netlify** : `netlify deploy --prod`
- **Vercel** : `vercel --prod`
- **GitHub Pages** : `npm run build && gh-pages -d dist`

## ✅ Checklist PWA

- [ ] Manifest.json configuré
- [ ] Service Worker enregistré
- [ ] Icons 192x192 et 512x512 générées
- [ ] Offline support (cache strategies)
- [ ] IndexedDB setup (Dexie.js)
- [ ] Background sync implemented
- [ ] Responsive design (mobile-first)
- [ ] Lighthouse audit ≥ 90 tous scores
- [ ] HTTPS deployment
- [ ] Install prompt tested

## 📚 Références

**PWA** : https://web.dev/progressive-web-apps/
**Workbox** : https://developers.google.com/web/tools/workbox
**Dexie.js** : https://dexie.org/
**Vite PWA** : https://vite-pwa-org.netlify.app/

---

**Version 1.0 | 2025-11-13 | Command /new-pwa-app**
