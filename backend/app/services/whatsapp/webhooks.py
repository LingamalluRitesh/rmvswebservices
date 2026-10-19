import hmac
import hashlib
import json
from datetime import datetime, timezone
from typing import Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.whatsapp import (
    WhatsAppMessageLog, WhatsAppWebhookEvent, CustomerWhatsAppPreference
)

def verify_webhook_signature(payload_bytes: bytes, signature_header: Optional[str], app_secret: Optional[str]) -> bool:
    """
    Validates Meta's X-Hub-Signature-256 HMAC-SHA256 signature.
    """
    if not app_secret or not app_secret.strip():
        # If app_secret is not configured yet, allow for initial development
        return True
    if not signature_header or not signature_header.startswith("sha256="):
        return False

    expected_sig = "sha256=" + hmac.new(
        app_secret.strip().encode("utf-8"),
        payload_bytes,
        hashlib.sha256
    ).hexdigest()

    return hmac.compare_digest(expected_sig, signature_header)

async def handle_webhook_payload(payload: Dict[str, Any], db: AsyncSession) -> Dict[str, Any]:
    """
    Parses and processes Meta WhatsApp webhook event payload.
    Supports status updates (sent, delivered, read, failed) and customer inbound messages.
    """
    entries = payload.get("entry", [])
    processed_count = 0

    for entry in entries:
        changes = entry.get("changes", [])
        for change in changes:
            value = change.get("value", {})
            field = change.get("field")

            if field != "messages":
                continue

            # 1. Process Message Status Updates (sent, delivered, read, failed)
            statuses = value.get("statuses", [])
            for st in statuses:
                wamid = st.get("id")
                new_status = st.get("status") # sent, delivered, read, failed
                recipient_id = st.get("recipient_id")

                # Deduplication record
                event_id = f"status_{wamid}_{new_status}"
                existing_ev = (await db.execute(
                    select(WhatsAppWebhookEvent).where(WhatsAppWebhookEvent.event_id == event_id)
                )).scalar_one_or_none()

                if existing_ev:
                    continue

                webhook_event = WhatsAppWebhookEvent(
                    event_id=event_id,
                    event_type=f"status_{new_status}",
                    payload=json.dumps(st),
                    processed=False
                )
                db.add(webhook_event)

                # Update matching message log
                log_stmt = select(WhatsAppMessageLog).where(
                    WhatsAppMessageLog.provider_message_id == wamid
                )
                msg_log = (await db.execute(log_stmt)).scalar_one_or_none()
                if msg_log:
                    msg_log.status = new_status
                    if new_status == "failed":
                        errors = st.get("errors", [{}])
                        err = errors[0] if errors else {}
                        msg_log.error_code = str(err.get("code", "UNKNOWN"))
                        msg_log.error_message = err.get("message") or err.get("title")

                webhook_event.processed = True
                webhook_event.processed_at = datetime.now(timezone.utc)
                processed_count += 1

            # 2. Process Inbound Messages (Customer replies, keyword opt-in / opt-out)
            messages = value.get("messages", [])
            contacts = value.get("contacts", [])
            contact_name = contacts[0].get("profile", {}).get("name") if contacts else None

            for msg in messages:
                msg_id = msg.get("id")
                from_phone = msg.get("from")
                msg_type = msg.get("type")
                text_body = msg.get("text", {}).get("body", "").strip()

                event_id = f"msg_{msg_id}"
                existing_ev = (await db.execute(
                    select(WhatsAppWebhookEvent).where(WhatsAppWebhookEvent.event_id == event_id)
                )).scalar_one_or_none()

                if existing_ev:
                    continue

                webhook_event = WhatsAppWebhookEvent(
                    event_id=event_id,
                    event_type="inbound_message",
                    payload=json.dumps(msg),
                    processed=False
                )
                db.add(webhook_event)

                formatted_phone = f"+{from_phone}" if not from_phone.startswith("+") else from_phone

                # Handle Keyword Opt-Out / Opt-In
                clean_text = text_body.upper()
                if clean_text in ["STOP", "UNSUBSCRIBE", "CANCEL"]:
                    pref_stmt = select(CustomerWhatsAppPreference).where(
                        CustomerWhatsAppPreference.whatsapp_phone == formatted_phone
                    )
                    pref = (await db.execute(pref_stmt)).scalar_one_or_none()
                    if pref:
                        pref.consent_given = False
                        pref.opt_out_at = datetime.now(timezone.utc)
                elif clean_text in ["START", "UNSTOP", "JOIN"]:
                    pref_stmt = select(CustomerWhatsAppPreference).where(
                        CustomerWhatsAppPreference.whatsapp_phone == formatted_phone
                    )
                    pref = (await db.execute(pref_stmt)).scalar_one_or_none()
                    if pref:
                        pref.consent_given = True
                        pref.opt_out_at = None

                # Log Inbound Message
                inbound_log = WhatsAppMessageLog(
                    direction="inbound",
                    recipient_phone=formatted_phone,
                    recipient_name=contact_name,
                    event_type="customer_reply",
                    rendered_body=text_body if text_body else f"[{msg_type} message]",
                    provider_message_id=msg_id,
                    status="delivered",
                    payload=json.dumps(msg)
                )
                db.add(inbound_log)

                webhook_event.processed = True
                webhook_event.processed_at = datetime.now(timezone.utc)
                processed_count += 1

    await db.commit()
    return {"status": "success", "processed_events": processed_count}
