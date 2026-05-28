"""Activity model — daily lifestyle tracking entries."""

from sqlalchemy import Column, Integer, Float, DateTime, Date, ForeignKey
from sqlalchemy.sql import func

from app.core.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_date = Column(Date, nullable=False)
    sleep_hours = Column(Float, default=0)
    study_hours = Column(Float, default=0)
    gaming_hours = Column(Float, default=0)
    screen_time_hours = Column(Float, default=0)
    physical_activity_mins = Column(Integer, default=0)
    stress_level = Column(Integer, default=5)
    energy_level = Column(Integer, default=5)
    mood_level = Column(Integer, default=5)
    water_intake_glasses = Column(Integer, default=0)
    social_interaction = Column(Integer, default=5)
    attendance_pct = Column(Float, default=0)
    logged_at = Column(DateTime(timezone=True), server_default=func.now())
