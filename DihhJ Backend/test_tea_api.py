#!/usr/bin/env python3
"""
Test script for the Tea API endpoints
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_root_endpoint():
    """Test the root endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"Root endpoint status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing root endpoint: {e}")
        return False

def test_health_endpoint():
    """Test the health endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Health endpoint status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing health endpoint: {e}")
        return False

def test_register_user():
    """Test user registration"""
    try:
        user_data = {
            "username": "testuser",
            "password": "testpassword123",
            "year": "27"
        }
        response = requests.post(f"{BASE_URL}/auth/register", json=user_data)
        print(f"Register endpoint status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code in [200, 201, 400]  # 400 if user already exists
    except Exception as e:
        print(f"Error testing register endpoint: {e}")
        return False

def test_create_tea():
    """Test creating a tea post"""
    try:
        tea_data = {
            "title": "My First Tea",
            "content": "This is a test tea post about my amazing day!",
            "images": ["https://example.com/image1.jpg"]
        }
        response = requests.post(f"{BASE_URL}/tea/create?username=testuser", json=tea_data)
        print(f"Create tea endpoint status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code in [200, 201]
    except Exception as e:
        print(f"Error testing create tea endpoint: {e}")
        return False

def test_list_teas():
    """Test listing tea posts"""
    try:
        response = requests.get(f"{BASE_URL}/tea/list")
        print(f"List teas endpoint status: {response.status_code}")
        print(f"Response: {response.json()}")
        return response.status_code == 200
    except Exception as e:
        print(f"Error testing list teas endpoint: {e}")
        return False

def main():
    """Run all tests"""
    print("🧪 Testing Tea API endpoints...")
    print("=" * 50)
    
    tests = [
        ("Root Endpoint", test_root_endpoint),
        ("Health Endpoint", test_health_endpoint),
        ("Register User", test_register_user),
        ("Create Tea", test_create_tea),
        ("List Teas", test_list_teas),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 Testing {test_name}...")
        result = test_func()
        results.append((test_name, result))
        print(f"✅ {test_name}: {'PASSED' if result else 'FAILED'}")
        print("-" * 30)
    
    print("\n📊 Test Results Summary:")
    print("=" * 50)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! The Tea API is working correctly.")
    else:
        print("⚠️  Some tests failed. Please check the server and try again.")

if __name__ == "__main__":
    main()
