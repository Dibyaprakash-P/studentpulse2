"""Prediction model — burnout prediction results."""

from sqlalchemy import Column, Integer, Float, String, DateTime, Date, ForeignKey, JSON
from sqlalchemy.sql import func

from app.core.database import Base


class Prediction(Base):
    __tablename__ = "predictions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False)
    burnout_percentage = Column(Float, default=0)
    risk_level = Column(String, default="unknown")
    contributing_factors = Column(JSON, default=list)
    recommendations = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
