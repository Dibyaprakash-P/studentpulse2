"""
Student Pulse — Gamification Service
XP, streaks, badges, and level progression.
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.auth.models import User
from app.gamification.models import Badge, UserBadge
from app.tracking.models import DailyActivity

# XP rewards
XP_DAILY_LOG = 25
XP_STREAK_BONUS = 10  # per streak day
XP_BADGE_EARN = 50

# Level thresholds
LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000]

# Default badges
DEFAULT_BADGES = [
    {"name": "First Log", "description": "Logged your first daily activity", "icon": "🌟", "category": "milestone", "xp_reward": 50},
    {"name": "3-Day Streak", "description": "Logged activities for 3 consecutive days", "icon": "🔥", "category": "streak", "xp_reward": 75},
    {"name": "7-Day Streak", "description": "One full week of consistency!", "icon": "💪", "category": "streak", "xp_reward": 150},
    {"name": "30-Day Streak", "description": "A whole month of dedication!", "icon": "👑", "category": "streak", "xp_reward": 500},
    {"name": "Focus Master", "description": "Studied 6+ hours in a day", "icon": "📚", "category": "productivity", "xp_reward": 100},
    {"name": "Healthy Sleep", "description": "Got 7-9 hours of sleep for 5 consecutive days", "icon": "😴", "category": "wellness", "xp_reward": 120},
    {"name": "Zen Mode", "description": "Maintained stress below 3 for a week", "icon": "🧘", "category": "wellness", "xp_reward": 150},
    {"name": "Active Life", "description": "30+ minutes of physical activity for 7 days", "icon": "🏃", "category": "fitness", "xp_reward": 130},
    {"name": "Hydration Hero", "description": "Drank 8+ glasses of water for 5 days", "icon": "💧", "category": "wellness", "xp_reward": 80},
    {"name": "Social Butterfly", "description": "High social interaction for a week", "icon": "🦋", "category": "social", "xp_reward": 100},
    {"name": "Perfect Attendance", "description": "100% attendance for a week", "icon": "✅", "category": "academic", "xp_reward": 200},
    {"name": "Low Burnout Pro", "description": "Maintained low burnout for 2 weeks", "icon": "🛡️", "category": "wellness", "xp_reward": 300},
]


def calculate_level(xp: int) -> int:
    for i, threshold in enumerate(LEVEL_THRESHOLDS):
        if xp < threshold:
            return i
    return len(LEVEL_THRESHOLDS)


async def initialize_badges(db: AsyncSession):
    """Create default badges if they don't exist."""
    for badge_data in DEFAULT_BADGES:
        result = await db.execute(select(Badge).where(Badge.name == badge_data["name"]))
        if not result.scalar_one_or_none():
            db.add(Badge(**badge_data))
    await db.commit()


async def award_xp(db: AsyncSession, user_id: str, xp_amount: int):
    """Award XP to a user and update their level."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user:
        user.xp_points += xp_amount
        user.level = calculate_level(user.xp_points)
        await db.flush()


async def update_streak(db: AsyncSession, user_id: str, activity_date: str):
    """Update user streak based on activity logging."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return

    if user.last_activity_date:
        last = datetime.strptime(user.last_activity_date, "%Y-%m-%d")
        current = datetime.strptime(activity_date, "%Y-%m-%d")
        diff = (current - last).days

        if diff == 1:
            user.current_streak += 1
        elif diff > 1:
            user.current_streak = 1
    else:
        user.current_streak = 1

    user.last_activity_date = activity_date
    user.longest_streak = max(user.longest_streak, user.current_streak)
    await db.flush()


async def check_and_award_badges(db: AsyncSession, user_id: str):
    """Check badge conditions and award new badges."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        return []

    earned_result = await db.execute(
        select(UserBadge.badge_id).where(UserBadge.user_id == user_id)
    )
    earned_ids = set(r[0] for r in earned_result.all())

    all_badges_result = await db.execute(select(Badge))
    all_badges = {b.name: b for b in all_badges_result.scalars().all()}
    newly_earned = []

    # First Log
    if "First Log" in all_badges and all_badges["First Log"].id not in earned_ids:
        count_result = await db.execute(
            select(func.count()).select_from(DailyActivity).where(DailyActivity.user_id == user_id)
        )
        if count_result.scalar() >= 1:
            newly_earned.append(all_badges["First Log"])

    # Streak badges
    for streak_name, streak_days in [("3-Day Streak", 3), ("7-Day Streak", 7), ("30-Day Streak", 30)]:
        if streak_name in all_badges and all_badges[streak_name].id not in earned_ids:
            if user.current_streak >= streak_days:
                newly_earned.append(all_badges[streak_name])

    # Award new badges
    for badge in newly_earned:
        db.add(UserBadge(user_id=user_id, badge_id=badge.id))
        await award_xp(db, user_id, badge.xp_reward)
        earned_ids.add(badge.id)

    await db.flush()
    return [{"name": b.name, "icon": b.icon, "description": b.description} for b in newly_earned]


async def get_user_gamification(db: AsyncSession, user_id: str) -> dict:
    """Get complete gamification data for a user."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()

    earned_result = await db.execute(
        select(UserBadge, Badge).join(Badge).where(UserBadge.user_id == user_id)
    )
    earned_badges = [
        {"name": b.name, "icon": b.icon, "description": b.description, "category": b.category,
         "earned_at": str(ub.earned_at)}
        for ub, b in earned_result.all()
    ]

    all_badges_result = await db.execute(select(Badge))
    all_badges = [
        {"name": b.name, "icon": b.icon, "description": b.description, "category": b.category, "xp_reward": b.xp_reward}
        for b in all_badges_result.scalars().all()
    ]

    current_level = user.level if user else 1
    current_xp = user.xp_points if user else 0
    next_level_xp = LEVEL_THRESHOLDS[current_level] if current_level < len(LEVEL_THRESHOLDS) else LEVEL_THRESHOLDS[-1]
    prev_level_xp = LEVEL_THRESHOLDS[current_level - 1] if current_level > 0 else 0

    return {
        "xp_points": current_xp,
        "level": current_level,
        "current_streak": user.current_streak if user else 0,
        "longest_streak": user.longest_streak if user else 0,
        "xp_to_next_level": next_level_xp - current_xp,
        "level_progress_pct": round(((current_xp - prev_level_xp) / max(1, next_level_xp - prev_level_xp)) * 100, 1),
        "earned_badges": earned_badges,
        "all_badges": all_badges,
        "total_badges_earned": len(earned_badges),
        "total_badges_available": len(all_badges),
    }
