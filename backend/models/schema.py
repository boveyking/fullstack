from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


# AwsInstance Schemas
class AwsInstanceBase(BaseModel):
    instance_id: str = Field(..., description="AWS EC2 instance ID")
    region: str = Field(..., description="AWS region")
    instance_type: Optional[str] = Field(None, description="EC2 instance type")
    ipv4: Optional[str] = Field(None, description="IPv4 address")
    ipv6: Optional[str] = Field(None, description="IPv6 address")
    domain: Optional[str] = Field(None, description="Domain name")
    is_active: bool = Field(True, description="Instance active status")


class AwsInstanceCreate(AwsInstanceBase):
    pass


class AwsInstanceCreateRequest(BaseModel):
    region: str = Field(..., description="AWS region")
    city: str = Field(..., description="City name")
    instance_type: str = Field(..., description="EC2 instance type (e.g., t2.micro)")


class AwsInstanceUpdate(BaseModel):
    instance_id: Optional[str] = None
    region: Optional[str] = None
    instance_type: Optional[str] = None
    ipv4: Optional[str] = None
    ipv6: Optional[str] = None
    domain: Optional[str] = None
    is_active: Optional[bool] = None


class AwsInstanceResponse(AwsInstanceBase):
    id: int
    creation_datetime: datetime

    class Config:
        from_attributes = True


# AwsSetting Schemas
class AwsSettingBase(BaseModel):
    region: str = Field(..., description="AWS region")
    ami_id: str = Field(..., description="AMI ID for the region")
    city: str = Field(..., description="City name for the region")


class AwsSettingCreate(AwsSettingBase):
    pass


class AwsSettingUpdate(BaseModel):
    region: Optional[str] = None
    ami_id: Optional[str] = None
    city: Optional[str] = None


class AwsSettingResponse(AwsSettingBase):
    id: int

    class Config:
        from_attributes = True


# User Registration Schemas
class UserRegisterResponse(BaseModel):
    user_id: int = Field(..., description="Created user ID")
    org_id: int = Field(..., description="Organization ID")
    address_id: int = Field(..., description="Address ID")
    message: str = Field(..., description="Success message")


class OrgDataByTokenResponse(BaseModel):
    email: str = Field(..., description="Email from invitation")
    organization: str = Field(..., description="Organization name")
    city: Optional[str] = Field(None, description="City")
    country: Optional[str] = Field(None, description="Country")
    intro: Optional[str] = Field(None, description="Organization introduction")
    title: Optional[str] = Field(None, description="User title")
    user_name: Optional[str] = Field(None, description="Username")
    name: Optional[str] = Field(None, description="User full name")
    alias_name: Optional[str] = Field(None, description="User alias name")
    logo: Optional[str] = Field(None, description="Organization logo as base64 string")
    status: Optional[str] = Field(None, description="Organization status")


class UserRegisterRequest(BaseModel):
    name: str = Field(..., description="User's full name")
    username: str = Field(..., description="Username")
    email: str = Field(..., description="User email")
    title: Optional[str] = Field(None, description="User title")
    password: str = Field(..., description="User password")
    alias: Optional[str] = Field(None, description="User alias")
    intro: str = Field(..., description="Organization introduction")
    city: str = Field(..., description="City")
    country: str = Field(..., description="Country")
    org_name: str = Field(..., description="Organization name")
    public: bool = Field(True, description="Make organization public")
    flag: Optional[str] = Field(None, description="Flag indicating registration type (invite or token)")
    logo: Optional[str] = Field(None, description="Organization logo as base64 string")
 

# Organization Schemas
class OrganizationResponse(BaseModel):
    id: int
    org_name: Optional[str] = None
    org_desc: Optional[str] = None
    is_active: Optional[bool] = None
    address_id: Optional[int] = None
    create_datetime: Optional[datetime] = None
    status: Optional[str] = None
    is_public: Optional[bool] = None
    city: Optional[str] = None

    class Config:
        from_attributes = True


class OrganizationsPaginatedResponse(BaseModel):
    items: list[OrganizationResponse]
    total: int
    offset: int
    limit: int


class OrganizationStatusUpdate(BaseModel):
    status: str = Field(..., description="Organization status (e.g., 'active', 'pending')")


