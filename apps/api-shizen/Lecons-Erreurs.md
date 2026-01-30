# Leçons & Erreurs - API Shizen-Planner

**Date**: 2026-01-05
**Contexte**: Setup infrastructure PostgreSQL + Alembic + FastAPI
**Statut**: 2 problèmes majeurs NON RÉSOLUS (à investiguer dans future session)

---

## ❌ ERREUR CRITIQUE #1 - SQLAlchemy ORM Ne Persiste PAS les Données

### 📋 Symptômes

- ✅ FastAPI endpoints exécutent avec succès (retournent 201 Created)
- ✅ Objets SQLAlchemy créés et retournés avec IDs valides
- ✅ Connexion PostgreSQL fonctionnelle (prouvé par raw SQL)
- ✅ Tables existent dans la base de données
- ❌ **AUCUNE donnée persistée dans PostgreSQL**
- ❌ Requêtes `SELECT * FROM questionnaire_sessions;` retournent 0 lignes

### 🔍 Détails Techniques

**Configuration**:
- Python 3.13
- SQLAlchemy 2.0.45
- psycopg 3.2.3 (driver PostgreSQL moderne, pas psycopg2)
- FastAPI 0.115.6
- PostgreSQL 16 (Docker container)

**Code Endpoint** (`app/routes/questionnaire.py:37`):
```python
@router.post("/start", response_model=QuestionnaireSessionResponse, status_code=status.HTTP_201_CREATED)
def start_questionnaire_session(
    session_data: QuestionnaireSessionCreate,
    db: Session = Depends(get_db)
):
    new_session = QuestionnaireSession(
        id=str(uuid.uuid4()),
        user_id=session_data.user_id,
        status=SessionStatus.STARTED,
        # ... autres champs
    )

    db.add(new_session)
    db.commit()  # ❌ N'a AUCUN effet
    db.refresh(new_session)

    return new_session  # ✅ Retourne objet valide
```

**Test API**:
```bash
curl -X POST "http://localhost:8001/api/questionnaire/start" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user-001",
    "full_name": "Test User"
  }'

# Retourne: {"id":"abc-123","user_id":"test-user-001",...} ✅
# Mais SELECT dans psql: 0 lignes ❌
```

**Test Raw SQL** (SUCCÈS - prouve que DB fonctionne):
```sql
INSERT INTO questionnaire_sessions (id, user_id, status, completion_percentage, started_at, last_activity_at)
VALUES ('raw-test-001', 'raw-user', 'STARTED', '0', NOW(), NOW());

SELECT * FROM questionnaire_sessions WHERE id = 'raw-test-001';
-- ✅ Retourne 1 ligne - Insertion réussie
```

### 🛠️ Tentatives de Résolution (TOUTES ÉCHOUÉES)

#### Tentative 1: Activer SQL Logging
```python
# app/core/database.py
engine = create_engine(DATABASE_URL, echo=True)  # Enable SQL logging
```
**Résultat**: Logs SQL visibles dans script test direct, mais PAS dans logs FastAPI
**Conclusion**: Queries générées mais pas exécutées/committées

#### Tentative 2: Charger Variables Environnement
```python
from dotenv import load_dotenv
load_dotenv()  # Au début de database.py
```
**Résultat**: ÉCHEC - Aucun changement

#### Tentative 3: Changer Async → Sync
```python
# Avant
async def start_questionnaire_session(...)

# Après
def start_questionnaire_session(...)  # Sync
```
**Résultat**: ÉCHEC - Aucun changement

#### Tentative 4: Activer Autocommit
```python
# app/core/database.py
SessionLocal = sessionmaker(autocommit=True, autoflush=True, bind=engine)
```
**Résultat**: ÉCHEC - Server Error 500 (pire)

#### Tentative 5: Remplacer commit() par flush()
```python
db.add(new_session)
# db.commit()  # Commenté
db.flush()    # Alternative
```
**Résultat**: ÉCHEC - Aucun changement

