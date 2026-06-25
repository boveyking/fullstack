"""Authentication and authorization dependencies for FastAPI endpoints"""
from fastapi import Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models.model import User
from models import crud


async def get_current_user(
    x_user_id: Optional[str] = Header(None, alias="X-User-ID"),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """Get current user from X-User-ID header"""
    if not x_user_id:
        return None
    
    try:
        user_id = int(x_user_id)
        user = crud.get_user(db, user_id)
        if user and user.is_active:
            return user
    except (ValueError, TypeError):
        pass
    
    return None


async def require_auth(
    current_user: User = Depends(get_current_user)
) -> User:
    """Require authenticated user"""
    if not current_user:
        raise HTTPException(
            status_code=401,
            detail="Authentication required"
        )
    return current_user


def require_role(*allowed_roles: str):
    """Factory function to create a dependency that requires specific roles"""
    async def role_checker(
        current_user: User = Depends(require_auth)
    ) -> User:
        user_role = current_user.role or 'user'
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required role: {', '.join(allowed_roles)}"
            )
        return current_user
    
    return role_checker

