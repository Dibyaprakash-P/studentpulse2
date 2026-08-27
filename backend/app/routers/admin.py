"""
Admin router — Platform administration endpoints.
Protected by RBAC — only users with role="admin" can access.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func, delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_admin
from app.models.activity import Activity
from app.models.prediction import Prediction
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["admin"])


def user_to_dict(user: User) -> dict:
    """Convert a User ORM object to a JSON-safe dictionary."""
    return {
        "id": user.id,
        "email": user.email,
        "full_name": user.full_name,
        "role": user.role,
        "gender": user.gender,
        "google_id": user.google_id,
        "picture": user.picture,
        "level": user.level,
        "xp_points": user.xp_points,
        "current_streak": user.current_streak,
        "longest_streak": user.longest_streak,
        "created_at": user.created_at.isoformat() if user.created_at else None,
    }


# ── List all users (paginated) ─────────────────────────────────
@router.get("/users")
async def list_users(
    skip: int = 0,
    limit: int = 50,
    role: str = None,
    user: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    query = select(User).order_by(User.id.asc()).offset(skip).limit(limit)
    if role:
        query = query.where(User.role == role)

    result = await db.execute(query)
    users = result.scalars().all()

    # Get total count
    count_query = select(func.count(User.id))
    if role:
        count_query = count_query.where(User.role == role)
    total = (await db.execute(count_query)).scalar()

    return {
        "users": [user_to_dict(u) for u in users],
        "total": total,
        "skip": skip,
        "limit": limit,
    }


# ── Get specific user details ──────────────────────────────────
@router.get("/users/{user_id}")
async def get_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")

    # Include activity and prediction counts
    activity_count = (
        await db.execute(
            select(func.count(Activity.id)).where(Activity.user_id == user_id)
        )
    ).scalar()

    prediction_count = (
        await db.execute(
            select(func.count(Prediction.id)).where(Prediction.user_id == user_id)
        )
    ).scalar()

    user_data = user_to_dict(user)
    user_data["activity_count"] = activity_count
    user_data["prediction_count"] = prediction_count
    return user_data


# ── Delete a user ──────────────────────────────────────────────
@router.delete("/users/{user_id}")
async def delete_user(
    user_id: int,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(404, "User not found")
    if user.id == admin.id:
        raise HTTPException(400, "Cannot delete your own admin account")

    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
    return {"message": f"User {user.email} deleted successfully"}


# ── Platform-wide statistics ───────────────────────────────────
@router.get("/stats")
async def get_platform_stats(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
):
    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_students = (
        await db.execute(
            select(func.count(User.id)).where(User.role == "student")
        )
    ).scalar()
    total_parents = (
        await db.execute(
            select(func.count(User.id)).where(User.role == "parent")
        )
    ).scalar()
    total_activities = (
        await db.execute(select(func.count(Activity.id)))
    ).scalar()
    total_predictions = (
        await db.execute(select(func.count(Prediction.id)))
    ).scalar()

    return {
        "total_users": total_users,
        "total_students": total_students,
        "total_parents": total_parents,
        "total_admins": total_users - total_students - total_parents,
        "total_activities": total_activities,
        "total_predictions": total_predictions,
    }
