import os
import ssl
from typing import AsyncGenerator
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import declarative_base
from app.core.config import settings

def normalize_database_url(raw_url: str):
    """
    Normalizes database URL for SQLAlchemy 2.0 async engine.
    Automatically handles Neon PostgreSQL connection strings:
      - Converts postgresql:// or postgres:// to postgresql+asyncpg://
      - Strips 'sslmode' query param (which causes asyncpg to error)
      - Configures SSL context for secure Neon Postgres connection
    """
    url = raw_url.strip()
    connect_args = {}
    engine_kwargs = {
        "echo": False,
        "future": True,
    }

    if url.startswith("sqlite"):
        connect_args["check_same_thread"] = False
        return url, connect_args, engine_kwargs

    # PostgreSQL / Neon handling
    if url.startswith("postgres://"):
        url = "postgresql+asyncpg://" + url[len("postgres://"):]
    elif url.startswith("postgresql://"):
        url = "postgresql+asyncpg://" + url[len("postgresql://"):]
    elif not url.startswith("postgresql+asyncpg://"):
        if "postgresql" in url:
            url = url.replace("postgresql:", "postgresql+asyncpg:", 1)

    # Clean query parameters for asyncpg & handle Neon SSL
    parsed = urlparse(url)
    query_params = parse_qs(parsed.query)

    is_neon = "neon.tech" in parsed.netloc.lower()
    has_sslmode = "sslmode" in query_params or "ssl" in query_params

    # Remove query params that asyncpg does not accept directly in query string
    query_params.pop("sslmode", None)
    query_params.pop("ssl", None)
    query_params.pop("channel_binding", None)

    # Reconstruct cleaned URL without sslmode query parameter
    new_query = urlencode(query_params, doseq=True)
    clean_url = urlunparse((
        parsed.scheme,
        parsed.netloc,
        parsed.path,
        parsed.params,
        new_query,
        parsed.fragment
    ))

    # Configure SSL for Neon or when requested
    if is_neon or has_sslmode:
        ssl_ctx = ssl.create_default_context()
        ssl_ctx.check_hostname = False
        ssl_ctx.verify_mode = ssl.CERT_NONE
        connect_args["ssl"] = ssl_ctx
        connect_args["statement_cache_size"] = 0
        connect_args["timeout"] = 10

    # Neon serverless pooling optimizations
    engine_kwargs["pool_pre_ping"] = True
    engine_kwargs["pool_recycle"] = 300
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10
    engine_kwargs["pool_timeout"] = 10

    return clean_url, connect_args, engine_kwargs

db_url, connect_args, engine_kwargs = normalize_database_url(settings.DATABASE_URL)

engine = create_async_engine(
    db_url,
    connect_args=connect_args,
    **engine_kwargs
)

AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False,
)

Base = declarative_base()

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
