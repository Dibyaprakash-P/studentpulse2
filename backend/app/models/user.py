"""User model — stores student and parent accounts."""

from sqlalchemy import Column, Integer, String, DateTime, Date
from sqlalchemy.sql import func

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, unique=True, nullable=False, index=True)
    full_name = Column(String, nullable=False, default="Student")
    hashed_password = Column(String, nullable=True)  # Nullable for Google OAuth users
    role = Column(String, nullable=False, default="student")  # "student" | "parent"
    gender = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    relation = Column(String, nullable=True)  # For parents: "Father" | "Mother" | "Other"
    google_id = Column(String, nullable=True)
    picture = Column(String, nullable=True)
    level = Column(Integer, default=1)
    xp_points = Column(Integer, default=0)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
