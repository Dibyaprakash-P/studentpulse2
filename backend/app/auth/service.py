"""
Student Pulse — Auth Service
Business logic for authentication and user management.
"""

import uuid
import random
import string
from datetime import datetime, timezone
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import User, ParentStudentLink
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token


async def register_user(db: AsyncSession, email: str, password: str, full_name: str, role: str) -> User:
    """Register a new user."""
    # Check if user already exists
    result = await db.execute(select(User).where(User.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        raise ValueError("Email already registered")

    user = User(
        email=email,
        password_hash=hash_password(password),
        full_name=full_name,
        role=role,
    )
    db.add(user)
    await db.flush()
    return user


async def authenticate_user(db: AsyncSession, email: str, password: str) -> User:
    """Authenticate a user by email and password."""
    result = await db.execute(select(User).where(User.email == email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        raise ValueError("Invalid email or password")
    return user


async def get_user_by_id(db: AsyncSession, user_id: str) -> User:
    """Get a user by their ID."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise ValueError("User not found")
    return user


def generate_tokens(user: User) -> dict:
    """Generate access and refresh tokens for a user."""
    token_data = {
        "sub": user.id,
        "email": user.email,
        "role": user.role,
        "name": user.full_name,
    }
    return {
        "access_token": create_access_token(token_data),
        "refresh_token": create_refresh_token(token_data),
    }


async def generate_link_code(db: AsyncSession, parent_id: str) -> ParentStudentLink:
    """Generate a unique link code for parent-student linking."""
    code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
    link = ParentStudentLink(
        parent_id=parent_id,
        link_code=code,
        status="pending",
    )
    db.add(link)
    await db.flush()
    return link


async def approve_parent_link(db: AsyncSession, student_id: str, link_code: str) -> ParentStudentLink:
    """Student approves a parent link request."""
    result = await db.execute(
        select(ParentStudentLink).where(
            ParentStudentLink.link_code == link_code,
            ParentStudentLink.status == "pending",
        )
    )
    link = result.scalar_one_or_none()
    if not link:
        raise ValueError("Invalid or expired link code")

    link.student_id = student_id
    link.status = "approved"
    link.approved_at = datetime.now(timezone.utc)
    await db.flush()
    return link


async def get_linked_students(db: AsyncSession, parent_id: str) -> list:
    """Get all students linked to a parent."""
    result = await db.execute(
        select(ParentStudentLink).where(
            ParentStudentLink.parent_id == parent_id,
            ParentStudentLink.status == "approved",
        )
    )
    links = result.scalars().all()
    student_ids = [link.student_id for link in links]

    if not student_ids:
        return []

    result = await db.execute(select(User).where(User.id.in_(student_ids)))
    return result.scalars().all()
