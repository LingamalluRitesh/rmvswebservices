import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import User
from app.models.orders import Order, Delivery
from app.schemas.orders import (
    DeliveryCreate, DeliveryStatusUpdate, DeliveryOut
)
from app.services.whatsapp.dispatcher import (
    dispatch_whatsapp_event, get_or_create_whatsapp_config
)
from app.api.deps import get_current_user

router = APIRouter()

def _format_date(dt: Optional[datetime]) -> str:
    if not dt:
        return "Shortly"
    return dt.strftime("%b %d, %Y (%I:%M %p UTC)")

@router.get("", response_model=List[DeliveryOut])
async def list_deliveries(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Delivery).options(selectinload(Delivery.order)).order_by(desc(Delivery.created_at))
    if status_filter:
        stmt = stmt.where(Delivery.status == status_filter)
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=DeliveryOut)
async def assign_delivery(
    payload: DeliveryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Assigns a delivery specialist to an order and sends 'order_assigned' WhatsApp notification.
    """
    order = (await db.execute(select(Order).where(Order.id == payload.order_id))).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Referenced order not found.")

    tracking_num = f"RMVS-TRK-{random.randint(10000, 99999)}"
    tracking_url = f"https://rmvswebservices.onrender.com/track/{tracking_num}"

    # Check if delivery record already exists for order
    existing_del = (await db.execute(select(Delivery).where(Delivery.order_id == order.id))).scalar_one_or_none()
    if existing_del:
        existing_del.delivery_agent_name = payload.delivery_agent_name or "RMVS Logistics Specialist"
        existing_del.delivery_agent_phone = payload.delivery_agent_phone or "+919400900000"
        if payload.estimated_delivery:
            existing_del.estimated_delivery = payload.estimated_delivery
        if payload.destination_address:
            existing_del.destination_address = payload.destination_address
        existing_del.updated_at = datetime.now(timezone.utc)
        delivery_obj = existing_del
    else:
        delivery_obj = Delivery(
            order_id=order.id,
            tracking_number=tracking_num,
            delivery_agent_name=payload.delivery_agent_name or "RMVS Logistics Specialist",
            delivery_agent_phone=payload.delivery_agent_phone or "+919400900000",
            status="assigned",
            estimated_delivery=payload.estimated_delivery or order.delivery_eta,
            destination_address=payload.destination_address,
            tracking_url=tracking_url
        )
        db.add(delivery_obj)

    await db.commit()
    await db.refresh(delivery_obj)

    # AUTOMATED WHATSAPP NOTIFICATION: Order Assigned
    await dispatch_whatsapp_event(
        db=db,
        event_type="order_assigned",
        recipient_phone=order.customer_phone,
        customer_name=order.customer_name,
        variables={
            "customer_name": order.customer_name,
            "delivery_agent_name": delivery_obj.delivery_agent_name,
            "delivery_agent_phone": delivery_obj.delivery_agent_phone,
            "order_number": order.order_number,
            "estimated_delivery": _format_date(delivery_obj.estimated_delivery),
            "tracking_url": tracking_url
        },
        user_id=order.client_id,
        order_id=order.id,
        delivery_id=delivery_obj.id,
        idempotency_key=f"del_assign_{delivery_obj.id}_{int(datetime.now(timezone.utc).timestamp())}"
    )

    return delivery_obj

@router.put("/{delivery_id}/status", response_model=DeliveryOut)
async def update_delivery_status(
    delivery_id: int,
    payload: DeliveryStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates delivery milestone and triggers relevant WhatsApp notifications:
    - out_for_delivery: 'order_out_for_delivery'
    - delivered: 'order_delivered'
    - exception: 'delivery_exception'
    """
    stmt = select(Delivery).where(Delivery.id == delivery_id).options(selectinload(Delivery.order))
    delivery = (await db.execute(stmt)).scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery record not found.")

    new_status = payload.status.lower()
    delivery.status = new_status
    if payload.exception_reason:
        delivery.exception_reason = payload.exception_reason
    if payload.estimated_delivery:
        delivery.estimated_delivery = payload.estimated_delivery
    if payload.latitude is not None:
        delivery.latitude = payload.latitude
    if payload.longitude is not None:
        delivery.longitude = payload.longitude
    if new_status == "delivered":
        delivery.actual_delivery = datetime.now(timezone.utc)
        if delivery.order:
            delivery.order.status = "delivered"

    delivery.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(delivery)

    order = delivery.order
    customer_phone = order.customer_phone if order else "+919400900000"
    customer_name = order.customer_name if order else "Customer"
    tracking_url = f"https://rmvswebservices.onrender.com/track/{delivery.tracking_number}"

    if new_status == "out_for_delivery":
        await dispatch_whatsapp_event(
            db=db,
            event_type="order_out_for_delivery",
            recipient_phone=customer_phone,
            customer_name=customer_name,
            variables={
                "customer_name": customer_name,
                "order_number": order.order_number if order else "N/A",
                "delivery_agent_name": delivery.delivery_agent_name or "Logistics Lead",
                "estimated_delivery": _format_date(delivery.estimated_delivery),
                "tracking_url": tracking_url
            },
            user_id=order.client_id if order else None,
            order_id=order.id if order else None,
            delivery_id=delivery.id,
            idempotency_key=f"out_for_delivery_{delivery.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )
    elif new_status == "delivered":
        await dispatch_whatsapp_event(
            db=db,
            event_type="order_delivered",
            recipient_phone=customer_phone,
            customer_name=customer_name,
            variables={
                "customer_name": customer_name,
                "order_number": order.order_number if order else "N/A"
            },
            user_id=order.client_id if order else None,
            order_id=order.id if order else None,
            delivery_id=delivery.id,
            idempotency_key=f"del_delivered_{delivery.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )
    elif new_status == "exception":
        await dispatch_whatsapp_event(
            db=db,
            event_type="delivery_exception",
            recipient_phone=customer_phone,
            customer_name=customer_name,
            variables={
                "customer_name": customer_name,
                "order_number": order.order_number if order else "N/A",
                "exception_reason": delivery.exception_reason or "Temporary delay in transit.",
                "tracking_url": tracking_url
            },
            user_id=order.client_id if order else None,
            order_id=order.id if order else None,
            delivery_id=delivery.id,
            idempotency_key=f"del_exception_{delivery.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )

    return delivery

@router.put("/{delivery_id}/eta", response_model=DeliveryOut)
async def update_delivery_eta(
    delivery_id: int,
    new_eta: datetime,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates ETA and sends 'delivery_eta_updated' WhatsApp notification
    only if the change exceeds the configured delivery_eta_threshold_minutes.
    """
    stmt = select(Delivery).where(Delivery.id == delivery_id).options(selectinload(Delivery.order))
    delivery = (await db.execute(stmt)).scalar_one_or_none()
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery record not found.")

    config = await get_or_create_whatsapp_config(db)
    threshold_min = config.delivery_eta_threshold_minutes or 30

    old_eta = delivery.estimated_delivery
    delivery.estimated_delivery = new_eta
    delivery.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(delivery)

    # Check threshold difference
    should_notify = True
    if old_eta:
        diff_minutes = abs((new_eta - old_eta).total_seconds()) / 60.0
        should_notify = diff_minutes >= threshold_min

    if should_notify:
        order = delivery.order
        customer_phone = order.customer_phone if order else "+919400900000"
        customer_name = order.customer_name if order else "Customer"
        tracking_url = f"https://rmvswebservices.onrender.com/track/{delivery.tracking_number}"

        await dispatch_whatsapp_event(
            db=db,
            event_type="delivery_eta_updated",
            recipient_phone=customer_phone,
            customer_name=customer_name,
            variables={
                "customer_name": customer_name,
                "order_number": order.order_number if order else "N/A",
                "estimated_delivery": _format_date(new_eta),
                "tracking_url": tracking_url
            },
            user_id=order.client_id if order else None,
            order_id=order.id if order else None,
            delivery_id=delivery.id,
            idempotency_key=f"eta_update_{delivery.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )

    return delivery
