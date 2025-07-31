from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.pool import StaticPool
import asyncio
import os
from config.settings import settings

# Database URL configuration
# Force SQLite for development (comment out PostgreSQL for now)
# if settings.POSTGRES_URL:
#     # Use PostgreSQL in production
#     DATABASE_URL = settings.POSTGRES_URL
#     engine = create_async_engine(
#         DATABASE_URL,
#         echo=False,
#         pool_pre_ping=True,
#         pool_recycle=300
#     )
# else:
# Use SQLite for development
DATABASE_URL = settings.DATABASE_URL.replace("sqlite:///", "sqlite+aiosqlite:///")
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)

# Session configuration
AsyncSessionLocal = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

# Base class for models
Base = declarative_base()

# Dependency to get database session
async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Initialize database
async def init_db():
    async with engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    # Create uploads directory if it doesn't exist
    os.makedirs(settings.UPLOAD_FOLDER, exist_ok=True)
    os.makedirs("logs", exist_ok=True) 