import pytest
import hmac
import hashlib
import json
from app.services.whatsapp.phone_utils import (
    validate_and_format_e164, format_for_meta, mask_phone_number
)
from app.services.whatsapp.templates import (
    render_template_text, build_meta_template_components, DEFAULT_TEMPLATES
)
from app.services.whatsapp.webhooks import verify_webhook_signature
from app.services.whatsapp.client import WhatsAppCloudAPIClient

def test_phone_validation_and_e164():
    # Valid Indian mobile number
    valid, formatted, err = validate_and_format_e164("9876543210", default_region="IN")
    assert valid is True
    assert formatted == "+919876543210"
    assert err is None

    # Valid international number with +
    valid, formatted, err = validate_and_format_e164("+14155552671", default_region="US")
    assert valid is True
    assert formatted == "+14155552671"

    # Meta format (digits only, no +)
    meta_digits = format_for_meta(formatted)
    assert meta_digits == "14155552671"

    # Invalid number
    valid, _, err = validate_and_format_e164("12345", default_region="IN")
    assert valid is False
    assert err is not None

def test_phone_masking():
    masked = mask_phone_number("+919876543210")
    assert masked.startswith("+9198")
    assert masked.endswith("210")
    assert "*" in masked

def test_template_rendering():
    raw_template = "Hello {{customer_name}}, your order {{order_number}} is confirmed for {{total_amount}}."
    variables = {
        "customer_name": "Alexander Vance",
        "order_number": "RMVS-ORD-1001",
        "total_amount": "₹145,000.00"
    }
    rendered = render_template_text(raw_template, variables)
    assert "Alexander Vance" in rendered
    assert "RMVS-ORD-1001" in rendered
    assert "₹145,000.00" in rendered
    assert "{{" not in rendered

def test_meta_components_builder():
    vars_list = ["customer_name", "order_number", "total_amount"]
    values = {
        "customer_name": "Priya Sharma",
        "order_number": "RMVS-ORD-1002",
        "total_amount": "₹89,000.00"
    }
    components = build_meta_template_components(vars_list, values)
    assert len(components) == 1
    assert components[0]["type"] == "body"
    assert len(components[0]["parameters"]) == 3
    assert components[0]["parameters"][0]["text"] == "Priya Sharma"
    assert components[0]["parameters"][1]["text"] == "RMVS-ORD-1002"

def test_webhook_signature_verification():
    secret = "my_meta_app_secret_12345"
    payload = b'{"object":"whatsapp_business_account","entry":[]}'
    expected_hex = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    valid_sig_header = f"sha256={expected_hex}"

    # Should match
    assert verify_webhook_signature(payload, valid_sig_header, secret) is True

    # Bad signature
    assert verify_webhook_signature(payload, "sha256=invalidhex", secret) is False

@pytest.mark.asyncio
async def test_client_test_mode_simulation():
    # Calling client with test_mode active returns a simulated successful delivery
    from app.models.whatsapp import WhatsAppConfig
    cfg = WhatsAppConfig(test_mode=True, is_enabled=True)

    result = await WhatsAppCloudAPIClient.send_template_message(
        to_phone="+919876543210",
        template_name="order_confirmed",
        config=cfg
    )
    assert result["success"] is True
    assert result["simulated"] is True
    assert result["status"] == "simulated_sent"
    assert result["provider_message_id"].startswith("wamid.SIMULATED_")
