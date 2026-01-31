# QuickRef: Testing Strategy

> Référence rapide tests unitaires et intégration.

---

## Pyramide des Tests

```
         /\
        /  \     E2E (peu, critiques)
       /----\
      /      \   Integration (moyen)
     /--------\
    /          \ Unit (beaucoup, rapides)
   /____________\
```

**Ratio cible** : 70% Unit / 20% Integration / 10% E2E

---

## Python (pytest)

```python
# tests/test_users.py
import pytest
from app.services import create_user

class TestCreateUser:
    def test_creates_user_with_valid_email(self):
        user = create_user(email="test@example.com")
        assert user.email == "test@example.com"

    def test_raises_on_invalid_email(self):
        with pytest.raises(ValueError, match="Invalid email"):
            create_user(email="invalid")

    @pytest.fixture
    def mock_db(self, mocker):
        return mocker.patch('app.services.db')

    def test_saves_to_database(self, mock_db):
        create_user(email="test@example.com")
        mock_db.save.assert_called_once()
```

**Commandes** :
```bash
pytest                           # Tous les tests
pytest -v                        # Verbose
pytest -k "test_create"          # Par nom
pytest --cov=app --cov-report=html  # Coverage
pytest -x                        # Stop au premier échec
pytest --lf                      # Seulement tests échoués
```

**pytest.ini** :
```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_functions = test_*
addopts = -v --tb=short
```

---

## JavaScript/TypeScript (Jest)

```typescript
// tests/users.test.ts
import { createUser } from '../src/services/users';

describe('createUser', () => {
  it('creates user with valid email', async () => {
    const user = await createUser({ email: 'test@example.com' });
    expect(user.email).toBe('test@example.com');
  });

  it('throws on invalid email', async () => {
    await expect(createUser({ email: 'invalid' }))
      .rejects.toThrow('Invalid email');
  });
});

// Mock
jest.mock('../src/db');
import { db } from '../src/db';

it('saves to database', async () => {
  await createUser({ email: 'test@example.com' });
  expect(db.save).toHaveBeenCalledTimes(1);
});
```

**Commandes** :
```bash
npm test                     # Tous les tests
npm test -- --watch          # Watch mode
npm test -- --coverage       # Coverage
npm test -- -t "createUser"  # Par nom
```

---

## React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginForm } from './LoginForm';

describe('LoginForm', () => {
  it('renders email input', () => {
    render(<LoginForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
  });

  it('submits form with valid data', async () => {
    const onSubmit = jest.fn();
    render(<LoginForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: 'test@example.com' }
    });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({ email: 'test@example.com' });
    });
  });
});
```

---

## Tests API (FastAPI)

```python
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_get_users():
    response = client.get("/api/users")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_user():
    response = client.post("/api/users", json={"email": "test@example.com"})
    assert response.status_code == 201
    assert response.json()["email"] == "test@example.com"
```

---

## Checklist Tests

- [ ] Coverage backend ≥80%
- [ ] Tests unitaires pour logique métier
- [ ] Tests intégration pour API endpoints
- [ ] Mocks pour dépendances externes
- [ ] Tests accessibilité (axe-core)
- [ ] Pas de tests flaky (random failures)

---

**Version** : 1.0 | **Trigger** : Écriture tests, debug tests, CI/CD
