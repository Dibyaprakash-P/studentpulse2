"""
Student Pulse — Tracking Models
SQLAlchemy models for daily activity tracking and burnout predictions.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Date, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class DailyActivity(Base):
    """Model for daily student activity tracking."""
    __tablename__ = "daily_activities"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    activity_date = Column(String, nullable=False, index=True)  # YYYY-MM-DD format

    # Core metrics
    sleep_hours = Column(Float, default=0)
    study_hours = Column(Float, default=0)
    gaming_hours = Column(Float, default=0)
    assignment_workload = Column(Integer, default=5)  # 1-10 scale
    attendance_pct = Column(Float, default=100)  # 0-100
    screen_time_hours = Column(Float, default=0)
    water_intake_glasses = Column(Integer, default=0)

    # Subjective metrics (1-10 scale)
    social_interaction = Column(Integer, default=5)
    mood_level = Column(Integer, default=5)
    stress_level = Column(Integer, default=5)
    energy_level = Column(Integer, default=5)

    # Physical activity
    physical_activity_mins = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="activities")


class BurnoutPrediction(Base):
    """Model for storing burnout predictions."""
    __tablename__ = "burnout_predictions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    prediction_date = Column(String, nullable=False)

    burnout_percentage = Column(Float, nullable=False)
    risk_level = Column(String, nullable=False)  # low, moderate, high
    contributing_factors = Column(JSON, nullable=True)
    recommendations = Column(JSON, nullable=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    user = relationship("User", back_populates="predictions")
