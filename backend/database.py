from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import certifi # <-- Added this

load_dotenv() 

MONGO_URI = os.getenv("MONGO_URI")

# Tell Motor to use the certifi certificates for the SSL handshake
client = AsyncIOMotorClient(MONGO_URI, tlsCAFile=certifi.where())
db = client.hireai_db

async def ping_db():
    try:
        await client.admin.command('ping')
        print("✅ SUCCESS: Connected to MongoDB Atlas!")
    except Exception as e:
        print(f"❌ ERROR: MongoDB connection failed: {e}")

async def get_db():
    yield db