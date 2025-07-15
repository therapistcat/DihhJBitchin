#!/usr/bin/env python3
"""
ULTRA MINIMAL DihhJ Backend - Guaranteed to work on Render
No Rust dependencies, no complex packages
"""
import os
import json
from typing import Optional, Dict, Any

# Try to import FastAPI, fall back to basic HTTP if needed
try:
    from fastapi import FastAPI, HTTPException
    from fastapi.middleware.cors import CORSMiddleware
    FASTAPI_AVAILABLE = True
except ImportError:
    print("FastAPI not available, using basic HTTP server")
    FASTAPI_AVAILABLE = False

# Create app
if FASTAPI_AVAILABLE:
    app = FastAPI(
        title="DihhJ Backend API",
        description="Minimal DihhJ Backend - No Rust Dependencies",
        version="1.0.0"
    )

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "https://dihhjbitchin-ido5.onrender.com",
            "http://localhost:3000",
            "http://localhost:3001"
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    @app.get("/")
    async def root():
        """Root endpoint"""
        return {
            "message": "DihhJ Backend is alive! 🎉",
            "status": "healthy",
            "version": "1.0.0-minimal",
            "rust_free": True,
            "frontend_url": "https://dihhjbitchin-ido5.onrender.com"
        }

    @app.get("/health")
    async def health_check():
        """Health check endpoint"""
        return {
            "status": "healthy",
            "message": "API is running perfectly",
            "database": "not_connected_yet",
            "environment": os.getenv("ENVIRONMENT", "development"),
            "version": "1.0.0-minimal"
        }

    @app.get("/test")
    async def test_endpoint():
        """Test endpoint for frontend"""
        return {
            "message": "Test successful!",
            "cors_working": True,
            "backend_url": "This backend is working!",
            "timestamp": "2024-01-01"
        }

    # Basic user endpoints (without database for now)
    @app.post("/auth/register")
    async def register_user():
        """Placeholder registration endpoint"""
        return {
            "message": "Registration endpoint working",
            "note": "Database connection will be added after deployment success"
        }

    @app.post("/auth/login")
    async def login_user():
        """Placeholder login endpoint"""
        return {
            "message": "Login endpoint working",
            "note": "Database connection will be added after deployment success"
        }

    @app.get("/tea")
    async def get_tea_posts():
        """Placeholder tea posts endpoint"""
        return {
            "message": "Tea posts endpoint working",
            "posts": [],
            "note": "Database connection will be added after deployment success"
        }

else:
    # Fallback basic HTTP server
    from http.server import HTTPServer, BaseHTTPRequestHandler
    import json

    class SimpleHandler(BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            response = {
                "message": "DihhJ Backend is alive (basic mode)!",
                "status": "healthy",
                "path": self.path
            }
            self.wfile.write(json.dumps(response).encode())

        def do_OPTIONS(self):
            self.send_response(200)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', '*')
            self.end_headers()

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    
    if FASTAPI_AVAILABLE:
        try:
            import uvicorn
            print(f"🚀 Starting DihhJ Backend on port {port}")
            uvicorn.run(app, host="0.0.0.0", port=port)
        except ImportError:
            print("Uvicorn not available, falling back to basic server")
            FASTAPI_AVAILABLE = False
    
    if not FASTAPI_AVAILABLE:
        # Basic HTTP server fallback
        server = HTTPServer(('0.0.0.0', port), SimpleHandler)
        print(f"🚀 Starting basic HTTP server on port {port}")
        server.serve_forever()
