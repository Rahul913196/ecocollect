from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from app.database import products_collection, orders_collection, users_collection
from app.models import ProductIn, ProductOut, OrderCreateIn, OrderOut
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/api/rewards", tags=["rewards"])


def product_doc_to_out(doc: dict) -> ProductOut:
    return ProductOut(
        id=str(doc["_id"]),
        name=doc["name"],
        description=doc["description"],
        points_cost=doc["points_cost"],
        stock=doc["stock"],
        image_url=doc.get("image_url"),
    )


def order_doc_to_out(doc: dict) -> OrderOut:
    return OrderOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        product_id=doc["product_id"],
        product_name=doc["product_name"],
        points_spent=doc["points_spent"],
        status=doc["status"],
        created_at=doc["created_at"],
    )


@router.get("/products", response_model=list[ProductOut])
async def list_products():
    cursor = products_collection.find({"stock": {"$gt": 0}})
    return [product_doc_to_out(doc) async for doc in cursor]


@router.post("/products", response_model=ProductOut, status_code=201)
async def create_product(
    payload: ProductIn, current_user: dict = Depends(require_role("admin"))
):
    """Admin-only: add a redeemable product to the marketplace."""
    result = await products_collection.insert_one(payload.model_dump())
    doc = payload.model_dump()
    doc["_id"] = result.inserted_id
    return product_doc_to_out(doc)


@router.post("/orders", response_model=OrderOut, status_code=201)
async def place_order(
    payload: OrderCreateIn, current_user: dict = Depends(require_role("user"))
):
    """User redeems reward points for a product."""
    product = await products_collection.find_one({"_id": ObjectId(payload.product_id)})
    if not product or product["stock"] <= 0:
        raise HTTPException(status_code=404, detail="Product not available")

    if current_user.get("reward_points", 0) < product["points_cost"]:
        raise HTTPException(status_code=400, detail="Not enough reward points")

    # Deduct points, decrement stock, create order (kept simple/non-transactional
    # for a standalone MongoDB instance without replica-set transactions)
    await users_collection.update_one(
        {"_id": current_user["_id"]}, {"$inc": {"reward_points": -product["points_cost"]}}
    )
    await products_collection.update_one(
        {"_id": product["_id"]}, {"$inc": {"stock": -1}}
    )

    order_doc = {
        "user_id": str(current_user["_id"]),
        "product_id": str(product["_id"]),
        "product_name": product["name"],
        "points_spent": product["points_cost"],
        "status": "placed",
        "created_at": datetime.now(timezone.utc),
    }
    result = await orders_collection.insert_one(order_doc)
    order_doc["_id"] = result.inserted_id
    return order_doc_to_out(order_doc)


@router.get("/orders/mine", response_model=list[OrderOut])
async def my_orders(current_user: dict = Depends(require_role("user"))):
    cursor = orders_collection.find({"user_id": str(current_user["_id"])}).sort(
        "created_at", -1
    )
    return [order_doc_to_out(doc) async for doc in cursor]