# User Schemas
class UserResponse(BaseModel):
    id: int
    user_name: Optional[str] = None
    name: Optional[str] = None
    email: Optional[str] = None
    title: Optional[str] = None
    is_active: Optional[bool] = None
    org_name: Optional[str] = None  # From joined Organization table

    class Config:
        from_attributes = True


class UsersPaginatedResponse(BaseModel):
    items: list[UserResponse]
    total: int
    offset: int
    limit: int


# Login Schemas
class LoginRequest(BaseModel):
    username_or_email: str = Field(..., description="Username or email address")
    password: str = Field(..., description="User password")


class UserData(BaseModel):
    user_id: int = Field(..., description="User ID")
    user_name: Optional[str] = Field(None, description="Username")
    email: Optional[str] = Field(None, description="User email")
    org_id: Optional[int] = Field(None, description="Organization ID")
    logo: Optional[str] = Field(None, description="Organization logo as base64 string")


class LoginResponse(BaseModel):
    code: int = Field(..., description="Response code (200 for success, 401 for failure)")
    result: bool = Field(..., description="Authentication result (true if successful)")
    message: Optional[str] = Field(None, description="Response message")
    user_data: Optional[UserData] = Field(None, description="User data (only present on successful login)")


# Invite Schemas
class InviteRequest(BaseModel):
    email: str = Field(..., description="Email of the person to invite")
    organization: str = Field(..., description="Organization name")


class InviteResponse(BaseModel):
    code: int = Field(..., description="Response code (200 for success, 400/500 for failure)")
    result: bool = Field(..., description="Invitation result (true if successful)")
    message: str = Field(..., description="Response message")
    invite_id: Optional[int] = Field(None, description="Invitation ID (only present on successful invite)")


# Verify Schemas
class VerifyResponse(BaseModel):
    code: int = Field(..., description="Response code (200 for success, 400/404 for failure)")
    result: bool = Field(..., description="Verification result (true if successful)")
    message: str = Field(..., description="Response message")
    email: Optional[str] = Field(None, description="Email associated with the invitation")
    organization: Optional[str] = Field(None, description="Organization name")


# Password Reset Schemas
class PasswordResetRequest(BaseModel):
    username_or_email: str = Field(..., description="Username or email address")

class PasswordResetResponse(BaseModel):
    code: int = Field(..., description="Response code (200 for success, 400/404/500 for failure)")
    result: bool = Field(..., description="Password reset request result (true if successful)")
    message: str = Field(..., description="Response message")


# Reset Password with Token Schemas
class ResetPasswordWithTokenRequest(BaseModel):
    token: str = Field(..., description="Password reset token")
    password: str = Field(..., description="New password")

class ResetPasswordWithTokenResponse(BaseModel):
    code: int = Field(..., description="Response code (200 for success, 400/404/500 for failure)")
    result: bool = Field(..., description="Password reset result (true if successful)")
    message: str = Field(..., description="Response message")


# User Info Schemas
class UserInfoResponse(BaseModel):
    # User information
    user_id: int = Field(..., description="User ID")
    user_name: Optional[str] = Field(None, description="Username")
    name: Optional[str] = Field(None, description="User full name")
    email: Optional[str] = Field(None, description="User email")
    title: Optional[str] = Field(None, description="User title")
    alias_name: Optional[str] = Field(None, description="User alias name")
    is_active: Optional[bool] = Field(None, description="User active status")
    role: Optional[str] = Field(None, description="User role")
    create_datetime: Optional[datetime] = Field(None, description="User creation datetime")
    
    # Organization information
    org_id: Optional[int] = Field(None, description="Organization ID")
    org_name: Optional[str] = Field(None, description="Organization name")
    org_desc: Optional[str] = Field(None, description="Organization description")
    org_status: Optional[str] = Field(None, description="Organization status")
    is_public: Optional[bool] = Field(None, description="Organization public status")
    logo: Optional[str] = Field(None, description="Organization logo as base64 string")
    
    # Address information
    address_id: Optional[int] = Field(None, description="Address ID")
    city: Optional[str] = Field(None, description="City")
    country: Optional[str] = Field(None, description="Country")