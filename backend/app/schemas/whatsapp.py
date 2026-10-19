from datetime import datetime
from typing import List, Optional, Any
from pydantic import BaseModel, Field

class WhatsAppConfigOut(BaseModel):
    id: int = 1
    is_enabled: bool = True
    test_mode: bool = True
    phone_number_id: Optional[str] = None
    waba_id: Optional[str] = None
    access_token_masked: Optional[str] = None
    has_access_token: bool = False
    webhook_verify_token: str = "rmvs_whatsapp_verify_token_2026"
    has_app_secret: bool = False
    business_phone_number: Optional[str] = None
    business_name: str = "RMVS WebServices"
    default_language: str = "en_US"
    max_retries: int = 3
    retry_delay_seconds: int = 60
    delivery_eta_threshold_minutes: int = 30
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WhatsAppConfigUpdate(BaseModel):
    is_enabled: Optional[bool] = None
    test_mode: Optional[bool] = None
    phone_number_id: Optional[str] = None
    waba_id: Optional[str] = None
    access_token: Optional[str] = None
    webhook_verify_token: Optional[str] = None
    app_secret: Optional[str] = None
    business_phone_number: Optional[str] = None
    business_name: Optional[str] = None
    default_language: Optional[str] = None
    max_retries: Optional[int] = None
    retry_delay_seconds: Optional[int] = None
    delivery_eta_threshold_minutes: Optional[int] = None

class WhatsAppTestMessageRequest(BaseModel):
    to_phone: str = Field(..., description="Recipient phone number with country code")
    message_type: str = Field(default="template", description="'template' or 'text'")
    template_name: Optional[str] = "order_confirmed"
    custom_text: Optional[str] = None

class WhatsAppTemplateOut(BaseModel):
    id: int
    template_name: str
    display_name: str
    category: str
    language: str
    event_trigger: str
    header_text: Optional[str] = None
    body_text: str
    footer_text: Optional[str] = None
    variables: List[str] = []
    approval_status: str
    is_active: bool
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class WhatsAppTemplateCreate(BaseModel):
    template_name: str
    display_name: str
    category: str = "UTILITY"
    language: str = "en_US"
    event_trigger: str
    header_text: Optional[str] = None
    body_text: str
    footer_text: Optional[str] = "RMVS WebServices • Automated Update"
    variables: List[str] = []

class WhatsAppTemplateUpdate(BaseModel):
    display_name: Optional[str] = None
    category: Optional[str] = None
    language: Optional[str] = None
    event_trigger: Optional[str] = None
    header_text: Optional[str] = None
    body_text: Optional[str] = None
    footer_text: Optional[str] = None
    variables: Optional[List[str]] = None
    approval_status: Optional[str] = None
    is_active: Optional[bool] = None

class CustomerWhatsAppPreferenceOut(BaseModel):
    id: int
    user_id: Optional[int] = None
    customer_email: Optional[str] = None
    whatsapp_phone: str
    phone_verified: bool = False
    consent_given: bool = True
    consent_timestamp: datetime
    transactional_enabled: bool = True
    marketing_enabled: bool = False
    preferred_language: str = "en_US"
    opt_out_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CustomerWhatsAppPreferenceUpdate(BaseModel):
    whatsapp_phone: str
    transactional_enabled: Optional[bool] = True
    marketing_enabled: Optional[bool] = False
    preferred_language: Optional[str] = "en_US"

class WhatsAppMessageLogOut(BaseModel):
    id: int
    direction: str
    recipient_phone: str
    recipient_phone_masked: str
    recipient_name: Optional[str] = None
    user_id: Optional[int] = None
    order_id: Optional[int] = None
    invoice_id: Optional[int] = None
    delivery_id: Optional[int] = None
    event_type: str
    template_name: Optional[str] = None
    rendered_body: Optional[str] = None
    provider_message_id: Optional[str] = None
    status: str
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class WhatsAppStatsOut(BaseModel):
    total_messages: int
    total_sent: int
    total_delivered: int
    total_read: int
    total_failed: int
    total_pending: int
    total_simulated: int
    delivery_rate_percent: float
    is_enabled: bool
    test_mode: bool
    configured_phone_id: Optional[str] = None
    business_phone: Optional[str] = None
    active_templates_count: int
    recent_messages_24h: int
