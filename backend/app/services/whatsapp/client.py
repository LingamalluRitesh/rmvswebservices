import json
import uuid
from typing import Dict, Any, List, Optional
import httpx
from app.models.whatsapp import WhatsAppConfig
from app.services.whatsapp.phone_utils import format_for_meta

META_API_VERSION = "v21.0"
META_BASE_URL = "https://graph.facebook.com"

class WhatsAppCloudAPIClient:
    """
    Official Meta WhatsApp Business Cloud API Client (v21.0).
    Sends template and session messages, with automatic simulation when in test mode.
    """

    @classmethod
    def _is_test_mode(cls, config: Optional[WhatsAppConfig]) -> bool:
        if not config:
            return True
        if config.test_mode:
            return True
        token = (config.access_token or "").strip()
        phone_id = (config.phone_number_id or "").strip()
        if not token or not phone_id:
            return True
        if "YOUR_" in token or "placeholder" in token.lower() or token.startswith("dev_"):
            return True
        return False

    @classmethod
    async def send_template_message(
        cls,
        to_phone: str,
        template_name: str,
        language_code: str = "en_US",
        components: Optional[List[Dict[str, Any]]] = None,
        config: Optional[WhatsAppConfig] = None
    ) -> Dict[str, Any]:
        """
        Sends an approved Meta WhatsApp template message.
        """
        if config and not config.is_enabled:
            return {
                "success": False,
                "status": "failed",
                "error_code": "AUTOMATION_DISABLED",
                "error_message": "WhatsApp Business Automation is currently toggled OFF in system settings.",
                "payload": None
            }

        clean_recipient = format_for_meta(to_phone)
        if not clean_recipient:
            return {
                "success": False,
                "status": "failed",
                "error_code": "INVALID_PHONE",
                "error_message": f"Recipient phone '{to_phone}' could not be formatted for Meta.",
                "payload": None
            }

        request_body = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_recipient,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {
                    "code": language_code
                }
            }
        }
        if components:
            request_body["template"]["components"] = components

        # If test mode or credentials are dummy/empty, record simulated success
        if cls._is_test_mode(config):
            simulated_id = f"wamid.SIMULATED_{uuid.uuid4().hex[:18]}"
            return {
                "success": True,
                "simulated": True,
                "status": "simulated_sent",
                "provider_message_id": simulated_id,
                "error_code": None,
                "error_message": None,
                "payload": json.dumps({
                    "request": request_body,
                    "simulation": True,
                    "simulated_provider_id": simulated_id,
                    "note": "Delivered via RMVS WebServices Test Simulation Engine (Meta credentials not configured or Test Mode active)."
                })
            }

        # Real Meta Cloud API execution
        url = f"{META_BASE_URL}/{META_API_VERSION}/{config.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {config.access_token.strip()}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=request_body, headers=headers)
                resp_json = response.json()

            if 200 <= response.status_code < 300:
                messages_data = resp_json.get("messages", [])
                msg_id = messages_data[0].get("id") if messages_data else None
                return {
                    "success": True,
                    "simulated": False,
                    "status": "sent",
                    "provider_message_id": msg_id,
                    "error_code": None,
                    "error_message": None,
                    "payload": json.dumps({"request": request_body, "response": resp_json})
                }
            else:
                err_data = resp_json.get("error", {})
                err_code = str(err_data.get("code", response.status_code))
                err_msg = err_data.get("message") or err_data.get("error_user_msg") or str(resp_json)
                return {
                    "success": False,
                    "simulated": False,
                    "status": "failed",
                    "provider_message_id": None,
                    "error_code": err_code,
                    "error_message": err_msg,
                    "payload": json.dumps({"request": request_body, "response": resp_json})
                }
        except Exception as e:
            return {
                "success": False,
                "simulated": False,
                "status": "failed",
                "provider_message_id": None,
                "error_code": "NETWORK_EXCEPTION",
                "error_message": str(e),
                "payload": json.dumps({"request": request_body, "exception": str(e)})
            }

    @classmethod
    async def send_text_message(
        cls,
        to_phone: str,
        body_text: str,
        config: Optional[WhatsAppConfig] = None
    ) -> Dict[str, Any]:
        """
        Sends a standard freeform text message (applicable within the 24h customer service window).
        """
        if config and not config.is_enabled:
            return {
                "success": False,
                "status": "failed",
                "error_code": "AUTOMATION_DISABLED",
                "error_message": "WhatsApp Business Automation is currently disabled.",
                "payload": None
            }

        clean_recipient = format_for_meta(to_phone)
        request_body = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_recipient,
            "type": "text",
            "text": {
                "preview_url": True,
                "body": body_text
            }
        }

        if cls._is_test_mode(config):
            simulated_id = f"wamid.SIMULATED_{uuid.uuid4().hex[:18]}"
            return {
                "success": True,
                "simulated": True,
                "status": "simulated_sent",
                "provider_message_id": simulated_id,
                "error_code": None,
                "error_message": None,
                "payload": json.dumps({"request": request_body, "simulation": True})
            }

        url = f"{META_BASE_URL}/{META_API_VERSION}/{config.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {config.access_token.strip()}",
            "Content-Type": "application/json"
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(url, json=request_body, headers=headers)
                resp_json = response.json()

            if 200 <= response.status_code < 300:
                msg_id = resp_json.get("messages", [{}])[0].get("id")
                return {
                    "success": True,
                    "simulated": False,
                    "status": "sent",
                    "provider_message_id": msg_id,
                    "error_code": None,
                    "error_message": None,
                    "payload": json.dumps({"request": request_body, "response": resp_json})
                }
            else:
                err_data = resp_json.get("error", {})
                return {
                    "success": False,
                    "simulated": False,
                    "status": "failed",
                    "provider_message_id": None,
                    "error_code": str(err_data.get("code", response.status_code)),
                    "error_message": err_data.get("message", "Meta API Error"),
                    "payload": json.dumps({"request": request_body, "response": resp_json})
                }
        except Exception as e:
            return {
                "success": False,
                "simulated": False,
                "status": "failed",
                "provider_message_id": None,
                "error_code": "NETWORK_EXCEPTION",
                "error_message": str(e),
                "payload": json.dumps({"request": request_body, "exception": str(e)})
            }
