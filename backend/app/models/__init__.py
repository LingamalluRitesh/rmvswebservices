from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from app.core.database import Base

# Association table for Developer Skills
developer_skills = Table(
    "developer_skills",
    Base.metadata,
    Column("developer_id", Integer, ForeignKey("developer_profiles.id", ondelete="CASCADE"), primary_key=True),
    Column("skill_id", Integer, ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
)

# Association table for Project Technologies
project_technologies = Table(
    "project_technologies",
    Base.metadata,
    Column("project_id", Integer, ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("technology_id", Integer, ForeignKey("technologies.id", ondelete="CASCADE"), primary_key=True)
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="developer", nullable=False) # super_admin (CEO), developer, client
    status = Column(String(50), default="approved", nullable=False) # pending, approved, rejected, suspended
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    developer_profile = relationship("DeveloperProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    client_profile = relationship("ClientProfile", back_populates="user", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    messages = relationship("Message", back_populates="sender")
    community_messages = relationship("CommunityMessage", back_populates="user")
    inquiries_made = relationship("ClientInquiry", back_populates="client", foreign_keys="ClientInquiry.client_id")
    activity_logs = relationship("ActivityLog", back_populates="user", cascade="all, delete-orphan")

class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    category = Column(String(100), nullable=True)

class DeveloperProfile(Base):
    __tablename__ = "developer_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    title = Column(String(255), default="Full Stack Developer", nullable=False) # Dynamic Designation (CEO, CTO, Lead Developer, etc.)
    department = Column(String(100), default="Engineering", nullable=False) # Department
    short_bio = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    availability = Column(String(100), default="Available for Projects", nullable=False)
    years_experience = Column(Integer, default=1)
    github_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    portfolio_url = Column(String(255), nullable=True)
    resume_url = Column(String(255), nullable=True)
    cover_image_url = Column(String(500), nullable=True)
    certificates = Column(Text, nullable=True) # JSON or newline text
    achievements = Column(Text, nullable=True) # JSON or newline text
    is_public = Column(Boolean, default=True, nullable=False)
    views_count = Column(Integer, default=0, nullable=False)

    user = relationship("User", back_populates="developer_profile")
    skills = relationship("Skill", secondary=developer_skills, lazy="selectin")
    project_associations = relationship("ProjectDeveloper", back_populates="developer", cascade="all, delete-orphan")
    inquiries = relationship("ClientInquiry", back_populates="developer", foreign_keys="ClientInquiry.developer_id")

class ClientProfile(Base):
    __tablename__ = "client_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    company_name = Column(String(255), nullable=True)
    website = Column(String(255), nullable=True)
    industry = Column(String(100), nullable=True)

    user = relationship("User", back_populates="client_profile")

class Technology(Base):
    __tablename__ = "technologies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)

class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    short_description = Column(String(500), nullable=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), default="Software", nullable=False)
    demo_url = Column(String(500), nullable=True)
    repo_url = Column(String(500), nullable=True)
    image_url = Column(String(500), nullable=True)
    gallery_urls = Column(Text, nullable=True)
    status = Column(String(50), default="Live", nullable=False) # Idea, Planning, In Development, Testing, Live, Completed, Maintenance, Archived
    visibility = Column(String(50), default="Public", nullable=False) # Public, Private
    client_name = Column(String(255), nullable=True)
    start_date = Column(String(50), nullable=True)
    completion_date = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    developer_associations = relationship("ProjectDeveloper", back_populates="project", cascade="all, delete-orphan", lazy="selectin")
    technologies = relationship("Technology", secondary=project_technologies, lazy="selectin")

class ProjectDeveloper(Base):
    __tablename__ = "project_developers"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    developer_id = Column(Integer, ForeignKey("developer_profiles.id", ondelete="CASCADE"), nullable=False)
    role_in_project = Column(String(100), default="Lead Developer", nullable=False)
    is_lead = Column(Boolean, default=False, nullable=False)

    project = relationship("Project", back_populates="developer_associations")
    developer = relationship("DeveloperProfile", back_populates="project_associations", lazy="selectin")

class ClientInquiry(Base):
    __tablename__ = "client_inquiries"

    id = Column(Integer, primary_key=True, index=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True) # Optional for public inquiry submissions
    developer_id = Column(Integer, ForeignKey("developer_profiles.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=True)
    company = Column(String(255), nullable=True)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    project_name = Column(String(255), nullable=False)
    project_type = Column(String(100), nullable=True)
    requirements = Column(Text, nullable=True)
    budget_range = Column(String(100), nullable=True)
    timeline = Column(String(100), nullable=True)
    preferred_developer = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)
    status = Column(String(50), default="New", nullable=False) # New, Contacted, Discussion, Proposal, In Progress, Completed, Closed
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    client = relationship("User", foreign_keys=[client_id], back_populates="inquiries_made", lazy="selectin")
    developer = relationship("DeveloperProfile", foreign_keys=[developer_id], back_populates="inquiries", lazy="selectin")

class CommunityChannel(Base):
    __tablename__ = "community_channels"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(String(255), nullable=True)
    is_locked = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    messages = relationship("CommunityMessage", back_populates="channel", cascade="all, delete-orphan")

class CommunityMessage(Base):
    __tablename__ = "community_messages"

    id = Column(Integer, primary_key=True, index=True)
    channel_id = Column(Integer, ForeignKey("community_channels.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    channel = relationship("CommunityChannel", back_populates="messages")
    user = relationship("User", back_populates="community_messages", lazy="selectin")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    inquiry_id = Column(Integer, ForeignKey("client_inquiries.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    members = relationship("ConversationMember", back_populates="conversation", cascade="all, delete-orphan", lazy="selectin")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class ConversationMember(Base):
    __tablename__ = "conversation_members"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    conversation = relationship("Conversation", back_populates="members")
    user = relationship("User", lazy="selectin")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
    sender = relationship("User", back_populates="messages", lazy="selectin")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String(50), default="system", nullable=False)
    link = Column(String(255), nullable=True)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="notifications")

class CompanySettings(Base):
    __tablename__ = "company_settings"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), default="Company Name Not Configured", nullable=False)
    logo_url = Column(String(500), nullable=True)
    favicon_url = Column(String(500), nullable=True)
    tagline = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    primary_color = Column(String(50), default="#000000", nullable=False)
    secondary_color = Column(String(50), default="#ffffff", nullable=False)
    email = Column(String(255), nullable=True)
    phone = Column(String(100), nullable=True)
    whatsapp = Column(String(100), nullable=True)
    website = Column(String(255), nullable=True)
    instagram_url = Column(String(255), nullable=True)
    linkedin_url = Column(String(255), nullable=True)
    github_url = Column(String(255), nullable=True)
    youtube_url = Column(String(255), nullable=True)
    address = Column(Text, nullable=True)
    business_hours = Column(String(255), nullable=True)
    footer_copyright = Column(String(255), nullable=True)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action = Column(String(100), nullable=False) # LOGIN, LOGOUT, DEVELOPER_CREATED, DESIGNATION_CHANGED, etc.
    entity_type = Column(String(100), nullable=True) # developer, project, client, settings, etc.
    entity_id = Column(Integer, nullable=True)
    details = Column(Text, nullable=True)
    ip_address = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", back_populates="activity_logs", lazy="selectin")

# Orders, Invoices, Deliveries and WhatsApp Business Automation Models
from app.models.orders import Order, Invoice, Delivery
from app.models.whatsapp import (
    WhatsAppConfig, WhatsAppTemplate, CustomerWhatsAppPreference,
    WhatsAppMessageLog, WhatsAppWebhookEvent
)
