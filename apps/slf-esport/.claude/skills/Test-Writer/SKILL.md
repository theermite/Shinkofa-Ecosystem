---
name: test-writer
description: Génération de tests automatisés (unit, integration, e2e). Utiliser quand Jay demande "ajoute des tests", "test cette fonction", "coverage", ou après implémentation d'une feature.
allowed-tools:
  - Read
  - Grep
  - Glob
  - Bash
user-invocable: true
---

# Test Writer Skill

## Mission
Générer des tests robustes, maintenables et bien structurés pour le code existant ou nouveau.

## Déclencheurs
- "Ajoute des tests pour..."
- "Teste cette fonction"
- "On a besoin de tests"
- "Coverage insuffisant"
- Après implémentation feature

## Workflow

### 1. Analyse Code Cible
```
- Identifier fonctions/composants à tester
- Comprendre les inputs/outputs
- Repérer edge cases
- Vérifier dépendances à mocker
```

### 2. Choix Stratégie Test

| Type | Quand | Ratio Recommandé |
|------|-------|------------------|
| **Unit** | Fonctions pures, utils, services | 70% |
| **Integration** | API, DB, composants combinés | 20% |
| **E2E** | Flows critiques utilisateur | 10% |

### 3. Génération Tests

## Templates par Stack

### Python (pytest)

```python
# tests/test_[module].py
import pytest
from unittest.mock import Mock, patch
from src.module import fonction_a_tester

class TestFonctionATester:
    """Tests pour fonction_a_tester"""

    def test_cas_nominal(self):
        """Test cas standard avec inputs valides"""
        result = fonction_a_tester(input_valide)
        assert result == expected_output

    def test_cas_limite(self):
        """Test edge case - valeur limite"""
        result = fonction_a_tester(valeur_limite)
        assert result == expected_limite

    def test_erreur_input_invalide(self):
        """Test gestion erreur input invalide"""
        with pytest.raises(ValueError):
            fonction_a_tester(input_invalide)

    @patch('src.module.dependance_externe')
    def test_avec_mock(self, mock_dep):
        """Test avec dépendance mockée"""
        mock_dep.return_value = mock_response
        result = fonction_a_tester(input)
        mock_dep.assert_called_once_with(expected_args)
        assert result == expected

    @pytest.mark.parametrize("input,expected", [
        ("cas1", "result1"),
        ("cas2", "result2"),
        ("cas3", "result3"),
    ])
    def test_parametrized(self, input, expected):
        """Test multiple cases"""
        assert fonction_a_tester(input) == expected
```

**Fixtures** :
```python
@pytest.fixture
def sample_data():
    return {"key": "value"}

@pytest.fixture
def mock_db(mocker):
    return mocker.patch('src.db.connection')
```

### TypeScript/JavaScript (Jest + Testing Library)

```typescript
// __tests__/module.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Component } from '../Component';

describe('Component', () => {
  it('should render with default props', () => {
    render(<Component />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should handle click event', async () => {
    const onClickMock = jest.fn();
    render(<Component onClick={onClickMock} />);

    await userEvent.click(screen.getByRole('button'));

    expect(onClickMock).toHaveBeenCalledTimes(1);
  });

  it('should show loading state', () => {
    render(<Component isLoading />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should display error message', async () => {
    render(<Component />);

    await userEvent.type(screen.getByRole('textbox'), 'invalid');
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Error message');
    });
  });
});
```

**API/Service Tests** :
```typescript
// __tests__/api.test.ts
import { fetchUsers } from '../api';

// Mock fetch
global.fetch = jest.fn();

describe('fetchUsers', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('should return users on success', async () => {
    const mockUsers = [{ id: 1, name: 'Test' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockUsers,
    });

    const result = await fetchUsers();

    expect(fetch).toHaveBeenCalledWith('/api/users');
    expect(result).toEqual(mockUsers);
  });

  it('should throw on API error', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(fetchUsers()).rejects.toThrow('API Error');
  });
});
```

### E2E (Playwright)

```typescript
// e2e/login.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('successful login redirects to dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'user@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Welcome');
  });

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');

    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('[role="alert"]')).toBeVisible();
  });
});
```

## Checklist Tests

### Avant Écriture
- [ ] Code à tester lu et compris
- [ ] Edge cases identifiés
- [ ] Dépendances à mocker listées
- [ ] Stratégie test choisie

### Structure Test
- [ ] Nom descriptif (test_[action]_[condition]_[expected])
- [ ] Arrange/Act/Assert clair
- [ ] Un assert principal par test
- [ ] Setup/Teardown si nécessaire

### Qualité
- [ ] Tests indépendants (pas d'ordre)
- [ ] Pas de données hardcodées si évitable
- [ ] Mocks bien configurés
- [ ] Nettoyage après test

### Coverage
- [ ] Happy path couvert
- [ ] Edge cases couverts
- [ ] Error handling testé
- [ ] Coverage ≥ 80% (backend)

## Commandes Utiles

```bash
# Python
pytest tests/ -v
pytest --cov=src tests/
pytest -k "test_specific"

# JavaScript/TypeScript
npm test
npm test -- --coverage
npm test -- --watch
npx playwright test

# Coverage report
pytest --cov=src --cov-report=html
```

## Format Output

```markdown
## Tests Générés

### Fichiers Créés
- `tests/test_[module].py` : [X] tests

### Coverage Estimée
- Fonctions couvertes : [liste]
- Edge cases : [liste]

### À Compléter Manuellement
- [ ] [Test nécessitant contexte métier]
```

## Contraintes
- Tests lisibles et maintenables
- Noms explicites
- Pas de tests fragiles (flaky)
- Documentation si logique complexe
