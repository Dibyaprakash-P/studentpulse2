"""
Gamification router — XP, levels, badges, and streaks.
Port of the client-side gamification engine to server-side Python.
"""

from datetime import date as date_type

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.activity import Activity
from app.models.prediction import Prediction
from app.models.user import User

router = APIRouter(prefix="/api/gamification", tags=["gamification"])

ALL_BADGES = [
    {"name": "First Log", "description": "Log your first daily activity", "icon": "🎯", "category": "milestone", "xp_reward": 50},
    {"name": "3-Day Streak", "description": "Log 3 days in a row", "icon": "🔥", "category": "streak", "xp_reward": 100},
    {"name": "7-Day Streak", "description": "Log 7 days in a row", "icon": "💪", "category": "streak", "xp_reward": 250},
    {"name": "30-Day Streak", "description": "Log 30 days in a row", "icon": "🏅", "category": "streak", "xp_reward": 1000},
    {"name": "Focus Master", "description": "Study 6+ hours in a single day", "icon": "🧠", "category": "productivity", "xp_reward": 150},
    {"name": "Healthy Sleep", "description": "Get 8+ hours of sleep", "icon": "😴", "category": "wellness", "xp_reward": 100},
    {"name": "Zen Mode", "description": "Achieve stress level ≤ 2", "icon": "🧘", "category": "wellness", "xp_reward": 150},
    {"name": "Active Life", "description": "Exercise 60+ minutes", "icon": "🏃", "category": "fitness", "xp_reward": 100},
    {"name": "Hydration Hero", "description": "Drink 10+ glasses of water", "icon": "💧", "category": "wellness", "xp_reward": 75},
    {"name": "Social Butterfly", "description": "Social interaction ≥ 8", "icon": "🦋", "category": "social", "xp_reward": 100},
    {"name": "Perfect Attendance", "description": "100% attendance", "icon": "📋", "category": "academic", "xp_reward": 200},
    {"name": "Low Burnout Pro", "description": "Burnout risk below 15%", "icon": "🛡️", "category": "wellness", "xp_reward": 200},
]


@router.get("/profile")
async def get_gamification_profile(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Get all activities for this user
    result = await db.execute(
        select(Activity)
        .where(Activity.user_id == user.id)
        .order_by(Activity.activity_date.asc())
    )
    activities = result.scalars().all()

    # Get predictions
    pred_result = await db.execute(
        select(Prediction).where(Prediction.user_id == user.id)
    )
    predictions = pred_result.scalars().all()

    total_logs = len(activities)
    earned: list[str] = []

    # ── Check badges ────────────────────────────────────────────
    if total_logs >= 1:
        earned.append("First Log")
    if any(a.study_hours >= 6 for a in activities):
        earned.append("Focus Master")
    if any(a.sleep_hours >= 8 for a in activities):
        earned.append("Healthy Sleep")
    if any(a.stress_level <= 2 for a in activities):
        earned.append("Zen Mode")
    if any(a.physical_activity_mins >= 60 for a in activities):
        earned.append("Active Life")
    if any(a.water_intake_glasses >= 10 for a in activities):
        earned.append("Hydration Hero")
    if any(a.social_interaction >= 8 for a in activities):
        earned.append("Social Butterfly")
    if any(a.attendance_pct >= 100 for a in activities):
        earned.append("Perfect Attendance")
    if any(p.burnout_percentage < 15 for p in predictions):
        earned.append("Low Burnout Pro")

    # ── Streak calculation ──────────────────────────────────────
    streak = 0
    longest_streak = 0
    temp_streak = 0
    dates = sorted(set(a.activity_date for a in activities))

    for i, d in enumerate(dates):
        if i == 0:
            temp_streak = 1
        else:
            diff = (d - dates[i - 1]).days
            temp_streak = temp_streak + 1 if diff == 1 else 1
        longest_streak = max(longest_streak, temp_streak)

    if dates:
        today = date_type.today()
        diff = (today - dates[-1]).days
        if diff <= 1:
            streak = temp_streak
            if streak >= 3:
                earned.append("3-Day Streak")
            if streak >= 7:
                earned.append("7-Day Streak")
            if streak >= 30:
                earned.append("30-Day Streak")

    # ── XP and level computation ────────────────────────────────
    earned_badges = [b for b in ALL_BADGES if b["name"] in earned]
    xp = sum(b["xp_reward"] for b in earned_badges) + total_logs * 25
    level = xp // 500 + 1
    xp_in_level = xp % 500
    progress_pct = (xp_in_level / 500) * 100

    # Update user stats in DB
    user.level = level
    user.xp_points = xp
    user.current_streak = streak
    user.longest_streak = longest_streak
    await db.commit()

    return {
        "xp_points": xp,
        "level": level,
        "level_progress_pct": round(progress_pct),
        "xp_to_next_level": 500 - xp_in_level,
        "current_streak": streak,
        "longest_streak": longest_streak,
        "total_badges_earned": len(earned_badges),
        "total_badges_available": len(ALL_BADGES),
        "earned_badges": earned_badges,
        "all_badges": ALL_BADGES,
    }
