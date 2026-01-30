"""
Test direct database connection
"""
from app.core.database import engine, SessionLocal, DATABASE_URL
from app.models.questionnaire_session import QuestionnaireSession, SessionStatus
from datetime import datetime, timezone
import uuid

print(f"DATABASE_URL: {DATABASE_URL}")
print(f"Engine: {engine}")

# Test connection
try:
    with engine.connect() as conn:
        result = conn.execute("SELECT 1")
        print(f"✅ Connection test: {result.fetchone()}")
except Exception as e:
    print(f"❌ Connection failed: {e}")

# Test creating a session
try:
    db = SessionLocal()
    new_session = QuestionnaireSession(
        id=str(uuid.uuid4()),
        user_id="direct-test",
        status=SessionStatus.STARTED,
        current_bloc=None,
        completion_percentage="0",
        birth_data=None,
        full_name="Direct DB Test",
        started_at=datetime.now(timezone.utc),
        last_activity_at=datetime.now(timezone.utc)
    )

    print(f"\n📝 Creating session: {new_session.id}")
    db.add(new_session)
    print("✅ Session added to db")

    db.commit()
    print("✅ Session committed")

    db.refresh(new_session)
    print(f"✅ Session refreshed: {new_session}")

    # Query it back
    queried = db.query(QuestionnaireSession).filter(
        QuestionnaireSession.id == new_session.id
    ).first()
    print(f"\n🔍 Queried session: {queried}")
    print(f"   User ID: {queried.user_id if queried else 'NOT FOUND'}")

    db.close()

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
