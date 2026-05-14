"""
Student Pulse — Tracking Service
Business logic for daily activity tracking.
"""

from datetime import datetime, timedelta, timezone
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.tracking.models import DailyActivity, BurnoutPrediction


async def create_activity(db: AsyncSession, user_id: str, data: dict) -> DailyActivity:
    """Create or update a daily activity log."""
    # Check if activity exists for this date
    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.user_id == user_id,
            DailyActivity.activity_date == data["activity_date"],
        )
    )
    existing = result.scalar_one_or_none()

    if existing:
        # Update existing
        for key, value in data.items():
            setattr(existing, key, value)
        await db.flush()
        return existing
    else:
        activity = DailyActivity(user_id=user_id, **data)
        db.add(activity)
        await db.flush()
        return activity


async def get_activities(
    db: AsyncSession, user_id: str, start_date: str = None, end_date: str = None, limit: int = 30
) -> list:
    """Get activity logs for a user within a date range."""
    query = select(DailyActivity).where(DailyActivity.user_id == user_id)

    if start_date:
        query = query.where(DailyActivity.activity_date >= start_date)
    if end_date:
        query = query.where(DailyActivity.activity_date <= end_date)

    query = query.order_by(DailyActivity.activity_date.desc()).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


async def get_activity_by_date(db: AsyncSession, user_id: str, date: str) -> DailyActivity:
    """Get activity for a specific date."""
    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.user_id == user_id,
            DailyActivity.activity_date == date,
        )
    )
    return result.scalar_one_or_none()


async def save_prediction(db: AsyncSession, user_id: str, prediction: dict) -> BurnoutPrediction:
    """Save a burnout prediction result."""
    pred = BurnoutPrediction(
        user_id=user_id,
        prediction_date=prediction["prediction_date"],
        burnout_percentage=prediction["burnout_percentage"],
        risk_level=prediction["risk_level"],
        contributing_factors=prediction["contributing_factors"],
        recommendations=prediction["recommendations"],
    )
    db.add(pred)
    await db.flush()
    return pred


async def get_prediction_history(db: AsyncSession, user_id: str, limit: int = 30) -> list:
    """Get burnout prediction history."""
    result = await db.execute(
        select(BurnoutPrediction)
        .where(BurnoutPrediction.user_id == user_id)
        .order_by(BurnoutPrediction.prediction_date.desc())
        .limit(limit)
    )
    return result.scalars().all()
