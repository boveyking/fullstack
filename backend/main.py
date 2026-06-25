from fastapi import FastAPI, Depends, HTTPException, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from dotenv import load_dotenv
from urllib.parse import quote
from datetime import datetime
import os
import logging
import asyncio
from database import init_db, get_db

from models.model import  User
from models.schema import (
    
    UserCreate,
    UserLogin,
    LoginResponse,
    UserListResponse,
    ResetPasswordRequest,
    ResetPasswordConfirm,
    
)
from models import crud
 
from services.depends_on import get_current_user, require_auth, require_role
 
from pydantic import BaseModel

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Set boto3 and botocore loggers to WARNING level to reduce verbosity
logging.getLogger('boto3').setLevel(logging.WARNING)
logging.getLogger('botocore').setLevel(logging.WARNING)
logging.getLogger('botocore.hooks').setLevel(logging.WARNING)
logging.getLogger('botocore.auth').setLevel(logging.WARNING)
logging.getLogger('botocore.parsers').setLevel(logging.WARNING)
logging.getLogger('botocore.retryhandler').setLevel(logging.WARNING)
logging.getLogger('botocore.regions').setLevel(logging.WARNING)
logging.getLogger('botocore.endpoint').setLevel(logging.WARNING)
logging.getLogger('botocore.httpsession').setLevel(logging.WARNING)
logging.getLogger('urllib3').setLevel(logging.WARNING)

logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()
static_assets_dir = "/app/static/assets"
is_production = os.path.exists("/app")  # Check if we're in Docker/production
if is_production:
    if os.path.exists(static_assets_dir) and os.path.isdir(static_assets_dir):
        app.mount("/assets", StaticFiles(directory=static_assets_dir), name="static")
    else:
        logger.warning(f"Static assets directory not found at {static_assets_dir}. Frontend assets will not be served.")
else:
    logger.debug("Running in dev mode - static files served by Vite dev server on port 3000")



app = FastAPI(title="Demo API")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


""" @app.get("/")
async def root():
    return {"message": "Demo API"} """

@app.get("/api/health")
async def health_check():
    return {"status": "healthy @" + str(datetime.now())}

   
class EnvVariableUpdate(BaseModel):
    region: str
    name: str
    value: str


class PingRequest(BaseModel):
    domain: str
    webbase: str

  
@app.post("/api/auth/login", response_model=LoginResponse)
async def login(
    credentials: UserLogin,
    db: Session = Depends(get_db)
):
    """Login user"""
    logger.info(f"Login attempt for email: {credentials.email}")
    user = crud.authenticate_user(db, credentials.email, credentials.password)
    if not user:
        logger.warning(f"Authentication failed for email: {credentials.email} - Incorrect email or password")
        raise HTTPException(
            status_code=401,
            detail="Incorrect email or password"
        )
    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )
    return LoginResponse(
        user_id=int(user.id),
        user_name=str(user.user_name),
        email=str(user.email),
        ref_code=user.ref_code,
        role=user.role,
        plan_id=int(user.plan_id) if user.plan_id is not None else -1
    )


@app.post("/api/auth/logout", status_code=200)
async def logout():
    """Logout user (client-side session management)"""
    return {"message": "Successfully logged out"}


@app.post("/api/auth/verify/{token}", status_code=200)
async def verify_user(
    token: str,
    db: Session = Depends(get_db)
):
    """Verify user email with token"""
    try:
        success = crud.verify_user_by_token(db, token)
        if success:
            return {"message": "Email verified successfully"}
        else:
            raise HTTPException(
                status_code=400,
                detail="No valide verification request"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying user: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to verify user: {str(e)}"
        )


@app.post("/api/auth/reset-password", status_code=200)
async def request_password_reset(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):
    """Request password reset for a user by email"""
    try:
        # Validate email format
        if not request.email or '@' not in request.email:
            raise HTTPException(
                status_code=400,
                detail="Invalid email format"
            )
        
        # Request password reset (always returns True for security)
        crud.request_password_reset(db, request.email)
        
        # Always return success message (don't reveal if email exists)
        return {"message": "If this email is found, we will send a password reset email"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error requesting password reset: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to process password reset request: {str(e)}"
        )


@app.post("/api/auth/reset-password/confirm", status_code=200)
async def confirm_password_reset(
    request: ResetPasswordConfirm,
    db: Session = Depends(get_db)
):
    """Confirm password reset with token and new password"""
    try:
        success = crud.reset_password_by_token(db, request.token, request.password)
        if success:
            return {"message": "Password reset successfully"}
        else:
            raise HTTPException(
                status_code=400,
                detail="Invalid request token"
            )
    except ValueError as e:
        logger.warning(f"Validation error during password reset: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error resetting password: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to reset password: {str(e)}"
        )


# User Management endpoints
@app.get("/api/users", response_model=UserListResponse)
async def get_users(
    page: int = Query(1, ge=1, description="Page number (starts from 1)"),
    page_size: int = Query(10, ge=1, le=100, description="Number of users per page"),
    email: Optional[str] = Query(None, description="Filter by email (partial match)"),
    uuid: Optional[str] = Query(None, description="Filter by UUID (partial match)"),
    _current_user: User = Depends(require_role("god")),
    db: Session = Depends(get_db)
):
    """Get all users with pagination and filters (requires god role)"""
    try:
        logger.info(f"Fetching users - page: {page}, page_size: {page_size}, email filter: {email}, uuid filter: {uuid}")
        result = crud.list_users(
            db=db,
            page=page,
            page_size=page_size,
            email=email,
            uuid=uuid
        )
        return UserListResponse(**result)
    except Exception as e:
        logger.error(f"Error fetching users: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch users: {str(e)}"
        )

# Catch-all route for SPA (Single Page Application)
# This MUST be the last route defined to avoid intercepting API calls
@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    """
    Serve static files and handle SPA routing.
    This route catches all unmatched paths and serves the frontend.
    Must be defined last to ensure API routes are matched first.
    Only active in production/Docker mode.
    """
    # If API call, let it bubble up (handled by other routes or 404)
    if full_path.startswith("api/"):
        raise HTTPException(status_code=404, detail="API endpoint not found")
    
    # Only serve static files in production/Docker mode
    if not is_production:
        raise HTTPException(status_code=404, detail="Not found (dev mode - frontend runs on port 3000)")
    
    # Check if file exists in static directory
    static_file_path = os.path.join("/app/static", full_path)
    if os.path.isfile(static_file_path):
        return FileResponse(static_file_path)

    # Otherwise return index.html for SPA routing
    index_path = "/app/static/index.html"
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    return {"message": "Frontend not found (is the static directory populated?)"}

 