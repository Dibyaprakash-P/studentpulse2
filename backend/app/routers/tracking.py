"""
Tracking router — Log daily activities and retrieve history.
"""

from datetime import date as date_type

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.activity import Activity
from app.models.user import User

router = APIRouter(prefix="/api/tracking", tags=["tracking"])


class LogActivityRequest(BaseModel):
    activity_date: str
    sleep_hours: float = 0
    study_hours: float = 0
    gaming_hours: float = 0
    screen_time_hours: float = 0
    physical_activity_mins: int = 0
    stress_level: int = 5
    energy_level: int = 5
    mood_level: int = 5
    water_intake_glasses: int = 0
    social_interaction: int = 5
    attendance_pct: float = 0


def activity_to_dict(a: Activity) -> dict:
    return {
        "id": a.id,
        "user_id": a.user_id,
        "activity_date": a.activity_date.isoformat(),
        "sleep_hours": a.sleep_hours,
        "study_hours": a.study_hours,
        "gaming_hours": a.gaming_hours,
        "screen_time_hours": a.screen_time_hours,
        "physical_activity_mins": a.physical_activity_mins,
        "stress_level": a.stress_level,
        "energy_level": a.energy_level,
        "mood_level": a.mood_level,
        "water_intake_glasses": a.water_intake_glasses,
        "social_interaction": a.social_interaction,
        "attendance_pct": a.attendance_pct,
        "logged_at": a.logged_at.isoformat() if a.logged_at else None,
    }


@router.post("/log")
async def log_activity(
    req: LogActivityRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    activity_date = date_type.fromisoformat(req.activity_date)

    # Remove existing entry for same user + date (upsert behavior)
    await db.execute(
        delete(Activity).where(
            Activity.user_id == user.id,
            Activity.activity_date == activity_date,
        )
    )

    activity = Activity(
        user_id=user.id,
        activity_date=activity_date,
        sleep_hours=req.sleep_hours,
        study_hours=req.study_hours,
        gaming_hours=req.gaming_hours,
        screen_time_hours=req.screen_time_hours,
        physical_activity_mins=req.physical_activity_mins,
        stress_level=req.stress_level,
        energy_level=req.energy_level,
        mood_level=req.mood_level,
        water_intake_glasses=req.water_intake_glasses,
        social_interaction=req.social_interaction,
        attendance_pct=req.attendance_pct,
    )

    db.add(activity)
    await db.commit()
    await db.refresh(activity)

    return activity_to_dict(activity)


@router.get("/activities")
async def get_activities(
    limit: int = 7,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Activity)
        .where(Activity.user_id == user.id)
        .order_by(Activity.activity_date.desc())
        .limit(limit)
    )
    activities = result.scalars().all()
    return [activity_to_dict(a) for a in activities]
