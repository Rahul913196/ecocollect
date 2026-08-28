from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from app.database import requests_collection
from app.models import RequestCreateIn, RequestOut
from app.deps import get_current_user, require_role

router = APIRouter(prefix="/api/requests", tags=["requests"])


def request_doc_to_out(doc: dict) -> RequestOut:
    return RequestOut(
        id=str(doc["_id"]),
        user_id=doc["user_id"],
        user_name=doc["user_name"],
        plastic_type=doc["plastic_type"],
        quantity_kg=doc["quantity_kg"],
        address=doc["address"],
        pickup_date=doc.get("pickup_date"),
        notes=doc.get("notes"),
        status=doc["status"],
        collector_id=doc.get("collector_id"),
        collector_name=doc.get("collector_name"),
        reward_points_awarded=doc.get("reward_points_awarded"),
        created_at=doc["created_at"],
        updated_at=doc["updated_at"],
    )


@router.post("", response_model=RequestOut, status_code=201)
async def create_request(
    payload: RequestCreateIn, current_user: dict = Depends(require_role("user"))
):
    """Sell Plastic page -> Create Request API"""
    now = datetime.now(timezone.utc)
    doc = {
        "user_id": str(current_user["_id"]),
        "user_name": current_user["name"],
        "plastic_type": payload.plastic_type,
        "quantity_kg": payload.quantity_kg,
        "address": payload.address,
        "pickup_date": payload.pickup_date,
        "notes": payload.notes,
        "status": "pending",
        "collector_id": None,
        "collector_name": None,
        "reward_points_awarded": None,
        "created_at": now,
        "updated_at": now,
    }
    result = await requests_collection.insert_one(doc)
    doc["_id"] = result.inserted_id
    return request_doc_to_out(doc)


@router.get("/mine", response_model=list[RequestOut])
async def my_requests(current_user: dict = Depends(require_role("user"))):
    """My Requests page"""
    cursor = requests_collection.find({"user_id": str(current_user["_id"])}).sort(
        "created_at", -1
    )
    return [request_doc_to_out(doc) async for doc in cursor]


@router.get("/{request_id}", response_model=RequestOut)
async def get_request(request_id: str, current_user: dict = Depends(get_current_user)):
    doc = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Request not found")

    is_owner = doc["user_id"] == str(current_user["_id"])
    is_staff = current_user["role"] in ("admin", "collector")
    if not (is_owner or is_staff):
        raise HTTPException(status_code=403, detail="Not allowed to view this request")

    return request_doc_to_out(doc)
