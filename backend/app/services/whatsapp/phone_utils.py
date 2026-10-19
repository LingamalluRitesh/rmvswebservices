import re
from typing import Optional, Tuple
import phonenumbers
from phonenumbers import NumberParseException

def validate_and_format_e164(phone_str: str, default_region: str = "IN") -> Tuple[bool, str, Optional[str]]:
    """
    Validates a phone number and formats it as E.164 (e.g., '+919876543210').
    Returns (is_valid, formatted_phone, error_message).
    """
    if not phone_str or not phone_str.strip():
        return False, "", "Phone number cannot be empty."

    raw = phone_str.strip()
    # Normalize common prefixes
    if raw.startswith("00"):
        raw = "+" + raw[2:]

    try:
        parsed = phonenumbers.parse(raw, default_region)
        if not phonenumbers.is_valid_number(parsed):
            return False, raw, f"The phone number '{phone_str}' is not a valid mobile or international number."
        
        e164_format = phonenumbers.format_number(parsed, phonenumbers.PhoneNumberFormat.E164)
        return True, e164_format, None
    except NumberParseException as e:
        return False, raw, f"Invalid phone number format: {str(e)}"

def format_for_meta(e164_phone: str) -> str:
    """
    Meta Cloud API expects digits only (e.g. '919876543210' without '+' or whitespace).
    """
    return re.sub(r"[^\d]", "", e164_phone)

def mask_phone_number(phone_str: str) -> str:
    """
    Masks middle digits for privacy in admin/manager portals (e.g., '+91 98*** **210').
    """
    if not phone_str:
        return "—"
    digits = re.sub(r"[^\d+]", "", phone_str)
    if len(digits) < 7:
        return digits
    prefix = digits[:5]
    suffix = digits[-3:]
    masked_count = len(digits) - len(prefix) - len(suffix)
    return f"{prefix}{'*' * max(masked_count, 3)}{suffix}"
