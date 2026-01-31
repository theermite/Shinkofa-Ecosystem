# Testing Guide - [Nom Electron App]

> Stratégie tests Electron (Main Process + Renderer + E2E).

---

## 🎯 Stratégie Tests

### Pyramide Tests Electron

```
      /\
     /E2E\       (10%) - Spectron/Playwright (app entière)
    /------\
   /Integ. \     (30%) - IPC communication, database
  /----------\
 /   Unit     \  (60%) - Components React, utils
/--------------\
```

**Objectif Coverage** : 70% minimum

---

## ⚛️ Tests Renderer (Vitest + React Testing Library)

### Setup

**Installation** :
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Config** (`vitest.config.ts`) :
```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
});
```

**Setup** (`tests/setup.ts`) :
```typescript
import '@testing-library/jest-dom';

// Mock window.api (IPC)
global.window.api = {
  invoke: vi.fn(),
  send: vi.fn(),
  on: vi.fn(),
};
```

---

### Tests Composants

```typescript
// tests/renderer/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { UserProfile } from '@/renderer/components/UserProfile';

describe('UserProfile', () => {
  it('should display user name', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    vi.mocked(window.api.invoke).mockResolvedValue({ success: true, data: mockUser });

    render(<UserProfile userId={1} />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });
});
```

---

## 🔧 Tests Main Process (Vitest)

### Tests Database

```typescript
// tests/main/database.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createUser, getUsers } from '@/main/db/operations';
import { db } from '@/main/db/sqlite';

describe('Database operations', () => {
  beforeEach(() => {
    db.exec('DELETE FROM users'); // Clean database
  });

  it('should create user', () => {
    const user = createUser({ name: 'John', email: 'john@example.com' });

    expect(user).toHaveProperty('id');
    expect(user.name).toBe('John');
  });

  it('should get users', () => {
    createUser({ name: 'John', email: 'john@example.com' });
    createUser({ name: 'Jane', email: 'jane@example.com' });

    const users = getUsers();

    expect(users).toHaveLength(2);
  });
});
```

---

## 🔗 Tests IPC

### Mock IPC Main Process

```typescript
// tests/main/ipc.test.ts
import { ipcMain } from 'electron';
import { vi } from 'vitest';
import { initializeIPC } from '@/main/ipc/handlers';

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
  },
}));

describe('IPC handlers', () => {
  it('should register database:getUsers handler', () => {
    initializeIPC();

    expect(ipcMain.handle).toHaveBeenCalledWith('database:getUsers', expect.any(Function));
  });
});
```

---

## 🎭 E2E Tests (Playwright for Electron)

### Setup

**Installation** :
```bash
npm install -D @playwright/test
```

**Config** (`playwright.config.ts`) :
```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  use: {
    headless: false,
  },
});
```

---

### Tests E2E

```typescript
// tests/e2e/app.test.ts
import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test('should launch app', async () => {
  const app = await electron.launch({
    args: [path.join(__dirname, '../../dist-electron/main.js')],
  });

  const window = await app.firstWindow();

  await expect(window.locator('h1')).toContainText('My Electron App');

  await app.close();
});

test('should display users list', async () => {
  const app = await electron.launch({
    args: [path.join(__dirname, '../../dist-electron/main.js')],
  });

  const window = await app.firstWindow();

  await window.click('button:has-text("Load Users")');

  await expect(window.locator('.user-list li')).toHaveCount(2);

  await app.close();
});
```

---

## 🧪 Best Practices

### Mock window.api (Renderer tests)

```typescript
beforeEach(() => {
  vi.mocked(window.api.invoke).mockReset();
});

it('should call IPC', async () => {
  vi.mocked(window.api.invoke).mockResolvedValue({ success: true, data: [] });

  const { result } = renderHook(() => useUsers());

  await waitFor(() => {
    expect(window.api.invoke).toHaveBeenCalledWith('database:getUsers');
  });
});
```

---

### Clean Database (Main tests)

```typescript
beforeEach(() => {
  db.exec('DELETE FROM users');
  db.exec('DELETE FROM settings');
});
```

---

## 🚀 CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - run: npm ci
      - run: npm run test:coverage

      # E2E tests (Linux headless)
      - run: xvfb-run npm run test:e2e
        if: runner.os == 'Linux'
```

---

**Version** : 1.0 | **Maintenu par** : QA Team
