from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

class OrderBase(BaseModel):
    customer_name: str
    customer_email: str
    customer_phone: str
    service_type: str
    total_amount: float
    currency: str = "INR"
    notes: Optional[str] = None

class OrderCreate(OrderBase):
    delivery_eta: Optional[datetime] = None
    client_id: Optional[int] = None

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., description="created, confirmed, accepted, rejected, processing, packed, dispatched, out_for_delivery, delivered, cancelled, refunded")
    cancellation_reason: Optional[str] = None
    delivery_eta: Optional[datetime] = None
    notes: Optional[str] = None

class OrderOut(OrderBase):
    id: int
    order_number: str
    client_id: Optional[int] = None
    status: str
    delivery_eta: Optional[datetime] = None
    cancellation_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class InvoiceCreate(BaseModel):
    order_id: int
    amount: float
    currency: str = "INR"
    due_date: Optional[datetime] = None
    payment_url: Optional[str] = None

class InvoiceStatusUpdate(BaseModel):
    status: str = Field(..., description="draft, generated, updated, payment_pending, paid, failed, refunded")
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    receipt_url: Optional[str] = None

class InvoiceOut(BaseModel):
    id: int
    invoice_number: str
    order_id: int
    client_id: Optional[int] = None
    amount: float
    currency: str
    status: str
    due_date: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    payment_method: Optional[str] = None
    transaction_id: Optional[str] = None
    invoice_url: Optional[str] = None
    payment_url: Optional[str] = None
    receipt_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DeliveryCreate(BaseModel):
    order_id: int
    delivery_agent_name: Optional[str] = "RMVS Logistics Specialist"
    delivery_agent_phone: Optional[str] = "+919400900000"
    estimated_delivery: Optional[datetime] = None
    destination_address: Optional[str] = None

class DeliveryStatusUpdate(BaseModel):
    status: str = Field(..., description="assigned, started, in_transit, out_for_delivery, delivered, exception")
    exception_reason: Optional[str] = None
    estimated_delivery: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class DeliveryOut(BaseModel):
    id: int
    order_id: int
    tracking_number: str
    delivery_agent_id: Optional[int] = None
    delivery_agent_name: Optional[str] = None
    delivery_agent_phone: Optional[str] = None
    status: str
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    destination_address: Optional[str] = None
    tracking_url: Optional[str] = None
    exception_reason: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class PublicTrackingOut(BaseModel):
    order_number: str
    tracking_number: str
    customer_name: str
    service_type: str
    status: str
    estimated_delivery: Optional[datetime] = None
    actual_delivery: Optional[datetime] = None
    delivery_agent_name: Optional[str] = None
    delivery_agent_phone: Optional[str] = None
    destination_address: Optional[str] = None
    is_delivered: bool
    milestones: List[dict] = []
