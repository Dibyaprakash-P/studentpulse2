"""
Student Pulse — Auth Schemas
Pydantic models for request/response validation.
"""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# --- Request Schemas ---

class UserRegister(BaseModel):
    """Schema for user registration."""
    email: str = Field(..., min_length=5, max_length=100)
    password: str = Field(..., min_length=6, max_length=100)
    full_name: str = Field(..., min_length=2, max_length=100)
    role: str = Field(default="student", pattern="^(student|parent|admin)$")


class UserLogin(BaseModel):
    """Schema for user login."""
    email: str
    password: str


class LinkParentRequest(BaseModel):
    """Schema for parent to generate a link code."""
    pass


class ApproveLinkRequest(BaseModel):
    """Schema for student to approve parent link."""
    link_code: str


# --- Response Schemas ---

class UserResponse(BaseModel):
    """Schema for user data in responses."""
    id: str
    email: str
    full_name: str
    role: str
    avatar_url: Optional[str] = None
    xp_points: int = 0
    level: int = 1
    current_streak: int = 0
    longest_streak: int = 0
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """Schema for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class LinkCodeResponse(BaseModel):
    """Schema for parent link code response."""
    link_code: str
    status: str
    message: str
