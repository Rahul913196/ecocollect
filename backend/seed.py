"""
Run once after starting MongoDB to create a default admin account
and a few sample reward products.

Usage:
    cd backend
    python seed.py
"""
import asyncio
from app.database import users_collection, products_collection, init_indexes
from app.security import hash_password

ADMIN_EMAIL = "admin@ecocollect.com"
ADMIN_PASSWORD = "Admin@123"


async def seed():
    await init_indexes()

    existing = await users_collection.find_one({"email": ADMIN_EMAIL})
    if not existing:
        await users_collection.insert_one({
            "name": "EcoCollect Admin",
            "email": ADMIN_EMAIL,
            "password": hash_password(ADMIN_PASSWORD),
            "phone": None,
            "role": "admin",
            "reward_points": 0,
        })
        print(f"Created admin account -> {ADMIN_EMAIL} / {ADMIN_PASSWORD}")
    else:
        print("Admin account already exists, skipping.")

    sample_products = [
        {"name": "Reusable Steel Bottle", "description": "1L insulated steel water bottle.", "points_cost": 150, "stock": 25, "image_url": None},
        {"name": "Cotton Tote Bag", "description": "Durable canvas tote for everyday use.", "points_cost": 80, "stock": 40, "image_url": None},
        {"name": "Bamboo Cutlery Set", "description": "Travel-friendly bamboo fork, knife, spoon.", "points_cost": 60, "stock": 50, "image_url": None},
        {"name": "₹200 Grocery Voucher", "description": "Redeemable at partner grocery stores.", "points_cost": 300, "stock": 15, "image_url": None},
    ]

    for p in sample_products:
        existing = await products_collection.find_one({"name": p["name"]})
        if not existing:
            await products_collection.insert_one(p)

    print("Seed complete.")


if __name__ == "__main__":
    asyncio.run(seed())
