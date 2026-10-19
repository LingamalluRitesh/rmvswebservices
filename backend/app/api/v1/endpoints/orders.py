import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc, or_
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import User
from app.models.orders import Order, Invoice, Delivery
from app.schemas.orders import (
    OrderCreate, OrderStatusUpdate, OrderOut, PublicTrackingOut
)
from app.services.whatsapp.dispatcher import dispatch_whatsapp_event
from app.api.deps import get_current_user, get_current_user_optional

router = APIRouter()

def _format_currency(val: float, curr: str = "INR") -> str:
    sym = "₹" if curr == "INR" else ("$" if curr == "USD" else curr)
    return f"{sym}{val:,.2f}"

def _format_date(dt: Optional[datetime]) -> str:
    if not dt:
        return "To be announced"
    return dt.strftime("%b %d, %Y (%I:%M %p UTC)")

@router.get("", response_model=List[OrderOut])
async def list_orders(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    List orders. Admins/CEOs view all; clients view their own orders.
    """
    stmt = select(Order).options(
        selectinload(Order.invoices),
        selectinload(Order.delivery)
    ).order_by(desc(Order.created_at))

    if current_user.role != "super_admin":
        stmt = stmt.where(Order.client_id == current_user.id)

    if status_filter:
        stmt = stmt.where(Order.status == status_filter)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=OrderOut)
async def create_order(
    payload: OrderCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates a new order, initial invoice, and delivery tracking.
    Automatically sends an 'order_created' WhatsApp message to the customer.
    """
    rand_id = random.randint(1000, 9999)
    order_number = f"RMVS-ORD-{rand_id}"
    tracking_number = f"RMVS-TRK-{rand_id + 50000}"
    invoice_number = f"RMVS-INV-2026-{rand_id}"

    new_order = Order(
        order_number=order_number,
        client_id=payload.client_id or current_user.id,
        customer_name=payload.customer_name.strip(),
        customer_email=payload.customer_email.strip(),
        customer_phone=payload.customer_phone.strip(),
        service_type=payload.service_type.strip(),
        total_amount=payload.total_amount,
        currency=payload.currency or "INR",
        status="created",
        delivery_eta=payload.delivery_eta,
        notes=payload.notes
    )
    db.add(new_order)
    await db.flush()

    # Create associated Invoice
    new_invoice = Invoice(
        invoice_number=invoice_number,
        order_id=new_order.id,
        client_id=new_order.client_id,
        amount=new_order.total_amount,
        currency=new_order.currency,
        status="payment_pending",
        invoice_url=f"/invoices/{invoice_number}",
        payment_url=f"/pay/{invoice_number}"
    )
    db.add(new_invoice)

    # Create associated Delivery Tracking
    new_delivery = Delivery(
        order_id=new_order.id,
        tracking_number=tracking_number,
        delivery_agent_name="RMVS Engineering Lead",
        delivery_agent_phone="+919400900000",
        status="assigned",
        estimated_delivery=new_order.delivery_eta,
        tracking_url=f"/track/{tracking_number}"
    )
    db.add(new_delivery)
    await db.commit()
    await db.refresh(new_order)

    # AUTOMATED WHATSAPP NOTIFICATION: Order Created
    tracking_url = f"https://rmvswebservices.onrender.com/track/{tracking_number}"
    await dispatch_whatsapp_event(
        db=db,
        event_type="order_created",
        recipient_phone=new_order.customer_phone,
        customer_name=new_order.customer_name,
        variables={
            "customer_name": new_order.customer_name,
            "order_number": new_order.order_number,
            "service_type": new_order.service_type,
            "total_amount": _format_currency(new_order.total_amount, new_order.currency),
            "estimated_delivery": _format_date(new_order.delivery_eta),
            "tracking_url": tracking_url
        },
        user_id=new_order.client_id,
        order_id=new_order.id,
        idempotency_key=f"order_created_{new_order.id}"
    )

    return new_order

@router.get("/{order_id}")
async def get_order_details(
    order_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(
            selectinload(Order.invoices),
            selectinload(Order.delivery),
            selectinload(Order.message_logs)
        )
    )
    order = (await db.execute(stmt)).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if current_user.role != "super_admin" and order.client_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to view this order")

    return {
        "id": order.id,
        "order_number": order.order_number,
        "client_id": order.client_id,
        "customer_name": order.customer_name,
        "customer_email": order.customer_email,
        "customer_phone": order.customer_phone,
        "service_type": order.service_type,
        "total_amount": order.total_amount,
        "currency": order.currency,
        "status": order.status,
        "delivery_eta": order.delivery_eta.isoformat() if order.delivery_eta else None,
        "cancellation_reason": order.cancellation_reason,
        "notes": order.notes,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "updated_at": order.updated_at.isoformat() if order.updated_at else None,
        "invoices": [
            {
                "id": inv.id,
                "invoice_number": inv.invoice_number,
                "amount": inv.amount,
                "currency": inv.currency,
                "status": inv.status,
                "invoice_url": inv.invoice_url,
                "payment_url": inv.payment_url
            } for inv in order.invoices
        ],
        "delivery": {
            "id": order.delivery.id,
            "tracking_number": order.delivery.tracking_number,
            "status": order.delivery.status,
            "estimated_delivery": order.delivery.estimated_delivery.isoformat() if order.delivery.estimated_delivery else None,
            "tracking_url": order.delivery.tracking_url
        } if order.delivery else None
    }

@router.put("/{order_id}/status", response_model=OrderOut)
async def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates the order status and automatically fires the corresponding WhatsApp notification.
    Events: order_confirmed, order_accepted, order_rejected, order_processing,
    order_packed, order_dispatched, order_delivered, order_cancelled
    """
    stmt = (
        select(Order)
        .where(Order.id == order_id)
        .options(selectinload(Order.delivery))
    )
    order = (await db.execute(stmt)).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    old_status = order.status
    new_status = payload.status.lower()
    order.status = new_status

    if payload.cancellation_reason:
        order.cancellation_reason = payload.cancellation_reason
    if payload.delivery_eta:
        order.delivery_eta = payload.delivery_eta
        if order.delivery:
            order.delivery.estimated_delivery = payload.delivery_eta
    if payload.notes:
        order.notes = payload.notes

    order.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(order)

    # AUTOMATED WHATSAPP NOTIFICATION ROUTING
    tracking_num = order.delivery.tracking_number if order.delivery else order.order_number
    tracking_url = f"https://rmvswebservices.onrender.com/track/{tracking_num}"

    event_map = {
        "confirmed": "order_confirmed",
        "accepted": "order_accepted",
        "rejected": "order_rejected",
        "processing": "order_processing",
        "packed": "order_packed",
        "dispatched": "order_dispatched",
        "delivered": "order_delivered",
        "cancelled": "order_cancelled"
    }

    event_type = event_map.get(new_status)
    if event_type:
        vars_dict = {
            "customer_name": order.customer_name,
            "order_number": order.order_number,
            "service_type": order.service_type,
            "total_amount": _format_currency(order.total_amount, order.currency),
            "estimated_delivery": _format_date(order.delivery_eta),
            "tracking_url": tracking_url,
            "rejection_reason": payload.cancellation_reason or "Executive operational decision.",
            "cancellation_reason": payload.cancellation_reason or "Cancelled by request.",
            "refund_status": "Initiated to original payment source."
        }
        await dispatch_whatsapp_event(
            db=db,
            event_type=event_type,
            recipient_phone=order.customer_phone,
            customer_name=order.customer_name,
            variables=vars_dict,
            user_id=order.client_id,
            order_id=order.id,
            idempotency_key=f"order_{new_status}_{order.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )

    return order

# --- Public Order Tracking ---
@router.get("/track/{identifier}", response_model=PublicTrackingOut)
async def public_track_order(
    identifier: str,
    db: AsyncSession = Depends(get_db)
):
    """
    Public order tracking endpoint.
    Accessible without authentication using tracking number (RMVS-TRK-*) or order number (RMVS-ORD-*).
    """
    clean_id = identifier.strip().upper()

    # Search by delivery tracking number or order number
    stmt = (
        select(Order)
        .outerjoin(Order.delivery)
        .where(
            or_(
                Order.order_number == clean_id,
                Delivery.tracking_number == clean_id
            )
        )
        .options(selectinload(Order.delivery))
    )
    order = (await db.execute(stmt)).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Order or tracking reference not found.")

    delivery = order.delivery
    status_str = delivery.status if delivery else order.status

    # Milestones logic
    all_milestones = [
        {"title": "Order Placed", "key": "created", "completed": True},
        {"title": "Confirmed & Accepted", "key": "confirmed", "completed": order.status in ["confirmed", "accepted", "processing", "packed", "dispatched", "out_for_delivery", "delivered"]},
        {"title": "Engineering & Assembly", "key": "processing", "completed": order.status in ["processing", "packed", "dispatched", "out_for_delivery", "delivered"]},
        {"title": "Packed & Ready", "key": "packed", "completed": order.status in ["packed", "dispatched", "out_for_delivery", "delivered"]},
        {"title": "Dispatched", "key": "dispatched", "completed": order.status in ["dispatched", "out_for_delivery", "delivered"] or (delivery and delivery.status in ["in_transit", "out_for_delivery", "delivered"])},
        {"title": "Out for Delivery", "key": "out_for_delivery", "completed": order.status in ["out_for_delivery", "delivered"] or (delivery and delivery.status in ["out_for_delivery", "delivered"])},
        {"title": "Delivered", "key": "delivered", "completed": order.status == "delivered" or (delivery and delivery.status == "delivered")}
    ]

    return PublicTrackingOut(
        order_number=order.order_number,
        tracking_number=delivery.tracking_number if delivery else f"TRK-{order.id}",
        customer_name=order.customer_name,
        service_type=order.service_type,
        status=order.status,
        estimated_delivery=order.delivery_eta,
        actual_delivery=delivery.actual_delivery if delivery else None,
        delivery_agent_name=delivery.delivery_agent_name if delivery else "RMVS Lead Engineer",
        delivery_agent_phone=delivery.delivery_agent_phone if delivery else "+919400900000",
        destination_address=delivery.destination_address if delivery else "Client Designated Location",
        is_delivered=order.status == "delivered" or (delivery and delivery.status == "delivered"),
        milestones=all_milestones
    )
