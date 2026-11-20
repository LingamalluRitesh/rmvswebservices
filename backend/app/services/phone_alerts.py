import os
import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.whatsapp import WhatsAppConfig, WhatsAppMessageLog
from app.models import CompanySettings, ActivityLog
from app.services.whatsapp.dispatcher import dispatch_whatsapp_event, get_or_create_whatsapp_config
from app.services.whatsapp.phone_utils import validate_and_format_e164

logger = logging.getLogger(__name__)

async def get_ceo_phone_number(db: AsyncSession) -> str:
    """
    Resolves the destination phone number for CEO alerts.
    Priority:
    1. Environment variable WHATSAPP_BUSINESS_NOTIFICATION_PHONE
    2. WhatsAppConfig.business_phone_number
    3. CompanySettings.phone
    4. Fallback default CEO phone (+91 9400900000)
    """
    env_phone = os.getenv("WHATSAPP_BUSINESS_NOTIFICATION_PHONE")
    if env_phone and env_phone.strip():
        is_valid, formatted, _ = validate_and_format_e164(env_phone)
        if is_valid:
            return formatted

    try:
        config = await get_or_create_whatsapp_config(db)
        if config.business_phone_number and config.business_phone_number.strip():
            is_valid, formatted, _ = validate_and_format_e164(config.business_phone_number)
            if is_valid:
                return formatted
    except Exception as e:
        logger.warning(f"Failed to read whatsapp config: {e}")

    try:
        settings_stmt = select(CompanySettings).where(CompanySettings.id == 1)
        company_settings = (await db.execute(settings_stmt)).scalar_one_or_none()
        if company_settings and company_settings.phone:
            is_valid, formatted, _ = validate_and_format_e164(company_settings.phone)
            if is_valid:
                return formatted
    except Exception as e:
        logger.warning(f"Failed to read company settings: {e}")

    return "+919400900000"

async def notify_ceo_phone(
    db: AsyncSession,
    event_type: str,
    title: str,
    details: str,
    customer_name: Optional[str] = "Website Visitor",
    customer_phone: Optional[str] = None,
    customer_email: Optional[str] = None,
    action_url: Optional[str] = "https://rmvswebservices.onrender.com/ceo"
) -> Optional[WhatsAppMessageLog]:
    """
    Sends an automated, instant notification to CEO Ritesh Lingamallu's phone
    whenever ANY activity happens on the RMVS website.
    """
    try:
        ceo_phone = await get_ceo_phone_number(db)
        timestamp_str = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S UTC")

        # Create audit activity log
        activity = ActivityLog(
            action=f"PHONE_ALERT_{event_type.upper()}",
            entity_type="website_activity",
            details=f"Alert sent to CEO ({ceo_phone}): {title} - {details}",
            ip_address="system"
        )
        db.add(activity)

        # Dispatch via WhatsApp Automation engine
        variables = {
            "customer_name": customer_name or "Website Visitor",
            "customer_email": customer_email or "Not provided",
            "customer_phone": customer_phone or "Not provided",
            "service_type": title,
            "message_snippet": details[:250],
            "inquiry_url": action_url or "https://rmvswebservices.onrender.com/ceo",
            "timestamp": timestamp_str
        }

        log = await dispatch_whatsapp_event(
            db=db,
            event_type="website_activity",
            recipient_phone=ceo_phone,
            customer_name="CEO Ritesh Lingamallu",
            variables=variables,
            idempotency_key=f"ceo_alert_{event_type}_{int(datetime.now(timezone.utc).timestamp())}"
        )
        await db.commit()
        return log
    except Exception as e:
        logger.error(f"Failed to dispatch CEO phone alert: {e}", exc_info=True)
        return None
