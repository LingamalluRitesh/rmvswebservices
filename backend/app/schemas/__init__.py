from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, EmailStr, Field

# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"

class TokenPayload(BaseModel):
    sub: Optional[str] = None

# --- Skill & Technology Schemas ---
class SkillBase(BaseModel):
    name: str
    category: Optional[str] = None

class SkillOut(SkillBase):
    id: int
    class Config:
        from_attributes = True

class TechnologyBase(BaseModel):
    name: str

class TechnologyOut(TechnologyBase):
    id: int
    class Config:
        from_attributes = True

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    phone: Optional[str] = None

class RegisterDeveloperRequest(UserBase):
    password: str = Field(..., min_length=6)
    title: str = "Full Stack Developer"
    department: str = "Engineering"
    short_bio: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    years_experience: int = 1
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    availability: str = "Available for Projects"

class RegisterClientRequest(UserBase):
    password: str = Field(..., min_length=6)
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None

class LoginRequest(BaseModel):
    email_or_username: str
    password: str

class UserBrief(BaseModel):
    id: int
    username: str
    full_name: str
    role: str # super_admin (CEO), developer, client
    avatar_url: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    status: Optional[str] = "approved"
    is_verified: bool = False
    is_active: bool = True
    class Config:
        from_attributes = True

class DeveloperProfileBrief(BaseModel):
    id: int
    title: Optional[str] = "Full Stack Developer"
    department: Optional[str] = "Engineering"
    location: Optional[str] = None
    availability: Optional[str] = "Available for Projects"
    years_experience: Optional[int] = 1
    avatar_url: Optional[str] = None
    user: UserBrief
    skills: List[SkillOut] = []
    class Config:
        from_attributes = True

class DeveloperProfileOut(BaseModel):
    id: int
    user_id: int
    title: Optional[str] = "Full Stack Developer"
    department: Optional[str] = "Engineering"
    short_bio: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = "Available for Projects"
    years_experience: Optional[int] = 1
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    certificates: Optional[str] = None
    achievements: Optional[str] = None
    is_public: bool = True
    views_count: int = 0
    user: UserBrief
    skills: List[SkillOut] = []
    class Config:
        from_attributes = True

class DeveloperProfileUpdate(BaseModel):
    title: Optional[str] = None
    department: Optional[str] = None
    short_bio: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    years_experience: Optional[int] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    certificates: Optional[str] = None
    achievements: Optional[str] = None
    is_public: Optional[bool] = None
    skills: Optional[List[str]] = None
    avatar_url: Optional[str] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None

class DeveloperCreateByAdmin(BaseModel):
    email: EmailStr
    username: str
    full_name: str
    password: str = Field(..., min_length=6)
    phone: Optional[str] = None
    title: str = "Senior Full Stack Developer"
    department: str = "Engineering"
    short_bio: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    skills: List[str] = []
    years_experience: int = 3
    availability: str = "Available for Projects"
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    is_verified: bool = True

class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None
    password: Optional[str] = None
    title: Optional[str] = None
    department: Optional[str] = None
    short_bio: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    availability: Optional[str] = None
    years_experience: Optional[int] = None
    skills: Optional[List[str]] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_url: Optional[str] = None
    resume_url: Optional[str] = None
    cover_image_url: Optional[str] = None
    certificates: Optional[str] = None
    achievements: Optional[str] = None
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None

class ClientProfileOut(BaseModel):
    id: int
    user_id: int
    company_name: Optional[str] = None
    website: Optional[str] = None
    industry: Optional[str] = None
    class Config:
        from_attributes = True

class AdminUserOut(UserBase):
    id: int
    role: str
    status: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    developer_profile: Optional[DeveloperProfileOut] = None
    client_profile: Optional[ClientProfileOut] = None
    projects_count: int = 0
    class Config:
        from_attributes = True

class UserOut(UserBase):
    id: int
    role: str
    status: str
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    created_at: datetime
    developer_profile: Optional[DeveloperProfileOut] = None
    client_profile: Optional[ClientProfileOut] = None
    class Config:
        from_attributes = True

# --- Project Attribution & Schemas ---
class ProjectDeveloperOut(BaseModel):
    id: int
    role_in_project: str
    is_lead: bool
    developer: DeveloperProfileBrief
    class Config:
        from_attributes = True

class ProjectOut(BaseModel):
    id: int
    name: str
    slug: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = "Websites"
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    gallery_urls: Optional[str] = None
    status: Optional[str] = "Live" # Idea, Planning, In Development, Testing, Live, Completed, Maintenance, Archived
    visibility: Optional[str] = "Public"
    client_name: Optional[str] = None
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    created_at: Optional[datetime] = None
    developer_associations: List[ProjectDeveloperOut] = []
    technologies: List[TechnologyOut] = []
    class Config:
        from_attributes = True