#### Tentative 6: Ajouter Exception Handling
```python
def get_db():
    db = SessionLocal()
    try:
        yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
```
**Résultat**: ÉCHEC - Aucune exception levée, mais données pas persistées

### 🔬 Tests de Debugging Réalisés

**Test Script Direct** (`test_db_direct.py`):
```python
from app.core.database import SessionLocal
from app.models.questionnaire_session import QuestionnaireSession

db = SessionLocal()
new_session = QuestionnaireSession(id=str(uuid.uuid4()), user_id="direct-test", ...)
db.add(new_session)
db.commit()
db.refresh(new_session)

# Résultat: SQL queries visibles dans logs MAIS données pas persistées
```

**Vérification Metadata** (`test_metadata.py`):
```python
from app.core.database import Base, engine
print(Base.metadata.tables.keys())  # 8 tables
inspector = inspect(engine)
print(inspector.get_table_names())  # 8 tables

# ✅ Metadata et DB synchronisés
```

### 💡 Hypothèses pour Future Investigation

1. **Transaction Isolation Level**: Possible mismatch entre SQLAlchemy et PostgreSQL
   - Vérifier `SHOW transaction_isolation;` dans psql
   - Tester avec `isolation_level="AUTOCOMMIT"` dans engine

2. **Connection Pooling avec psycopg3**: Possible incompatibilité
   - psycopg3 gère différemment les transactions que psycopg2
   - Tester avec `pool_pre_ping=False`, `pool_recycle=3600`

3. **SQLAlchemy 2.0 Async Compatibility**:
   - Même avec routes sync, SQLAlchemy 2.0 peut avoir comportement async implicite
   - Tester avec `future=True` dans sessionmaker

4. **FastAPI Dependency Injection Lifecycle**:
   - Session créée/fermée avant commit effectif
   - Tester commit AVANT `yield db` dans `get_db()`

5. **Missing `begin()` Transaction Context**:
   - SQLAlchemy 2.0 requiert peut-être explicit transaction
   - Tester avec `with db.begin(): db.add(...)`

### 📝 Code pour Future Session

**Test #1 - Explicit Transaction**:
```python
from sqlalchemy import text

def get_db():
    db = SessionLocal()
    try:
        with db.begin():  # Explicit transaction
            yield db
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
```

**Test #2 - Isolation Level**:
```python
engine = create_engine(
    DATABASE_URL,
    isolation_level="AUTOCOMMIT",
    pool_pre_ping=True
)
```

**Test #3 - SQLAlchemy 1.4 Syntax (compatibility)**:
```python
from sqlalchemy.orm import Session as SASession

def get_db() -> Generator[SASession, None, None]:
    db = SessionLocal()
    db.begin()  # Explicit begin
    try:
        yield db
        db.commit()  # Explicit commit APRÈS yield
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
```

### ✅ Workaround Temporaire

**Aucun workaround ORM disponible** - Utiliser raw SQL si nécessaire:
```python
from sqlalchemy import text

def create_session_raw_sql(session_data):
    db = SessionLocal()
    query = text("""
        INSERT INTO questionnaire_sessions (id, user_id, status, ...)
        VALUES (:id, :user_id, :status, ...)
        RETURNING *
    """)
    result = db.execute(query, {...})
    db.commit()
    return result.fetchone()
```

---

## ❌ ERREUR MAJEURE #2 - Alembic Migration Ne Crée PAS les Tables

### 📋 Symptômes

- ✅ Migration Alembic s'exécute sans erreur
- ✅ Table `alembic_version` créée avec version `590ced3fe486`
- ❌ **Aucune table questionnaire créée** (questionnaire_sessions, questionnaire_responses, holistic_profiles, uploaded_charts)
- ❌ ENUMs PostgreSQL non créés (sessionstatus, charttype, chartstatus)

### 🔍 Détails Techniques

**Configuration**:
- Alembic 1.14.0
- SQLAlchemy 2.0.45
- PostgreSQL 16

