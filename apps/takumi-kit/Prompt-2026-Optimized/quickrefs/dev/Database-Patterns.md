# QuickRef: Database Patterns

> Référence rapide bases de données et ORM.

---

## SQLite (Dev/Prototypage)

```python
# Python - sqlite3
import sqlite3

conn = sqlite3.connect('app.db')
cursor = conn.cursor()

cursor.execute('''
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
''')

# Query paramétrée (JAMAIS f-string!)
cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
```

---

## PostgreSQL (Production)

**Connexion** :
```python
# Python - psycopg2
import psycopg2
from contextlib import contextmanager

@contextmanager
def get_db():
    conn = psycopg2.connect(os.getenv('DATABASE_URL'))
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
```

**Commandes CLI** :
```bash
psql -h localhost -U user -d database
\dt                  # Liste tables
\d+ table_name       # Structure table
\q                   # Quitter
```

---

## Prisma (TypeScript)

```typescript
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  posts     Post[]
  createdAt DateTime @default(now())
}

// Usage
const user = await prisma.user.create({
  data: { email: 'test@example.com', name: 'Test' }
});

const users = await prisma.user.findMany({
  where: { email: { contains: '@example.com' } },
  include: { posts: true }
});
```

**Commandes** :
```bash
npx prisma migrate dev     # Créer migration
npx prisma migrate deploy  # Appliquer en prod
npx prisma generate        # Générer client
npx prisma studio          # GUI browser
```

---

## SQLAlchemy (Python)

```python
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.orm import declarative_base, sessionmaker

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)

engine = create_engine(os.getenv('DATABASE_URL'))
Session = sessionmaker(bind=engine)

# Usage
with Session() as session:
    user = User(email='test@example.com')
    session.add(user)
    session.commit()
```

---

## Migrations Best Practices

1. **Jamais modifier** migration déjà appliquée en prod
2. **Toujours** backup avant migration destructive
3. **Tester** migrations sur copie de prod d'abord
4. **Nommer** clairement : `20260119_add_user_roles.sql`

```bash
# Alembic (Python)
alembic revision --autogenerate -m "add user roles"
alembic upgrade head
alembic downgrade -1

# Prisma
npx prisma migrate dev --name add_user_roles
```

---

## Optimisation Queries

```sql
-- Index pour colonnes fréquemment filtrées
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_posts_user_id ON posts(user_id);

-- EXPLAIN pour analyser
EXPLAIN ANALYZE SELECT * FROM users WHERE email = 'x';

-- Pagination efficace (cursor-based)
SELECT * FROM posts
WHERE id > :last_id
ORDER BY id
LIMIT 20;
```

---

**Version** : 1.0 | **Trigger** : Travail DB, migrations, optimisation queries
