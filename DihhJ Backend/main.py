import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uvicorn
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Import routes
from routes.registration import router as registration_router
from routes.login import router as login_router
from routes.tea import router as tea_router
from routes.bitch import router as bitch_router
# from routes.images import router as images_router  # Temporarily commented out

# Import database functions
from database import test_connection, close_connection, initialize_indexes

# Lifespan context manager for startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("🚀 Starting DihhJ Backend...")
    await test_connection()
    await initialize_indexes()
    yield
    # Shutdown
    print("🛑 Shutting down DihhJ Backend...")
    await close_connection()

# Create FastAPI app
app = FastAPI(
    title="DihhJ Backend API",
    description="A FastAPI backend with user registration and login functionality",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS origins
def get_cors_origins():
    """Get CORS origins from environment variable"""
    cors_origins_str = os.getenv("CORS_ORIGINS", '["http://localhost:3000", "http://localhost:3001"]')
    try:
        return json.loads(cors_origins_str)
    except json.JSONDecodeError:
        # Fallback to default origins
        return ["http://localhost:3000", "http://localhost:3001"]

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
    Health check endpoint
    """
    return {"status": "healthy", "message": "API is running"}

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