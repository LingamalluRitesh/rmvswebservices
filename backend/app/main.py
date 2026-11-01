import asyncio
import os
import httpx
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.v1.router import api_router
from app.api.websockets.routes import ws_router
from app.db.seed import seed_data

async def _background_startup():
    print("RMVS Web Services: Running background schema & seed verification...")
    try:
        await seed_data()
        print("RMVS Web Services: Database tables and seeds ready.")
    except Exception as e:
        print(f"Seed notice: {e}")

async def _keep_alive_loop():
    """Keeps Render Free Tier backend awake by pinging its health endpoint every 10 minutes."""
    await asyncio.sleep(45)  # initial delay after boot
    backend_url = os.getenv("RENDER_EXTERNAL_URL", "https://rmvs-backend.onrender.com").rstrip("/")
    health_url = f"{backend_url}/health"
    print(f"RMVS Keep-Alive active for: {health_url}")
    while True:
        try:
            await asyncio.sleep(600)  # 10 minutes (Render spins down after 15m)
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(health_url)
                print(f"Keep-Alive ping to {health_url}: {resp.status_code}")
        except asyncio.CancelledError:
            break
        except Exception as e:
            print(f"Keep-Alive ping error: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("RMVS Web Services Backend starting up... immediate readiness enabled.")
    startup_task = asyncio.create_task(_background_startup())
    keep_alive_task = asyncio.create_task(_keep_alive_loop())
    yield
    print("RMVS Web Services Backend shutting down.")
    startup_task.cancel()
    keep_alive_task.cancel()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan
)

# Set all CORS enabled origins
origins = [o for o in settings.CORS_ORIGINS if o != "*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins if origins else ["*"],
    allow_origin_regex=r"^https?://.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(api_router, prefix=settings.API_V1_STR)
app.include_router(ws_router)

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "leadership": {
            "ceo": settings.SUPER_ADMIN_NAME
        }
    }

@app.get("/")
async def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API",
        "docs": "/docs",
        "api_v1": settings.API_V1_STR
    }
