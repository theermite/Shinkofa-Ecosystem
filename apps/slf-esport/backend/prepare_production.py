"""
Prepare database for PRODUCTION deployment
- Keep admin accounts (Manager, Coach)
- Remove test player account(s)
- Clear all test data (sessions, scores, etc.)
- Keep exercises (reference data)
"""

import sys
from app.core.database import SessionLocal
from app.models.user import User
from app.models.session import Session as SessionModel, SessionParticipant
from app.models.exercise import ExerciseScore

# Admin accounts to KEEP (by email)
ADMIN_EMAILS = [
    'gautierlandrysodart@gmail.com',  # Manager - Le-Blond
    'jaygonc@gmail.com',               # Coach - The-Ermite
]

def prepare_production():
    """Clean test data and prepare for production"""
    db = SessionLocal()

    try:
        print("=" * 70)
        print("🚀 PRODUCTION PREPARATION - Database Cleanup")
        print("=" * 70)
        print()

        # Count before cleanup
        all_users = db.query(User).all()
        sessions_count = db.query(SessionModel).count()
        participants_count = db.query(SessionParticipant).count()
        scores_count = db.query(ExerciseScore).count()

        print("📊 Current database state:")
        print(f"   Total users: {len(all_users)}")
        for u in all_users:
            print(f"     - {u.username} ({u.email}) - {u.role}")
        print(f"   Sessions: {sessions_count}")
        print(f"   Participants: {participants_count}")
        print(f"   Exercise scores: {scores_count}")
        print()

        # Identify test users (not in admin list)
        admin_users = [u for u in all_users if u.email in ADMIN_EMAILS]
        test_users = [u for u in all_users if u.email not in ADMIN_EMAILS]

        print("✅ Admin accounts to KEEP:")
        for u in admin_users:
            print(f"   - {u.username} ({u.email}) - {u.role}")
        print()

        if test_users:
            print("🗑️  Test accounts to DELETE:")
            for u in test_users:
                print(f"   - {u.username} ({u.email}) - {u.role}")
            print()

        # Confirm deletion
        print("⚠️  WARNING: This will DELETE all test data!")
        print("   - Test user accounts will be removed")
        print("   - All sessions, scores will be cleared")
        print("   - Admin accounts will be KEPT")
        print("   - Exercises will be KEPT (reference data)")
        print()

        response = input("🔴 Type 'DELETE' to confirm production cleanup: ")

        if response != 'DELETE':
            print("❌ Cleanup cancelled. Database unchanged.")
            return

        print()
        print("🧹 Starting cleanup...\n")

        # Delete in correct order (respect foreign keys)

        # 1. Delete exercise scores (references users)
        deleted_scores = db.query(ExerciseScore).delete()
        print(f"✅ Deleted {deleted_scores} exercise score(s)")

        # 2. Delete session participants (references sessions and users)
        deleted_participants = db.query(SessionParticipant).delete()
        print(f"✅ Deleted {deleted_participants} session participant(s)")

        # 3. Delete sessions (references users via created_by_id and coach_id)
        deleted_sessions = db.query(SessionModel).delete()
        print(f"✅ Deleted {deleted_sessions} session(s)")

        # 4. Delete test users ONLY
        deleted_users = 0
        for test_user in test_users:
            db.delete(test_user)
            deleted_users += 1
            print(f"✅ Deleted test user: {test_user.username}")

        # Commit all deletions
        db.commit()

        print()
        print("=" * 70)
        print("🎉 PRODUCTION CLEANUP COMPLETED!")
        print("=" * 70)
        print()

        # Show final state
        remaining_users = db.query(User).all()
        print("📊 Final database state:")
        print(f"   Users: {len(remaining_users)}")
        for u in remaining_users:
            print(f"     ✅ {u.username} ({u.email}) - {u.role}")
        print(f"   Sessions: {db.query(SessionModel).count()}")
        print(f"   Participants: {db.query(SessionParticipant).count()}")
        print(f"   Exercise scores: {db.query(ExerciseScore).count()}")
        print()
        print("✅ Database is ready for PRODUCTION deployment!")
        print("🚀 Next steps:")
        print("   1. Configure production environment variables")
        print("   2. Deploy to VPS with docker-compose")
        print("   3. Set up SSL/HTTPS with Let's Encrypt")
        print()

    except Exception as e:
        db.rollback()
        print(f"❌ Error during cleanup: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    prepare_production()
