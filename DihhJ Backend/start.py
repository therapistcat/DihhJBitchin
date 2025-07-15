#!/usr/bin/env python3
"""
Ultra-simple startup script for DihhJ Backend on Render
"""
import os
import sys

def main():
    """Start the application with minimal configuration"""

    # Get port from environment (Render sets this automatically)
    port = int(os.environ.get("PORT", 8000))

    print(f"🚀 Starting DihhJ Backend on port {port}")
    print(f"🐍 Python version: {sys.version}")
    print(f"📁 Working directory: {os.getcwd()}")

    # Set environment variables for production
    os.environ.setdefault("ENVIRONMENT", "production")

    try:
        # Import uvicorn
        import uvicorn
        print("✅ Uvicorn imported")

        # Import the FastAPI app
        from main import app
        print("✅ FastAPI app imported")

        # Start the server with minimal configuration
        print(f"🌐 Starting server on 0.0.0.0:{port}")
        uvicorn.run(
            app,
            host="0.0.0.0",
            port=port,
            log_level="info",
            access_log=True
        )

    except ImportError as e:
        print(f"❌ Import error: {e}")
        print("📦 Available packages:")
        import pkg_resources
        for pkg in pkg_resources.working_set:
            print(f"  - {pkg.project_name} {pkg.version}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Startup error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

if __name__ == "__main__":
    main()
