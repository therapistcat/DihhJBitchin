import os
import urllib.parse
import asyncio
from pymongo import MongoClient
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection settings
def get_mongodb_url():
    """Get MongoDB URL with proper configuration for Atlas or local"""
    # For production (MongoDB Atlas)
    mongodb_url = os.getenv("MONGODB_URL")
    db_password = os.getenv("DB_PASSWORD")

    if mongodb_url and db_password:
        # Replace <db_password> placeholder with actual password
        mongodb_url = mongodb_url.replace("<db_password>", urllib.parse.quote_plus(db_password))
        return mongodb_url

    # For local development
    return os.getenv("MONGODB_URL", "mongodb://localhost:27017")

MONGODB_URL = get_mongodb_url()
DATABASE_NAME = os.getenv("DATABASE_NAME", "dihhj_backend")

# MongoDB client configuration (simplified for compatibility)
client_options = {
    "maxPoolSize": 10,
    "minPoolSize": 1,
    "maxIdleTimeMS": 30000,
    "serverSelectionTimeoutMS": 5000,
    "socketTimeoutMS": 20000,
    "connectTimeoutMS": 10000,
    "retryWrites": True,
    "w": "majority"
}

# Create MongoDB client (synchronous)
try:
    client = MongoClient(MONGODB_URL, **client_options)
except Exception as e:
    print(f"❌ Error creating MongoDB client: {e}")
    raise

# Get database
database = client[DATABASE_NAME]

# Get collections
user_collection = database.get_collection("users")
tea_collection = database.get_collection("teas")
bitch_collection = database.get_collection("bitches")
tea_votes_collection = database.get_collection("tea_votes")
bitch_votes_collection = database.get_collection("bitch_votes")

# Async wrapper for synchronous operations
async def run_sync(func, *args, **kwargs):
    """Run synchronous function in thread pool"""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, func, *args, **kwargs)

# Test connection function
async def test_connection():
    try:
        # Test the connection with timeout
        await run_sync(client.admin.command, 'ping')

        # Test database access
        await run_sync(database.list_collection_names)

        print("✅ Successfully connected to MongoDB!")
        print(f"📊 Connected to database: {DATABASE_NAME}")
        return True
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        print(f"🔗 Connection URL: {MONGODB_URL.split('@')[1] if '@' in MONGODB_URL else 'localhost'}")
        return False

# Initialize database indexes
async def initialize_indexes():
    try:
        # Create unique index on username field
        await run_sync(user_collection.create_index, "username", unique=True)
        print("✅ Database indexes initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to initialize indexes: {e}")
        return False

# Close connection function
async def close_connection():
    await run_sync(client.close)
    print("🔌 MongoDB connection closed")