class ProjectCreate(BaseModel):
    name: str
    short_description: Optional[str] = None
    description: Optional[str] = None
    category: str = "Websites"
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    gallery_urls: Optional[str] = None
    status: str = "Live"
    visibility: str = "Public"
    client_name: Optional[str] = None
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    technologies: List[str] = []
    team_members: Optional[List[dict]] = None # [{"developer_id": int, "role_in_project": str, "is_lead": bool}]

class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    short_description: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    demo_url: Optional[str] = None
    repo_url: Optional[str] = None
    image_url: Optional[str] = None
    gallery_urls: Optional[str] = None
    status: Optional[str] = None
    visibility: Optional[str] = None
    client_name: Optional[str] = None
    start_date: Optional[str] = None
    completion_date: Optional[str] = None
    technologies: Optional[List[str]] = None
    team_members: Optional[List[dict]] = None

# --- Client Inquiry Schemas ---
class ClientInquiryCreate(BaseModel):
    developer_id: Optional[int] = None
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    project_name: str
    project_type: Optional[str] = None
    requirements: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    preferred_developer: Optional[str] = None
    description: str

class ClientInquiryUpdate(BaseModel):
    status: str # New, Contacted, Discussion, Proposal, In Progress, Completed, Closed

class ClientInquiryOut(BaseModel):
    id: int
    client_id: Optional[int] = None
    developer_id: Optional[int] = None
    name: Optional[str] = None
    company: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    project_name: str
    project_type: Optional[str] = None
    requirements: Optional[str] = None
    budget_range: Optional[str] = None
    timeline: Optional[str] = None
    preferred_developer: Optional[str] = None
    description: str
    status: str
    created_at: datetime
    client: Optional[UserBrief] = None
    developer: Optional[DeveloperProfileBrief] = None
    class Config:
        from_attributes = True

# --- Community Schemas ---
class CommunityChannelOut(BaseModel):
    id: int
    name: str
    description: Optional[str] = None
    is_locked: bool
    created_at: datetime
    class Config:
        from_attributes = True

class CommunityMessageCreate(BaseModel):
    content: str

class CommunityMessageOut(BaseModel):
    id: int
    channel_id: int
    user_id: int
    content: str
    created_at: datetime
    user: UserBrief
    class Config:
        from_attributes = True

# --- Direct Chat Schemas ---
class MessageCreate(BaseModel):
    content: str

class MessageOut(BaseModel):
    id: int
    conversation_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime
    sender: UserBrief
    class Config:
        from_attributes = True

class ConversationOut(BaseModel):
    id: int
    inquiry_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    members: List[dict] = []
    last_message: Optional[MessageOut] = None
    class Config:
        from_attributes = True

# --- Notification Schemas ---
class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    type: str
    link: Optional[str] = None
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# --- Company & Website Settings Schemas ---
class CompanySettingsBase(BaseModel):
    company_name: str = "Company Name Not Configured"
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    primary_color: str = "#000000"
    secondary_color: str = "#ffffff"
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    youtube_url: Optional[str] = None
    address: Optional[str] = None
    business_hours: Optional[str] = None
    footer_copyright: Optional[str] = None

class CompanySettingsUpdate(BaseModel):
    company_name: Optional[str] = None
    logo_url: Optional[str] = None
    favicon_url: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    primary_color: Optional[str] = None
    secondary_color: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    whatsapp: Optional[str] = None
    website: Optional[str] = None
    instagram_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    youtube_url: Optional[str] = None
    address: Optional[str] = None
    business_hours: Optional[str] = None
    footer_copyright: Optional[str] = None

class CompanySettingsOut(CompanySettingsBase):
    id: int
    updated_at: datetime
    class Config:
        from_attributes = True

# --- Activity Log Schemas ---
class ActivityLogOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    action: str
    entity_type: Optional[str] = None
    entity_id: Optional[int] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime
    user: Optional[UserBrief] = None
    class Config:
        from_attributes = True

# --- Admin & Stats Schemas ---
class DashboardStatsOut(BaseModel):
    total_developers: int
    active_developers: int
    total_projects: int
    completed_projects: int
    total_clients: int
    open_inquiries: int
    project_views: int
    developer_views: int
    recent_activity: List[ActivityLogOut] = []

class DeveloperApprovalRequest(BaseModel):
    action: str # approve, reject, suspend, restore
    reason: Optional[str] = None

# --- WhatsApp Business Automation & Orders Schemas ---
from app.schemas.whatsapp import (
    WhatsAppConfigOut, WhatsAppConfigUpdate, WhatsAppTestMessageRequest,
    WhatsAppTemplateOut, WhatsAppTemplateCreate, WhatsAppTemplateUpdate,
    CustomerWhatsAppPreferenceOut, CustomerWhatsAppPreferenceUpdate,
    WhatsAppMessageLogOut, WhatsAppStatsOut
)
from app.schemas.orders import (
    OrderBase, OrderCreate, OrderStatusUpdate, OrderOut,
    InvoiceCreate, InvoiceStatusUpdate, InvoiceOut,
    DeliveryCreate, DeliveryStatusUpdate, DeliveryOut,
    PublicTrackingOut
)
