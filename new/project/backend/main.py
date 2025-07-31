from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import logging
from datetime import datetime
import traceback

from database.database import init_db, get_db
from routers import (
    auth_router,
    business_analyst_router,
    research_eda_router,
    marketing_analytics_router,
    financial_analysis_router,
    predictive_modeling_router,
    healthcare_analytics_router,
    ecommerce_analytics_router,
    general_analysis_router,
    admin_router
)
from services.error_logging_service import ErrorLoggingService
from config.settings import settings

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting FastAPI application...")
    await init_db()
    logger.info("Database initialized successfully")
    yield
    # Shutdown
    logger.info("Shutting down FastAPI application...")

app = FastAPI(
    title="DataWhiz Analytics API",
    description="Production-ready modular FastAPI backend for role-specific analytics pipelines",
    version="1.0.0",
    lifespan=lifespan
)

# Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=settings.ALLOWED_HOSTS
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    error_logger = ErrorLoggingService()
    
    # Log the error
    await error_logger.log_error(
        error_type=type(exc).__name__,
        error_message=str(exc),
        stack_trace=traceback.format_exc(),
        endpoint=str(request.url),
        request_data=str(request.query_params),
        ip_address=request.client.host if request.client else None
    )
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Include routers
app.include_router(auth_router.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(business_analyst_router.router, prefix="/api/analyze/business", tags=["Business Analyst"])
app.include_router(research_eda_router.router, prefix="/api/analyze/research", tags=["Research & EDA"])
app.include_router(marketing_analytics_router.router, prefix="/api/analyze/marketing", tags=["Marketing Analytics"])
app.include_router(financial_analysis_router.router, prefix="/api/analyze/financial", tags=["Financial Analysis"])
app.include_router(predictive_modeling_router.router, prefix="/api/analyze/predictive", tags=["Predictive Modeling"])
app.include_router(healthcare_analytics_router.router, prefix="/api/analyze/healthcare", tags=["Healthcare Analytics"])
app.include_router(ecommerce_analytics_router.router, prefix="/api/analyze/ecommerce", tags=["E-Commerce Analytics"])
app.include_router(general_analysis_router.router, prefix="/api/analyze/general", tags=["General Analysis"])
app.include_router(admin_router.router, prefix="/api/admin", tags=["Admin"])

@app.get("/")
async def root():
    return {
        "message": "DataWhiz Analytics API",
        "version": "1.0.0",
        "status": "running",
        "available_roles": [
            "business_analyst",
            "research_eda", 
            "marketing_analytics",
            "financial_analysis",
            "predictive_modeling",
            "healthcare_analytics",
            "ecommerce_analytics",
            "general_analysis"
        ]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow().isoformat()}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 