from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models import User
from app.models.whatsapp import CustomerWhatsAppPreference
from app.schemas.whatsapp import (
    CustomerWhatsAppPreferenceOut, CustomerWhatsAppPreferenceUpdate
)
from app.services.whatsapp.phone_utils import validate_and_format_e164
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/preferences", response_model=CustomerWhatsAppPreferenceOut)
async def get_my_preferences(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Returns the customer's WhatsApp notification preferences.
    """
    stmt = select(CustomerWhatsAppPreference).where(
        CustomerWhatsAppPreference.user_id == current_user.id
    )
    pref = (await db.execute(stmt)).scalar_one_or_none()
    if not pref:
        # Create default preferences
        default_phone = current_user.phone or "+919400900000"
        _, fmt_phone, _ = validate_and_format_e164(default_phone)
        pref = CustomerWhatsAppPreference(
            user_id=current_user.id,
            customer_email=current_user.email,
            whatsapp_phone=fmt_phone or default_phone,
            phone_verified=False,
            consent_given=True,
            consent_timestamp=datetime.now(timezone.utc),
            transactional_enabled=True,
            marketing_enabled=False,
            preferred_language="en_US"
        )
        db.add(pref)
        await db.commit()
        await db.refresh(pref)
    return pref

@router.put("/preferences", response_model=CustomerWhatsAppPreferenceOut)
async def update_my_preferences(
    payload: CustomerWhatsAppPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates WhatsApp phone number and opt-in/opt-out consent.
    """
    is_valid, fmt_phone, err = validate_and_format_e164(payload.whatsapp_phone)
    if not is_valid:
        raise HTTPException(status_code=400, detail=f"Invalid phone number: {err}")

    stmt = select(CustomerWhatsAppPreference).where(
        CustomerWhatsAppPreference.user_id == current_user.id
    )
    pref = (await db.execute(stmt)).scalar_one_or_none()
    if not pref:
        pref = CustomerWhatsAppPreference(
            user_id=current_user.id,
            customer_email=current_user.email,
            whatsapp_phone=fmt_phone,
            phone_verified=True,
            consent_given=True,
            consent_timestamp=datetime.now(timezone.utc),
            transactional_enabled=payload.transactional_enabled if payload.transactional_enabled is not None else True,
            marketing_enabled=payload.marketing_enabled if payload.marketing_enabled is not None else False,
            preferred_language=payload.preferred_language or "en_US"
        )
        db.add(pref)
    else:
        pref.whatsapp_phone = fmt_phone
        if payload.transactional_enabled is not None:
            pref.transactional_enabled = payload.transactional_enabled
        if payload.marketing_enabled is not None:
            pref.marketing_enabled = payload.marketing_enabled
        if payload.preferred_language is not None:
            pref.preferred_language = payload.preferred_language
        pref.consent_given = True
        pref.opt_out_at = None
        pref.updated_at = datetime.now(timezone.utc)

    await db.commit()
    await db.refresh(pref)
    return pref
