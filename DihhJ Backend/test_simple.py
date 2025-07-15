#!/usr/bin/env python3
"""
Simple test to verify the backend works
"""
import sys
import os

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing imports...")
    
    try:
        import fastapi
        print(f"✅ FastAPI {fastapi.__version__}")
    except ImportError as e:
        print(f"❌ FastAPI import failed: {e}")
        return False
    
    try:
        import uvicorn
        print(f"✅ Uvicorn imported")
    except ImportError as e:
        print(f"❌ Uvicorn import failed: {e}")
        return False
    
    try:
        import motor
        print(f"✅ Motor imported")
    except ImportError as e:
        print(f"❌ Motor import failed: {e}")
        return False
    
    try:
        import pymongo
        print(f"✅ PyMongo {pymongo.version}")
    except ImportError as e:
        print(f"❌ PyMongo import failed: {e}")
        return False
    
    try:
        from main import app
        print("✅ Main app imported")
    except ImportError as e:
        print(f"❌ Main app import failed: {e}")
        return False
    
    return True

def test_app_creation():
    """Test if the FastAPI app can be created"""
    print("\n🧪 Testing app creation...")
    
    try:
        from main import app
        print(f"✅ App created: {app.title}")
        print(f"✅ App version: {app.version}")
        return True
    except Exception as e:
        print(f"❌ App creation failed: {e}")
        return False

if __name__ == "__main__":
    print("🚀 DihhJ Backend Simple Test")
    print("=" * 40)
    
    success = True
    
    if not test_imports():
        success = False
    
    if not test_app_creation():
        success = False
    
    if success:
        print("\n✅ All tests passed! Backend is ready for deployment.")
        sys.exit(0)
    else:
        print("\n❌ Some tests failed. Check the errors above.")
        sys.exit(1)
