import sys
from pathlib import Path

# Ensure the backend directory is in sys.path so sibling modules can be imported
_backend_dir = str(Path(__file__).resolve().parent)
if _backend_dir not in sys.path:
    sys.path.insert(0, _backend_dir)

from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from dotenv import load_dotenv
import logging
from database import init_db, get_db
 
from models.schema import (
    UserRegisterRequest,
    UserRegisterResponse,
    OrgDataByTokenResponse,
    OrganizationsPaginatedResponse,
    OrganizationStatusUpdate,
    OrganizationResponse,
    UsersPaginatedResponse,
    LoginRequest,
    LoginResponse,
    InviteRequest,
    InviteResponse,
    VerifyResponse,
    UserInfoResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    ResetPasswordWithTokenRequest,
    ResetPasswordWithTokenResponse
)
from models import crud

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Define frontend dist path for static file serving
frontend_dist = Path(__file__).parent.parent / "frontend" / "dist"

app = FastAPI(title="Demo API")

@app.on_event("startup")
async def startup_event():
    """Initialize database on startup"""
    init_db()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "*"  # In production, replace with your actual domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Serve frontend index.html for root route"""
    index_path = frontend_dist / "index.html"
    if index_path.exists():
        return FileResponse(index_path)
    # Fallback for development/testing
    return {"message": "Backend API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}

 
@app.post("/api/register", response_model=UserRegisterResponse, status_code=201)
async def register_user(
    request: UserRegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new user with organization and address"""
    try:
        return crud.register_user(db, request)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error in register_user: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to register user: {str(e)}")


@app.get("/api/organization/token/{token}", response_model=OrgDataByTokenResponse)
async def get_organization_by_token(
    token: str,
    db: Session = Depends(get_db)
):
    """Get organization data by token for pre-populating registration form"""
    try:
        return crud.get_org_by_token(db, token)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error in get_organization_by_token: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve organization: {str(e)}")


@app.post("/api/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """Authenticate a user by username/email and password"""
    try:
        response = crud.authenticate_user(db, request)
        # Always return LoginResponse, even for failures
        # Frontend will check response.code and response.result
        return response
    except Exception as e:
        logger.error(f"Error in login: {str(e)}", exc_info=True)
        return LoginResponse(
            code=500,
            result=False,
            message=f"Failed to authenticate user: {str(e)}",
            user_data=None
        )


@app.get("/api/organizations", response_model=OrganizationsPaginatedResponse)
async def get_organizations(
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    length: int = Query(10, ge=1, le=100, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get paginated organizations regardless of status and is_active"""
    try:
        organizations, total = crud.get_all_organizations(db, offset=offset, limit=length)
        # FastAPI will automatically convert Organization models to OrganizationResponse
        # using Pydantic's from_attributes=True
        return OrganizationsPaginatedResponse(
            items=organizations,  # type: ignore
            total=total,
            offset=offset,
            limit=length
        )
    except Exception as e:
        logger.error(f"Error in get_organizations: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch organizations: {str(e)}")


@app.patch("/api/organizations/{org_id}/status", response_model=OrganizationResponse)
async def update_organization_status(
    org_id: int,
    request: OrganizationStatusUpdate,
    db: Session = Depends(get_db)
):
    """Update organization status"""
    try:
        organization = crud.update_organization_status(db, org_id, request.status)
        return organization  # type: ignore
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error in update_organization_status: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update organization status: {str(e)}")


@app.get("/api/users", response_model=UsersPaginatedResponse)
async def get_users(
    offset: int = Query(0, ge=0, description="Number of records to skip"),
    length: int = Query(10, ge=1, le=100, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get paginated users with organization name"""
    try:
        users, total = crud.get_all_users(db, offset=offset, limit=length)
        return UsersPaginatedResponse(
            items=users,  # type: ignore
            total=total,
            offset=offset,
            limit=length
        )
    except Exception as e:
        logger.error(f"Error in get_users: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch users: {str(e)}")


@app.post("/api/invite", response_model=InviteResponse)
async def invite_user(
    request: InviteRequest,
    db: Session = Depends(get_db)
):
    """
    Send an invitation to a user to join an organization
    
    Workflow:
    1. Validate organization exists
    2. Create invitation record (to be implemented)
    3. Send invitation notification (to be implemented)
    """
    try:
        response = crud.invite_user(db, request)
        return response
    except Exception as e:
        logger.error(f"Error in invite_user: {str(e)}", exc_info=True)
        return InviteResponse(
            code=500,
            result=False,
            message=f"Failed to send invitation: {str(e)}",
            invite_id=None
        )


@app.get("/api/verify/{token}", response_model=VerifyResponse)
async def verify_invitation(
    token: str,
    db: Session = Depends(get_db)
):
    """
    Verify an invitation token
    
    Workflow:
    1. Check if token exists in tbl_invitation
    2. If exists and is_active=True: update is_active to False and return success
    3. If exists and is_active=False: return "invitation already accepted"
    4. If doesn't exist: return "invalid invitation code"
    """
    try:
        response = crud.verify_invitation(db, token)
        return response
    except Exception as e:
        logger.error(f"Error in verify_invitation: {str(e)}", exc_info=True)
        return VerifyResponse(
            code=500,
            result=False,
            message=f"Failed to verify invitation: {str(e)}",
            email=None,
            organization=None
        )


@app.get("/api/user/{user_id}", response_model=UserInfoResponse)
async def get_user_info(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get user information including organization and address details"""
    try:
        return crud.get_user_info(db, user_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        logger.error(f"Error in get_user_info: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to retrieve user information: {str(e)}")


@app.post("/api/reset-password/request", response_model=PasswordResetResponse)
async def request_password_reset(
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request a password reset email"""
    try:
        response = crud.request_password_reset(db, request)
        return response
    except Exception as e:
        logger.error(f"Error in request_password_reset: {str(e)}", exc_info=True)
        return PasswordResetResponse(
            code=500,
            result=False,
            message=f"Failed to process password reset request: {str(e)}"
        )


@app.post("/api/reset-password", response_model=ResetPasswordWithTokenResponse)
async def reset_password_with_token(
    request: ResetPasswordWithTokenRequest,
    db: Session = Depends(get_db)
):
    """Reset password using a reset token"""
    try:
        response = crud.reset_password_with_token(db, request)
        return response
    except Exception as e:
        logger.error(f"Error in reset_password_with_token: {str(e)}", exc_info=True)
        return ResetPasswordWithTokenResponse(
            code=500,
            result=False,
            message=f"Failed to reset password: {str(e)}"
        )


# Serve static files from frontend build
# Check if frontend dist directory exists (for Docker deployment)
if frontend_dist.exists():
    # Mount static files (JS, CSS, images, etc.)
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")
    
    # Only mount /img if the directory exists
    img_dir = frontend_dist / "img"
    if img_dir.exists():
        app.mount("/img", StaticFiles(directory=str(img_dir)), name="images")

  
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        """Serve frontend for all non-API routes (SPA fallback)"""
        # Skip API routes
        if full_path.startswith("api/"):
            raise HTTPException(status_code=404, detail="Not found")
        
        # Try to serve the requested file
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        
        # Otherwise, serve index.html (for React Router)
        index_path = frontend_dist / "index.html"
        if index_path.exists():
            return FileResponse(index_path)
        
        raise HTTPException(status_code=404, detail="Not found")
