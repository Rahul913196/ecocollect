from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone
import math

from app.database import requests_collection, users_collection
from app.models import RequestOut
from app.deps import require_role
from app.routers.requests import request_doc_to_out

router = APIRouter(prefix="/api/collector", tags=["collector"])

POINTS_PER_KG = 10  # simple, transparent reward rule


@router.get("/requests", response_model=list[RequestOut])
async def my_assigned_requests(current_user: dict = Depends(require_role("collector"))):
    """Collector Dashboard: requests assigned to this collector."""
    cursor = requests_collection.find(
        {
            "collector_id": str(current_user["_id"]),
            "status": {"$in": ["assigned", "picked_up"]},
        }
    ).sort("created_at", -1)
    return [request_doc_to_out(doc) async for doc in cursor]


@router.patch("/requests/{request_id}/pickup", response_model=RequestOut)
async def mark_picked_up(
    request_id: str, current_user: dict = Depends(require_role("collector"))
):
    doc = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Request not found")
    if doc.get("collector_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="This request is not assigned to you")
    if doc["status"] != "assigned":
        raise HTTPException(status_code=400, detail="Request must be 'assigned' first")

    await requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "picked_up", "updated_at": datetime.now(timezone.utc)}},
    )
    updated = await requests_collection.find_one({"_id": ObjectId(request_id)})
    return request_doc_to_out(updated)


@router.patch("/requests/{request_id}/complete", response_model=RequestOut)
async def complete_request(
    request_id: str, current_user: dict = Depends(require_role("collector"))
):
    doc = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Request not found")
    if doc.get("collector_id") != str(current_user["_id"]):
        raise HTTPException(status_code=403, detail="This request is not assigned to you")
    if doc["status"] != "picked_up":
        raise HTTPException(status_code=400, detail="Request must be 'picked_up' first")

    points = math.floor(doc["quantity_kg"] * POINTS_PER_KG)

    await requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "completed",
                "reward_points_awarded": points,
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    # Phase 7: Reward system — credit points to the user who submitted the request
    await users_collection.update_one(
        {"_id": ObjectId(doc["user_id"])}, {"$inc": {"reward_points": points}}
    )

    updated = await requests_collection.find_one({"_id": ObjectId(request_id)})
    return request_doc_to_out(updated)
