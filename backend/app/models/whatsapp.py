from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base

class WhatsAppConfig(Base):
    """
    Singleton configuration row (id=1) storing Meta WhatsApp Cloud API credentials
    and global automation behavior.
    """
    __tablename__ = "whatsapp_configs"

    id = Column(Integer, primary_key=True, default=1)
    is_enabled = Column(Boolean, default=True, nullable=False)
    test_mode = Column(Boolean, default=True, nullable=False)  # True = simulated delivery without Meta API costs or errors
    
    phone_number_id = Column(String(100), nullable=True) # Meta Cloud API Phone Number ID
    waba_id = Column(String(100), nullable=True) # WhatsApp Business Account ID
    access_token = Column(Text, nullable=True) # System User Access Token
    webhook_verify_token = Column(String(255), default="rmvs_whatsapp_verify_token_2026", nullable=False)
    app_secret = Column(String(255), nullable=True) # App Secret for X-Hub-Signature-256 HMAC verification
    
    business_phone_number = Column(String(50), nullable=True) # Receiving number for business alerts (e.g. +919876543210)
    business_name = Column(String(100), default="RMVS WebServices", nullable=False)
    default_language = Column(String(20), default="en_US", nullable=False)
    
    max_retries = Column(Integer, default=3, nullable=False)
    retry_delay_seconds = Column(Integer, default=60, nullable=False)
    delivery_eta_threshold_minutes = Column(Integer, default=30, nullable=False) # Only notify if ETA changes by >= threshold
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class WhatsAppTemplate(Base):
    """
    Approved or custom message templates mapped to business lifecycle events.
    """
    __tablename__ = "whatsapp_templates"

    id = Column(Integer, primary_key=True, index=True)
    template_name = Column(String(100), unique=True, index=True, nullable=False)
    display_name = Column(String(255), nullable=False)
    category = Column(String(50), default="UTILITY", nullable=False) # UTILITY, MARKETING, AUTHENTICATION
    language = Column(String(20), default="en_US", nullable=False)
    event_trigger = Column(String(100), index=True, nullable=False) # order_created, order_confirmed, etc.
    header_text = Column(String(255), nullable=True)
    body_text = Column(Text, nullable=False)
    footer_text = Column(String(255), default="RMVS WebServices • Automated Update", nullable=True)
    variables = Column(Text, nullable=False) # JSON list of variable keys, e.g. ["customer_name", "order_number"]
    approval_status = Column(String(50), default="APPROVED", nullable=False) # APPROVED, PENDING, REJECTED
    is_active = Column(Boolean, default=True, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

class CustomerWhatsAppPreference(Base):
    """
    Customer-level messaging consent, contact preferences, and validation.
    """
    __tablename__ = "customer_whatsapp_preferences"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    customer_email = Column(String(255), index=True, nullable=True)
    whatsapp_phone = Column(String(50), index=True, nullable=False) # Formatted in E.164
    phone_verified = Column(Boolean, default=False, nullable=False)
    
    consent_given = Column(Boolean, default=True, nullable=False)
    consent_timestamp = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    transactional_enabled = Column(Boolean, default=True, nullable=False)
    marketing_enabled = Column(Boolean, default=False, nullable=False)
    preferred_language = Column(String(20), default="en_US", nullable=False)
    opt_out_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", lazy="selectin")

class WhatsAppMessageLog(Base):
    """
    Audit log of all sent and received WhatsApp messages with delivery and retry tracking.
    """
    __tablename__ = "whatsapp_message_logs"

    id = Column(Integer, primary_key=True, index=True)
    direction = Column(String(20), default="outbound", nullable=False) # outbound, inbound
    recipient_phone = Column(String(50), index=True, nullable=False)
    recipient_name = Column(String(255), nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), nullable=True, index=True)
    invoice_id = Column(Integer, ForeignKey("invoices.id", ondelete="SET NULL"), nullable=True, index=True)
    delivery_id = Column(Integer, ForeignKey("deliveries.id", ondelete="SET NULL"), nullable=True, index=True)
    
    event_type = Column(String(100), index=True, nullable=False)
    template_name = Column(String(100), nullable=True)
    rendered_body = Column(Text, nullable=True)
    
    provider_message_id = Column(String(255), index=True, nullable=True) # Meta wamid.xxx
    status = Column(String(50), default="pending", index=True, nullable=False) # pending, simulated_sent, sent, delivered, read, failed
    error_code = Column(String(100), nullable=True)
    error_message = Column(Text, nullable=True)
    
    payload = Column(Text, nullable=True) # Request/response debug JSON
    retry_count = Column(Integer, default=0, nullable=False)
    max_retries = Column(Integer, default=3, nullable=False)
    last_retry_at = Column(DateTime(timezone=True), nullable=True)
    
    idempotency_key = Column(String(255), unique=True, index=True, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), index=True, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    user = relationship("User", lazy="selectin")
    order = relationship("Order", back_populates="message_logs", lazy="selectin")
    invoice = relationship("Invoice", back_populates="message_logs", lazy="selectin")
    delivery = relationship("Delivery", back_populates="message_logs", lazy="selectin")

class WhatsAppWebhookEvent(Base):
    """
    Raw inbound webhook events from Meta for audit, idempotency, and deduplication.
    """
    __tablename__ = "whatsapp_webhook_events"

    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(String(255), unique=True, index=True, nullable=False)
    event_type = Column(String(100), nullable=False) # status_update, message_received, etc.
    payload = Column(Text, nullable=False)
    processed = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    processed_at = Column(DateTime(timezone=True), nullable=True)
