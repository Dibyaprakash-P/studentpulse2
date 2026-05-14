"""
Student Pulse — Auth Models
SQLAlchemy models for users and parent-student links.
"""

import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from app.core.database import Base


class User(Base):
    """User model for students, parents, and admins."""
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(Enum("student", "parent", "admin", name="user_role"), nullable=False, default="student")
    avatar_url = Column(String, nullable=True)
    xp_points = Column(Integer, default=0)
    level = Column(Integer, default=1)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    last_activity_date = Column(String, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationships
    activities = relationship("DailyActivity", back_populates="user", lazy="dynamic")
    predictions = relationship("BurnoutPrediction", back_populates="user", lazy="dynamic")
    badges = relationship("UserBadge", back_populates="user", lazy="dynamic")


class ParentStudentLink(Base):
    """Model for linking parent accounts to student accounts."""
    __tablename__ = "parent_student_links"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    parent_id = Column(String, ForeignKey("users.id"), nullable=False)
    student_id = Column(String, ForeignKey("users.id"), nullable=True)
    link_code = Column(String, unique=True, nullable=False)
    status = Column(Enum("pending", "approved", "rejected", name="link_status"), default="pending")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    approved_at = Column(DateTime, nullable=True)

    # Relationships
    parent = relationship("User", foreign_keys=[parent_id])
    student = relationship("User", foreign_keys=[student_id])
