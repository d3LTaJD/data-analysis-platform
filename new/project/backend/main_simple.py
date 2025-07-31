from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import uvicorn
import logging
from datetime import datetime
import traceback
import os

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# Create necessary directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("reports", exist_ok=True)
os.makedirs("logs", exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting FastAPI application...")
    logger.info("Application started successfully (no database)")
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
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["localhost", "127.0.0.1"]
)

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Error: {str(exc)}")
    logger.error(f"Traceback: {traceback.format_exc()}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "message": "An unexpected error occurred. Please try again later.",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# Simple authentication (in-memory for now)
users_db = {
    "test@example.com": {
        "id": 1,
        "email": "test@example.com",
        "password": "Test123!",  # In production, this would be hashed
        "first_name": "Test",
        "last_name": "User",
        "role": "user",
        "is_active": True,
        "created_at": "2024-01-01T00:00:00Z"
    }
}

sessions_db = {}

# Authentication endpoints
@app.post("/api/auth/register")
async def register(user_data: dict):
    email = user_data.get("email")
    password = user_data.get("password")
    first_name = user_data.get("first_name", "")
    last_name = user_data.get("last_name", "")
    
    if email in users_db:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = len(users_db) + 1
    users_db[email] = {
        "id": user_id,
        "email": email,
        "password": password,  # In production, hash this
        "first_name": first_name,
        "last_name": last_name,
        "role": "user",
        "is_active": True,
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Auto-login after registration
    session_token = f"token_{user_id}_{datetime.utcnow().timestamp()}"
    sessions_db[session_token] = user_id
    
    return {
        "access_token": session_token,
        "user": {
            "id": user_id,
            "email": email,
            "first_name": first_name,
            "last_name": last_name,
            "role": "user",
            "is_active": True,
            "created_at": users_db[email]["created_at"]
        }
    }

@app.post("/api/auth/login")
async def login(credentials: dict):
    email = credentials.get("email")
    password = credentials.get("password")
    
    if email not in users_db or users_db[email]["password"] != password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    user = users_db[email]
    session_token = f"token_{user['id']}_{datetime.utcnow().timestamp()}"
    sessions_db[session_token] = user['id']
    
    return {
        "access_token": session_token,
        "user": {
            "id": user["id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "role": user["role"],
            "is_active": user["is_active"],
            "created_at": user["created_at"]
        }
    }

@app.post("/api/auth/logout")
async def logout():
    return {"message": "Logged out successfully"}

@app.post("/api/auth/validate")
async def validate_session():
    return {"valid": True}

@app.get("/api/auth/profile")
async def get_profile():
    return {
        "id": 1,
        "email": "test@example.com",
        "first_name": "Test",
        "last_name": "User",
        "role": "user",
        "is_active": True,
        "created_at": "2024-01-01T00:00:00Z"
    }

# Business Analyst endpoints
@app.post("/api/analyze/business/upload")
async def upload_business_file():
    return {
        "analysis_id": 1,
        "message": "File uploaded successfully",
        "filename": "business_data.csv"
    }

@app.post("/api/analyze/business/analyze/{analysis_id}")
async def run_business_analysis(analysis_id: int):
    # Simulate analysis processing
    import time
    time.sleep(2)  # Simulate processing time
    
    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "results": {
            "kpis": {
                "total_revenue": 1500000,
                "total_customers": 1250,
                "average_order_value": 1200,
                "customer_retention_rate": 0.85
            },
            "insights": [
                "Revenue increased by 15% compared to last quarter",
                "Customer retention rate is above industry average",
                "Average order value shows positive trend"
            ],
            "recommendations": [
                "Focus on customer retention strategies",
                "Consider upselling opportunities",
                "Invest in customer acquisition campaigns"
            ],
            "charts": [
                {
                    "type": "revenue_trend",
                    "title": "Revenue Trend Analysis",
                    "data": {"labels": ["Jan", "Feb", "Mar"], "values": [1000000, 1200000, 1500000]}
                }
            ]
        }
    }

@app.get("/api/analyze/business/analyses")
async def get_business_analyses():
    return {
        "analyses": [
            {
                "id": 1,
                "analysis_name": "Business Performance Analysis",
                "status": "completed",
                "created_at": "2024-01-01T10:00:00Z"
            }
        ]
    }

@app.get("/api/analyze/business/analyses/{analysis_id}")
async def get_business_analysis(analysis_id: int):
    return {
        "analysis_id": analysis_id,
        "status": "completed",
        "results": {
            "kpis": {
                "total_revenue": 1500000,
                "total_customers": 1250,
                "average_order_value": 1200,
                "customer_retention_rate": 0.85
            },
            "insights": [
                "Revenue increased by 15% compared to last quarter",
                "Customer retention rate is above industry average",
                "Average order value shows positive trend"
            ],
            "recommendations": [
                "Focus on customer retention strategies",
                "Consider upselling opportunities",
                "Invest in customer acquisition campaigns"
            ]
        }
    }

# Marketing Analytics endpoints
@app.post("/api/analyze/marketing/upload")
async def upload_marketing_file():
    return {
        "analysis_id": 2,
        "message": "File uploaded successfully",
        "filename": "marketing_data.csv"
    }

@app.get("/api/analyze/marketing/analyses")
async def get_marketing_analyses():
    return {
        "analyses": [
            {
                "id": 2,
                "analysis_name": "Marketing Campaign Analysis",
                "status": "completed",
                "created_at": "2024-01-01T11:00:00Z"
            }
        ]
    }

# Research & EDA endpoints
@app.post("/api/analyze/research/upload")
async def upload_research_file():
    return {
        "analysis_id": 3,
        "message": "File uploaded successfully",
        "filename": "research_data.csv"
    }

@app.get("/api/analyze/research/analyses")
async def get_research_analyses():
    return {
        "analyses": [
            {
                "id": 3,
                "analysis_name": "Research Data Analysis",
                "status": "completed",
                "created_at": "2024-01-01T12:00:00Z"
            }
        ]
    }

# Other analytics endpoints (placeholders)
for role in ["financial", "predictive", "healthcare", "ecommerce", "general"]:
    @app.post(f"/api/analyze/{role}/upload")
    async def upload_file(role=role):
        return {
            "analysis_id": hash(role) % 1000,
            "message": "File uploaded successfully",
            "filename": f"{role}_data.csv"
        }
    
    @app.get(f"/api/analyze/{role}/analyses")
    async def get_analyses(role=role):
        return {
            "analyses": [
                {
                    "id": hash(role) % 1000,
                    "analysis_name": f"{role.title()} Analysis",
                    "status": "completed",
                    "created_at": "2024-01-01T13:00:00Z"
                }
            ]
        }

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "DataWhiz Analytics API",
        "version": "1.0.0",
        "status": "running",
        "available_roles": [
            "business",
            "research", 
            "marketing",
            "financial",
            "predictive",
            "healthcare",
            "ecommerce",
            "general"
        ]
    }

# Health check
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "disabled"
    }

if __name__ == "__main__":
    uvicorn.run(
        "main_simple:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    ) 