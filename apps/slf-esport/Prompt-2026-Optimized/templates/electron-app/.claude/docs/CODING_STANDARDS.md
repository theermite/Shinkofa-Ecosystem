# Coding Standards - [Nom Electron App]

> Standards TypeScript Electron + React.

---

## 🎯 TypeScript

### Style Guide
**Base** : Airbnb TypeScript

**Formatter** : Prettier
**Linter** : ESLint

### Conventions Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | camelCase | `userId`, `isActive` |
| Fonctions | camelCase | `getUsers()` |
| Components | PascalCase | `UserProfile` |
| IPC Channels | `<domain>:<action>` | `database:getUsers` |
| Files Main Process | camelCase.ts | `window.ts`, `database.ts` |
| Files Renderer | PascalCase.tsx | `UserProfile.tsx` |

---

## 🎨 Structure Composant React

### Functional Component

```typescript
// src/renderer/components/UserProfile.tsx
import { FC } from 'react';

interface UserProfileProps {
  userId: number;
}

export const UserProfile: FC<UserProfileProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    window.api.invoke('database:getUserById', userId).then(setUser);
  }, [userId]);

  if (!user) return <div>Loading...</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
};
```

---

## 🔗 IPC Communication

### Main Process (Handler)

```typescript
// src/main/ipc/handlers.ts
import { ipcMain } from 'electron';
import { getUsers, createUser } from '../db/operations';

export function initializeIPC() {
  // Handle with return value
  ipcMain.handle('database:getUsers', async () => {
    try {
      return { success: true, data: getUsers() };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Handle with validation
  ipcMain.handle('database:createUser', async (event, data: { name: string; email: string }) => {
    if (!data.name || !data.email) {
      return { success: false, error: 'Missing required fields' };
    }

    try {
      const user = createUser(data);
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  });

  // Listen without return
  ipcMain.on('log:info', (event, message: string) => {
    console.log(`[Renderer] ${message}`);
  });
}
```

---

### Preload Script

```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
  send: (channel: string, ...args: any[]) => ipcRenderer.send(channel, ...args),
  on: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
  },
});
```

---

### Renderer (Usage)

```typescript
// src/renderer/pages/Users.tsx
import { useEffect, useState } from 'react';

export function UsersPage() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    window.api.invoke('database:getUsers').then(result => {
      if (result.success) {
        setUsers(result.data);
      }
    });
  }, []);

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  );
}
```

---

## 💾 Database Operations

### CRUD Pattern

```typescript
// src/main/db/operations.ts
import { db } from './sqlite';

interface User {
  id: number;
  name: string;
  email: string;
}

export function getUsers(): User[] {
  return db.prepare('SELECT * FROM users').all() as User[];
}

export function getUserById(id: number): User | undefined {
  return db.prepare('SELECT * FROM users WHERE id = ?').get(id) as User | undefined;
}

export function createUser(data: { name: string; email: string }): User {
  const result = db.prepare('INSERT INTO users (name, email) VALUES (?, ?)').run(data.name, data.email);
  return getUserById(result.lastInsertRowid as number)!;
}

export function updateUser(id: number, data: Partial<User>): void {
  const fields = Object.keys(data).map(k => `${k} = ?`).join(', ');
  db.prepare(`UPDATE users SET ${fields} WHERE id = ?`).run(...Object.values(data), id);
}

export function deleteUser(id: number): void {
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
}
```

---

## 🚨 Error Handling

### Main Process

```typescript
try {
  const users = getUsers();
  return { success: true, data: users };
} catch (error) {
  console.error('Error fetching users:', error);
  return { success: false, error: error.message };
}
```

### Renderer Process

```typescript
try {
  const result = await window.api.invoke('database:getUsers');
  if (!result.success) {
    throw new Error(result.error);
  }
  setUsers(result.data);
} catch (error) {
  console.error(error);
  toast.error('Failed to load users');
}
```

---

## 🔐 Sécurité

### Best Practices

```typescript
// ✅ Correct
webPreferences: {
  preload: path.join(__dirname, 'preload.js'),
  contextIsolation: true,      // OBLIGATOIRE
  nodeIntegration: false,      // OBLIGATOIRE
  sandbox: true,               // Recommandé
}

// ❌ DANGEREUX
webPreferences: {
  nodeIntegration: true,       // JAMAIS
  contextIsolation: false,     // JAMAIS
}
```

---

### Input Validation (IPC)

```typescript
// TOUJOURS valider inputs venant du Renderer
ipcMain.handle('database:createUser', async (event, data) => {
  // Validation
  if (typeof data.email !== 'string' || !data.email.includes('@')) {
    return { success: false, error: 'Invalid email' };
  }

  // Safe to use
  return createUser(data);
});
```

---

## 🧪 Tests

### Fichiers Tests

```
tests/
├── main/
│   └── database.test.ts
└── renderer/
    └── UserProfile.test.tsx
```

---

## ✅ Pre-Commit Checklist

- [ ] `npm run lint` (ESLint)
- [ ] `npm run type-check` (TypeScript)
- [ ] `npm run test` (Tests)
- [ ] `contextIsolation: true` + `nodeIntegration: false`
- [ ] IPC inputs validés

---

**Version** : 1.0 | **Maintenu par** : Dev Team
