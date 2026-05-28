"""
Student Pulse — Async Database Engine (PostgreSQL via asyncpg)
"""

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase

from app.core.config import settings

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_size=5,
    max_overflow=10,
)

async_session = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


class Base(DeclarativeBase):
    """Base class for all SQLAlchemy models."""
    pass


async def get_db():
    """FastAPI dependency — yields an async database session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


async def create_tables():
    """Create all tables on startup (safe for existing tables)."""
    # Import all models so Base.metadata knows about them
    import app.models.user       # noqa: F401
    import app.models.activity   # noqa: F401
    import app.models.prediction # noqa: F401
    import app.models.link_code  # noqa: F401

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
