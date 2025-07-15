#!/usr/bin/env python3
"""
Test script to verify Render deployment
"""
import os
import sys

def main():
    print("🧪 Testing Render Deployment Configuration")
    print("=" * 50)
    
    # Test 1: Python version
    print(f"🐍 Python version: {sys.version}")
    
    # Test 2: Environment variables
    port = os.environ.get('PORT', 'Not set')
    print(f"🔌 PORT environment variable: {port}")
    
    # Test 3: Check if app.py exists
    if os.path.exists('app.py'):
        print("✅ app.py file exists")
    else:
        print("❌ app.py file not found!")
        return False
    
    # Test 4: Try to import app.py
    try:
        import app
        print("✅ app.py can be imported")
    except Exception as e:
        print(f"❌ Error importing app.py: {e}")
        return False
    
    # Test 5: Check current directory
    print(f"📁 Current directory: {os.getcwd()}")
    print(f"📂 Files in directory: {os.listdir('.')}")
    
    print("=" * 50)
    print("✅ All tests passed! Ready for deployment.")
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
