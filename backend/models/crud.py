from sqlalchemy.orm import Session
from datetime import datetime
import bcrypt
import uuid
import logging
from models.model import  Address, Organization, User
from utils.util import send_activation_email, send_invitation_email, send_reset_password_email
from models.schema import (
    UserRegisterRequest,
    UserRegisterResponse,
    OrgDataByTokenResponse,
    LoginRequest,
    LoginResponse,
    UserData,
    InviteRequest,
    InviteResponse,
    VerifyResponse,
    UserInfoResponse,
    PasswordResetRequest,
    PasswordResetResponse,
    ResetPasswordWithTokenRequest,
    ResetPasswordWithTokenResponse
)


 

# User Registration CRUD Operations
def register_user(db: Session, request: UserRegisterRequest) -> UserRegisterResponse:
    """
    Register a new user with organization and address
    
    Two scenarios based on flag:
    1. flag='invite': Create new address, organization (with token), and user. Send verification email.
    2. flag=<token>: Find organization by token, update information, create user. No email.
    
    Args:
        db: Database session
        request: User registration request
        
    Returns:
        UserRegisterResponse with user_id, org_id, address_id
    """
    print(request)
    try:
        # Hash password using bcrypt
        password_bytes = request.password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Scenario 1: flag='invite' - Create new organization
        if request.flag == 'invite':
            # Step 1: Create address record
            address_record = Address(
                country=request.country,
                city=request.city
            )
            db.add(address_record)
            db.flush()  # Flush to get the ID without committing
            
            # Step 2: Generate UUID token
            token = str(uuid.uuid4())
            
            # Step 3: Create organization record with token and verified=False
            org_record = Organization(
                address_id=address_record.id,
                org_name=request.org_name,
                org_desc=request.intro,
                is_public=request.public,
                status='invited',
                token=token,
                verified=False,
                is_active=False,
                create_datetime=datetime.now(),
                logo=request.logo
            )
            db.add(org_record)
            db.flush()  # Flush to get the ID without committing
            
            # Step 4: Check if user already exists, update or create
            user_record = db.query(User).filter(
                User.email == request.email,
                User.org_id == org_record.id
            ).first()
            
            if user_record:
                # Update existing user
                user_record.user_name = request.username
                user_record.password = hashed_password
                user_record.title = request.title
                user_record.name = request.name
                user_record.alias_name = request.alias
                # Keep existing is_active, role, and create_datetime
            else:
                # Create new user record
                user_record = User(
                    org_id=org_record.id,
                    user_name=request.username,
                    password=hashed_password,
                    is_active=False,
                    role='user',
                    email=request.email,
                    title=request.title,
                    name=request.name,
                    alias_name=request.alias,
                    create_datetime=datetime.now()
                )
                db.add(user_record)
            
            db.commit()
            db.refresh(user_record)
            
            logging.info(f"request.email: {request.email} request.name: {request.name} token: {token}")
            # Step 5: Send verification email
            send_invitation_email(request.email, request.name, token  )
            
            return UserRegisterResponse(
                user_id=user_record.id if user_record else None,
                org_id=org_record.id if org_record else None,
                address_id=address_record.id if address_record else None,
                message="User invitation sent successfully."
            )
        
        # Scenario 2: flag!=invite - Update existing organization by token
        else:
            token = request.flag
            
            # Step 1: Find organization by token
            org_record = db.query(Organization).filter(Organization.token == token).first()
            if not org_record:
                raise ValueError(f"Organization with token {token} not found")
            
            # Step 2: Get or create address record
            if org_record.address_id:
                # Update existing address
                address_record = db.query(Address).filter(Address.id == org_record.address_id).first()
                if address_record:
                    address_record.country = request.country
                    address_record.city = request.city
                else:
                    # Create new address if not found
                    address_record = Address(
                        country=request.country,
                        city=request.city
                    )
                    db.add(address_record)
                    db.flush()
                    org_record.address_id = address_record.id
            else:
                # Create new address
                address_record = Address(
                    country=request.country,
                    city=request.city
                )
                db.add(address_record)
                db.flush()
                org_record.address_id = address_record.id
            
            # Step 3: Update organization information
            org_record.org_name = request.org_name
            org_record.org_desc = request.intro
            org_record.is_public = request.public
            org_record.status = 'pending'
            org_record.verified = True  # Mark as verified when user completes registration
            if request.logo:
                org_record.logo = request.logo
            
            # Step 4: Check if user already exists, update or create
            user_record = db.query(User).filter(
                User.email == request.email,
                User.org_id == org_record.id
            ).first()
            
            if user_record:
                # Update existing user
                user_record.user_name = request.username
                user_record.password = hashed_password
                user_record.title = request.title
                user_record.name = request.name
                user_record.alias_name = request.alias
                # Keep existing is_active, role, and create_datetime
            else:
                # Create new user record
                user_record = User(
                    org_id=org_record.id,
                    user_name=request.username,
                    password=hashed_password,
                    is_active=False,
                    role='user',
                    email=request.email,
                    title=request.title,
                    name=request.name,
                    alias_name=request.alias,
                    create_datetime=datetime.now()
                )
                db.add(user_record)
            
            db.commit()
            db.refresh(user_record)
            
            # No email sending for token-based registration
            
            return UserRegisterResponse(
                user_id=user_record.id,
                org_id=org_record.id,
                address_id=address_record.id if address_record else None,
                message="User registered successfully with existing organization"
            )
            
    except Exception as e:
        db.rollback()
        raise ValueError(f"Failed to register user: {str(e)}")


