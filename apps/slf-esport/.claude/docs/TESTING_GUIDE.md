# Testing Guide - [Nom Projet]

> Guide complet des stratégies, outils et patterns de test pour ce projet.

**Dernière mise à jour** : [DATE]

---

## 🎯 Philosophie Testing

### Principes Fondamentaux

1. **Test First** - Écrire tests AVANT ou EN MÊME TEMPS que le code
2. **Fast Feedback** - Tests rapides (<5min pour suite complète)
3. **Isolation** - Chaque test est indépendant
4. **Readable** - Tests lisibles comme documentation
5. **Maintainable** - Tests faciles à modifier

### Pyramide de Tests

```
         /\
        /E2E\          10% - Tests End-to-End
       /------\
      /Integration\    30% - Tests d'Intégration
     /------------\
    /  Unit Tests  \   60% - Tests Unitaires
   /----------------\
```

---

## 📊 Coverage Targets

| Type | Coverage Minimum | Idéal |
|------|------------------|-------|
| **Unit Tests** | 80% | 90%+ |
| **Integration Tests** | 60% | 75%+ |
| **E2E Tests** | Critical paths | Happy + Error paths |
| **Branches** | 70% | 85%+ |

### Coverage Actuel

```bash
# Générer rapport coverage
[commande coverage]

# Voir rapport HTML
open coverage/index.html
```

---

## 🧪 Types de Tests

### 1. Tests Unitaires

**Objectif** : Tester fonctions/méthodes isolées

**Framework** : [Jest / pytest / Mocha]

**Structure AAA** :
```python
def test_calculate_discount():
    # Arrange - Préparer données
    price = 100
    discount = 0.2

    # Act - Exécuter fonction
    result = calculate_discount(price, discount)

    # Assert - Vérifier résultat
    assert result == 80
```

**Exemples** :

#### Python (pytest)

```python
# tests/test_user_service.py
import pytest
from app.services.user import UserService
from app.models import User

@pytest.fixture
def user_service():
    """Fixture pour réutiliser service."""
    return UserService()

@pytest.fixture
def sample_user():
    """Fixture pour user de test."""
    return User(
        email="test@example.com",
        name="Test User",
        password="hashed_password"
    )

def test_create_user_success(user_service):
    # Arrange
    user_data = {
        "email": "new@example.com",
        "name": "New User",
        "password": "SecurePass123!"
    }

    # Act
    user = user_service.create_user(user_data)

    # Assert
    assert user.id is not None
    assert user.email == "new@example.com"
    assert user.password != "SecurePass123!"  # Doit être hashé

def test_create_user_duplicate_email_raises_error(user_service, sample_user):
    # Arrange
    user_service.create_user(sample_user)

    # Act & Assert
    with pytest.raises(ValueError, match="Email already exists"):
        user_service.create_user(sample_user)

def test_get_user_by_id_not_found(user_service):
    # Act
    user = user_service.get_user_by_id("nonexistent-id")

    # Assert
    assert user is None
```

#### TypeScript (Jest)

```typescript
// tests/user.service.test.ts
import { UserService } from '../src/services/user';
import { User } from '../src/models/user';

describe('UserService', () => {
  let userService: UserService;

  beforeEach(() => {
    userService = new UserService();
  });

  describe('createUser', () => {
    it('should create user successfully', async () => {
      // Arrange
      const userData = {
        email: 'test@example.com',
        name: 'Test User',
        password: 'SecurePass123!',
      };

      // Act
      const user = await userService.createUser(userData);

      // Assert
      expect(user.id).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(user.password).not.toBe('SecurePass123!');
    });

    it('should throw error on duplicate email', async () => {
      // Arrange
      const userData = {
        email: 'duplicate@example.com',
        name: 'User 1',
        password: 'pass123',
      };
      await userService.createUser(userData);

      // Act & Assert
      await expect(userService.createUser(userData)).rejects.toThrow(
        'Email already exists'
      );
    });
  });

  describe('getUserById', () => {
    it('should return null when user not found', async () => {
      // Act
      const user = await userService.getUserById('nonexistent-id');

      // Assert
      expect(user).toBeNull();
    });
  });
});
```

---

### 2. Tests d'Intégration

**Objectif** : Tester interaction entre composants (API + DB, Service + Repository)

**Setup** : Base de données test, fixtures

**Exemple** :

#### Python (pytest + FastAPI)

```python
# tests/integration/test_user_api.py
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import get_db, Base, engine

# Setup DB test
@pytest.fixture(scope="module")
def test_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(test_db):
    return TestClient(app)

def test_create_user_endpoint(client):
    # Act
    response = client.post("/api/users", json={
        "email": "integration@example.com",
        "name": "Integration User",
        "password": "SecurePass123!"
    })

    # Assert
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "integration@example.com"
    assert "id" in data
    assert "password" not in data  # Ne pas exposer password

def test_get_user_endpoint(client):
    # Arrange - Créer user d'abord
    create_response = client.post("/api/users", json={
        "email": "getuser@example.com",
        "name": "Get User",
        "password": "pass123"
    })
    user_id = create_response.json()["id"]

    # Act
    response = client.get(f"/api/users/{user_id}")

    # Assert
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == user_id
    assert data["email"] == "getuser@example.com"

def test_authentication_flow(client):
    # Arrange - Créer user
    client.post("/api/users", json={
        "email": "auth@example.com",
        "password": "SecurePass123!"
    })

    # Act - Login
    login_response = client.post("/api/auth/login", json={
        "email": "auth@example.com",
        "password": "SecurePass123!"
    })

    # Assert
    assert login_response.status_code == 200
    tokens = login_response.json()
    assert "access_token" in tokens
    assert "refresh_token" in tokens

    # Act - Use token
    headers = {"Authorization": f"Bearer {tokens['access_token']}"}
    me_response = client.get("/api/users/me", headers=headers)

    # Assert
    assert me_response.status_code == 200
    assert me_response.json()["email"] == "auth@example.com"
```

