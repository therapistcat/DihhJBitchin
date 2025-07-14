#!/usr/bin/env python3
"""
Production Configuration Test Script
Tests the backend configuration for production deployment
"""

import os
import asyncio
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.production')

async def test_production_config():
    """Test production configuration"""
    print("🧪 Testing DihhJ Backend Production Configuration...")
    print("=" * 50)
    
    # Test environment variables
    print("\n📋 Environment Variables:")
    required_vars = [
        'MONGODB_URL',
        'DB_PASSWORD', 
        'DATABASE_NAME',
        'API_HOST',
        'API_PORT',
        'ENVIRONMENT',
        'CORS_ORIGINS',
        'SECRET_KEY'
    ]
    
    missing_vars = []
    for var in required_vars:
        value = os.getenv(var)
        if value:
            # Mask sensitive values
            if var in ['DB_PASSWORD', 'SECRET_KEY']:
                display_value = '*' * len(value)
            elif var == 'MONGODB_URL':
                display_value = value.replace(os.getenv('DB_PASSWORD', ''), '***')
            else:
                display_value = value
            print(f"  ✅ {var}: {display_value}")
        else:
            print(f"  ❌ {var}: NOT SET")
            missing_vars.append(var)
    
    if missing_vars:
        print(f"\n❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    # Test database connection
    print("\n🔗 Testing Database Connection:")
    try:
        from database import test_connection
        db_connected = await test_connection()
        if db_connected:
            print("  ✅ MongoDB Atlas connection successful")
        else:
            print("  ❌ MongoDB Atlas connection failed")
            return False
    except Exception as e:
        print(f"  ❌ Database connection error: {e}")
        return False
    
    # Test API configuration
    print("\n🚀 API Configuration:")
    try:
        import json
        cors_origins = json.loads(os.getenv('CORS_ORIGINS', '[]'))
        print(f"  ✅ CORS Origins: {cors_origins}")
        print(f"  ✅ Environment: {os.getenv('ENVIRONMENT')}")
        print(f"  ✅ Host: {os.getenv('API_HOST')}")
        print(f"  ✅ Port: {os.getenv('API_PORT')}")
    except Exception as e:
        print(f"  ❌ API configuration error: {e}")
        return False
    
    print("\n✅ All production configuration tests passed!")
    print("\n📝 Next Steps:")
    print("1. Update DB_PASSWORD with your actual MongoDB password")
    print("2. Update CORS_ORIGINS with your frontend URL after deployment")
    print("3. Generate a secure SECRET_KEY")
    print("4. Deploy to Render with these environment variables")
    
    return True

if __name__ == "__main__":
    try:
        result = asyncio.run(test_production_config())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        print("\n\n⏹️  Test interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
        sys.exit(1)
