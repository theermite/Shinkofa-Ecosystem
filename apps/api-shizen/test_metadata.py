"""
Test SQLAlchemy metadata and model binding
"""
from app.core.database import Base, engine
from app.models import questionnaire_session, questionnaire_response, holistic_profile, uploaded_chart

print("📊 Checking Base.metadata...")
print(f"Tables in metadata: {list(Base.metadata.tables.keys())}")

print("\n📋 Checking if tables exist in database...")
from sqlalchemy import inspect
inspector = inspect(engine)
db_tables = inspector.get_table_names()
print(f"Tables in database: {db_tables}")

print("\n🔍 Comparing...")
metadata_tables = set(Base.metadata.tables.keys())
db_table_set = set(db_tables)

print(f"In metadata but not in DB: {metadata_tables - db_table_set}")
print(f"In DB but not in metadata: {db_table_set - metadata_tables}")

if metadata_tables == db_table_set:
    print("\n✅ Metadata and DB are in sync!")
else:
    print("\n⚠️ Mismatch between metadata and database!")
