#!/usr/bin/env python3
"""
Bulletproof startup script for DihhJ Backend on Render
"""
import os
import sys

def main():
    """Start the application with proper configuration"""
    
    # Get port from environment (Render sets this)
    port = int(os.environ.get("PORT", 8000))
    
    print(f"🚀 Starting DihhJ Backend on port {port}")
    print(f"🐍 Python version: {sys.version}")
    
    try:
        # Import and run with uvicorn
        import uvicorn
        print("✅ Uvicorn imported successfully")
        
        # Import the FastAPI app
        from main import app
        print("✅ FastAPI app imported successfully")
        
        # Start the server
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info"
        )
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
