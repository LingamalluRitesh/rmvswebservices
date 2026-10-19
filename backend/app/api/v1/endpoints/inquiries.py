from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import ClientInquiry, DeveloperProfile, User, Notification, Conversation, ConversationMember
from app.schemas import ClientInquiryCreate, ClientInquiryUpdate, ClientInquiryOut
from app.api.deps import get_current_user, get_current_user_optional
from app.services.whatsapp.dispatcher import dispatch_whatsapp_event, get_or_create_whatsapp_config

router = APIRouter()

@router.post("", response_model=ClientInquiryOut)
async def create_inquiry(
    payload: ClientInquiryCreate,
    current_user: Optional[User] = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db)
):
    dev_profile = None
    if payload.developer_id:
        dev_stmt = (
            select(DeveloperProfile)
            .join(DeveloperProfile.user)
            .where(DeveloperProfile.id == payload.developer_id)
            .options(selectinload(DeveloperProfile.user))
        )
        dev_profile = (await db.execute(dev_stmt)).scalar_one_or_none()

    client_id = current_user.id if current_user else None
    sender_name = payload.name or (current_user.full_name if current_user else "Website Visitor")
    sender_email = payload.email or (current_user.email if current_user else "contact@rmvswebservices.com")

    new_inquiry = ClientInquiry(
        client_id=client_id,
        developer_id=dev_profile.id if dev_profile else None,
        name=sender_name,
        company=payload.company,
        email=sender_email,
        phone=payload.phone,
        project_name=payload.project_name,
        project_type=payload.project_type,
        requirements=payload.requirements,
        budget_range=payload.budget_range,
        timeline=payload.timeline,
        preferred_developer=payload.preferred_developer,
        description=payload.description,
        status="New"
    )
    db.add(new_inquiry)
    await db.flush()

    # If developer targeted, notify developer
    if dev_profile:
        notif = Notification(
            user_id=dev_profile.user_id,
            title="New Project Inquiry",
            message=f"You received an inquiry from {sender_name} for '{payload.project_name}'.",
            type="inquiry",
            link="/dashboard/inquiries"
        )
        db.add(notif)

        if current_user:
            conv = Conversation(inquiry_id=new_inquiry.id)
            db.add(conv)
            await db.flush()
            m1 = ConversationMember(conversation_id=conv.id, user_id=current_user.id)
            m2 = ConversationMember(conversation_id=conv.id, user_id=dev_profile.user_id)
            db.add_all([m1, m2])

    await db.commit()
    await db.refresh(new_inquiry)

    # AUTOMATED WHATSAPP NOTIFICATION: Alert configured business WhatsApp number
    config = await get_or_create_whatsapp_config(db)
    if config.is_enabled and config.business_phone_number:
        await dispatch_whatsapp_event(
            db=db,
            event_type="contact_inquiry",
            recipient_phone=config.business_phone_number,
            customer_name=sender_name,
            variables={
                "customer_name": sender_name,
                "customer_email": sender_email,
                "service_type": payload.project_type or payload.project_name,
                "message_snippet": (payload.description or "")[:150],
                "inquiry_url": "https://rmvswebservices.onrender.com/ceo"
            },
            idempotency_key=f"inq_lead_{new_inquiry.id}"
        )

    await db.commit()
    await db.refresh(new_inquiry)

    # Re-fetch with relations
    inq_stmt = (
        select(ClientInquiry)
        .where(ClientInquiry.id == new_inquiry.id)
        .options(
            selectinload(ClientInquiry.client),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.user),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.skills)
        )
    )
    return (await db.execute(inq_stmt)).scalar_one()

@router.get("/developer", response_model=List[ClientInquiryOut])
async def get_developer_inquiries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    dev_stmt = select(DeveloperProfile).where(DeveloperProfile.user_id == current_user.id)
    dev_profile = (await db.execute(dev_stmt)).scalar_one_or_none()
    if not dev_profile:
        return []

    stmt = (
        select(ClientInquiry)
        .where(ClientInquiry.developer_id == dev_profile.id)
        .options(
            selectinload(ClientInquiry.client),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.user),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.skills)
        )
        .order_by(ClientInquiry.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/client", response_model=List[ClientInquiryOut])
async def get_client_inquiries(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ClientInquiry)
        .where(ClientInquiry.client_id == current_user.id)
        .options(
            selectinload(ClientInquiry.client),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.user),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.skills)
        )
        .order_by(ClientInquiry.created_at.desc())
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.put("/{inquiry_id}/status", response_model=ClientInquiryOut)
async def update_inquiry_status(
    inquiry_id: int,
    payload: ClientInquiryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(ClientInquiry)
        .where(ClientInquiry.id == inquiry_id)
        .options(
            selectinload(ClientInquiry.client),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.user),
            selectinload(ClientInquiry.developer).selectinload(DeveloperProfile.skills)
        )
    )
    inquiry = (await db.execute(stmt)).scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    # Only developer, client, or admin can update status
    is_authorized = (
        current_user.id == inquiry.client_id or
        current_user.id == inquiry.developer.user_id or
        current_user.role == "super_admin"
    )
    if not is_authorized:
        raise HTTPException(status_code=403, detail="Not authorized to update this inquiry")

    inquiry.status = payload.status
    await db.commit()
    await db.refresh(inquiry)
    return inquiry
