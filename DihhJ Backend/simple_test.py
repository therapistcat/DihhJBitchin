#!/usr/bin/env python3
"""
Simple test to verify dependencies work
"""
import sys

def test_imports():
    """Test that all required packages can be imported"""
    print("🧪 Testing package imports...")
    
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print(f"✅ Uvicorn available")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False
    
    try:
        import pydantic
        print(f"✅ Pydantic {pydantic.__version__}")
    except ImportError as e:
        print(f"❌ Pydantic import failed: {e}")
        return False
    
    return True

def test_fastapi_app():
    """Test that FastAPI app can be created"""
    print("\n🧪 Testing FastAPI app creation...")
    
    try:
        from fastapi import FastAPI
        from fastapi.middleware.cors import CORSMiddleware
        
        app = FastAPI(title="Test App")
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        
        @app.get("/")
        async def root():
            return {"message": "Test successful"}
        
        print("✅ FastAPI app created successfully")
        return True
    except Exception as e:
        print(f"❌ FastAPI app creation failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🚀 DihhJ Backend Simple Test")
    print("=" * 40)
    
    # Test imports
    imports_ok = test_imports()
    
    # Test FastAPI app
    app_ok = test_fastapi_app()
    
    print("\n" + "=" * 40)
    if imports_ok and app_ok:
        print("✅ All tests passed! Dependencies are working.")
        return True
    else:
        print("❌ Some tests failed. Check the errors above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
