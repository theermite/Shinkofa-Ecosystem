# Testing Guide - [Nom Projet Next.js]

> Stratégie tests Next.js 14 : Unit + Integration + E2E.

---

## 🎯 Stratégie Tests

### Pyramide Tests

```
      /\
     /E2E\       (10%) - Playwright (flows complets)
    /------\
   /Integ. \     (30%) - Tests Server Actions + API Routes
  /----------\
 /   Unit     \  (60%) - Components + Utils isolés
/--------------\
```

**Objectif Coverage** : 80% minimum

---

## 🛠️ Stack Tests

| Type | Outil | Usage |
|------|-------|-------|
| **Unit** | Vitest + React Testing Library | Composants, utils |
| **Integration** | Vitest + MSW (Mock Service Worker) | API Routes, Server Actions |
| **E2E** | Playwright | Flows utilisateur complets |

---

## ⚛️ Unit Tests (Vitest + React Testing Library)

### Setup

**Installation** :
```bash
npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Config** (`vitest.config.ts`) :
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
});
```

**Setup File** (`vitest.setup.ts`) :
```typescript
import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

**package.json** :
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

---

### Tests Composants (Client Components)

```typescript
// components/LoginForm.test.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { LoginForm } from './LoginForm';

// Mock next-auth
vi.mock('next-auth/react', () => ({
  signIn: vi.fn(),
}));

describe('LoginForm', () => {
  it('should display email and password fields', () => {
    render(<LoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('should call signIn when form submitted', async () => {
    const user = userEvent.setup();
    const { signIn } = await import('next-auth/react');

    render(<LoginForm />);

    await user.type(screen.getByLabelText(/email/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email: 'test@example.com',
      password: 'password123',
    });
  });
});
```

---

### Tests Utils

```typescript
// lib/utils.test.ts
import { describe, it, expect } from 'vitest';
import { formatDate } from './utils';

describe('formatDate', () => {
  it('should format date correctly', () => {
    const date = new Date('2026-01-28T10:00:00Z');
    expect(formatDate(date)).toBe('Jan 28, 2026');
  });

  it('should handle invalid dates', () => {
    expect(formatDate(null)).toBe('Invalid date');
  });
});
```

---

## 🔌 Integration Tests (Server Actions + API Routes)

### Tests Server Actions

```typescript
// app/dashboard/actions.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { updateProfile } from './actions';
import { prisma } from '@/lib/prisma';

// Mock Prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    user: {
      update: vi.fn(),
    },
  },
}));

// Mock auth
vi.mock('@/lib/auth', () => ({
  auth: vi.fn(() => Promise.resolve({ user: { id: 1, email: 'test@example.com' } })),
}));

describe('updateProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should update user profile with valid data', async () => {
    const formData = new FormData();
    formData.set('name', 'New Name');

    await updateProfile(formData);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { name: 'New Name' },
    });
  });

  it('should throw error when not authenticated', async () => {
    // Mock auth to return null
    vi.mocked(await import('@/lib/auth')).auth.mockResolvedValueOnce(null);

    const formData = new FormData();
    formData.set('name', 'New Name');

    await expect(updateProfile(formData)).rejects.toThrow('Unauthorized');
  });

  it('should validate name length', async () => {
    const formData = new FormData();
    formData.set('name', 'A'); // Too short

    await expect(updateProfile(formData)).rejects.toThrow();
  });
});
```

---

### Tests API Routes (MSW)

**Setup MSW** :
```bash
npm install -D msw
```

**Config** (`vitest.setup.ts`) :
```typescript
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { beforeAll, afterAll, afterEach } from 'vitest';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

export { server, http, HttpResponse };
```

**Test** :
```typescript
// app/api/users/route.test.ts
import { describe, it, expect } from 'vitest';
import { GET } from './route';

describe('GET /api/users', () => {
  it('should return users list', async () => {
    const request = new Request('http://localhost:3000/api/users?skip=0&take=10');

    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toHaveProperty('users');
    expect(Array.isArray(data.users)).toBe(true);
  });

  it('should handle pagination params', async () => {
    const request = new Request('http://localhost:3000/api/users?skip=10&take=5');

    const response = await GET(request);
    const data = await response.json();

    expect(data.skip).toBe(10);
    expect(data.take).toBe(5);
  });
});
```

---

## 🎭 E2E Tests (Playwright)

### Setup

**Installation** :
```bash
npm install -D @playwright/test
npx playwright install
```

**Config** (`playwright.config.ts`) :
```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

### Tests E2E Exemples

```typescript
// e2e/auth.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpass');
    await page.click('button[type="submit"]');

    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Logout
    await page.click('button[aria-label="Logout"]');

    await expect(page).toHaveURL('/login');
  });
});
```

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login avant chaque test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display user profile', async ({ page }) => {
    await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="user-email"]')).toContainText('test@example.com');
  });

  test('should update profile successfully', async ({ page }) => {
    await page.goto('/dashboard/settings');

    await page.fill('input[name="name"]', 'New Name');
    await page.click('button[type="submit"]');

    await expect(page.locator('.success-message')).toContainText('Profile updated');
  });
});
```

---

## 🧪 Best Practices

### AAA Pattern (Arrange-Act-Assert)

```typescript
test('should create post with valid data', async () => {
  // Arrange: Setup
  const formData = new FormData();
  formData.set('title', 'Test Post');
  formData.set('content', 'Test content');

  // Act: Execute
  const result = await createPost(formData);

  // Assert: Verify
  expect(result.success).toBe(true);
});
```

---

### Mocking Next.js Modules

**next/navigation** :
```typescript
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
  usePathname: vi.fn(() => '/dashboard'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));
```

**next/image** :
```typescript
vi.mock('next/image', () => ({
  default: (props: any) => <img {...props} />,
}));
```

---

### Test Isolation

- Chaque test indépendant (pas de shared state)
- `beforeEach` pour cleanup
- Mock external services (Prisma, APIs tierces)

---

### Nommage Tests

**Format** : `should <action> when <condition>`

```typescript
test('should display error when email invalid', () => {});
test('should redirect to dashboard when login successful', () => {});
test('should disable button when form submitting', () => {});
```

---

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18

      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run test:coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3

      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run build
      - run: npx playwright test

      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📊 Coverage

**Objectif** : 80% minimum

```bash
# Generate coverage report
npm run test:coverage

# Open HTML report
open coverage/index.html
```

**Exclusions** :
- `.config.ts` files
- `middleware.ts` (testé E2E seulement)
- Types (`.d.ts`)

---

**Version** : 1.0 | **Maintenu par** : QA Team
