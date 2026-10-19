import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.whatsapp import (
    WhatsAppConfig, WhatsAppTemplate, CustomerWhatsAppPreference,
    WhatsAppMessageLog
)
from app.services.whatsapp.phone_utils import validate_and_format_e164
from app.services.whatsapp.templates import (
    DEFAULT_TEMPLATES, render_template_text, build_meta_template_components
)
from app.services.whatsapp.client import WhatsAppCloudAPIClient

async def get_or_create_whatsapp_config(db: AsyncSession) -> WhatsAppConfig:
    """
    Returns the singleton WhatsApp configuration row (id=1), creating it with defaults if missing.
    """
    stmt = select(WhatsAppConfig).where(WhatsAppConfig.id == 1)
    config = (await db.execute(stmt)).scalar_one_or_none()
    if not config:
        config = WhatsAppConfig(
            id=1,
            is_enabled=True,
            test_mode=True, # Default to test simulation so no unhandled crashes occur
            webhook_verify_token="rmvs_whatsapp_verify_token_2026",
            business_name="RMVS WebServices",
            default_language="en_US",
            max_retries=3,
            retry_delay_seconds=60,
            delivery_eta_threshold_minutes=30
        )
        db.add(config)
        await db.commit()
        await db.refresh(config)
    return config

async def dispatch_whatsapp_event(
    db: AsyncSession,
    event_type: str,
    recipient_phone: str,
    customer_name: str,
    variables: Dict[str, Any],
    user_id: Optional[int] = None,
    order_id: Optional[int] = None,
    invoice_id: Optional[int] = None,
    delivery_id: Optional[int] = None,
    idempotency_key: Optional[str] = None,
    is_marketing: bool = False
) -> Optional[WhatsAppMessageLog]:
    """
    Core automated notification dispatcher.
    Enforces customer consent, idempotency deduplication, template rendering,
    and Meta Cloud API transmission.
    """
    config = await get_or_create_whatsapp_config(db)
    if not config.is_enabled:
        return None

    # 1. Phone validation
    is_valid, formatted_phone, phone_err = validate_and_format_e164(recipient_phone)
    if not is_valid:
        # Create a failed log entry for visibility in the CEO/Admin audit log
        failed_log = WhatsAppMessageLog(
            direction="outbound",
            recipient_phone=recipient_phone,
            recipient_name=customer_name,
            user_id=user_id,
            order_id=order_id,
            invoice_id=invoice_id,
            delivery_id=delivery_id,
            event_type=event_type,
            status="failed",
            error_code="INVALID_PHONE_NUMBER",
            error_message=phone_err,
            idempotency_key=idempotency_key
        )
        db.add(failed_log)
        await db.commit()
        return failed_log

    # 2. Check Customer Preferences & Consent
    pref_stmt = select(CustomerWhatsAppPreference).where(
        CustomerWhatsAppPreference.whatsapp_phone == formatted_phone
    )
    pref = (await db.execute(pref_stmt)).scalar_one_or_none()
    if pref:
        if pref.opt_out_at is not None or not pref.consent_given:
            return None # Customer has explicitly opted out
        if is_marketing and not pref.marketing_enabled:
            return None # Marketing opt-in required
        if not is_marketing and not pref.transactional_enabled:
            return None # Transactional notifications disabled by user

    # 3. Idempotency Check
    if idempotency_key:
        existing_log_stmt = select(WhatsAppMessageLog).where(
            WhatsAppMessageLog.idempotency_key == idempotency_key
        )
        existing_log = (await db.execute(existing_log_stmt)).scalar_one_or_none()
        if existing_log and existing_log.status in ["sent", "simulated_sent", "delivered", "read"]:
            return existing_log

    # 4. Resolve Template
    template_stmt = select(WhatsAppTemplate).where(
        WhatsAppTemplate.event_trigger == event_type,
        WhatsAppTemplate.is_active == True
    )
    template = (await db.execute(template_stmt)).scalar_one_or_none()

    template_name = event_type
    language_code = config.default_language or "en_US"
    template_variables_list = []
    body_text_template = ""

    if template:
        template_name = template.template_name
        language_code = template.language or "en_US"
        body_text_template = template.body_text
        try:
            template_variables_list = json.loads(template.variables) if isinstance(template.variables, str) else template.variables
        except Exception:
            template_variables_list = list(variables.keys())
    else:
        # Fallback to default in-memory definition
        fallback_def = next((t for t in DEFAULT_TEMPLATES if t["event_trigger"] == event_type), None)
        if fallback_def:
            template_name = fallback_def["template_name"]
            body_text_template = fallback_def["body_text"]
            template_variables_list = fallback_def["variables"]
        else:
            body_text_template = f"Hello {customer_name}, your update for {event_type} is ready."
            template_variables_list = list(variables.keys())

    # Build rendered preview & Meta components
    rendered_body = render_template_text(body_text_template, variables)
    meta_components = build_meta_template_components(template_variables_list, variables)

    # 5. Create Outbox / Audit Record
    message_log = WhatsAppMessageLog(
        direction="outbound",
        recipient_phone=formatted_phone,
        recipient_name=customer_name,
        user_id=user_id,
        order_id=order_id,
        invoice_id=invoice_id,
        delivery_id=delivery_id,
        event_type=event_type,
        template_name=template_name,
        rendered_body=rendered_body,
        status="pending",
        idempotency_key=idempotency_key
    )
    db.add(message_log)
    await db.flush()

    # 6. Execute Dispatch via Official Meta Cloud API Client
    result = await WhatsAppCloudAPIClient.send_template_message(
        to_phone=formatted_phone,
        template_name=template_name,
        language_code=language_code,
        components=meta_components,
        config=config
    )

    # 7. Update Audit Log with Result
    message_log.status = result.get("status", "failed")
    message_log.provider_message_id = result.get("provider_message_id")
    message_log.error_code = result.get("error_code")
    message_log.error_message = result.get("error_message")
    message_log.payload = result.get("payload")
    if result.get("status") == "failed":
        message_log.retry_count = 1
        message_log.last_retry_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(message_log)
    return message_log

async def retry_failed_message(db: AsyncSession, log_id: int) -> WhatsAppMessageLog:
    """
    Manual or automated retry of a failed message with exponential backoff awareness.
    """
    stmt = select(WhatsAppMessageLog).where(WhatsAppMessageLog.id == log_id)
    log = (await db.execute(stmt)).scalar_one_or_none()
    if not log:
        raise ValueError("Message log record not found.")

    config = await get_or_create_whatsapp_config(db)
    log.retry_count += 1
    log.last_retry_at = datetime.now(timezone.utc)

    result = await WhatsAppCloudAPIClient.send_template_message(
        to_phone=log.recipient_phone,
        template_name=log.template_name or "order_created",
        language_code=config.default_language or "en_US",
        components=None,
        config=config
    )

    log.status = result.get("status", "failed")
    log.provider_message_id = result.get("provider_message_id")
    log.error_code = result.get("error_code")
    log.error_message = result.get("error_message")
    log.payload = result.get("payload")

    await db.commit()
    await db.refresh(log)
    return log
