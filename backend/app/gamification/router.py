"""
Student Pulse — Gamification Router
API endpoints for XP, badges, and streaks.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.gamification import service

router = APIRouter(prefix="/gamification", tags=["Gamification"])


@router.get("/profile")
async def get_gamification_profile(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get gamification profile (XP, level, streaks, badges)."""
    return await service.get_user_gamification(db, current_user["user_id"])
