"""
Analytics router — Burnout prediction and weekly summary.
Port of the client-side algorithm to server-side Python.
"""

from datetime import date as date_type, timedelta

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.activity import Activity
from app.models.prediction import Prediction
from app.models.user import User

router = APIRouter(prefix="/api/analytics", tags=["analytics"])


class PredictRequest(BaseModel):
    activity_date: str = ""
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


# ── Burnout prediction algorithm (ported from JS) ──────────────
def predict_burnout(d: PredictRequest) -> dict:
    risk = 0
    factors: list[dict] = []
    recs: list[dict] = []

    # Sleep analysis
    if d.sleep_hours < 5:
        risk += 25
        factors.append({"factor": "Very low sleep", "severity": "high", "detail": f"Only {d.sleep_hours}h sleep"})
        recs.append({"icon": "😴", "text": "You're severely sleep-deprived. Aim for at least 7 hours tonight."})
    elif d.sleep_hours < 7:
        risk += 12
        factors.append({"factor": "Low sleep", "severity": "moderate", "detail": f"{d.sleep_hours}h sleep"})
        recs.append({"icon": "🛏️", "text": "Try to get 7-8 hours of sleep for optimal recovery."})

    # Stress analysis
    if d.stress_level >= 8:
        risk += 20
        factors.append({"factor": "High stress", "severity": "high", "detail": f"Stress: {d.stress_level}/10"})
        recs.append({"icon": "🧘", "text": "Your stress is very high. Try 10 minutes of deep breathing or meditation."})
    elif d.stress_level >= 6:
        risk += 10
        factors.append({"factor": "Moderate stress", "severity": "moderate", "detail": f"Stress: {d.stress_level}/10"})

    # Study overload
    if d.study_hours > 10:
        risk += 15
        factors.append({"factor": "Study overload", "severity": "high", "detail": f"{d.study_hours}h studying"})
        recs.append({"icon": "📚", "text": "You're studying excessively. Take regular breaks using the Pomodoro technique."})
    elif d.study_hours > 7:
        risk += 8
        factors.append({"factor": "Heavy study", "severity": "moderate", "detail": f"{d.study_hours}h studying"})

    # Screen time
    if d.screen_time_hours > 10:
        risk += 10
        factors.append({"factor": "Excessive screen time", "severity": "high", "detail": f"{d.screen_time_hours}h screen time"})
        recs.append({"icon": "📱", "text": "Reduce screen time. Take a 5-min break every 30 minutes."})

    # Low energy
    if d.energy_level <= 3:
        risk += 12
        factors.append({"factor": "Low energy", "severity": "high", "detail": f"Energy: {d.energy_level}/10"})
        recs.append({"icon": "⚡", "text": "Your energy is critically low. Eat well, hydrate, and rest."})

    # Low mood
    if d.mood_level <= 3:
        risk += 10
        factors.append({"factor": "Low mood", "severity": "high", "detail": f"Mood: {d.mood_level}/10"})
        recs.append({"icon": "💛", "text": "Your mood is low. Reach out to a friend or do something you enjoy."})

    # Physical activity
    if d.physical_activity_mins < 10:
        risk += 8
        factors.append({"factor": "Sedentary", "severity": "moderate", "detail": f"Only {d.physical_activity_mins}min activity"})
        recs.append({"icon": "🏃", "text": "Try a short 15-minute walk to boost mood and energy."})

    # Hydration
    if d.water_intake_glasses < 4:
        risk += 5
        factors.append({"factor": "Dehydrated", "severity": "moderate", "detail": f"{d.water_intake_glasses} glasses of water"})
        recs.append({"icon": "💧", "text": "Drink at least 8 glasses of water throughout the day."})

    # Gaming balance
    if d.gaming_hours > d.study_hours and d.gaming_hours > 3:
        risk += 8
        factors.append({"factor": "Gaming > Study", "severity": "moderate", "detail": f"Gaming {d.gaming_hours}h vs Study {d.study_hours}h"})
        recs.append({"icon": "🎮", "text": "Balance gaming with study. Set a study-first rule."})

    # Low social
    if d.social_interaction <= 2:
        risk += 5
        factors.append({"factor": "Social isolation", "severity": "moderate", "detail": f"Social: {d.social_interaction}/10"})
        recs.append({"icon": "👥", "text": "Social connections reduce burnout. Chat with a friend or classmate."})

    # Good indicators (reduce risk)
    if d.sleep_hours >= 8 and d.energy_level >= 7:
        risk = max(0, risk - 10)
    if d.mood_level >= 8 and d.stress_level <= 3:
        risk = max(0, risk - 10)
    if d.physical_activity_mins >= 60:
        risk = max(0, risk - 5)

    risk = min(100, max(0, risk))

    if not recs:
        recs.append({"icon": "✅", "text": "Great job! Your habits look healthy. Keep it up!"})

    risk_level = "high" if risk >= 60 else "moderate" if risk >= 35 else "low"
    return {
        "burnout_percentage": risk,
        "risk_level": risk_level,
        "contributing_factors": factors,
        "recommendations": recs,
    }


