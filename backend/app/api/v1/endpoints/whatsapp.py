import json
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_, desc
from app.core.database import get_db
from app.models.whatsapp import (
    WhatsAppConfig, WhatsAppTemplate, WhatsAppMessageLog
)
from app.models import User
from app.schemas.whatsapp import (
    WhatsAppConfigOut, WhatsAppConfigUpdate, WhatsAppTestMessageRequest,
    WhatsAppTemplateOut, WhatsAppTemplateCreate, WhatsAppTemplateUpdate,
    WhatsAppMessageLogOut, WhatsAppStatsOut
)
from app.services.whatsapp.phone_utils import mask_phone_number, validate_and_format_e164
from app.services.whatsapp.dispatcher import (
    get_or_create_whatsapp_config, retry_failed_message
)
from app.services.whatsapp.client import WhatsAppCloudAPIClient
from app.api.deps import get_current_user, get_current_admin

router = APIRouter()

# --- Config Management (Admin/CEO) ---
@router.get("/config", response_model=WhatsAppConfigOut)
async def get_whatsapp_config(
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns WhatsApp Cloud API configuration with masked sensitive tokens.
    """
    config = await get_or_create_whatsapp_config(db)
    raw_token = config.access_token or ""
    masked_token = (raw_token[:6] + "••••••••" + raw_token[-4:]) if len(raw_token) > 10 else ("••••••••" if raw_token else None)

    return WhatsAppConfigOut(
        id=config.id,
        is_enabled=config.is_enabled,
        test_mode=config.test_mode,
        phone_number_id=config.phone_number_id,
        waba_id=config.waba_id,
        access_token_masked=masked_token,
        has_access_token=bool(config.access_token and config.access_token.strip()),
        webhook_verify_token=config.webhook_verify_token,
        has_app_secret=bool(config.app_secret and config.app_secret.strip()),
        business_phone_number=config.business_phone_number,
        business_name=config.business_name,
        default_language=config.default_language,
        max_retries=config.max_retries,
        retry_delay_seconds=config.retry_delay_seconds,
        delivery_eta_threshold_minutes=config.delivery_eta_threshold_minutes,
        updated_at=config.updated_at
    )

@router.put("/config", response_model=WhatsAppConfigOut)
async def update_whatsapp_config(
    payload: WhatsAppConfigUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates WhatsApp Business Cloud API settings. Never echoes raw secrets in responses.
    """
    config = await get_or_create_whatsapp_config(db)
    
    if payload.is_enabled is not None:
        config.is_enabled = payload.is_enabled
    if payload.test_mode is not None:
        config.test_mode = payload.test_mode
    if payload.phone_number_id is not None:
        config.phone_number_id = payload.phone_number_id.strip() or None
    if payload.waba_id is not None:
        config.waba_id = payload.waba_id.strip() or None
    if payload.access_token is not None and payload.access_token.strip():
        config.access_token = payload.access_token.strip()
    if payload.webhook_verify_token is not None:
        config.webhook_verify_token = payload.webhook_verify_token.strip()
    if payload.app_secret is not None and payload.app_secret.strip():
        config.app_secret = payload.app_secret.strip()
    if payload.business_phone_number is not None:
        config.business_phone_number = payload.business_phone_number.strip() or None
    if payload.business_name is not None:
        config.business_name = payload.business_name.strip()
    if payload.default_language is not None:
        config.default_language = payload.default_language.strip()
    if payload.max_retries is not None:
        config.max_retries = payload.max_retries
    if payload.retry_delay_seconds is not None:
        config.retry_delay_seconds = payload.retry_delay_seconds
    if payload.delivery_eta_threshold_minutes is not None:
        config.delivery_eta_threshold_minutes = payload.delivery_eta_threshold_minutes

    config.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(config)

    raw_token = config.access_token or ""
    masked_token = (raw_token[:6] + "••••••••" + raw_token[-4:]) if len(raw_token) > 10 else ("••••••••" if raw_token else None)

    return WhatsAppConfigOut(
        id=config.id,
        is_enabled=config.is_enabled,
        test_mode=config.test_mode,
        phone_number_id=config.phone_number_id,
        waba_id=config.waba_id,
        access_token_masked=masked_token,
        has_access_token=bool(config.access_token and config.access_token.strip()),
        webhook_verify_token=config.webhook_verify_token,
        has_app_secret=bool(config.app_secret and config.app_secret.strip()),
        business_phone_number=config.business_phone_number,
        business_name=config.business_name,
        default_language=config.default_language,
        max_retries=config.max_retries,
        retry_delay_seconds=config.retry_delay_seconds,
        delivery_eta_threshold_minutes=config.delivery_eta_threshold_minutes,
        updated_at=config.updated_at
    )

# --- Statistics Dashboard (Admin / Managers) ---
@router.get("/stats", response_model=WhatsAppStatsOut)
async def get_whatsapp_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns real database statistics and live delivery rate.
    """
    config = await get_or_create_whatsapp_config(db)

    total_msgs = await db.scalar(select(func.count(WhatsAppMessageLog.id))) or 0
    total_sent = await db.scalar(select(func.count(WhatsAppMessageLog.id)).where(WhatsAppMessageLog.status == "sent")) or 0
    total_simulated = await db.scalar(select(func.count(WhatsAppMessageLog.id)).where(WhatsAppMessageLog.status == "simulated_sent")) or 0
    total_delivered = await db.scalar(select(func.count(WhatsAppMessageLog.id)).where(WhatsAppMessageLog.status == "delivered")) or 0
    total_read = await db.scalar(select(func.count(WhatsAppMessageLog.id)).where(WhatsAppMessageLog.status == "read")) or 0
    total_failed = await db.scalar(select(func.count(WhatsAppMessageLog.id)).where(WhatsAppMessageLog.status == "failed")) or 0
    total_pending = await db.scalar(select(func.count(WhatsAppMessageLog.id)).where(WhatsAppMessageLog.status == "pending")) or 0

    active_templates = await db.scalar(
        select(func.count(WhatsAppTemplate.id)).where(WhatsAppTemplate.is_active == True)
    ) or 0

    one_day_ago = datetime.now(timezone.utc) - timedelta(hours=24)
    recent_24h = await db.scalar(
        select(func.count(WhatsAppMessageLog.id)).where(WhatsAppMessageLog.created_at >= one_day_ago)
    ) or 0

    successful_outbound = total_sent + total_simulated + total_delivered + total_read
    total_decided = successful_outbound + total_failed
    rate = round((successful_outbound / total_decided * 100.0), 1) if total_decided > 0 else 100.0

    return WhatsAppStatsOut(
        total_messages=total_msgs,
        total_sent=total_sent,
        total_delivered=total_delivered,
        total_read=total_read,
        total_failed=total_failed,
        total_pending=total_pending,
        total_simulated=total_simulated,
        delivery_rate_percent=rate,
        is_enabled=config.is_enabled,
        test_mode=config.test_mode,
        configured_phone_id=config.phone_number_id,
        business_phone=config.business_phone_number,
        active_templates_count=active_templates,
        recent_messages_24h=recent_24h
    )

# --- Template Management ---
@router.get("/templates", response_model=List[WhatsAppTemplateOut])
async def list_templates(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WhatsAppTemplate).order_by(WhatsAppTemplate.id.asc())
    templates = (await db.execute(stmt)).scalars().all()
    out = []
    for t in templates:
        vars_list = []
        try:
            vars_list = json.loads(t.variables) if isinstance(t.variables, str) else t.variables
        except Exception:
            vars_list = []
        out.append(WhatsAppTemplateOut(
            id=t.id,
            template_name=t.template_name,
            display_name=t.display_name,
            category=t.category,
            language=t.language,
            event_trigger=t.event_trigger,
            header_text=t.header_text,
            body_text=t.body_text,
            footer_text=t.footer_text,
            variables=vars_list,
            approval_status=t.approval_status,
            is_active=t.is_active,
            created_at=t.created_at,
            updated_at=t.updated_at
        ))
    return out

@router.post("/templates", response_model=WhatsAppTemplateOut)
async def create_template(
    payload: WhatsAppTemplateCreate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    existing = (await db.execute(
        select(WhatsAppTemplate).where(WhatsAppTemplate.template_name == payload.template_name)
    )).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail=f"Template '{payload.template_name}' already exists.")

    new_t = WhatsAppTemplate(
        template_name=payload.template_name.strip(),
        display_name=payload.display_name.strip(),
        category=payload.category,
        language=payload.language,
        event_trigger=payload.event_trigger.strip(),
        header_text=payload.header_text,
        body_text=payload.body_text,
        footer_text=payload.footer_text,
        variables=json.dumps(payload.variables),
        approval_status="APPROVED",
        is_active=True
    )
    db.add(new_t)
    await db.commit()
    await db.refresh(new_t)

    return WhatsAppTemplateOut(
        id=new_t.id,
        template_name=new_t.template_name,
        display_name=new_t.display_name,
        category=new_t.category,
        language=new_t.language,
        event_trigger=new_t.event_trigger,
        header_text=new_t.header_text,
        body_text=new_t.body_text,
        footer_text=new_t.footer_text,
        variables=payload.variables,
        approval_status=new_t.approval_status,
        is_active=new_t.is_active,
        created_at=new_t.created_at,
        updated_at=new_t.updated_at
    )

@router.put("/templates/{template_id}", response_model=WhatsAppTemplateOut)
async def update_template(
    template_id: int,
    payload: WhatsAppTemplateUpdate,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(WhatsAppTemplate).where(WhatsAppTemplate.id == template_id)
    tmpl = (await db.execute(stmt)).scalar_one_or_none()
    if not tmpl:
        raise HTTPException(status_code=404, detail="Template not found.")

    if payload.display_name is not None:
        tmpl.display_name = payload.display_name.strip()
    if payload.category is not None:
        tmpl.category = payload.category
    if payload.language is not None:
        tmpl.language = payload.language
    if payload.event_trigger is not None:
        tmpl.event_trigger = payload.event_trigger.strip()
    if payload.header_text is not None:
        tmpl.header_text = payload.header_text
    if payload.body_text is not None:
        tmpl.body_text = payload.body_text
    if payload.footer_text is not None:
        tmpl.footer_text = payload.footer_text
    if payload.variables is not None:
        tmpl.variables = json.dumps(payload.variables)
    if payload.approval_status is not None:
        tmpl.approval_status = payload.approval_status
    if payload.is_active is not None:
        tmpl.is_active = payload.is_active

    tmpl.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(tmpl)

    vars_list = []
    try:
        vars_list = json.loads(tmpl.variables) if isinstance(tmpl.variables, str) else tmpl.variables
    except Exception:
        vars_list = []

    return WhatsAppTemplateOut(
        id=tmpl.id,
        template_name=tmpl.template_name,
        display_name=tmpl.display_name,
        category=tmpl.category,
        language=tmpl.language,
        event_trigger=tmpl.event_trigger,
        header_text=tmpl.header_text,
        body_text=tmpl.body_text,
        footer_text=tmpl.footer_text,
        variables=vars_list,
        approval_status=tmpl.approval_status,
        is_active=tmpl.is_active,
        created_at=tmpl.created_at,
        updated_at=tmpl.updated_at
    )

# --- Message History & Audit (Admin / Managers) ---
@router.get("/messages")
async def list_message_history(
    search: Optional[str] = Query(None, description="Search by phone, name, or event"),
    status: Optional[str] = Query(None, description="Filter by status: sent, delivered, read, failed, simulated_sent, pending"),
    event: Optional[str] = Query(None, description="Filter by event type"),
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Searchable, paginated audit log of WhatsApp messages with masked phone numbers.
    """
    query = select(WhatsAppMessageLog)

    if status:
        query = query.where(WhatsAppMessageLog.status == status)
    if event:
        query = query.where(WhatsAppMessageLog.event_type == event)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(
            or_(
                WhatsAppMessageLog.recipient_phone.ilike(term),
                WhatsAppMessageLog.recipient_name.ilike(term),
                WhatsAppMessageLog.event_type.ilike(term),
                WhatsAppMessageLog.template_name.ilike(term),
                WhatsAppMessageLog.rendered_body.ilike(term)
            )
        )

    # Count total matching
    count_stmt = select(func.count()).select_from(query.subquery())
    total_count = await db.scalar(count_stmt) or 0

    # Paginate
    offset = (page - 1) * limit
    paged_stmt = query.order_by(desc(WhatsAppMessageLog.created_at)).offset(offset).limit(limit)
    logs = (await db.execute(paged_stmt)).scalars().all()

    items = []
    for l in logs:
        items.append({
            "id": l.id,
            "direction": l.direction,
            "recipient_phone": l.recipient_phone,
            "recipient_phone_masked": mask_phone_number(l.recipient_phone),
            "recipient_name": l.recipient_name,
            "user_id": l.user_id,
            "order_id": l.order_id,
            "invoice_id": l.invoice_id,
            "delivery_id": l.delivery_id,
            "event_type": l.event_type,
            "template_name": l.template_name,
            "rendered_body": l.rendered_body,
            "provider_message_id": l.provider_message_id,
            "status": l.status,
            "error_code": l.error_code,
            "error_message": l.error_message,
            "retry_count": l.retry_count,
            "max_retries": l.max_retries,
            "created_at": l.created_at.isoformat() if l.created_at else None,
            "updated_at": l.updated_at.isoformat() if l.updated_at else None
        })

    return {
        "items": items,
        "total": total_count,
        "page": page,
        "limit": limit,
        "total_pages": (total_count + limit - 1) // limit if total_count > 0 else 1
    }

@router.post("/messages/{log_id}/retry")
async def retry_message(
    log_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Retries an eligible failed message.
    """
    try:
        updated_log = await retry_failed_message(db, log_id)
        return {
            "success": updated_log.status in ["sent", "simulated_sent", "delivered", "read"],
            "status": updated_log.status,
            "retry_count": updated_log.retry_count,
            "error_message": updated_log.error_message
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# --- Test Message Sender Tool ---
@router.post("/test-message")
async def send_test_message(
    payload: WhatsAppTestMessageRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db)
):
    """
    Dispatches a live or simulated test WhatsApp message to verify integration health.
    """
    is_valid, formatted_phone, err = validate_and_format_e164(payload.to_phone)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid phone number: {err}")

    config = await get_or_create_whatsapp_config(db)

    if payload.message_type == "text" and payload.custom_text:
        res = await WhatsAppCloudAPIClient.send_text_message(
            to_phone=formatted_phone,
            body_text=payload.custom_text,
            config=config
        )
    else:
        # Default test template
        components = [
            {
                "type": "body",
                "parameters": [
                    {"type": "text", "text": "Valued Partner"},
                    {"type": "text", "text": "RMVS-TEST-2026"},
                    {"type": "text", "text": "₹0.00"},
                    {"type": "text", "text": "Immediately"},
                    {"type": "text", "text": "https://rmvswebservices.onrender.com"}
                ]
            }
        ]
        res = await WhatsAppCloudAPIClient.send_template_message(
            to_phone=formatted_phone,
            template_name=payload.template_name or "order_confirmed",
            language_code=config.default_language or "en_US",
            components=components,
            config=config
        )

    # Save to log for tracking
    test_log = WhatsAppMessageLog(
        direction="outbound",
        recipient_phone=formatted_phone,
        recipient_name="Admin Test Recipient",
        event_type="admin_test_ping",
        template_name=payload.template_name if payload.message_type != "text" else "custom_text",
        rendered_body=payload.custom_text or "Automated test notification from RMVS WebServices.",
        provider_message_id=res.get("provider_message_id"),
        status=res.get("status", "failed"),
        error_code=res.get("error_code"),
        error_message=res.get("error_message"),
        payload=res.get("payload")
    )
    db.add(test_log)
    await db.commit()

    return {
        "success": res.get("success", False),
        "status": res.get("status"),
        "simulated": res.get("simulated", False),
        "provider_message_id": res.get("provider_message_id"),
        "error_message": res.get("error_message"),
        "formatted_recipient": formatted_phone
    }