**Commande Exécutée**:
```bash
cd apps/api-shizen-planner
alembic upgrade head

# Output:
INFO  [alembic.runtime.migration] Running upgrade  -> a68983c8d413, initial migration
INFO  [alembic.runtime.migration] Running upgrade a68983c8d413 -> 590ced3fe486, add questionnaire tables
```

**Vérification Tables**:
```bash
docker exec -it shinkofa-postgres-dev psql -U dev -d shinkofa_shizen_planner_dev -c "\dt"

# Résultat:
              List of relations
 Schema |      Name       | Type  | Owner
--------+-----------------+-------+-------
 public | alembic_version | table | dev
(1 row)

# ❌ Seulement alembic_version, pas les 4 tables attendues
```

### 🛠️ Tentatives de Résolution

#### Tentative 1: Downgrade + Upgrade
```bash
alembic downgrade -1
alembic upgrade head
```
**Résultat**: ÉCHEC - Pas d'erreur mais tables toujours absentes

#### Tentative 2: Vérifier Metadata Binding
```python
# test_metadata.py
from app.core.database import Base
print(Base.metadata.tables.keys())

# ✅ Output: ['users', 'tasks', 'categories', 'tags', 'questionnaire_sessions', ...]
# Metadata correct MAIS Alembic ne les crée pas
```

#### Tentative 3: Vérifier Alembic env.py
```python
# alembic/env.py
target_metadata = Base.metadata  # ✅ Correct

# Imports vérifiés:
from app.models import questionnaire_session, questionnaire_response, ...
# ✅ Tous les modèles importés
```

### ✅ Workaround Appliqué - Création Manuelle SQL

**Script**: `scripts/create-questionnaire-tables.sql`

```sql
-- Créer ENUMs
CREATE TYPE sessionstatus AS ENUM ('STARTED', 'IN_PROGRESS', 'COMPLETED', 'ANALYZED', 'ABANDONED');
CREATE TYPE charttype AS ENUM ('DESIGN_HUMAN', 'BIRTH_CHART');
CREATE TYPE chartstatus AS ENUM ('UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED');

-- Créer tables (voir fichier complet pour DDL détaillé)
CREATE TABLE questionnaire_sessions (...);
CREATE TABLE questionnaire_responses (...);
CREATE TABLE holistic_profiles (...);
CREATE TABLE uploaded_charts (...);
```

**Exécution**:
```bash
docker exec -i shinkofa-postgres-dev psql -U dev -d shinkofa_shizen_planner_dev < scripts/create-questionnaire-tables.sql

# ✅ Tables créées avec succès
```

**Vérification**:
```bash
\dt
# ✅ 8 tables visibles (4 nouvelles + 4 existantes)
```

### 💡 Hypothèses pour Future Investigation

1. **Import Circulaire Modèles**:
   - `alembic/env.py` importe Base, mais modèles peut-être pas chargés au bon moment
   - Vérifier ordre imports dans `app/models/__init__.py`

2. **Metadata Binding Timing**:
   - Base.metadata peut être vide au moment d'exécution Alembic
   - Tester `target_metadata = Base.metadata` APRÈS imports modèles

3. **SQLAlchemy 2.0 Declarative Base**:
   - Possible incompatibilité entre `declarative_base()` et Alembic 1.14
   - Tester avec `DeclarativeBase` (nouveau style SQLAlchemy 2.0)

4. **Alembic autogenerate Bug**:
   - `alembic revision --autogenerate` peut avoir généré migration vide
   - Vérifier contenu fichier migration `590ced3fe486`

### 📝 Code pour Future Session

**Test #1 - Vérifier Contenu Migration**:
```bash
cat alembic/versions/590ced3fe486_add_questionnaire_tables.py

# Chercher:
def upgrade():
    # Devrait contenir op.create_table(...) pour chaque table
    # Si vide → Bug autogenerate
```

**Test #2 - Imports Explicites env.py**:
```python
# alembic/env.py
from app.core.database import Base

# AJOUT: Imports explicites AVANT target_metadata
from app.models.questionnaire_session import QuestionnaireSession
from app.models.questionnaire_response import QuestionnaireResponse
from app.models.holistic_profile import HolisticProfile
from app.models.uploaded_chart import UploadedChart

target_metadata = Base.metadata
```

