from fastapi import APIRouter, Request, Query, HTTPException, status, Depends
from fastapi.responses import PlainTextResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.services.whatsapp.dispatcher import get_or_create_whatsapp_config
from app.services.whatsapp.webhooks import verify_webhook_signature, handle_webhook_payload

router = APIRouter()

@router.get("/whatsapp")
async def verify_meta_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Meta Webhook Verification Endpoint.
    Responds to Meta's GET challenge when subscribing to the Webhooks product.
    """
    params = request.query_params
    mode = params.get("hub.mode")
    verify_token = params.get("hub.verify_token")
    challenge = params.get("hub.challenge")

    config = await get_or_create_whatsapp_config(db)
    expected_token = config.webhook_verify_token or "rmvs_whatsapp_verify_token_2026"

    if mode == "subscribe" and verify_token == expected_token:
        # Must return the challenge directly as plain text with HTTP 200
        return PlainTextResponse(content=challenge or "", status_code=200)

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Verification token mismatch or invalid hub.mode."
    )

@router.post("/whatsapp")
async def receive_meta_webhook_events(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Meta Webhook Event Ingestion Endpoint.
    Receives real-time delivery statuses (sent, delivered, read, failed) and customer replies.
    Verifies HMAC-SHA256 signature using X-Hub-Signature-256.
    """
    raw_body = await request.body()
    signature_header = request.headers.get("X-Hub-Signature-256")

    config = await get_or_create_whatsapp_config(db)
    if config.app_secret and not verify_webhook_signature(raw_body, signature_header, config.app_secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid X-Hub-Signature-256 header."
        )

    try:
        payload = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload.")

    result = await handle_webhook_payload(payload, db)
    return {"status": "success", "detail": result}