def get_org_by_token(db: Session, token: str) -> OrgDataByTokenResponse:
    """
    Get organization data by token (from invitation/verification flow)
    
    This retrieves the invitation information stored when an organization was created
    with the 'invite' flag. The token is stored in tbl_organization.token.
    
    Args:
        db: Database session
        token: Organization token (UUID)
        
    Returns:
        OrgDataByTokenResponse with email, organization, city, country, intro
        
    Raises:
        ValueError: If token not found
    """
    try:
        # Query organization by token and join with address
        result = (
            db.query(Organization, Address)
            .outerjoin(Address, Organization.address_id == Address.id)
            .filter(Organization.token == token)
            .first()
        )
        
        if not result:
            raise ValueError(f"Organization with token {token} not found")
        
        org, address = result
        
        # Get user information from the first user associated with this organization (if any)
        user = db.query(User).filter(User.org_id == org.id).first()
        
        return OrgDataByTokenResponse(
            email=user.email if user else "",
            organization=org.org_name or "",
            city=address.city if address else None,
            country=address.country if address else None,
            intro=org.org_desc or None,
            title=user.title if user else None,
            user_name=user.user_name if user else None,
            name=user.name if user else None,
            alias_name=user.alias_name if user else None,
            logo=org.logo if org.logo else None,
            status=org.status if org.status else None
        )
        
    except Exception as e:
        raise ValueError(f"Failed to retrieve organization by token: {str(e)}")


