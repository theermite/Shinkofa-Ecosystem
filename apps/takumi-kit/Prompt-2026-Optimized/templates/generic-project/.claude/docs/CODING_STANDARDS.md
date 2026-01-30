# Coding Standards - [Nom Projet]

> Standards de code, conventions et best practices pour ce projet.

**Dernière mise à jour** : [DATE]

---

## 🎯 Principes Généraux

### Valeurs Fondamentales

1. **Lisibilité > Cleverness** - Code lisible avant tout
2. **DRY (Don't Repeat Yourself)** - Pas de duplication
3. **KISS (Keep It Simple, Stupid)** - Simplicité
4. **YAGNI (You Aren't Gonna Need It)** - Pas de sur-engineering
5. **Fail Fast** - Errors explicites tôt

### Code Review

✅ **Tous les PR nécessitent** :
- Review par au moins 1 développeur
- Tests passent (CI green)
- Coverage ≥ 80%
- Pas de conflits
- Documentation à jour

---

## 📝 Conventions Générales

### Nommage

| Élément | Convention | Exemple |
|---------|------------|---------|
| **Variables** | [snake_case / camelCase] | `user_name` / `userName` |
| **Fonctions** | [snake_case / camelCase] | `get_user()` / `getUser()` |
| **Classes** | PascalCase | `UserService` |
| **Constantes** | SCREAMING_SNAKE_CASE | `MAX_RETRY_COUNT` |
| **Fichiers** | [snake_case / kebab-case] | `user_service.py` / `user-service.ts` |
| **Components React** | PascalCase | `UserProfile.tsx` |

### Langues

| Contexte | Langue |
|----------|--------|
| **Code** (variables, fonctions) | Anglais |
| **Comments** | Anglais |
| **Documentation** | [Français / Anglais] |
| **Commits** | Anglais |
| **UI/Messages utilisateur** | [Français / i18n] |

---

## 🐍 Python (si applicable)

### Style Guide

**Base** : PEP 8 avec adaptations

```python
# ✅ Bon
def calculate_total_price(items: list[Item], discount: float = 0.0) -> float:
    """
    Calculate total price with optional discount.

    Args:
        items: List of items to calculate
        discount: Discount percentage (0.0 to 1.0)

    Returns:
        Total price after discount

    Raises:
        ValueError: If discount is invalid
    """
    if not 0 <= discount <= 1:
        raise ValueError("Discount must be between 0 and 1")

    subtotal = sum(item.price for item in items)
    return subtotal * (1 - discount)


# ❌ Mauvais
def calc(items,d=0):  # Noms courts, pas de types
    total=0  # Pas d'espace autour =
    for i in items:
        total+=i.price
    return total-total*d  # Pas clair
```

### Imports

```python
# Order: standard lib, third party, local
import os
import sys
from typing import Optional

import requests
from fastapi import FastAPI

from app.core import config
from app.models import User
```

### Type Hints (obligatoire)

```python
# ✅ Bon
def process_user(user_id: int) -> Optional[User]:
    ...

# ❌ Mauvais
def process_user(user_id):
    ...
```

### Tools

- **Formatter** : Black (line-length=100)
- **Linter** : Pylint, Flake8
- **Type checker** : Mypy
- **Import sorter** : isort

```bash
# Pre-commit
black . && isort . && mypy . && pylint app/
```

---

## 🟦 TypeScript / JavaScript (si applicable)

### Style Guide

**Base** : Airbnb + adaptations

```typescript
// ✅ Bon
interface User {
  id: string;
  email: string;
  name: string;
}

const getUserById = async (id: string): Promise<User | null> => {
  try {
    const user = await db.user.findUnique({ where: { id } });
    return user;
  } catch (error) {
    logger.error('Failed to fetch user', { id, error });
    return null;
  }
};


// ❌ Mauvais
function getUser(id) {  // Pas de types
  return db.user.findUnique({where:{id}})  // Pas de formatting
}
```

### Imports

```typescript
// Order: React, third party, local
import React from 'react';

import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

import { User } from '@/types';
import { api } from '@/services/api';
```

### Type Safety (obligatoire)

```typescript
// ✅ Bon - Types explicites
interface ApiResponse<T> {
  data: T;
  error: string | null;
}

const fetchUser = async (id: string): Promise<ApiResponse<User>> => {
  // ...
};


// ❌ Mauvais - any interdit
const fetchUser = async (id: any): Promise<any> => {
  // ...
};
```

### Tools

- **Formatter** : Prettier
- **Linter** : ESLint
- **Type checker** : TypeScript strict mode

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

---

## ⚛️ React (si applicable)

### Component Structure

```typescript
// ✅ Bon - Functional component avec TypeScript
interface UserProfileProps {
  userId: string;
  onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userId, onEdit }) => {
  const { data: user, isLoading } = useQuery(['user', userId], () =>
    fetchUser(userId)
  );

  if (isLoading) return <Skeleton />;
  if (!user) return <NotFound />;

  return (
    <div className="user-profile">
      <h1>{user.name}</h1>
      {onEdit && <Button onClick={onEdit}>Edit</Button>}
    </div>
  );
};
```

### Hooks Rules

```typescript
// ✅ Bon
useEffect(() => {
  let mounted = true;

  fetchData().then(data => {
    if (mounted) setData(data);
  });

  return () => { mounted = false; };  // Cleanup
}, []);


// ❌ Mauvais - Pas de cleanup
useEffect(() => {
  fetchData().then(setData);
}, []);
```

### File Structure

```
components/
├── UserProfile/
│   ├── UserProfile.tsx       # Component
│   ├── UserProfile.test.tsx  # Tests
│   ├── UserProfile.styles.ts # Styles (si styled-components)
│   └── index.ts              # Export
```

---

## 💾 SQL

### Nommage

```sql
-- ✅ Bon
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Index nommés clairement
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id_status ON posts(user_id, status);


-- ❌ Mauvais
CREATE TABLE tbl_usr (
  usr_id INT,
  em VARCHAR(100)
);
```

### Queries

```sql
-- ✅ Bon - Lisible, paramétré
SELECT
  u.id,
  u.name,
  u.email,
  COUNT(p.id) AS post_count
FROM users u
LEFT JOIN posts p ON p.user_id = u.id
WHERE u.is_active = true
  AND u.created_at > $1
GROUP BY u.id
ORDER BY post_count DESC
LIMIT 10;


-- ❌ Mauvais - Pas lisible, SQL injection
SELECT * FROM users WHERE email='${email}'
```

---

## 📄 Documentation

### Code Comments

```python
# ✅ Bon - Explique POURQUOI, pas QUOI
def retry_on_failure(max_attempts=3):
    """
    Retry decorator for handling transient failures.

    We use exponential backoff to avoid overwhelming
    the service during temporary outages.
    """
    # Sleep exponentially longer between retries
    # to give the service time to recover
    time.sleep(2 ** attempt)


# ❌ Mauvais - Commente l'évident
def add(a, b):
    # Add a and b
    return a + b
```

### Docstrings (obligatoire pour fonctions publiques)

```python
def process_payment(amount: float, method: PaymentMethod) -> PaymentResult:
    """
    Process a payment transaction.

    Args:
        amount: Payment amount in USD (must be > 0)
        method: Payment method (card, paypal, etc.)

    Returns:
        PaymentResult with transaction ID if successful

    Raises:
        ValueError: If amount is invalid
        PaymentError: If payment processing fails

    Example:
        >>> result = process_payment(99.99, PaymentMethod.CARD)
        >>> result.transaction_id
        'txn_123abc'
    """
```

---

## 🧪 Tests

### Test Structure

```python
# ✅ Bon - AAA pattern (Arrange, Act, Assert)
def test_user_creation_success():
    # Arrange
    user_data = {"email": "test@example.com", "name": "Test User"}

    # Act
    user = create_user(user_data)

    # Assert
    assert user.email == "test@example.com"
    assert user.name == "Test User"
    assert user.id is not None
```

### Test Naming

```python
# ✅ Bon - Descriptif
def test_create_user_with_duplicate_email_raises_error():
    ...

# ❌ Mauvais - Pas clair
def test_user_1():
    ...
```

Voir [TESTING_GUIDE.md](TESTING_GUIDE.md) pour détails.

---

## 🚫 Anti-Patterns À Éviter

### ❌ Magic Numbers

```python
# ❌ Mauvais
if user.age > 18:
    ...

# ✅ Bon
LEGAL_AGE = 18
if user.age > LEGAL_AGE:
    ...
```

### ❌ Nested Ternaries

```typescript
// ❌ Mauvais
const status = user ? user.active ? 'active' : 'inactive' : 'unknown';

// ✅ Bon
const getStatus = (user?: User) => {
  if (!user) return 'unknown';
  return user.active ? 'active' : 'inactive';
};
```

### ❌ God Objects / Functions

```python
# ❌ Mauvais - Fonction fait trop de choses
def handle_user(user_id):
    user = get_user(user_id)
    validate_user(user)
    send_email(user)
    log_activity(user)
    update_stats(user)
    ...  # 50 autres lignes

# ✅ Bon - Fonctions focalisées
def process_user_registration(user_id):
    user = get_user(user_id)
    validate_user(user)
    notify_user_registered(user)
```

---

## 🔐 Sécurité

### ✅ Toujours

- Sanitize user input
- Use parameterized queries
- Hash passwords (bcrypt, argon2)
- Validate all data (backend + frontend)
- Use HTTPS en production
- Secrets dans .env (jamais dans code)

### ❌ Jamais

- Hardcoder secrets
- Stocker passwords en clair
- Faire confiance au client
- Ignorer errors
- Exposer stack traces en prod

---

## 📦 Git

### Commits

**Format** : Conventional Commits

```
type(scope): description

[body optionnel]

[footer optionnel]
```

**Types** :
- `feat` - Nouvelle feature
- `fix` - Bug fix
- `docs` - Documentation
- `style` - Formatting
- `refactor` - Refactoring
- `test` - Tests
- `chore` - Maintenance

**Exemples** :
```
feat(auth): add JWT refresh token support
fix(api): handle null response from external service
docs(readme): update installation instructions
```

### Branches

```
main                # Production-ready
develop             # Development
feature/name        # Nouvelles features
fix/bug-name        # Bug fixes
```

---

## 🔗 Voir Aussi

- [TESTING_GUIDE.md](TESTING_GUIDE.md) - Guide tests complet
- [ARCHITECTURE.md](ARCHITECTURE.md) - Décisions architecture
- Conventions externes : [Airbnb Style Guide](https://github.com/airbnb/javascript)

---

**Maintenu par** : [Équipe]
**Revue recommandée** : Trimestre ou lors ajout nouvelle stack