---

### 3. Tests End-to-End (E2E)

**Objectif** : Tester parcours utilisateur complets

**Framework** : [Playwright / Cypress / Selenium]

**Exemple Playwright** :

```typescript
// e2e/user-registration.spec.ts
import { test, expect } from '@playwright/test';

test.describe('User Registration Flow', () => {
  test('should register new user successfully', async ({ page }) => {
    // Navigate to registration page
    await page.goto('http://localhost:3000/register');

    // Fill form
    await page.fill('input[name="email"]', 'e2e@example.com');
    await page.fill('input[name="name"]', 'E2E User');
    await page.fill('input[name="password"]', 'SecurePass123!');
    await page.fill('input[name="confirmPassword"]', 'SecurePass123!');

    // Submit
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL('**/dashboard');

    // Verify user is logged in
    const userName = await page.textContent('.user-name');
    expect(userName).toBe('E2E User');
  });

  test('should show error on duplicate email', async ({ page }) => {
    await page.goto('http://localhost:3000/register');

    await page.fill('input[name="email"]', 'existing@example.com');
    await page.fill('input[name="name"]', 'User');
    await page.fill('input[name="password"]', 'pass123');
    await page.fill('input[name="confirmPassword"]', 'pass123');

    await page.click('button[type="submit"]');

    // Verify error message
    const errorMsg = await page.textContent('.error-message');
    expect(errorMsg).toContain('Email already exists');
  });
});
```

---

## 🛠️ Outils

### Testing Frameworks

| Langage | Framework | Description |
|---------|-----------|-------------|
| **Python** | pytest | Framework test complet + fixtures |
| **TypeScript** | Jest | Test runner rapide + mocking |
| **React** | React Testing Library | Tests composants UI |
| **E2E** | Playwright | Tests browser cross-platform |

### Coverage Tools

```bash
# Python
pytest --cov=app --cov-report=html

# TypeScript
npm run test:coverage
```

### Mocking

#### Python (pytest-mock)

```python
def test_send_email_on_user_creation(mocker):
    # Mock external email service
    mock_send = mocker.patch('app.services.email.send_email')

    # Act
    user_service.create_user(user_data)

    # Assert email was sent
    mock_send.assert_called_once_with(
        to="user@example.com",
        subject="Welcome"
    )
```

#### TypeScript (Jest)

```typescript
it('should send email on user creation', async () => {
  // Mock
  const mockSendEmail = jest.fn();
  jest.spyOn(emailService, 'sendEmail').mockImplementation(mockSendEmail);

  // Act
  await userService.createUser(userData);

  // Assert
  expect(mockSendEmail).toHaveBeenCalledWith({
    to: 'user@example.com',
    subject: 'Welcome',
  });
});
```

---

## 🚀 Running Tests

### Local Development

```bash
# Tous les tests
[npm test / pytest]

# Tests unitaires uniquement
[npm run test:unit / pytest tests/unit]

# Tests intégration
[npm run test:integration / pytest tests/integration]

# Tests E2E
[npm run test:e2e / playwright test]

# Watch mode (re-run on change)
[npm run test:watch / pytest-watch]

# Specific file
[npm test user.test.ts / pytest tests/test_user.py]
```

### CI/CD Pipeline

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup
        run: [setup commands]

      - name: Unit Tests
        run: [test command]

      - name: Integration Tests
        run: [integration test command]

      - name: Upload Coverage
        uses: codecov/codecov-action@v3
```

---

## 📝 Best Practices

### ✅ Bon

```python
# Descriptif, isolé, rapide
def test_calculate_discount_with_valid_percentage():
    result = calculate_discount(100, 0.2)
    assert result == 80

# Test edge cases
def test_calculate_discount_with_zero_percentage():
    result = calculate_discount(100, 0)
    assert result == 100

def test_calculate_discount_with_full_percentage():
    result = calculate_discount(100, 1)
    assert result == 0
```

### ❌ Mauvais

```python
# Nom vague, teste plusieurs choses
def test_discount():
    assert calculate_discount(100, 0.2) == 80
    assert calculate_discount(50, 0.5) == 25
    assert calculate_discount(200, 0.1) == 180

# Dépend d'état externe
def test_user_count():
    # Dépend du nombre de users en DB
    assert User.count() == 5
```

---

## 🐛 Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

```
1. 🔴 RED   - Écrire test qui fail
2. 🟢 GREEN - Écrire code minimal pour passer
3. 🔵 REFACTOR - Améliorer code sans casser tests
```

**Exemple** :

```python
# 1. RED - Test d'abord
def test_user_full_name():
    user = User(first_name="John", last_name="Doe")
    assert user.full_name() == "John Doe"

# (Test FAIL car full_name() n'existe pas)

# 2. GREEN - Implémenter minimal
class User:
    def __init__(self, first_name, last_name):
        self.first_name = first_name
        self.last_name = last_name

    def full_name(self):
        return f"{self.first_name} {self.last_name}"

# (Test PASS)

# 3. REFACTOR - Améliorer
class User:
    def __init__(self, first_name: str, last_name: str):
        self.first_name = first_name.strip()
        self.last_name = last_name.strip()

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

# (Test PASS toujours)
```

---

## 🔗 Voir Aussi

- [CODING_STANDARDS.md](CODING_STANDARDS.md) - Standards code
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture système
- Framework docs : [pytest](https://docs.pytest.org) | [Jest](https://jestjs.io)

---

**Maintenu par** : [Équipe]
**Revue recommandée** : À chaque ajout feature majeure
