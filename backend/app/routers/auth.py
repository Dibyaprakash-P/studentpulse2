"""
Authentication router — Register, Login, Google OAuth, Get Profile.
"""

from datetime import date as date_type
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


# ── Request schemas ─────────────────────────────────────────────
class RegisterRequest(BaseModel):
    email: str
    password: str
    full_name: str = "Student"
    role: str = "student"
    gender: Optional[str] = None
    date_of_birth: Optional[str] = None
    relation: Optional[str] = None


class LoginRequest(BaseModel):
    email: str
    password: str
    remember_me: bool = False


class GoogleLoginRequest(BaseModel):
    email: str
    full_name: str
    google_id: str
    picture: Optional[str] = None
    role: str = "student"


# ── Helpers ─────────────────────────────────────────────────────
def user_to_dict(user: User) -> dict:
    """Convert a User ORM object to a JSON-safe dictionary."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "gender": user.gender,
        "google_id": user.google_id,
        "picture": user.picture,
        "level": user.level,
        "xp_points": user.xp_points,
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── Endpoints ───────────────────────────────────────────────────
@router.post("/register")
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    # Check if email already taken
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(400, "An account with this email already exists.")

    if not req.password or len(req.password) < 6:
        raise HTTPException(400, "Password must be at least 6 characters.")

    # Validate role — only known roles are accepted
    valid_roles = {"student", "parent", "admin"}
    if req.role not in valid_roles:
        raise HTTPException(400, f"Invalid role. Must be one of: {', '.join(sorted(valid_roles))}")

    user = User(
        email=req.email,
        full_name=req.full_name,
        hashed_password=hash_password(req.password),
        role=req.role,
        gender=req.gender,
        relation=req.relation,
    )

    if req.date_of_birth:
        try:
            user.date_of_birth = date_type.fromisoformat(req.date_of_birth)
        except ValueError:
            pass

    db.add(user)
    await db.commit()
    await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "refresh_token": token,
        "user": user_to_dict(user),
    }


@router.post("/login")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(400, "No account found with this email. Please sign up first.")

    if not user.hashed_password:
        raise HTTPException(
            400, "This account uses Google Sign-In. Please log in with Google."
        )

    if not verify_password(req.password, user.hashed_password):
        raise HTTPException(400, "Incorrect password. Please try again.")

    # 30 days if remember_me, else default
    expire_minutes = 43200 if req.remember_me else None
    token = create_access_token({"sub": str(user.id)}, expire_minutes=expire_minutes)
    return {
        "access_token": token,
        "refresh_token": token,
        "user": user_to_dict(user),
    }


@router.post("/google")
async def google_login(req: GoogleLoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    user = result.scalar_one_or_none()

    if user:
        # Existing user — update Google info
        user.google_id = req.google_id
        if req.picture:
            user.picture = req.picture
        if req.full_name:
            user.full_name = req.full_name
        await db.commit()
        await db.refresh(user)
    else:
        # New user via Google
        user = User(
            email=req.email,
            full_name=req.full_name,
            role=req.role,
            google_id=req.google_id,
            picture=req.picture,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return {
        "access_token": token,
        "refresh_token": token,
        "user": user_to_dict(user),
    }


@router.get("/me")
async def get_me(user: User = Depends(get_current_user)):
    return user_to_dict(user)
