"""
Student Pulse — FastAPI Application Entry Point
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import create_tables
from app.auth.router import router as auth_router
from app.tracking.router import router as tracking_router
from app.analytics.router import router as analytics_router
from app.ml.router import router as ml_router
from app.gamification.router import router as gamification_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    await create_tables()
    # Initialize gamification badges
    from app.core.database import async_session_factory
    from app.gamification.service import initialize_badges
    async with async_session_factory() as session:
        await initialize_badges(session)
    yield
    # Shutdown (cleanup if needed)


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="AI-Powered Student Burnout & Lifestyle Analytics Platform",
    lifespan=lifespan,
)

# CORS middleware — allow all origins so desktop/mobile apps from any
# device or network can reach this backend.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth_router)
app.include_router(tracking_router)
app.include_router(analytics_router)
app.include_router(ml_router)
app.include_router(gamification_router)


@app.get("/")
async def root():
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "message": "Track. Analyze. Improve.",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}
