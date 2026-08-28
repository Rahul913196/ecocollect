from motor.motor_asyncio import AsyncIOMotorClient
from app.config import settings

client = AsyncIOMotorClient(settings.mongo_uri)
db = client[settings.db_name]

users_collection = db["users"]
requests_collection = db["requests"]
products_collection = db["products"]
orders_collection = db["orders"]


async def init_indexes():
    """Create indexes needed by the app. Called once on startup."""
    await users_collection.create_index("email", unique=True)
    await requests_collection.create_index("user_id")
    await requests_collection.create_index("status")
    await orders_collection.create_index("user_id")
