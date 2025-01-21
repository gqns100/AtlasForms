from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from cryptography.fernet import Fernet
from .config import get_settings
import os
from loguru import logger
from typing import AsyncGenerator

settings = get_settings()

# Use in-memory SQLite database with encryption
ENCRYPTION_KEY = Fernet.generate_key()
cipher_suite = Fernet(ENCRYPTION_KEY)

# Create async in-memory database with encryption
engine = create_async_engine(
    'sqlite+aiosqlite:///:memory:',
    echo=False,
    connect_args={"check_same_thread": False}
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

def encrypt_value(value: str) -> bytes:
    """Encrypt sensitive data"""
    return cipher_suite.encrypt(value.encode())

def decrypt_value(encrypted_value: bytes) -> str:
    """Decrypt sensitive data"""
    return cipher_suite.decrypt(encrypted_value).decode()

async def init_db():
    """Initialize database with tables"""
    from .db import Base
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    logger.info("Database tables created")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Get async database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

logger.info("Using encrypted in-memory database for development")
