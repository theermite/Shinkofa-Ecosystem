# Testing Guide - [Nom Projet]

> Stratégie et patterns de tests Backend (pytest) + Frontend (Vitest).

---

## 🎯 Stratégie Tests

### Pyramide Tests

```
      /\
     /E2E\       (10%) - Tests end-to-end complets
    /------\
   /Integ. \     (30%) - Tests intégration (API + DB)
  /----------\
 /   Unit     \  (60%) - Tests unitaires isolés
/--------------\
```

**Objectif Coverage** : 80% minimum

---

## 🐍 Backend (pytest)

### Setup

**Installation** :
```bash
pip install pytest pytest-asyncio pytest-cov httpx
```

**Config** (`pytest.ini`) :
```ini
[pytest]
asyncio_mode = auto
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

### Structure Tests

```
tests/
├── unit/              # Tests unitaires (logic isolée)
│   ├── test_services.py
│   └── test_utils.py
├── integration/       # Tests intégration (API + DB)
│   ├── test_auth.py
│   └── test_users.py
├── conftest.py        # Fixtures partagées
└── factories.py       # Test data factories
```

### Fixtures (conftest.py)

```python
import pytest
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from httpx import AsyncClient

from app.main import app
from app.db.session import get_db

@pytest.fixture
async def db_session() -> AsyncSession:
    """Test database session."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSession(engine) as session:
        yield session

    await engine.dispose()

@pytest.fixture
async def client(db_session: AsyncSession) -> AsyncClient:
    """Test API client."""
    app.dependency_overrides[get_db] = lambda: db_session

    async with AsyncClient(app=app, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
```

### Tests Unitaires

```python
from app.services.user_service import UserService

async def test_create_user_with_valid_data_returns_user(db_session):
    """Test user creation with valid data."""
    service = UserService(db_session)

    user = await service.create_user(
        email="test@example.com",
        password="SecurePass123!",
        name="Test User"
    )

    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.hashed_password != "SecurePass123!"  # Hashed
```

### Tests Intégration (API)

```python
async def test_login_with_valid_credentials_returns_tokens(client):
    """Test login endpoint with valid credentials."""
    # Arrange: Create user
    await client.post("/api/users", json={
        "email": "test@example.com",
        "password": "SecurePass123!",
        "name": "Test User"
    })

    # Act: Login
    response = await client.post("/api/auth/login", json={
        "email": "test@example.com",
        "password": "SecurePass123!"
    })

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"
```

### Run Tests

```bash
# All tests
pytest

# Specific file
pytest tests/integration/test_auth.py

# Specific test
pytest tests/integration/test_auth.py::test_login_with_valid_credentials

# With coverage
pytest --cov=app --cov-report=html
```

---

## ⚛️ Frontend (Vitest + React Testing Library)

### Setup

**Installation** :
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

**Config** (`vite.config.ts`) :
```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

### Structure Tests

```
src/
├── components/
│   ├── UserProfile.tsx
│   └── UserProfile.test.tsx    # Colocated tests
├── hooks/
│   ├── useAuth.ts
│   └── useAuth.test.ts
└── test/
    ├── setup.ts                # Test setup
    └── utils.tsx               # Test utilities
```

### Test Setup (`src/test/setup.ts`)

```typescript
import '@testing-library/jest-dom';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});
```

### Tests Composants

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserProfile } from './UserProfile';

describe('UserProfile', () => {
  it('should display user name when loaded', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };

    render(<UserProfile user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', async () => {
    const mockUser = { id: 1, name: 'John Doe', email: 'john@example.com' };
    const handleEdit = vi.fn();

    render(<UserProfile user={mockUser} onEdit={handleEdit} />);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(handleEdit).toHaveBeenCalledWith(mockUser);
  });
});
```

### Tests Hooks

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should return null user when not authenticated', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

### Run Tests

```bash
# All tests
npm run test

# Watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

---

## 🧪 Best Practices

### AAA Pattern (Arrange-Act-Assert)

```python
async def test_example():
    # Arrange: Setup test data
    user = UserFactory.create()

    # Act: Execute action
    result = await service.do_something(user)

    # Assert: Verify result
    assert result.status == "success"
```

### Fixtures Over Mocks

✅ **Préférer** fixtures réelles (test DB)
⚠️ **Utiliser** mocks seulement pour services externes (email, API tierces)

### Test Isolation

- Chaque test doit être indépendant
- Cleanup automatique (fixtures, afterEach)
- Pas de global state partagé

### Nommage Tests

**Format** : `test_<action>_<condition>_<expected_result>`

```python
test_create_user_with_valid_data_returns_user()
test_create_user_with_duplicate_email_raises_error()
test_login_with_invalid_password_returns_401()
```

---

## 🚀 CI/CD Integration

### GitHub Actions

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-python@v4
      - run: pip install -r requirements-dev.txt
      - run: pytest --cov=app --cov-fail-under=80

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
```

---

**Version** : 1.0 | **Maintenu par** : QA Team
