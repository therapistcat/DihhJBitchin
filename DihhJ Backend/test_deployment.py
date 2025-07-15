#!/usr/bin/env python3
"""
Test script to verify DihhJ Backend deployment
"""
import requests
import json
import sys

def test_backend_deployment(base_url):
    """Test backend deployment endpoints"""
    print(f"🧪 Testing DihhJ Backend at: {base_url}")
    print("=" * 50)
    
    # Test 1: Root endpoint
    try:
        print("1. Testing root endpoint...")
        response = requests.get(f"{base_url}/", timeout=10)
        if response.status_code == 200:
            print("   ✅ Root endpoint working")
            data = response.json()
            print(f"   📝 Message: {data.get('message', 'N/A')}")
        else:
            print(f"   ❌ Root endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Root endpoint error: {e}")
        return False
    
    # Test 2: Health check
    try:
        print("2. Testing health endpoint...")
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            print("   ✅ Health endpoint working")
            data = response.json()
            print(f"   📊 Status: {data.get('status', 'N/A')}")
            print(f"   🗄️ Database: {data.get('database', 'N/A')}")
        else:
            print(f"   ❌ Health endpoint failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Health endpoint error: {e}")
        return False
    
    # Test 3: CORS headers
    try:
        print("3. Testing CORS configuration...")
        response = requests.options(f"{base_url}/", timeout=10)
        cors_headers = response.headers.get('Access-Control-Allow-Origin', '')
        if cors_headers:
            print("   ✅ CORS headers present")
            print(f"   🌐 Allowed origins: {cors_headers}")
        else:
            print("   ⚠️ CORS headers not found (might be okay)")
    except Exception as e:
        print(f"   ❌ CORS test error: {e}")
    
    # Test 4: API Documentation (if available)
    try:
        print("4. Testing API documentation...")
        response = requests.get(f"{base_url}/docs", timeout=10)
        if response.status_code == 200:
            print("   ✅ API docs available")
        elif response.status_code == 404:
            print("   ℹ️ API docs disabled (production mode)")
        else:
            print(f"   ⚠️ API docs status: {response.status_code}")
    except Exception as e:
        print(f"   ❌ API docs test error: {e}")
    
    print("\n🎉 Backend deployment test completed!")
    return True

def main():
    """Main function"""
    # Test both local and production URLs
    urls_to_test = [
        "http://localhost:8000",  # Local development
        "https://your-backend-url.onrender.com"  # Replace with actual Render URL
    ]
    
    if len(sys.argv) > 1:
        # Custom URL provided
        urls_to_test = [sys.argv[1]]
    
    for url in urls_to_test:
        try:
            test_backend_deployment(url)
            print("\n" + "=" * 50 + "\n")
        except KeyboardInterrupt:
            print("\n⏹️ Test interrupted by user")
            break
        except Exception as e:
            print(f"❌ Test failed for {url}: {e}")
            continue

if __name__ == "__main__":
    main()
