from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime



# User Schemas
class UserBase(BaseModel):
    email: str = Field(..., description="User email address")
    user_name: str = Field(..., max_length=30, description="Username")
    role: Optional[str] = Field(None, description="User role")


class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="User password (minimum 6 characters)")


class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")


class UserResponse(UserBase):
    id: int
    is_active: bool
    create_datetime: datetime

    uuid: Optional[str] = None

    class Config:
        from_attributes = True


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class LoginResponse(BaseModel):
    user_id: int
    user_name: str
    email: str


    class Config:
        from_attributes = True


class ResetPasswordRequest(BaseModel):
    email: str = Field(..., description="User email address for password reset")


class ResetPasswordConfirm(BaseModel):
    token: str = Field(..., description="Password reset token")
    password: str = Field(..., min_length=6, description="New password (minimum 6 characters)")

 