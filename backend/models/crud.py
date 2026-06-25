from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
import re
import os
import time
from utils.util import send_verification_email, send_reset_password_email
import bcrypt
from dotenv import load_dotenv
from utils.util import short_uid
from models.model import   User 
from models.schema import (
    
    UserCreate,
    
)
 

load_dotenv()


 
# User CRUD Operations
def get_password_hash(password: str) -> str:
    """Hash a password using bcrypt directly"""
    # Encode password to bytes and hash it
    # bcrypt automatically handles the 72-byte limit by hashing the password
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(password.encode('utf-8'), salt)
    # Return as string for database storage
    return hashed.decode('utf-8')


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash using bcrypt directly"""
    try:
        # Convert hashed_password from string to bytes for bcrypt
        hashed_bytes = hashed_password.encode('utf-8')
        
        # Verify the password
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_bytes)
    except Exception:
        return False


def get_user(db: Session, user_id: int) -> Optional[User]:
    """Get a single user by ID"""
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email address"""
    return db.query(User).filter(User.email == email).first()


def get_user_by_ref_code(db: Session, ref_code: str) -> Optional[User]:
    """Get a user by reference code"""
    return db.query(User).filter(User.ref_code == ref_code).first()


def create_user(db: Session, user: UserCreate) -> User:
    """Create a new user with hashed password"""
    # Validate email format
    if not user.email or '@' not in user.email:
        raise ValueError("Invalid email format")
    
    # Validate username
    if not user.user_name or len(user.user_name.strip()) == 0:
        raise ValueError("Username cannot be empty")
    
    # Validate password
    if not user.password or len(user.password) < 6:
        raise ValueError("Password must be at least 6 characters long")
    
    # Check if user with email already exists
    existing_user = get_user_by_email(db, user.email)
    if existing_user:
        raise ValueError(f"User with email {user.email} already exists")
    
    # Check if username already exists
    existing_username = db.query(User).filter(User.user_name == user.user_name).first()
    if existing_username:
        raise ValueError(f"Username {user.user_name} already exists")
    
    # Hash the password
    try:
        password_hash = get_password_hash(user.password)
    except Exception as e:
        raise ValueError(f"Failed to hash password: {str(e)}")
    
    # Handle referral code if provided
    ref_user_id = None
    if user.ref_code:
        referrer = get_user_by_ref_code(db, user.ref_code)
        if referrer:
            ref_user_id = referrer.id
        # If ref_code doesn't exist, we still allow registration but ref_user_id stays None
    
    # Generate a unique ref_code for the new user (can be used for referrals)
    import uuid
    new_ref_code = str(uuid.uuid4())[:8]  # Generate 8-character ref code
    
    # Create user
    try:
        db_user = User(
            email=user.email.strip().lower(),
            user_name=user.user_name.strip(),
            password_hash=password_hash,
            ref_code=new_ref_code,
            ref_user_id=ref_user_id,
            is_active=False,
            role=user.role if hasattr(user, 'role') and user.role else 'user'
        )
  
       
        
        # Generate a unique verify token for the new user
        verify_token = str(uuid.uuid4())
        db_user.verify_token = verify_token
        #send verify email
        send_verification_email(user.email.strip().lower(), user.user_name.strip(), verify_token)
        
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        
        return db_user
    except Exception as e:
        db.rollback()
        raise ValueError(f"Failed to create user: {str(e)}")


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate a user by email and password"""
    import logging
    logger = logging.getLogger(__name__)
    
    user = get_user_by_email(db, email)
    if not user:
        logger.debug(f"User not found for email: {email}")
        return None
    
    password_valid = verify_password(password, str(user.password_hash))
    if not password_valid:
        logger.debug(f"Password verification failed for email: {email}")
        return None
    
    logger.info(f"Authentication successful for email: {email}")
    return user


def verify_user_by_token(db: Session, token: str) -> bool:
    """Verify user email by token
    
    Args:
        db: Database session
        token: Verification token
        
    Returns:
        True if user was verified successfully, False if token not found
    """
    # Find user by verify_token
    user = db.query(User).filter(User.verify_token == token).first()
    
    if not user:
        return False
    
    # If user is already active, token might have been used already
    # Return True to make it idempotent (already verified is success)
    if user.is_active:
        # Clear the token if it still exists (cleanup)
        if user.verify_token:
            user.verify_token = None
            db.commit()
        return True
    
    # Set user as active and clear verify_token
    user.is_active = True
    user.verify_token = None
    db.commit()
    db.refresh(user)
    
    return True


def list_users(
    db: Session,
    page: int = 1,
    page_size: int = 10,
    email: Optional[str] = None,
    uuid: Optional[str] = None
) -> Dict[str, Any]:
    """List users with pagination and optional filters
    
    Args:
        db: Database session
        page: Page number (starts from 1)
        page_size: Number of users per page
        email: Filter by email (partial match)
        uuid: Filter by UUID (partial match)
        
    Returns:
        Dictionary with users list, total count, and pagination info
    """
    # Build query
    query = db.query(User)
    
    # Apply filters
    if email:
        query = query.filter(User.email.ilike(f"%{email}%"))
    
    if uuid:
        query = query.filter(User.uuid.ilike(f"%{uuid}%"))
    
    # Get total count
    total = query.count()
    
    # Calculate pagination
    total_pages = (total + page_size - 1) // page_size if total > 0 else 1
    offset = (page - 1) * page_size
    
    # Get paginated results
    users = query.offset(offset).limit(page_size).all()
    
    return {
        "users": users,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


def request_password_reset(db: Session, email: str) -> bool:
    """Request password reset for a user by email
    
    Args:
        db: Database session
        email: User email address
        
    Returns:
        True if email was sent (user exists), False otherwise
        Note: Returns True even if user doesn't exist for security (don't reveal if email exists)
    """
    # Find user by email
    user = get_user_by_email(db, email)
    
    if not user:
        # Return True for security - don't reveal if email exists
        return True
    
    # Generate a unique reset token
    import uuid
    reset_token = str(uuid.uuid4())
    
    # Store reset token in verify_token field (can be reused for password reset)
    user.verify_token = reset_token
    db.commit()
    db.refresh(user)
    
    # Send reset password email
    try:
        send_reset_password_email(
            email_to=str(user.email),
            to_name=str(user.user_name),
            reset_token=reset_token
        )
    except Exception as e:
        # Log error but still return True (don't reveal failure)
        import logging
        logging.error(f"Error sending password reset email to {email}: {e}")
    
    return True


def reset_password_by_token(db: Session, token: str, new_password: str) -> bool:
    """Reset user password by token
    
    Args:
        db: Database session
        token: Password reset token (stored in verify_token field)
        new_password: New password to set
        
    Returns:
        True if password was reset successfully, False if token not found
    """
    # Find user by verify_token
    user = db.query(User).filter(User.verify_token == token).first()
    
    if not user:
        return False
    
    # Validate password
    if not new_password or len(new_password) < 6:
        raise ValueError("Password must be at least 6 characters long")
    
    # Hash the new password
    try:
        password_hash = get_password_hash(new_password)
    except Exception as e:
        raise ValueError(f"Failed to hash password: {str(e)}")
    
    # Update password and clear verify_token
    user.password_hash = password_hash
    user.verify_token = None
    db.commit()
    db.refresh(user)
    
    return True

 