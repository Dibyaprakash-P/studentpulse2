"""
Student Pulse — Tracking Router
API endpoints for daily activity tracking.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, List
from app.core.database import get_db
from app.core.security import get_current_user
from app.tracking import schemas, service

router = APIRouter(prefix="/tracking", tags=["Activity Tracking"])


@router.post("/activities", response_model=schemas.ActivityResponse, status_code=status.HTTP_201_CREATED)
async def log_activity(
    data: schemas.ActivityCreate,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Log daily activity (creates or updates for the date)."""
    activity = await service.create_activity(db, current_user["user_id"], data.model_dump())
    return schemas.ActivityResponse.model_validate(activity)


@router.get("/activities", response_model=List[schemas.ActivityResponse])
async def get_activities(
    start_date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    end_date: Optional[str] = Query(None, pattern=r"^\d{4}-\d{2}-\d{2}$"),
    limit: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get activity logs for the current user."""
    activities = await service.get_activities(db, current_user["user_id"], start_date, end_date, limit)
    return [schemas.ActivityResponse.model_validate(a) for a in activities]


@router.get("/activities/{date}", response_model=Optional[schemas.ActivityResponse])
async def get_activity_by_date(
    date: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get activity for a specific date."""
    activity = await service.get_activity_by_date(db, current_user["user_id"], date)
    if not activity:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No activity found for this date")
    return schemas.ActivityResponse.model_validate(activity)


@router.get("/predictions", response_model=List[schemas.BurnoutPredictionResponse])
async def get_prediction_history(
    limit: int = Query(30, ge=1, le=365),
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get burnout prediction history."""
    predictions = await service.get_prediction_history(db, current_user["user_id"], limit)
    return [schemas.BurnoutPredictionResponse.model_validate(p) for p in predictions]
