import json
import re
from typing import Dict, Any, List

DEFAULT_TEMPLATES: List[Dict[str, Any]] = [
    {
        "template_name": "order_created",
        "display_name": "Order Created",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_created",
        "header_text": "RMVS WebServices • Order Confirmation",
        "body_text": (
            "Hello {{customer_name}}, your order {{order_number}} for {{service_type}} has been placed successfully.\n\n"
            "Order Amount: {{total_amount}}\n"
            "Expected Delivery: {{estimated_delivery}}\n\n"
            "Track your order: {{tracking_url}}\n\n"
            "Thank you for choosing RMVS WebServices."
        ),
        "variables": ["customer_name", "order_number", "service_type", "total_amount", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_confirmed",
        "display_name": "Order Confirmed",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_confirmed",
        "header_text": "RMVS WebServices • Order Confirmed",
        "body_text": (
            "Hello {{customer_name}}, your order {{order_number}} has been confirmed.\n\n"
            "Order Amount: {{total_amount}}\n"
            "Expected Delivery: {{estimated_delivery}}\n\n"
            "Track your order: {{tracking_url}}\n\n"
            "Thank you for choosing us."
        ),
        "variables": ["customer_name", "order_number", "total_amount", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_accepted",
        "display_name": "Order Accepted",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_accepted",
        "header_text": "RMVS WebServices • Project Accepted",
        "body_text": (
            "Hello {{customer_name}}, your order {{order_number}} has been accepted by our engineering team.\n\n"
            "Expected Delivery: {{estimated_delivery}}\n\n"
            "Track progress: {{tracking_url}}"
        ),
        "variables": ["customer_name", "order_number", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_rejected",
        "display_name": "Order Rejected",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_rejected",
        "header_text": "RMVS WebServices • Order Status",
        "body_text": (
            "Hello {{customer_name}}, we regret to inform you that order {{order_number}} could not be accepted.\n\n"
            "Reason: {{rejection_reason}}\n\n"
            "Please contact our executive team for further assistance."
        ),
        "variables": ["customer_name", "order_number", "rejection_reason"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_processing",
        "display_name": "Order Processing Started",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_processing",
        "header_text": "RMVS WebServices • Engineering In Progress",
        "body_text": (
            "Hello {{customer_name}}, work on your order {{order_number}} has commenced.\n\n"
            "Milestone: Active Development & Quality Assurance\n"
            "Estimated Completion: {{estimated_delivery}}\n\n"
            "Track your order: {{tracking_url}}"
        ),
        "variables": ["customer_name", "order_number", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_packed",
        "display_name": "Order Packed / Ready for Dispatch",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_packed",
        "header_text": "RMVS WebServices • Ready for Dispatch",
        "body_text": (
            "Hello {{customer_name}}, your deliverables for order {{order_number}} are finalized and ready for dispatch.\n\n"
            "Expected Delivery: {{estimated_delivery}}\n\n"
            "Track status: {{tracking_url}}"
        ),
        "variables": ["customer_name", "order_number", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_dispatched",
        "display_name": "Order Dispatched",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_dispatched",
        "header_text": "RMVS WebServices • Dispatched",
        "body_text": (
            "Hello {{customer_name}}, your order {{order_number}} is on its way.\n\n"
            "Estimated Arrival: {{estimated_delivery}}\n\n"
            "Track your delivery: {{tracking_url}}"
        ),
        "variables": ["customer_name", "order_number", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_assigned",
        "display_name": "Order Assigned to Delivery Agent",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_assigned",
        "header_text": "RMVS WebServices • Delivery Assigned",
        "body_text": (
            "Hello {{customer_name}}, delivery specialist {{delivery_agent_name}} ({{delivery_agent_phone}}) has been assigned to order {{order_number}}.\n\n"
            "Estimated Delivery: {{estimated_delivery}}\n\n"
            "Track live: {{tracking_url}}"
        ),
        "variables": ["customer_name", "delivery_agent_name", "delivery_agent_phone", "order_number", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_out_for_delivery",
        "display_name": "Order Out For Delivery",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_out_for_delivery",
        "header_text": "RMVS WebServices • Out For Delivery",
        "body_text": (
            "Hello {{customer_name}}, your order {{order_number}} is out for delivery!\n\n"
            "Delivery Agent: {{delivery_agent_name}}\n"
            "Estimated Arrival: {{estimated_delivery}}\n\n"
            "Track live: {{tracking_url}}"
        ),
        "variables": ["customer_name", "order_number", "delivery_agent_name", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "delivery_eta_updated",
        "display_name": "Delivery ETA Changed",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "delivery_eta_updated",
        "header_text": "RMVS WebServices • ETA Update",
        "body_text": (
            "Hello {{customer_name}}, the estimated delivery time for order {{order_number}} has been updated.\n\n"
            "New Arrival Time: {{estimated_delivery}}\n\n"
            "Track live: {{tracking_url}}"
        ),
        "variables": ["customer_name", "order_number", "estimated_delivery", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_delivered",
        "display_name": "Order Successfully Delivered",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_delivered",
        "header_text": "RMVS WebServices • Delivered",
        "body_text": (
            "Hello {{customer_name}}, your order {{order_number}} has been delivered successfully.\n\n"
            "Thank you for choosing us. We appreciate your business!"
        ),
        "variables": ["customer_name", "order_number"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "order_cancelled",
        "display_name": "Order Cancelled",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "order_cancelled",
        "header_text": "RMVS WebServices • Order Cancelled",
        "body_text": (
            "Hello {{customer_name}}, your order {{order_number}} has been cancelled.\n\n"
            "Reason: {{cancellation_reason}}\n"
            "Refund Status: {{refund_status}}\n\n"
            "Please contact support if you need further clarification."
        ),
        "variables": ["customer_name", "order_number", "cancellation_reason", "refund_status"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "invoice_generated",
        "display_name": "Invoice Generated",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "invoice_generated",
        "header_text": "RMVS WebServices • Invoice Ready",
        "body_text": (
            "Hello {{customer_name}}, your invoice {{invoice_number}} is ready.\n\n"
            "Invoice Amount: {{total_amount}}\n"
            "Payment Status: {{payment_status}}\n\n"
            "View your invoice securely: {{invoice_url}}\n\n"
            "Thank you."
        ),
        "variables": ["customer_name", "invoice_number", "total_amount", "payment_status", "invoice_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "invoice_updated",
        "display_name": "Invoice Updated",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "invoice_updated",
        "header_text": "RMVS WebServices • Invoice Updated",
        "body_text": (
            "Hello {{customer_name}}, your invoice {{invoice_number}} has been updated.\n\n"
            "Revised Amount: {{total_amount}}\n"
            "Payment Status: {{payment_status}}\n\n"
            "View invoice: {{invoice_url}}"
        ),
        "variables": ["customer_name", "invoice_number", "total_amount", "payment_status", "invoice_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "payment_reminder",
        "display_name": "Payment Pending Reminder",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "payment_reminder",
        "header_text": "RMVS WebServices • Payment Reminder",
        "body_text": (
            "Hello {{customer_name}}, this is a friendly reminder that invoice {{invoice_number}} for {{total_amount}} is pending payment.\n\n"
            "Due Date: {{due_date}}\n"
            "Pay online securely: {{payment_url}}\n\n"
            "Thank you."
        ),
        "variables": ["customer_name", "invoice_number", "total_amount", "due_date", "payment_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "payment_received",
        "display_name": "Payment Received",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "payment_received",
        "header_text": "RMVS WebServices • Payment Received",
        "body_text": (
            "Hello {{customer_name}}, payment of {{total_amount}} for invoice {{invoice_number}} has been received successfully.\n\n"
            "Payment Method: {{payment_method}}\n"
            "Transaction ID: {{transaction_id}}\n\n"
            "Receipt: {{receipt_url}}\n\n"
            "Thank you for choosing RMVS WebServices."
        ),
        "variables": ["customer_name", "total_amount", "invoice_number", "payment_method", "transaction_id", "receipt_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "payment_failed",
        "display_name": "Payment Failed",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "payment_failed",
        "header_text": "RMVS WebServices • Payment Notice",
        "body_text": (
            "Hello {{customer_name}}, the payment attempt for invoice {{invoice_number}} could not be completed.\n\n"
            "Amount: {{total_amount}}\n"
            "Retry payment securely: {{payment_url}}\n\n"
            "If you need assistance, please let us know."
        ),
        "variables": ["customer_name", "invoice_number", "total_amount", "payment_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "refund_completed",
        "display_name": "Refund Completed",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "refund_completed",
        "header_text": "RMVS WebServices • Refund Processed",
        "body_text": (
            "Hello {{customer_name}}, your refund of {{total_amount}} for invoice {{invoice_number}} (Order: {{order_number}}) has been processed successfully.\n\n"
            "Transaction ID: {{transaction_id}}\n\n"
            "Thank you."
        ),
        "variables": ["customer_name", "total_amount", "invoice_number", "order_number", "transaction_id"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "delivery_exception",
        "display_name": "Delivery Exception",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "delivery_exception",
        "header_text": "RMVS WebServices • Delivery Update",
        "body_text": (
            "Hello {{customer_name}}, we encountered a delivery exception for order {{order_number}}.\n\n"
            "Note: {{exception_reason}}\n\n"
            "Our delivery coordinator is actively addressing this. Track live: {{tracking_url}}"
        ),
        "variables": ["customer_name", "order_number", "exception_reason", "tracking_url"],
        "approval_status": "APPROVED",
        "is_active": True
    },
    {
        "template_name": "contact_lead_received",
        "display_name": "New Website Inquiry Lead",
        "category": "UTILITY",
        "language": "en_US",
        "event_trigger": "contact_inquiry",
        "header_text": "RMVS WebServices • New Client Lead",
        "body_text": (
            "New inquiry received on rmvswebservices.onrender.com!\n\n"
            "Client Name: {{customer_name}}\n"
            "Email: {{customer_email}}\n"
            "Service: {{service_type}}\n"
            "Requirements: {{message_snippet}}\n\n"
            "View in CEO Suite: {{inquiry_url}}"
        ),
        "variables": ["customer_name", "customer_email", "service_type", "message_snippet", "inquiry_url"],
        "approval_status": "APPROVED",
        "is_active": True
    }
]

def render_template_text(body_template: str, variables: Dict[str, Any]) -> str:
    """
    Interpolates '{{variable_name}}' tokens with values from the variables dictionary.
    """
    text = body_template
    for key, val in variables.items():
        pattern = r"\{\{\s*" + re.escape(key) + r"\s*\}\}"
        text = re.sub(pattern, str(val) if val is not None else "", text)
    return text

def build_meta_template_components(variables_list: List[str], values_dict: Dict[str, Any]) -> List[Dict[str, Any]]:
    """
    Builds the Meta WhatsApp Cloud API 'components' payload for a template message.
    Meta Cloud API templates take sequential positional parameters for body variables.
    """
    params = []
    for var in variables_list:
        val = str(values_dict.get(var, ""))
        params.append({
            "type": "text",
            "text": val if val.strip() else "—"
        })
    
    if not params:
        return []

    return [
        {
            "type": "body",
            "parameters": params
        }
    ]
