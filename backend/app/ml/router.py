"""
Student Pulse — ML Router
API endpoint for burnout prediction.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.tracking.schemas import ActivityCreate
from app.ml.service import predict_burnout
from app.tracking import service as tracking_service

router = APIRouter(prefix="/ml", tags=["Machine Learning"])


@router.post("/predict-burnout")
async def predict(
    data: ActivityCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Predict burnout risk from activity data and save prediction."""
    try:
        prediction = predict_burnout(data.model_dump())
        await tracking_service.save_prediction(db, current_user["user_id"], prediction)
        return prediction
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")


@router.get("/predict-latest")
async def predict_latest(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Predict burnout using the latest logged activity."""
    from datetime import datetime
    today = datetime.now().strftime("%Y-%m-%d")
    activity = await tracking_service.get_activity_by_date(db, current_user["user_id"], today)
    if not activity:
        activities = await tracking_service.get_activities(db, current_user["user_id"], limit=1)
        if not activities:
            raise HTTPException(status_code=404, detail="No activity data found. Log your daily activity first!")
        activity = activities[0]

    activity_dict = {
        "activity_date": activity.activity_date,
        "sleep_hours": activity.sleep_hours,
        "study_hours": activity.study_hours,
        "gaming_hours": activity.gaming_hours,
        "assignment_workload": activity.assignment_workload,
        "attendance_pct": activity.attendance_pct,
        "screen_time_hours": activity.screen_time_hours,
        "water_intake_glasses": activity.water_intake_glasses,
        "social_interaction": activity.social_interaction,
        "mood_level": activity.mood_level,
        "stress_level": activity.stress_level,
        "energy_level": activity.energy_level,
        "physical_activity_mins": activity.physical_activity_mins,
    }
    prediction = predict_burnout(activity_dict)
    await tracking_service.save_prediction(db, current_user["user_id"], prediction)
    return prediction
