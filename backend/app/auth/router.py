"""
Student Pulse — Auth Router
API endpoints for authentication and user management.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.auth import schemas, service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(data: schemas.UserRegister, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    try:
        user = await service.register_user(db, data.email, data.password, data.full_name, data.role)
        tokens = service.generate_tokens(user)
        return schemas.TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user=schemas.UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/login", response_model=schemas.TokenResponse)
async def login(data: schemas.UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    try:
        user = await service.authenticate_user(db, data.email, data.password)
        tokens = service.generate_tokens(user)
        return schemas.TokenResponse(
            access_token=tokens["access_token"],
            refresh_token=tokens["refresh_token"],
            user=schemas.UserResponse.model_validate(user),
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=schemas.UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get current authenticated user's profile."""
    try:
        user = await service.get_user_by_id(db, current_user["user_id"])
        return schemas.UserResponse.model_validate(user)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))


@router.post("/generate-link-code", response_model=schemas.LinkCodeResponse)
async def generate_link_code(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Generate a link code for parent-student linking (parent only)."""
    if current_user["role"] != "parent":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only parents can generate link codes")
    link = await service.generate_link_code(db, current_user["user_id"])
    return schemas.LinkCodeResponse(
        link_code=link.link_code,
        status=link.status,
        message="Share this code with your child to link accounts",
    )


@router.post("/approve-link")
async def approve_link(
    data: schemas.ApproveLinkRequest,
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Student approves a parent link request."""
    if current_user["role"] != "student":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only students can approve links")
    try:
        link = await service.approve_parent_link(db, current_user["user_id"], data.link_code)
        return {"message": "Parent link approved successfully", "status": link.status}
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/linked-students")
async def get_linked_students(
    current_user: dict = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Get all students linked to the current parent."""
    if current_user["role"] != "parent":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only parents can view linked students")
    students = await service.get_linked_students(db, current_user["user_id"])
    return [schemas.UserResponse.model_validate(s) for s in students]
