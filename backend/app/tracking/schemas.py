"""
Student Pulse — Tracking Schemas
Pydantic models for activity tracking request/response.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class ActivityCreate(BaseModel):
    """Schema for creating a daily activity log."""
    activity_date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$")
    sleep_hours: float = Field(default=0, ge=0, le=24)
    study_hours: float = Field(default=0, ge=0, le=24)
    gaming_hours: float = Field(default=0, ge=0, le=24)
    assignment_workload: int = Field(default=5, ge=1, le=10)
    attendance_pct: float = Field(default=100, ge=0, le=100)
    screen_time_hours: float = Field(default=0, ge=0, le=24)
    water_intake_glasses: int = Field(default=0, ge=0, le=30)
    social_interaction: int = Field(default=5, ge=1, le=10)
    mood_level: int = Field(default=5, ge=1, le=10)
    stress_level: int = Field(default=5, ge=1, le=10)
    energy_level: int = Field(default=5, ge=1, le=10)
    physical_activity_mins: int = Field(default=0, ge=0, le=480)


class ActivityResponse(BaseModel):
    """Schema for activity response."""
    id: str
    user_id: str
    activity_date: str
    sleep_hours: float
    study_hours: float
    gaming_hours: float
    assignment_workload: int
    attendance_pct: float
    screen_time_hours: float
    water_intake_glasses: int
    social_interaction: int
    mood_level: int
    stress_level: int
    energy_level: int
    physical_activity_mins: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class BurnoutPredictionResponse(BaseModel):
    """Schema for burnout prediction response."""
    burnout_percentage: float
    risk_level: str
    contributing_factors: list
    recommendations: list
    prediction_date: str

    class Config:
        from_attributes = True


class WeeklyReport(BaseModel):
    """Schema for weekly analytics report."""
    avg_sleep: float
    avg_study: float
    avg_gaming: float
    avg_mood: float
    avg_stress: float
    avg_energy: float
    productivity_score: float
    consistency_score: float
    burnout_trend: List[float]
    days_logged: int
