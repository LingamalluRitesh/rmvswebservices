import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from app.core.database import Base, get_db
from app.main import app
from app.models.orders import Order, Delivery
from datetime import datetime, timezone, timedelta

@pytest_asyncio.fixture(autouse=True)
async def setup_test_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    session_factory = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    # Seed sample tracking data
    async with session_factory() as session:
        ord_obj = Order(
            order_number="RMVS-ORD-1001",
            customer_name="Alexander Vance",
            customer_email="alex.vance@blackmesa.tech",
            customer_phone="+919876543210",
            service_type="Enterprise AI Pipeline",
            total_amount=145000.0,
            currency="INR",
            status="processing",
            delivery_eta=datetime.now(timezone.utc) + timedelta(days=5),
            notes="LLM fine-tuning and deployment."
        )
        session.add(ord_obj)
        await session.flush()

        del_obj = Delivery(
            order_id=ord_obj.id,
            tracking_number="RMVS-TRK-789011",
            delivery_agent_name="Vikram Sethi",
            delivery_agent_phone="+919876500001",
            status="assigned",
            estimated_delivery=ord_obj.delivery_eta,
            destination_address="Cyber City, Hyderabad",
            tracking_url="/track/RMVS-TRK-789011"
        )
        session.add(del_obj)
        await session.commit()

    async def override_get_db():
        async with session_factory() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

@pytest.mark.asyncio
async def test_webhook_get_challenge_verification():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        # Valid verify token
        response = await ac.get(
            "/api/v1/webhooks/whatsapp",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "rmvs_whatsapp_verify_token_2026",
                "hub.challenge": "1155992288"
            }
        )
        assert response.status_code == 200
        assert response.text == "1155992288"

        # Invalid verify token
        bad_response = await ac.get(
            "/api/v1/webhooks/whatsapp",
            params={
                "hub.mode": "subscribe",
                "hub.verify_token": "wrong_token",
                "hub.challenge": "1155992288"
            }
        )
        assert bad_response.status_code == 403

@pytest.mark.asyncio
async def test_webhook_post_status_ingestion():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        payload = {
            "object": "whatsapp_business_account",
            "entry": [
                {
                    "id": "948372619401823",
                    "changes": [
                        {
                            "value": {
                                "messaging_product": "whatsapp",
                                "metadata": {"display_phone_number": "919400900000", "phone_number_id": "105938472910482"},
                                "statuses": [
                                    {
                                        "id": "wamid.TEST_WAMID_12345",
                                        "status": "delivered",
                                        "timestamp": "1741512000",
                                        "recipient_id": "919876543210"
                                    }
                                ]
                            },
                            "field": "messages"
                        }
                    ]
                }
            ]
        }
        response = await ac.post("/api/v1/webhooks/whatsapp", json=payload)
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "success"

@pytest.mark.asyncio
async def test_public_tracking_endpoint():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/api/v1/orders/track/RMVS-ORD-1001")
        assert response.status_code == 200
        data = response.json()
        assert data["order_number"] == "RMVS-ORD-1001"
        assert data["customer_name"] == "Alexander Vance"
        assert "milestones" in data
        assert len(data["milestones"]) > 0

        # By tracking number
        trk_response = await ac.get("/api/v1/orders/track/RMVS-TRK-789011")
        assert trk_response.status_code == 200
        trk_data = trk_response.json()
        assert trk_data["tracking_number"] == "RMVS-TRK-789011"