# ── Endpoints ───────────────────────────────────────────────────
@router.post("/predict")
async def predict(
    req: PredictRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = predict_burnout(req)

    pred_date = (
        date_type.fromisoformat(req.activity_date) if req.activity_date else date_type.today()
    )

    prediction = Prediction(
        user_id=user.id,
        date=pred_date,
        burnout_percentage=result["burnout_percentage"],
        risk_level=result["risk_level"],
        contributing_factors=result["contributing_factors"],
        recommendations=result["recommendations"],
    )
    db.add(prediction)
    await db.commit()

    return result


@router.get("/latest-prediction")
async def get_latest_prediction(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Prediction)
        .where(Prediction.user_id == user.id)
        .order_by(Prediction.created_at.desc())
        .limit(1)
    )
    pred = result.scalar_one_or_none()

    if not pred:
        return {
            "burnout_percentage": 0,
            "risk_level": "unknown",
            "contributing_factors": [],
            "recommendations": [],
        }

    return {
        "burnout_percentage": pred.burnout_percentage,
        "risk_level": pred.risk_level,
        "contributing_factors": pred.contributing_factors,
        "recommendations": pred.recommendations,
    }


@router.get("/weekly-summary")
async def get_weekly_summary(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    week_ago = date_type.today() - timedelta(days=7)

    result = await db.execute(
        select(Activity)
        .where(Activity.user_id == user.id, Activity.activity_date >= week_ago)
        .order_by(Activity.activity_date.asc())
    )
    activities = result.scalars().all()

    if not activities:
        return {
            "days_logged": 0,
            "avg_sleep": 0,
            "avg_study": 0,
            "avg_gaming": 0,
            "productivity_score": 0,
            "consistency_score": 0,
            "daily_data": [],
        }

    n = len(activities)

    def avg_field(attr: str) -> float:
        return round(sum(getattr(a, attr) for a in activities) / n, 1)

    daily_data = []
    for a in activities:
        prod = min(
            100,
            round(
                (a.study_hours / 10) * 30
                + (a.sleep_hours / 8) * 20
                + (a.energy_level / 10) * 15
                + ((10 - a.stress_level) / 10) * 15
                + (a.mood_level / 10) * 10
                + (a.attendance_pct / 100) * 10
            ),
        )
        daily_data.append(
            {
                "date": a.activity_date.isoformat(),
                "productivity": prod,
                "study": a.study_hours,
                "gaming": a.gaming_hours,
                "energy": a.energy_level,
                "stress": a.stress_level,
                "mood": a.mood_level,
            }
        )

    prod_scores = [d["productivity"] for d in daily_data]

    return {
        "days_logged": n,
        "avg_sleep": avg_field("sleep_hours"),
        "avg_study": avg_field("study_hours"),
        "avg_gaming": avg_field("gaming_hours"),
        "productivity_score": round(sum(prod_scores) / len(prod_scores)),
        "consistency_score": round((n / 7) * 100),
        "daily_data": daily_data,
    }
