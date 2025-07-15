import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes.registration import router as registration_router
from routes.login import router as login_router
from routes.tea import router as tea_router
from routes.bitch import router as bitch_router

# Import database functions
from database import test_connection, close_connection, initialize_indexes

# Create FastAPI app
app = FastAPI(
    title="DihhJ Backend API",
    description="A FastAPI backend for DihhJ Bitchers - Tea & Drama Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Startup and shutdown events (compatible with older FastAPI)
@app.on_event("startup")
async def startup_event():
    print("🚀 Starting DihhJ Backend...")
    await test_connection()
    await initialize_indexes()

@app.on_event("shutdown")
async def shutdown_event():
    print("🛑 Shutting down DihhJ Backend...")
    await close_connection()

# Configure CORS origins
def get_cors_origins():
    """Get CORS origins from environment variable"""
    # Default origins including production frontend
    default_origins = [
        "http://localhost:3000",
        "http://localhost:3001",
        "https://dihhjbitchin-ido5.onrender.com"
    ]

    cors_origins_str = os.getenv("CORS_ORIGINS")
    if cors_origins_str:
        try:
            return json.loads(cors_origins_str)
        except json.JSONDecodeError:
            print(f"⚠️ Invalid CORS_ORIGINS format, using defaults")
            return default_origins

    return default_origins

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=get_cors_origins(),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(registration_router)
app.include_router(login_router)
app.include_router(tea_router)
app.include_router(bitch_router)
# app.include_router(images_router)  # Temporarily commented out

# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint - API health check
    """
    return {
        "message": "Welcome to DihhJ Backend API!",
        "status": "healthy",
        "version": "1.0.0",
        "endpoints": {
            "register": "/auth/register",
            "login": "/auth/login",
            "tea": "/tea",
            "bitch": "/bitch",
            "docs": "/docs",
            "redoc": "/redoc"
        }
    }

# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint with database connectivity
    """
    try:
        # Test database connection
        db_status = await test_connection()
        return {
            "status": "healthy" if db_status else "degraded",
            "message": "API is running",
            "database": "connected" if db_status else "disconnected",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "version": "1.0.0"
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": "API is running but database connection failed",
            "error": str(e),
            "environment": os.getenv("ENVIRONMENT", "development"),
            "version": "1.0.0"
        }

if __name__ == "__main__":
    # Get configuration from environment
    host = os.getenv("API_HOST", "0.0.0.0")
    port = int(os.getenv("API_PORT", "8000"))
    environment = os.getenv("ENVIRONMENT", "development")

    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=environment == "development",
        log_level="info"
    )