"""
Simple test script to verify the API endpoints work correctly
"""
import asyncio
import aiohttp
import json

BASE_URL = "http://localhost:8000"

async def test_api():
    async with aiohttp.ClientSession() as session:
        print("🧪 Testing DihhJ Backend API...")
        
        # Test root endpoint
        print("\n1. Testing root endpoint...")
        async with session.get(f"{BASE_URL}/") as response:
            data = await response.json()
            print(f"Status: {response.status}")
            print(f"Response: {json.dumps(data, indent=2)}")
        
        # Test health endpoint
        print("\n2. Testing health endpoint...")
        async with session.get(f"{BASE_URL}/health") as response:
            data = await response.json()
            print(f"Status: {response.status}")
            print(f"Response: {json.dumps(data, indent=2)}")
        
        # Test user registration
        print("\n3. Testing user registration...")
        user_data = {
            "username": "test_user",
            "password": "testpassword123",
            "year": "27"
        }
        
        async with session.post(
            f"{BASE_URL}/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        ) as response:
            data = await response.json()
            print(f"Status: {response.status}")
            print(f"Response: {json.dumps(data, indent=2)}")
        
        # Test user login
        print("\n4. Testing user login...")
        login_data = {
            "username": "test_user",
            "password": "testpassword123"
        }
        
        async with session.post(
            f"{BASE_URL}/auth/login",
            json=login_data,
            headers={"Content-Type": "application/json"}
        ) as response:
            data = await response.json()
            print(f"Status: {response.status}")
            print(f"Response: {json.dumps(data, indent=2)}")
        
        # Test duplicate registration (should fail)
        print("\n5. Testing duplicate registration (should fail)...")
        async with session.post(
            f"{BASE_URL}/auth/register",
            json=user_data,
            headers={"Content-Type": "application/json"}
        ) as response:
            data = await response.json()
            print(f"Status: {response.status}")
            print(f"Response: {json.dumps(data, indent=2)}")
        
        # Test invalid login (should fail)
        print("\n6. Testing invalid login (should fail)...")
        invalid_login = {
            "username": "test_user",
            "password": "wrongpassword"
        }
        
        async with session.post(
            f"{BASE_URL}/auth/login",
            json=invalid_login,
            headers={"Content-Type": "application/json"}
        ) as response:
            data = await response.json()
            print(f"Status: {response.status}")
            print(f"Response: {json.dumps(data, indent=2)}")

if __name__ == "__main__":
    print("Make sure the API server is running on http://localhost:8000")
    print("Run: python main.py")
    print("Then run this test script in another terminal")
    
    try:
        asyncio.run(test_api())
    except Exception as e:
        print(f"❌ Error running tests: {e}")
        print("Make sure the API server is running!")
