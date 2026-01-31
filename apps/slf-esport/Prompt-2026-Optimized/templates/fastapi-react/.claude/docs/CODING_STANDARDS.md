# Coding Standards - [Nom Projet]

> Standards de code Python (Backend) + TypeScript (Frontend).

---

## 🐍 Python (FastAPI Backend)

### Style Guide
**Base** : PEP 8

**Formatter** : Black (line-length=100)
**Linter** : Ruff (remplace Flake8 + isort)
**Type Checker** : Mypy (strict mode)

### Conventions Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | snake_case | `user_id`, `is_active` |
| Fonctions | snake_case | `get_current_user()` |
| Classes | PascalCase | `UserService`, `UserSchema` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT = 3` |
| Fichiers | snake_case | `user_service.py` |
| Async functions | Préfixe optionnel | `async def fetch_user()` |

### Structure Fichier Python

```python
"""Module docstring.

Description du module.
"""

# Standard library imports
import os
from datetime import datetime

# Third-party imports
from fastapi import APIRouter, Depends
from sqlalchemy import select

# Local imports
from app.core.config import settings
from app.models.user import User

# Constants
MAX_PAGE_SIZE = 100

# Code...
```

### Docstrings (Google Style)

```python
async def create_user(email: str, password: str) -> User:
    """Create new user with hashed password.

    Args:
        email: User email address (unique)
        password: Plain text password (will be hashed)

    Returns:
        Created User instance

    Raises:
        ValueError: If email already exists
        DatabaseError: If DB insert fails
    """
    # Implementation...
```

### Type Hints (Obligatoires)

```python
from typing import Optional, List

async def get_users(
    skip: int = 0,
    limit: int = 100
) -> List[User]:
    """Type hints everywhere."""
    pass
```

---

## 🎯 TypeScript (React Frontend)

### Style Guide
**Base** : Airbnb TypeScript

**Formatter** : Prettier
**Linter** : ESLint (airbnb-typescript)

### Conventions Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| Variables | camelCase | `userId`, `isActive` |
| Fonctions | camelCase | `getCurrentUser()` |
| Components | PascalCase | `UserProfile`, `LoginForm` |
| Interfaces | PascalCase, préfixe I optionnel | `User`, `IUserProps` |
| Types | PascalCase | `UserRole` |
| Enums | PascalCase | `UserStatus` |
| Constantes | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT = 3` |
| Fichiers composants | PascalCase.tsx | `UserProfile.tsx` |
| Fichiers utils | camelCase.ts | `formatDate.ts` |

### Structure Composant React

```typescript
import { FC, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@/components/atoms/Button';
import { useAuth } from '@/contexts/AuthContext';
import { User } from '@/types/user';

interface UserProfileProps {
  userId: number;
}

/**
 * User profile component.
 * Displays user info with edit capability.
 */
export const UserProfile: FC<UserProfileProps> = ({ userId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const { user } = useAuth();

  // Component logic...

  return (
    <div className="user-profile">
      {/* JSX */}
    </div>
  );
};
```

### Type Definitions

```typescript
// Prefer interfaces for objects
interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
}

// Use types for unions, intersections
type UserRole = 'admin' | 'user' | 'guest';
type ApiResponse<T> = {
  data: T;
  error?: string;
};
```

---

## 📝 Général (Les Deux)

### Commentaires
- ✅ Docstrings/JSDoc pour fonctions publiques
- ✅ Comments pour logique complexe (`// Why, not what`)
- ❌ Pas de comments évidents (`x = x + 1  // increment x`)

### Tests
- Fichiers : `test_*.py` (Python), `*.test.tsx` (TS)
- Coverage minimum : 80%
- Nommage tests : `test_<action>_<condition>_<expected>`

```python
def test_create_user_with_valid_data_returns_user():
    """Test descriptif."""
    pass
```

```typescript
describe('UserProfile', () => {
  it('should display user name when loaded', () => {
    // Test...
  });
});
```

### Error Handling

**Python** :
```python
try:
    result = await some_operation()
except SpecificError as e:
    logger.error(f"Operation failed: {e}")
    raise HTTPException(status_code=500, detail="Operation failed")
```

**TypeScript** :
```typescript
try {
  const result = await someOperation();
} catch (error) {
  if (error instanceof ApiError) {
    toast.error(error.message);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

---

## 🚨 Anti-Patterns à Éviter

### Python
- ❌ `except Exception:` (trop large, catch SpecificError)
- ❌ Mutable default args (`def func(list=[]):`)
- ❌ `from module import *`
- ❌ Global variables (use dependency injection)

### TypeScript
- ❌ `any` type (use `unknown` si vraiment besoin)
- ❌ Non-null assertion `!` (use optional chaining `?.`)
- ❌ Nested ternaries (use if/else)
- ❌ `console.log` en production (use logger)

---

## 🔧 Tools Config

### Python (`pyproject.toml`)
```toml
[tool.black]
line-length = 100

[tool.ruff]
line-length = 100
select = ["E", "F", "I"]

[tool.mypy]
strict = true
```

### TypeScript (`.eslintrc.js`, `.prettierrc`)
Voir fichiers config racine projet.

---

## ✅ Pre-Commit Checklist

- [ ] `ruff check .` (Python linting)
- [ ] `mypy .` (Python type check)
- [ ] `pytest` (Python tests)
- [ ] `npm run lint` (TS linting)
- [ ] `npm run type-check` (TS type check)
- [ ] `npm run test` (TS tests)
- [ ] Pas de `console.log` ou `print` debug

Utilise `/pre-commit` pour automation.

---

**Version** : 1.0 | **Maintenu par** : Dev Team
