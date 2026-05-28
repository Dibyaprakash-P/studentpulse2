"""
Student Pulse API — Main Application Entry Point
─────────────────────────────────────────────────
FastAPI backend with PostgreSQL for multi-user data storage.

Run:  uvicorn app.main:app --reload
Docs: http://localhost:8000/docs
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import create_tables
from app.routers import analytics, auth, gamification, parent, tracking


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables on startup."""
    await create_tables()
    yield


app = FastAPI(
    title="Student Pulse API",
    description="AI-Powered Student Burnout & Lifestyle Analytics — Backend",
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS — allow the Next.js frontend to access the API ────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to your frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount all routers ──────────────────────────────────────────
app.include_router(auth.router)
app.include_router(tracking.router)
app.include_router(analytics.router)
app.include_router(gamification.router)
app.include_router(parent.router)


@app.get("/")
async def root():
    return {
        "message": "Student Pulse API v2.0",
        "status": "running",
        "docs": "/docs",
    }
