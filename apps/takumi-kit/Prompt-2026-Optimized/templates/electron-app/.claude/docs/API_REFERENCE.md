# API Reference - [Nom Electron App]

> Documentation IPC API (Main ↔ Renderer communication).

**Version** : [VERSION]

---

## 🔗 IPC Channels

### Nomenclature

**Convention** : `<domain>:<action>`

**Exemples** :
- `database:getUsers`
- `file:save`
- `window:minimize`

---

## 💾 Database API

### `database:getUsers`
Récupérer liste utilisateurs.

**Type** : `invoke` (async, return value)

**Request** :
```typescript
const users = await window.api.invoke('database:getUsers');
```

**Response** :
```typescript
type User = {
  id: number;
  name: string;
  email: string;
  created_at: number;
};

Promise<User[]>
```

---

### `database:createUser`
Créer nouvel utilisateur.

**Type** : `invoke`

**Request** :
```typescript
const result = await window.api.invoke('database:createUser', {
  name: 'John Doe',
  email: 'john@example.com',
});
```

**Parameters** :
```typescript
{
  name: string;
  email: string;
}
```

**Response** :
```typescript
{
  success: boolean;
  userId?: number;
  error?: string;
}
```

---

### `database:updateUser`
Mettre à jour utilisateur.

**Request** :
```typescript
await window.api.invoke('database:updateUser', userId, { name: 'New Name' });
```

---

### `database:deleteUser`
Supprimer utilisateur.

**Request** :
```typescript
await window.api.invoke('database:deleteUser', userId);
```

---

## 📁 File System API

### `file:openDialog`
Ouvrir dialog sélection fichier.

**Request** :
```typescript
const filePath = await window.api.invoke('file:openDialog', {
  filters: [{ name: 'Images', extensions: ['png', 'jpg'] }],
});
```

**Response** :
```typescript
string | null  // Path ou null si annulé
```

---

### `file:saveDialog`
Ouvrir dialog sauvegarde fichier.

**Request** :
```typescript
const filePath = await window.api.invoke('file:saveDialog', {
  defaultPath: 'document.txt',
});
```

---

### `file:read`
Lire contenu fichier.

**Request** :
```typescript
const content = await window.api.invoke('file:read', '/path/to/file.txt');
```

**Response** :
```typescript
string  // File content
```

---

### `file:write`
Écrire contenu fichier.

**Request** :
```typescript
await window.api.invoke('file:write', '/path/to/file.txt', 'Content here');
```

---

## 🪟 Window API

### `window:minimize`
Minimiser fenêtre.

**Type** : `send` (fire-and-forget)

**Request** :
```typescript
window.api.send('window:minimize');
```

---

### `window:maximize`
Maximiser/restaurer fenêtre.

```typescript
window.api.send('window:maximize');
```

---

### `window:close`
Fermer fenêtre.

```typescript
window.api.send('window:close');
```

---

## 🔔 Notifications API

### `notification:show`
Afficher notification système.

**Request** :
```typescript
window.api.send('notification:show', {
  title: 'Title',
  body: 'Message body',
});
```

---

## 🔄 Events (Main → Renderer)

### `update:available`
Nouvelle version disponible.

**Listener** :
```typescript
window.api.on('update:available', (version: string) => {
  console.log(`New version ${version} available`);
});
```

---

### `update:downloaded`
Mise à jour téléchargée.

**Listener** :
```typescript
window.api.on('update:downloaded', () => {
  // Prompt user to restart
});
```

---

## 🛠️ Hooks (React)

### `useIPC`
Hook pour communication IPC simplifiée.

```typescript
// src/renderer/hooks/useIPC.ts
import { useCallback, useEffect } from 'react';

export function useIPC() {
  const invoke = useCallback(
    (channel: string, ...args: any[]) => window.api.invoke(channel, ...args),
    []
  );

  const send = useCallback(
    (channel: string, ...args: any[]) => window.api.send(channel, ...args),
    []
  );

  const on = useCallback(
    (channel: string, callback: (...args: any[]) => void) => {
      window.api.on(channel, callback);
    },
    []
  );

  return { invoke, send, on };
}

// Usage
const { invoke } = useIPC();
const users = await invoke('database:getUsers');
```

---

### `useDatabase`
Hook pour opérations DB simplifiées.

```typescript
// src/renderer/hooks/useDatabase.ts
import { useState, useEffect } from 'react';
import { useIPC } from './useIPC';

export function useDatabase<T>(channel: string, ...args: any[]) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { invoke } = useIPC();

  useEffect(() => {
    invoke(channel, ...args)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
  }, [channel, ...args]);

  return { data, loading, error };
}

// Usage
const { data: users, loading } = useDatabase<User[]>('database:getUsers');
```

---

**Version** : 1.0 | **Maintenu par** : Dev Team
