from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, developers, projects, inquiries,
    community, conversations, notifications, admin,
    settings, activity, whatsapp, whatsapp_webhooks,
    orders, invoices, deliveries, customer_preferences
)

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(developers.router, prefix="/developers", tags=["Developers"])
api_router.include_router(projects.router, prefix="/projects", tags=["Projects"])
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["Client Inquiries"])
api_router.include_router(community.router, prefix="/community", tags=["Community"])
api_router.include_router(conversations.router, prefix="/conversations", tags=["Direct Messaging"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
api_router.include_router(admin.router, prefix="/admin", tags=["Administration"])
api_router.include_router(settings.router, prefix="/settings", tags=["Company Settings"])
api_router.include_router(activity.router, prefix="/activity", tags=["Activity Logs"])

# WhatsApp Business Automation & Order/Billing/Delivery Suite
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["WhatsApp Automation"])
api_router.include_router(whatsapp_webhooks.router, prefix="/webhooks", tags=["Webhooks"])
api_router.include_router(orders.router, prefix="/orders", tags=["Order Management"])
api_router.include_router(invoices.router, prefix="/invoices", tags=["Billing & Invoices"])
api_router.include_router(deliveries.router, prefix="/deliveries", tags=["Deliveries & Tracking"])
api_router.include_router(customer_preferences.router, prefix="/customer", tags=["Customer Preferences"])
