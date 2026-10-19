from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Order(Base):
    """
    Client order entity supporting full lifecycle automation.
    """
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(100), unique=True, index=True, nullable=False) # e.g. RMVS-ORD-1001
    client_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False) # E.164
    service_type = Column(String(255), nullable=False) # e.g. Full-Stack Web Platform, AI Architecture
    
    total_amount = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    
    # Lifecycle: created -> confirmed -> accepted/rejected -> processing -> packed -> dispatched -> out_for_delivery -> delivered / cancelled / refunded
    status = Column(String(50), default="created", index=True, nullable=False)
    
    delivery_eta = Column(DateTime(timezone=True), nullable=True)
    cancellation_reason = Column(String(500), nullable=True)
    notes = Column(Text, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    client = relationship("User", foreign_keys=[client_id], lazy="selectin")
    invoices = relationship("Invoice", back_populates="order", cascade="all, delete-orphan", lazy="selectin")
    delivery = relationship("Delivery", back_populates="order", uselist=False, cascade="all, delete-orphan", lazy="selectin")
    message_logs = relationship("WhatsAppMessageLog", back_populates="order", cascade="all, delete-orphan", lazy="selectin")

class Invoice(Base):
    """
    Billing & payment invoice records.
    """
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_number = Column(String(100), unique=True, index=True, nullable=False) # e.g. RMVS-INV-2026-001
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    client_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    
    amount = Column(Float, default=0.0, nullable=False)
    currency = Column(String(10), default="INR", nullable=False)
    
    # Billing status: draft, generated, updated, payment_pending, paid, failed, refunded
    status = Column(String(50), default="generated", index=True, nullable=False)
    
    due_date = Column(DateTime(timezone=True), nullable=True)
    paid_at = Column(DateTime(timezone=True), nullable=True)
    payment_method = Column(String(100), nullable=True) # e.g. UPI, NetBanking, Card, Stripe
    transaction_id = Column(String(255), nullable=True)
    
    invoice_url = Column(String(500), nullable=True)
    payment_url = Column(String(500), nullable=True)
    receipt_url = Column(String(500), nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="invoices", lazy="selectin")
    client = relationship("User", foreign_keys=[client_id], lazy="selectin")
    message_logs = relationship("WhatsAppMessageLog", back_populates="invoice", cascade="all, delete-orphan", lazy="selectin")

class Delivery(Base):
    """
    Delivery & fulfillment records with tracking link, ETA, and live milestones.
    """
    __tablename__ = "deliveries"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), unique=True, nullable=False, index=True)
    tracking_number = Column(String(100), unique=True, index=True, nullable=False) # e.g. RMVS-TRK-89210
    
    delivery_agent_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    delivery_agent_name = Column(String(255), nullable=True)
    delivery_agent_phone = Column(String(50), nullable=True)
    
    # Status: assigned, started, in_transit, out_for_delivery, delivered, exception
    status = Column(String(50), default="assigned", index=True, nullable=False)
    
    estimated_delivery = Column(DateTime(timezone=True), nullable=True)
    actual_delivery = Column(DateTime(timezone=True), nullable=True)
    
    destination_address = Column(Text, nullable=True)
    tracking_url = Column(String(500), nullable=True)
    exception_reason = Column(Text, nullable=True)
    
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)

    order = relationship("Order", back_populates="delivery", lazy="selectin")
    delivery_agent = relationship("User", foreign_keys=[delivery_agent_id], lazy="selectin")
    message_logs = relationship("WhatsAppMessageLog", back_populates="delivery", cascade="all, delete-orphan", lazy="selectin")