# Organization CRUD Operations
def get_all_organizations(db: Session, offset: int = 0, limit: int = 10) -> tuple[list[Organization], int]:
    """
    Get paginated organizations regardless of status and is_active
    Joins with tbl_address to fetch city information
    
    Args:
        db: Database session
        offset: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        Tuple of (List of Organization records with city attribute, total count)
    """
    total = db.query(Organization).count()
    # Join with Address table to get city information
    organizations = (
        db.query(Organization, Address.city)
        .outerjoin(Address, Organization.address_id == Address.id)
        .order_by(Organization.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    # Attach city to each organization object
    org_list = []
    for org, city in organizations:
        org.city = city  # Add city as an attribute
        org_list.append(org)
    
    return org_list, total


def update_organization_status(db: Session, org_id: int, status: str) -> Organization:
    """
    Update organization status
    Joins with tbl_address to fetch city information
    
    Args:
        db: Database session
        org_id: Organization ID
        status: New status value (e.g., 'active', 'pending')
        
    Returns:
        Updated Organization record with city attribute
        
    Raises:
        ValueError: If organization not found
    """
    org = (
        db.query(Organization, Address.city)
        .outerjoin(Address, Organization.address_id == Address.id)
        .filter(Organization.id == org_id)
        .first()
    )
    if not org:
        raise ValueError(f"Organization with id {org_id} not found")
    
    org_obj, city = org
    org_obj.status = status
    org_obj.city = city  # Add city as an attribute
    
    # Update all users' is_active status based on organization status
    is_active = (status == 'active')
    org_obj.is_active = is_active
    # Retrieve users via the Organization -> User relationship
    users = org_obj.users or []
    print(f"Users: {users}")
    for user in users:
        user.is_active = is_active
        if is_active:
            # Send activation email when organization (and thus user) becomes active
            send_activation_email(user.email, user.name, org_obj.org_name)
    db.commit()
    db.refresh(org_obj)
    return org_obj


# User CRUD Operations
def get_all_users(db: Session, offset: int = 0, limit: int = 10) -> tuple[list[User], int]:
    """
    Get paginated users with organization name
    Joins with tbl_organization to fetch organization name
    
    Args:
        db: Database session
        offset: Number of records to skip
        limit: Maximum number of records to return
        
    Returns:
        Tuple of (List of User records with org_name attribute, total count)
    """
    total = db.query(User).count()
    # Join with Organization table to get organization name
    users = (
        db.query(User, Organization.org_name)
        .outerjoin(Organization, User.org_id == Organization.id)
        .order_by(User.id.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )
    
    # Attach org_name to each user object
    user_list = []
    for user, org_name in users:
        user.org_name = org_name  # Add org_name as an attribute
        user_list.append(user)
    
    return user_list, total


# Authentication CRUD Operations
def authenticate_user(db: Session, request: LoginRequest) -> LoginResponse:
    """
    Authenticate a user by username or email and password
    
    Args:
        db: Database session
        request: Login request with username_or_email and password
        
    Returns:
        LoginResponse with code, result, and message
    """
    try:
        # Check if username_or_email looks like an email (contains @)
        is_email = '@' in request.username_or_email
        
        # Query user by email or username
        if is_email:
            user = db.query(User).filter(User.email == request.username_or_email).first()
        else:
            user = db.query(User).filter(User.user_name == request.username_or_email).first()
        
        # If user not found
        if not user:
            return LoginResponse(
                code=401,
                result=False,
                message="Invalid username/email or password",
                user_data=None
            )
        
        # Check if user is active
        if not user.is_active:
            return LoginResponse(
                code=401,
                result=False,
                message="Account is not active. Please contact administrator.",
                user_data=None
            )
        
        # Verify password
        if not user.password:
            return LoginResponse(
                code=401,
                result=False,
                message="Invalid username/email or password",
                user_data=None
            )
        
        # Check password using bcrypt
        password_bytes = request.password.encode('utf-8')
        stored_password_bytes = user.password.encode('utf-8')
        
        if bcrypt.checkpw(password_bytes, stored_password_bytes):
            # Fetch organization logo if org_id exists
            logo = None
            if user.org_id:
                org = db.query(Organization).filter(Organization.id == user.org_id).first()
                if org and org.logo:
                    logo = org.logo
            
            # Create user_data with user information including organization logo
            user_data = UserData(
                user_id=user.id,
                user_name=user.user_name,
                email=user.email,
                org_id=user.org_id,
                logo=logo
            )
            return LoginResponse(
                code=200,
                result=True,
                message="Login successful",
                user_data=user_data
            )
        else:
            return LoginResponse(
                code=401,
                result=False,
                message="Invalid username/email or password",
                user_data=None
            )
            
    except Exception as e:
        return LoginResponse(
            code=500,
            result=False,
            message=f"Authentication error: {str(e)}",
            user_data=None
        )


# Invite CRUD Operations
def invite_user(db: Session, request: InviteRequest) -> InviteResponse:
    """
    Send an invitation to a user
    
    Workflow:
    1. Find organization by name
    2. Generate token and store in organization.token field
    3. Send invitation email notification
    
    Args:
        db: Database session
        request: Invite request with email and organization
        
    Returns:
        InviteResponse with code, result, message, and optional invite_id
    """
    email = request.email
    organization = request.organization   
    print(f"Inviting user {email} for organization {organization}")
    try:
        # Find organization by name
        org_record = db.query(Organization).filter(Organization.org_name == organization).first()
        if not org_record:
            return InviteResponse(
                code=404,
                result=False,
                message=f"Organization '{organization}' not found",
                invite_id=None
            )
        
        # Generate and store token in organization
        token = str(uuid.uuid4())
        org_record.token = token
        org_record.verified = False
        db.commit()
        db.refresh(org_record)
        
        # Send email to the user with the token
        send_invitation_email(email, organization, token)
        
        return InviteResponse(
            code=200,
            result=True,
            message=f"Invitation sent successfully to {email} for organization {organization}",
            invite_id=org_record.id
        )
        
    except Exception as e:
        db.rollback()
        logging.error(f"Failed to send invitation to {email} for organization {organization}. Error: {str(e)}")
        return InviteResponse(
            code=500,
            result=False,
            message=f"Failed to send invitation to {email} for organization {organization}. Error: {str(e)}",
            invite_id=None
        )


# Verify Invitation CRUD Operations
def verify_invitation(db: Session, token: str) -> VerifyResponse:
    """
    Verify an invitation token
    
    Workflow:
    1. Check if token exists in tbl_organization
    2. If exists and verified=False: update verified to True and return success
    3. If exists and verified=True: return "invitation already accepted"
    4. If doesn't exist: return "invalid invitation code"
    
    Args:
        db: Database session
        token: Invitation token (UUID)
        
    Returns:
        VerifyResponse with code, result, message, email, and organization
    """
    try:
        # Query organization by token
        org_record = db.query(Organization).filter(Organization.token == token).first()
        
        # If organization doesn't exist
        if not org_record:
            return VerifyResponse(
                code=404,
                result=False,
                message="Invalid invitation code",
                email=None,
                organization=None
            )
        
        # Get email from the first user in this organization (if any)
        user = db.query(User).filter(User.org_id == org_record.id).first()
        email = user.email if user else None
        
        # If invitation already accepted (verified=True)
        if org_record.verified:
            return VerifyResponse(
                code=400,
                result=False,
                message="Invitation already accepted",
                email=email,
                organization=org_record.org_name
            )
        
        # If invitation is valid and not yet verified
        # Note: We don't mark as verified here anymore, as that will be done during registration
        # Just return success to allow user to proceed to registration
        
        return VerifyResponse(
            code=200,
            result=True,
            message="Invitation verified successfully",
            email=email,
            organization=org_record.org_name
        )
        
    except Exception as e:
        logging.error(f"Failed to verify invitation {token}. Error: {str(e)}")
        db.rollback()
        return VerifyResponse(
            code=500,
            result=False,
            message=f"Failed to verify invitation: {str(e)}",
            email=None,
            organization=None
        )


# User Info CRUD Operations
def get_user_info(db: Session, user_id: int) -> UserInfoResponse:
    """
    Get user information including organization and address details
    
    Args:
        db: Database session
        user_id: User ID
        
    Returns:
        UserInfoResponse with user, organization, and address information
        
    Raises:
        ValueError: If user not found
    """
    try:
        # Query user with organization and address joins
        result = (
            db.query(User, Organization, Address)
            .outerjoin(Organization, User.org_id == Organization.id)
            .outerjoin(Address, Organization.address_id == Address.id)
            .filter(User.id == user_id)
            .first()
        )
        
        if not result:
            raise ValueError(f"User with id {user_id} not found")
        
        user, org, address = result
        
        return UserInfoResponse(
            # User information
            user_id=user.id,
            user_name=user.user_name,
            name=user.name,
            email=user.email,
            title=user.title,
            alias_name=user.alias_name,
            is_active=user.is_active,
            role=user.role,
            create_datetime=user.create_datetime,
            # Organization information
            org_id=org.id if org else None,
            org_name=org.org_name if org else None,
            org_desc=org.org_desc if org else None,
            org_status=org.status if org else None,
            is_public=org.is_public if org else None,
            logo=org.logo if org else None,
            # Address information
            address_id=address.id if address else None,
            city=address.city if address else None,
            country=address.country if address else None
        )
        
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Failed to retrieve user information: {str(e)}")


# Password Reset CRUD Operations
def request_password_reset(db: Session, request: PasswordResetRequest) -> PasswordResetResponse:
    """
    Request a password reset for a user
    
    Workflow:
    1. Find user by username or email
    2. Generate a reset token (UUID)
    3. Store token in user.password_reset_token
    4. Send password reset email
    
    Args:
        db: Database session
        request: PasswordResetRequest with username_or_email
        
    Returns:
        PasswordResetResponse with code, result, and message
    """
    try:
        username_or_email = request.username_or_email
        
        # Check if username_or_email looks like an email (contains @)
        is_email = '@' in username_or_email
        
        # Query user by email or username
        if is_email:
            user = db.query(User).filter(User.email == username_or_email).first()
        else:
            user = db.query(User).filter(User.user_name == username_or_email).first()
        
        # If user not found, still return success (security best practice - don't reveal if user exists)
        if not user:
            return PasswordResetResponse(
                code=200,
                result=True,
                message="If an account with that email/username exists, a password reset link has been sent."
            )
        
        # Check if user is active
        if not user.is_active:
            return PasswordResetResponse(
                code=400,
                result=False,
                message="Account is not active. Please contact administrator."
            )
        
        # Generate reset token
        reset_token = str(uuid.uuid4())
        
        # Store token in user record
        user.password_reset_token = reset_token
        db.commit()
        db.refresh(user)
        
        # Send password reset email
        if user.email:
            send_reset_password_email(user.email, reset_token)
        
        return PasswordResetResponse(
            code=200,
            result=True,
            message="Password reset instructions have been sent to your email."
        )
        
    except Exception as e:
        db.rollback()
        logging.error(f"Failed to request password reset for {request.username_or_email}. Error: {str(e)}")
        return PasswordResetResponse(
            code=500,
            result=False,
            message=f"Failed to process password reset request: {str(e)}"
        )


def reset_password_with_token(db: Session, request: ResetPasswordWithTokenRequest) -> ResetPasswordWithTokenResponse:
    """
    Reset password using a reset token
    
    Workflow:
    1. Find user by password_reset_token
    2. Hash the new password
    3. Update user password
    4. Clear password_reset_token (set to None)
    5. Commit changes
    
    Args:
        db: Database session
        request: ResetPasswordWithTokenRequest with token and password
        
    Returns:
        ResetPasswordWithTokenResponse with code, result, and message
    """
    try:
        token = request.token
        new_password = request.password
        
        # Validate password length
        if len(new_password) < 6:
            return ResetPasswordWithTokenResponse(
                code=400,
                result=False,
                message="Password must be at least 6 characters long."
            )
        
        # Find user by password_reset_token
        user = db.query(User).filter(User.password_reset_token == token).first()
        
        # If user not found or token is invalid
        if not user:
            return ResetPasswordWithTokenResponse(
                code=404,
                result=False,
                message="Invalid or expired password reset token."
            )
        
        # Check if user is active
        if not user.is_active:
            return ResetPasswordWithTokenResponse(
                code=400,
                result=False,
                message="Account is not active. Please contact administrator."
            )
        
        # Hash the new password using bcrypt
        password_bytes = new_password.encode('utf-8')
        salt = bcrypt.gensalt()
        hashed_password = bcrypt.hashpw(password_bytes, salt).decode('utf-8')
        
        # Update user password and clear reset token
        user.password = hashed_password
        user.password_reset_token = None  # Clear the token after successful reset
        
        db.commit()
        db.refresh(user)
        
        return ResetPasswordWithTokenResponse(
            code=200,
            result=True,
            message="Password has been reset successfully."
        )
        
    except Exception as e:
        db.rollback()
        logging.error(f"Failed to reset password with token. Error: {str(e)}")
        return ResetPasswordWithTokenResponse(
            code=500,
            result=False,
            message=f"Failed to reset password: {str(e)}"
        )
    