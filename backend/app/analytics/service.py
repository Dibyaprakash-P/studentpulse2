"""
Student Pulse — Analytics Service
Aggregation and trend computation for student data.
"""

from datetime import datetime, timedelta
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.tracking.models import DailyActivity, BurnoutPrediction


async def get_weekly_summary(db: AsyncSession, user_id: str) -> dict:
    """Compute weekly summary statistics."""
    today = datetime.now().strftime("%Y-%m-%d")
    week_ago = (datetime.now() - timedelta(days=7)).strftime("%Y-%m-%d")

    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.user_id == user_id,
            DailyActivity.activity_date >= week_ago,
            DailyActivity.activity_date <= today,
        ).order_by(DailyActivity.activity_date.asc())
    )
    activities = result.scalars().all()

    if not activities:
        return {
            "avg_sleep": 0, "avg_study": 0, "avg_gaming": 0,
            "avg_mood": 0, "avg_stress": 0, "avg_energy": 0,
            "productivity_score": 0, "consistency_score": 0,
            "burnout_trend": [], "days_logged": 0,
            "daily_data": [],
        }

    n = len(activities)
    avg_sleep = sum(a.sleep_hours for a in activities) / n
    avg_study = sum(a.study_hours for a in activities) / n
    avg_gaming = sum(a.gaming_hours for a in activities) / n
    avg_mood = sum(a.mood_level for a in activities) / n
    avg_stress = sum(a.stress_level for a in activities) / n
    avg_energy = sum(a.energy_level for a in activities) / n
    avg_attendance = sum(a.attendance_pct for a in activities) / n

    # Productivity score = weighted combination
    productivity_score = min(100, (
        (avg_study / 8) * 30 +                    # Study hours (max 8h optimal)
        (avg_sleep / 8) * 25 +                     # Sleep quality (8h optimal)
        (avg_attendance / 100) * 20 +               # Attendance
        ((10 - avg_stress) / 10) * 15 +            # Low stress bonus
        (avg_mood / 10) * 10                        # Mood bonus
    ))

    # Consistency score = how many days logged out of 7
    consistency_score = (n / 7) * 100

    # Daily data for charts
    daily_data = []
    for a in activities:
        daily_data.append({
            "date": a.activity_date,
            "sleep": a.sleep_hours,
            "study": a.study_hours,
            "gaming": a.gaming_hours,
            "mood": a.mood_level,
            "stress": a.stress_level,
            "energy": a.energy_level,
            "productivity": min(100, (
                (a.study_hours / 8) * 30 +
                (a.sleep_hours / 8) * 25 +
                (a.attendance_pct / 100) * 20 +
                ((10 - a.stress_level) / 10) * 15 +
                (a.mood_level / 10) * 10
            )),
        })

    return {
        "avg_sleep": round(avg_sleep, 1),
        "avg_study": round(avg_study, 1),
        "avg_gaming": round(avg_gaming, 1),
        "avg_mood": round(avg_mood, 1),
        "avg_stress": round(avg_stress, 1),
        "avg_energy": round(avg_energy, 1),
        "avg_attendance": round(avg_attendance, 1),
        "productivity_score": round(productivity_score, 1),
        "consistency_score": round(consistency_score, 1),
        "days_logged": n,
        "daily_data": daily_data,
    }


async def get_monthly_trends(db: AsyncSession, user_id: str) -> dict:
    """Compute monthly trend data."""
    today = datetime.now().strftime("%Y-%m-%d")
    month_ago = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.user_id == user_id,
            DailyActivity.activity_date >= month_ago,
            DailyActivity.activity_date <= today,
        ).order_by(DailyActivity.activity_date.asc())
    )
    activities = result.scalars().all()

    # Burnout predictions for the period
    pred_result = await db.execute(
        select(BurnoutPrediction).where(
            BurnoutPrediction.user_id == user_id,
            BurnoutPrediction.prediction_date >= month_ago,
            BurnoutPrediction.prediction_date <= today,
        ).order_by(BurnoutPrediction.prediction_date.asc())
    )
    predictions = pred_result.scalars().all()

    daily_data = []
    for a in activities:
        daily_data.append({
            "date": a.activity_date,
            "sleep": a.sleep_hours,
            "study": a.study_hours,
            "gaming": a.gaming_hours,
            "mood": a.mood_level,
            "stress": a.stress_level,
            "energy": a.energy_level,
            "attendance": a.attendance_pct,
            "physical_activity": a.physical_activity_mins,
        })

    burnout_data = []
    for p in predictions:
        burnout_data.append({
            "date": p.prediction_date,
            "burnout_pct": p.burnout_percentage,
            "risk_level": p.risk_level,
        })

    return {
        "daily_data": daily_data,
        "burnout_data": burnout_data,
        "total_days": len(activities),
    }


async def get_student_summary_for_parent(db: AsyncSession, student_id: str) -> dict:
    """Get a summary of student data for parent viewing."""
    weekly = await get_weekly_summary(db, student_id)

    # Get latest burnout prediction
    pred_result = await db.execute(
        select(BurnoutPrediction)
        .where(BurnoutPrediction.user_id == student_id)
        .order_by(BurnoutPrediction.prediction_date.desc())
        .limit(1)
    )
    latest_prediction = pred_result.scalar_one_or_none()

    return {
        "weekly_summary": weekly,
        "latest_burnout": {
            "percentage": latest_prediction.burnout_percentage if latest_prediction else 0,
            "risk_level": latest_prediction.risk_level if latest_prediction else "unknown",
            "date": latest_prediction.prediction_date if latest_prediction else None,
        } if latest_prediction else None,
    }
