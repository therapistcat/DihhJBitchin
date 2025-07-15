#!/usr/bin/env python3
"""
Test the simple API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    """Test health endpoint"""
    print("🧪 Testing health endpoint...")
    response = requests.get(f"{BASE_URL}/health")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_register():
    """Test user registration"""
    print("\n🧪 Testing user registration...")
    user_data = {
        "username": "testuser",
        "password": "testpass",
        "year": 26
    }
    response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_login():
    """Test user login"""
    print("\n🧪 Testing user login...")
    login_data = {
        "username": "testuser",
        "password": "testpass"
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_create_tea():
    """Test creating a tea post"""
    print("\n🧪 Testing tea creation...")
    tea_data = {
        "title": "Test Tea",
        "content": "This is a test tea post",
        "tag": "general"
    }
    response = requests.post(f"{BASE_URL}/tea", json=tea_data)
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

def test_get_teas():
    """Test getting all teas"""
    print("\n🧪 Testing get all teas...")
    response = requests.get(f"{BASE_URL}/tea")
    print(f"Status: {response.status_code}")
    print(f"Response: {response.json()}")
    return response.status_code == 200

if __name__ == "__main__":
    print("🚀 Testing DihhJ Simple API")
    print("=" * 40)
    
    # Note: Make sure the server is running first
    print("⚠️  Make sure to start the server first: python main_simple.py")
    input("Press Enter when server is running...")
    
    tests = [
        test_health,
        test_register,
        test_login,
        test_create_tea,
        test_get_teas
    ]
    
    passed = 0
    for test in tests:
        try:
            if test():
                passed += 1
                print("✅ PASSED")
            else:
                print("❌ FAILED")
        except Exception as e:
            print(f"❌ ERROR: {e}")
    
    print(f"\n📊 Results: {passed}/{len(tests)} tests passed")
    
    if passed == len(tests):
        print("🎉 All tests passed! API is working correctly.")
    else:
        print("⚠️  Some tests failed. Check the server logs.")
