"""
Student Pulse — Admin Seed CLI
───────────────────────────────
Creates the initial admin account in the database.

Usage:
    python seed_admin.py                          # Interactive prompts
    python seed_admin.py --email admin@sp.com     # With flags
    python seed_admin.py --email admin@sp.com --password Admin123! --name "Admin"

This script is idempotent — if the email already exists, it updates the
existing user's role to "admin" instead of creating a duplicate.
"""

import argparse
import asyncio
import getpass
import sys

from sqlalchemy import select

# Ensure the backend package is importable
sys.path.insert(0, ".")

from app.core.database import async_session, create_tables
from app.core.security import hash_password
from app.models.user import User


async def seed_admin(email: str, password: str, full_name: str) -> None:
    """Create or promote an admin user."""
    await create_tables()

    async with async_session() as db:
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()

        if user:
            if user.role == "admin":
                print(f"✅ Admin account already exists: {email}")
                return
            # Promote existing user to admin
            user.role = "admin"
            await db.commit()
            print(f"⬆️  Promoted existing user to admin: {email}")
        else:
            # Create new admin user
            user = User(
                email=email,
                full_name=full_name,
                hashed_password=hash_password(password),
                role="admin",
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"🎉 Admin account created successfully!")
            print(f"   Email:  {email}")
            print(f"   Name:   {full_name}")
            print(f"   Role:   admin")
            print(f"   ID:     {user.id}")

    print("\n🔑 You can now log in at /api/auth/login with these credentials.")


def main():
    parser = argparse.ArgumentParser(
        description="Create or promote an admin account for Student Pulse",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python seed_admin.py
  python seed_admin.py --email admin@studentpulse.com --password SecurePass123!
  python seed_admin.py --email admin@studentpulse.com --name "Platform Admin"
        """,
    )
    parser.add_argument("--email", help="Admin email address")
    parser.add_argument("--password", help="Admin password (min 6 chars)")
    parser.add_argument("--name", default="Admin", help="Admin display name (default: Admin)")

    args = parser.parse_args()

    # Interactive prompts if flags not provided
    email = args.email
    if not email:
        email = input("📧 Admin email: ").strip()
        if not email:
            print("❌ Email is required.")
            sys.exit(1)

    password = args.password
    if not password:
        password = getpass.getpass("🔒 Admin password (min 6 chars): ")
        if len(password) < 6:
            print("❌ Password must be at least 6 characters.")
            sys.exit(1)

    full_name = args.name

    print(f"\n{'═' * 45}")
    print(f"  Student Pulse — Admin Seed")
    print(f"{'═' * 45}")
    print(f"  Email: {email}")
    print(f"  Name:  {full_name}")
    print(f"{'═' * 45}\n")

    asyncio.run(seed_admin(email, password, full_name))


if __name__ == "__main__":
    main()
