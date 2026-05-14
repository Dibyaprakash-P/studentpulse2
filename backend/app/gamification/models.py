"""
Student Pulse — Gamification Models
Badges, XP, and streak tracking.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Badge(Base):
    __tablename__ = "badges"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String, nullable=False)
    icon = Column(String, nullable=False)
    category = Column(String, nullable=False)
    xp_reward = Column(Integer, default=50)


class UserBadge(Base):
    __tablename__ = "user_badges"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    badge_id = Column(String, ForeignKey("badges.id"), nullable=False)
    earned_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    user = relationship("User", back_populates="badges")
    badge = relationship("Badge")
