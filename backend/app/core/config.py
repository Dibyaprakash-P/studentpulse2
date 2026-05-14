"""
Student Pulse — Application Configuration
Manages environment variables and application settings using pydantic-settings.
"""

from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # Application
    APP_NAME: str = "Student Pulse"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database — supports both SQLite (local) and PostgreSQL (cloud).
    # Render.com provides DATABASE_URL starting with "postgres://..."
    # which we auto-convert to the async-compatible driver.
    DATABASE_URL: str = "sqlite+aiosqlite:///./student_pulse.db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "student-pulse-super-secret-key-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 30

    # CORS
    CORS_ORIGINS: str = "*"

    # ML Model
    ML_MODEL_PATH: str = "app/ml/model.pkl"

    @property
    def async_database_url(self) -> str:
        """Convert DATABASE_URL to an async-compatible URL."""
        url = self.DATABASE_URL
        # Render/Heroku use 'postgres://' but SQLAlchemy needs 'postgresql://'
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        return url

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
