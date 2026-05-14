"""
Student Pulse — Analytics Router
API endpoints for analytics and reporting.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.analytics import service as analytics_service
from app.auth import service as auth_service

router = APIRouter(prefix="/analytics", tags=["Analytics"])


@router.get("/weekly-summary")
async def get_weekly_summary(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get weekly analytics summary for the current student."""
    return await analytics_service.get_weekly_summary(db, current_user["user_id"])


@router.get("/monthly-trends")
async def get_monthly_trends(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get monthly trend data for charts."""
    return await analytics_service.get_monthly_trends(db, current_user["user_id"])


@router.get("/parent/student-summary/{student_id}")
async def get_student_summary(
    student_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get student summary for a linked parent."""
    if current_user["role"] != "parent":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Parents only")

    # Verify parent-student link
    students = await auth_service.get_linked_students(db, current_user["user_id"])
    student_ids = [s.id for s in students]
    if student_id not in student_ids:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Student not linked")

    return await analytics_service.get_student_summary_for_parent(db, student_id)
