import random
from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
from sqlalchemy.orm import selectinload
from app.core.database import get_db
from app.models import User
from app.models.orders import Order, Invoice
from app.schemas.orders import (
    InvoiceCreate, InvoiceStatusUpdate, InvoiceOut
)
from app.services.whatsapp.dispatcher import dispatch_whatsapp_event
from app.api.deps import get_current_user

router = APIRouter()

def _format_currency(val: float, curr: str = "INR") -> str:
    sym = "₹" if curr == "INR" else ("$" if curr == "USD" else curr)
    return f"{sym}{val:,.2f}"

def _format_date(dt: Optional[datetime]) -> str:
    if not dt:
        return "Upon Receipt"
    return dt.strftime("%b %d, %Y")

@router.get("", response_model=List[InvoiceOut])
async def list_invoices(
    status_filter: Optional[str] = Query(None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(Invoice).options(selectinload(Invoice.order)).order_by(desc(Invoice.created_at))
    if current_user.role != "super_admin":
        stmt = stmt.where(Invoice.client_id == current_user.id)
    if status_filter:
        stmt = stmt.where(Invoice.status == status_filter)

    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("", response_model=InvoiceOut)
async def create_invoice(
    payload: InvoiceCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Creates an invoice and dispatches an 'invoice_generated' WhatsApp notification.
    """
    order = (await db.execute(select(Order).where(Order.id == payload.order_id))).scalar_one_or_none()
    if not order:
        raise HTTPException(status_code=404, detail="Referenced order not found.")

    inv_num = f"RMVS-INV-2026-{random.randint(1000, 9999)}"
    inv_url = f"https://rmvswebservices.onrender.com/invoices/{inv_num}"
    pay_url = payload.payment_url or f"https://rmvswebservices.onrender.com/pay/{inv_num}"

    new_inv = Invoice(
        invoice_number=inv_num,
        order_id=order.id,
        client_id=order.client_id,
        amount=payload.amount,
        currency=payload.currency or "INR",
        status="generated",
        due_date=payload.due_date,
        invoice_url=inv_url,
        payment_url=pay_url
    )
    db.add(new_inv)
    await db.commit()
    await db.refresh(new_inv)

    # AUTOMATED WHATSAPP NOTIFICATION: Invoice Generated
    await dispatch_whatsapp_event(
        db=db,
        event_type="invoice_generated",
        recipient_phone=order.customer_phone,
        customer_name=order.customer_name,
        variables={
            "customer_name": order.customer_name,
            "invoice_number": new_inv.invoice_number,
            "total_amount": _format_currency(new_inv.amount, new_inv.currency),
            "payment_status": "Pending",
            "invoice_url": inv_url
        },
        user_id=order.client_id,
        order_id=order.id,
        invoice_id=new_inv.id,
        idempotency_key=f"invoice_gen_{new_inv.id}"
    )

    return new_inv

@router.put("/{invoice_id}/status", response_model=InvoiceOut)
async def update_invoice_status(
    invoice_id: int,
    payload: InvoiceStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Updates invoice billing status and triggers relevant WhatsApp notifications:
    - paid: 'payment_received'
    - failed: 'payment_failed'
    - refunded: 'refund_completed'
    - updated: 'invoice_updated'
    """
    stmt = select(Invoice).where(Invoice.id == invoice_id).options(selectinload(Invoice.order))
    inv = (await db.execute(stmt)).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    new_status = payload.status.lower()
    inv.status = new_status
    if payload.payment_method:
        inv.payment_method = payload.payment_method
    if payload.transaction_id:
        inv.transaction_id = payload.transaction_id
    if payload.receipt_url:
        inv.receipt_url = payload.receipt_url
    if new_status == "paid":
        inv.paid_at = datetime.now(timezone.utc)

    inv.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(inv)

    order = inv.order
    customer_phone = order.customer_phone if order else "+919400900000"
    customer_name = order.customer_name if order else "Valued Client"
    receipt_link = inv.receipt_url or f"https://rmvswebservices.onrender.com/receipts/{inv.invoice_number}"

    if new_status == "paid":
        await dispatch_whatsapp_event(
            db=db,
            event_type="payment_received",
            recipient_phone=customer_phone,
            customer_name=customer_name,
            variables={
                "customer_name": customer_name,
                "total_amount": _format_currency(inv.amount, inv.currency),
                "invoice_number": inv.invoice_number,
                "payment_method": inv.payment_method or "Online Transfer",
                "transaction_id": inv.transaction_id or f"TXN-{random.randint(100000, 999999)}",
                "receipt_url": receipt_link
            },
            user_id=inv.client_id,
            order_id=inv.order_id,
            invoice_id=inv.id,
            idempotency_key=f"inv_paid_{inv.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )
    elif new_status == "failed":
        await dispatch_whatsapp_event(
            db=db,
            event_type="payment_failed",
            recipient_phone=customer_phone,
            customer_name=customer_name,
            variables={
                "customer_name": customer_name,
                "invoice_number": inv.invoice_number,
                "total_amount": _format_currency(inv.amount, inv.currency),
                "payment_url": inv.payment_url or f"https://rmvswebservices.onrender.com/pay/{inv.invoice_number}"
            },
            user_id=inv.client_id,
            order_id=inv.order_id,
            invoice_id=inv.id,
            idempotency_key=f"inv_failed_{inv.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )
    elif new_status == "refunded":
        await dispatch_whatsapp_event(
            db=db,
            event_type="refund_completed",
            recipient_phone=customer_phone,
            customer_name=customer_name,
            variables={
                "customer_name": customer_name,
                "total_amount": _format_currency(inv.amount, inv.currency),
                "invoice_number": inv.invoice_number,
                "order_number": order.order_number if order else "N/A",
                "transaction_id": inv.transaction_id or f"REF-{random.randint(100000, 999999)}"
            },
            user_id=inv.client_id,
            order_id=inv.order_id,
            invoice_id=inv.id,
            idempotency_key=f"inv_refund_{inv.id}_{int(datetime.now(timezone.utc).timestamp())}"
        )

    return inv

@router.post("/{invoice_id}/remind")
async def send_payment_reminder(
    invoice_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Manually or scheduled trigger of a 'payment_reminder' WhatsApp message.
    """
    stmt = select(Invoice).where(Invoice.id == invoice_id).options(selectinload(Invoice.order))
    inv = (await db.execute(stmt)).scalar_one_or_none()
    if not inv:
        raise HTTPException(status_code=404, detail="Invoice not found.")

    order = inv.order
    customer_phone = order.customer_phone if order else "+919400900000"
    customer_name = order.customer_name if order else "Valued Client"

    log = await dispatch_whatsapp_event(
        db=db,
        event_type="payment_reminder",
        recipient_phone=customer_phone,
        customer_name=customer_name,
        variables={
            "customer_name": customer_name,
            "invoice_number": inv.invoice_number,
            "total_amount": _format_currency(inv.amount, inv.currency),
            "due_date": _format_date(inv.due_date),
            "payment_url": inv.payment_url or f"https://rmvswebservices.onrender.com/pay/{inv.invoice_number}"
        },
        user_id=inv.client_id,
        order_id=inv.order_id,
        invoice_id=inv.id,
        idempotency_key=f"remind_{inv.id}_{int(datetime.now(timezone.utc).timestamp())}"
    )

    return {
        "success": True,
        "message": f"Payment reminder queued for {customer_name} ({customer_phone})",
        "log_status": log.status if log else "sent"
    }