**Test #3 - Nouvelle Migration Manuelle**:
```bash
# Supprimer migration autogénérée
rm alembic/versions/590ced3fe486_*.py

# Créer migration vide
alembic revision -m "create questionnaire tables manual"

# Éditer manuellement avec op.create_table(...)
```

### ⚠️ Note Importante

**Décision Prise**: Utiliser création manuelle SQL pour continuer développement.
**Raison**: User énergie 8/10 → Prioriser livraison fonctionnelle vs debug infrastructure.
**Action Future**: Investiguer et résoudre problème Alembic dans session dédiée.

---

## ✅ Autres Erreurs Résolues (Succès)

### 1. Redis Port Already Allocated
**Erreur**: `Bind for 0.0.0.0:6379 failed: port is already allocated`
**Cause**: Service Redis déjà en cours d'exécution sur machine hôte
**Solution**: Démarrer uniquement PostgreSQL: `docker-compose up -d postgres-dev`
**Statut**: ✅ RÉSOLU

### 2. Init Script CRLF Line Endings
**Erreur**: `/bin/bash^M: bad interpreter`
**Cause**: Fichier `init-multiple-databases.sh` avec line endings Windows (CRLF)
**Solution**: Création manuelle databases via `docker exec psql`
**Statut**: ✅ RÉSOLU

### 3. Alembic Wrong Hostname
**Erreur**: `failed to resolve host 'postgres-dev'`
**Cause**: `alembic.ini` configuré avec nom service Docker au lieu de localhost
**Solution**: Remplacer `postgres-dev` par `localhost` dans `alembic.ini`
**Statut**: ✅ RÉSOLU

### 4. Missing Python Dependencies
**Erreur**: Multiple `ModuleNotFoundError` (uvicorn, jose, httpx)
**Cause**: Dépendances FastAPI pas toutes installées
**Solution**: Installation incrémentale packages manquants
**Statut**: ✅ RÉSOLU

---

## 📊 Statut Global Session

### ✅ Accomplissements

1. ✅ Docker Compose complet (PostgreSQL 16 + Redis 7 + pgAdmin)
2. ✅ 2 bases de données créées (shinkofa_auth_dev, shinkofa_shizen_planner_dev)
3. ✅ Configuration environnement (.env, .env.example)
4. ✅ 4 tables questionnaire créées manuellement (ENUMs + indexes + foreign keys)
5. ✅ FastAPI server fonctionnel sur port 8001
6. ✅ Tous endpoints API chargés et accessibles
7. ✅ Health check endpoint opérationnel
8. ✅ PostgreSQL connectivité vérifiée (raw SQL fonctionne)

### ❌ Blockers Non Résolus

1. ❌ SQLAlchemy ORM ne persiste pas données (CRITIQUE)
2. ❌ Alembic migration ne crée pas tables

### 📋 Next Steps (Future Session)

**Priorité Immédiate** (blocker critique):
1. Investiguer pourquoi SQLAlchemy génère SQL mais ne commit pas
   - Tester hypothèses transaction isolation, psycopg3, SQLAlchemy 2.0
   - Essayer explicit `begin()` transaction context
   - Vérifier lifecycle FastAPI dependency injection

**Priorité Haute** (déferred par user):
2. Débugger pourquoi Alembic ne crée pas tables
   - Vérifier contenu fichier migration
   - Tester imports explicites dans env.py
   - Considérer migration manuelle si autogenerate broken

**Après Résolution**:
3. Tester endpoints API complets avec données réelles
4. Implémenter services d'analyse (OCR, IA, Design Humain, etc.)
5. Tests unitaires backend (≥80% coverage)

---

**Dernière Mise à Jour**: 2026-01-05 23:45 UTC
**Durée Session Debug**: ~90 minutes
**Énergie User**: 8/10 → Décision "document + commit" pour préserver énergie
