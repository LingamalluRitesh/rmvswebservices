from typing import List, Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.core.database import get_db
from app.models import Notification, User
from app.schemas import NotificationOut
from app.api.deps import get_current_user
from app.services.phone_alerts import notify_ceo_phone

router = APIRouter()

class PhoneAlertRequest(BaseModel):
    event_type: str = "website_activity"
    title: str
    details: str
    customer_name: Optional[str] = "Website Visitor"
    customer_phone: Optional[str] = None
    customer_email: Optional[str] = None
    action_url: Optional[str] = "https://rmvswebservices.onrender.com/ceo"

@router.post("/phone-alert")
async def trigger_phone_alert(
    payload: PhoneAlertRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Triggers an instant automatic WhatsApp / SMS alert to CEO Ritesh Lingamallu's phone
    when any action occurs on the website.
    """
    log = await notify_ceo_phone(
        db=db,
        event_type=payload.event_type,
        title=payload.title,
        details=payload.details,
        customer_name=payload.customer_name,
        customer_phone=payload.customer_phone,
        customer_email=payload.customer_email,
        action_url=payload.action_url
    )
    return {
        "status": "sent" if log and log.status in ["sent", "simulated_sent"] else "queued",
        "event": payload.event_type,
        "message": "CEO phone notification dispatched successfully."
    }

@router.get("", response_model=List[NotificationOut])
async def list_notifications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Notification)
        .where(Notification.user_id == current_user.id)
        .order_by(Notification.created_at.desc())
        .limit(50)
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@router.put("/{notification_id}/read")
async def mark_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    )
    notif = (await db.execute(stmt)).scalar_one_or_none()
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notif.is_read = True
    await db.commit()
    return {"status": "success"}

@router.put("/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        update(Notification)
        .where(Notification.user_id == current_user.id, Notification.is_read == False)
        .values(is_read=True)
    )
    await db.execute(stmt)
    await db.commit()
    return {"status": "success", "message": "All notifications marked as read"}
