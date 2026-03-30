from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

load_dotenv() # Load variables from .env

# Fallback to local MongoDB if URI not provided
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")

client = AsyncIOMotorClient(MONGO_URI)
db = client.hireai_db

async def get_db():
    # Yield the database instance directly
    yield db
