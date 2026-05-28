"""
Parent router — Link code generation, student linking, and monitoring.
"""

import secrets

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.link_code import LinkCode
from app.models.user import User

router = APIRouter(prefix="/api/parent", tags=["parent"])


class ApproveCodeRequest(BaseModel):
    link_code: str


@router.post("/generate-code")
async def generate_link_code(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    code = secrets.token_hex(4).upper()

    link = LinkCode(code=code, parent_id=user.id)
    db.add(link)
    await db.commit()

    return {"link_code": code, "message": "Share this code with your student."}


@router.post("/approve-code")
async def approve_link_code(
    req: ApproveCodeRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LinkCode).where(LinkCode.code == req.link_code.upper())
    )
    link = result.scalar_one_or_none()

    if not link:
        raise HTTPException(400, "Invalid link code.")

    link.student_id = user.id
    await db.commit()

    return {"message": "Successfully linked!"}


@router.get("/linked-students")
async def get_linked_students(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(LinkCode).where(
            LinkCode.parent_id == user.id,
            LinkCode.student_id.isnot(None),
        )
    )
    links = result.scalars().all()

    students = []
    for link in links:
        student_result = await db.execute(
            select(User).where(User.id == link.student_id)
        )
        student = student_result.scalar_one_or_none()
        if student:
            students.append(
                {
                    "id": student.id,
                    "full_name": student.full_name,
                    "level": student.level,
                    "xp_points": student.xp_points,
                    "current_streak": student.current_streak,
                }
            )

    return students
