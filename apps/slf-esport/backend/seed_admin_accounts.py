"""
Seed admin accounts (Manager & Coach)
This script can be run in development and production.
"""

from app.core.database import SessionLocal
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Admin accounts configuration
ADMIN_ACCOUNTS = [
    {
        "email": "gautierlandrysodart@gmail.com",
        "username": "Le-Blond",
        "password": "PasswordLSLF123@",
        "full_name": "Gautier-Landry Sodart",
        "role": UserRole.MANAGER,
        "bio": "Créateur et Manager de La Salade de Fruits E-Sport. Passionné d'eSport et de développement d'équipe.",
        "is_active": True,
        "is_verified": True,
    },
    {
        "email": "jaygonc@gmail.com",
        "username": "The-Ermite",
        "password": "LifeisLove177.",
        "full_name": "Jaypee Goncalves",
        "role": UserRole.COACH,
        "bio": "Coach et Entraîneur principal de La Salade de Fruits E-Sport. Spécialisé en coaching holistique et performance gaming.",
        "is_active": True,
        "is_verified": True,
    },
]


def seed_admin_accounts():
    """Create admin accounts (Manager & Coach)"""
    db = SessionLocal()

    try:
        print("🔑 Creating admin accounts...\n")

        created_count = 0
        updated_count = 0

        for account_data in ADMIN_ACCOUNTS:
            # Check if user already exists
            existing = db.query(User).filter(
                User.email == account_data["email"]
            ).first()

            if existing:
                print(f"⚠️  User {account_data['username']} already exists")

                # Update password and role (in case they changed)
                existing.hashed_password = get_password_hash(account_data["password"])
                existing.role = account_data["role"]
                existing.full_name = account_data["full_name"]
                existing.bio = account_data["bio"]
                existing.is_active = account_data["is_active"]
                existing.is_verified = account_data["is_verified"]
                existing.moral_contract_accepted = True  # Staff auto-accepts contract

                updated_count += 1
                print(f"✅ Updated: {account_data['username']} ({account_data['role'].value})")
            else:
                # Create new user
                user = User(
                    email=account_data["email"],
                    username=account_data["username"],
                    hashed_password=get_password_hash(account_data["password"]),
                    full_name=account_data["full_name"],
                    role=account_data["role"],
                    bio=account_data["bio"],
                    is_active=account_data["is_active"],
                    is_verified=account_data["is_verified"],
                    moral_contract_accepted=True,  # Staff auto-accepts contract
                )
                db.add(user)
                created_count += 1
                print(f"✅ Created: {account_data['username']} ({account_data['role'].value})")
                print(f"   Email: {account_data['email']}")
                print(f"   Role: {account_data['role'].value}")
                print()

        db.commit()

        print(f"\n🎉 Admin accounts setup completed!")
        print(f"   Created: {created_count}")
        print(f"   Updated: {updated_count}")

        # Show summary
        print(f"\n📊 Total users in database: {db.query(User).count()}")
        print("\n🔐 Login credentials:")
        print("=" * 60)
        for account in ADMIN_ACCOUNTS:
            print(f"\n{account['role'].value.upper()} - {account['full_name']}")
            print(f"   Username: {account['username']}")
            print(f"   Email: {account['email']}")
            print(f"   Password: {account['password']}")
        print("\n" + "=" * 60)

        print("\n⚠️  IMPORTANT: Change these passwords after first login!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("=" * 60)
    print("ADMIN ACCOUNTS SEED SCRIPT")
    print("La Salade de Fruits E-Sport")
    print("=" * 60)
    print()
    seed_admin_accounts()
