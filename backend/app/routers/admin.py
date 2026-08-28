from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from datetime import datetime, timezone

from app.database import requests_collection, users_collection, orders_collection
from app.models import RequestOut, AssignCollectorIn
from app.deps import require_role
from app.routers.requests import request_doc_to_out

router = APIRouter(prefix="/api/admin", tags=["admin"])


@router.get("/requests", response_model=list[RequestOut])
async def list_all_requests(
    status: str | None = None, current_user: dict = Depends(require_role("admin"))
):
    """Admin Dashboard: view every pickup request, optionally filtered by status."""
    query = {"status": status} if status else {}
    cursor = requests_collection.find(query).sort("created_at", -1)
    return [request_doc_to_out(doc) async for doc in cursor]


@router.patch("/requests/{request_id}/approve", response_model=RequestOut)
async def approve_request(
    request_id: str, current_user: dict = Depends(require_role("admin"))
):
    doc = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Request not found")
    if doc["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be approved")

    await requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "approved", "updated_at": datetime.now(timezone.utc)}},
    )
    updated = await requests_collection.find_one({"_id": ObjectId(request_id)})
    return request_doc_to_out(updated)


@router.patch("/requests/{request_id}/reject", response_model=RequestOut)
async def reject_request(
    request_id: str, current_user: dict = Depends(require_role("admin"))
):
    doc = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Request not found")
    if doc["status"] != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be rejected")

    await requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {"$set": {"status": "rejected", "updated_at": datetime.now(timezone.utc)}},
    )
    updated = await requests_collection.find_one({"_id": ObjectId(request_id)})
    return request_doc_to_out(updated)


@router.patch("/requests/{request_id}/assign", response_model=RequestOut)
async def assign_collector(
    request_id: str,
    payload: AssignCollectorIn,
    current_user: dict = Depends(require_role("admin")),
):
    doc = await requests_collection.find_one({"_id": ObjectId(request_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Request not found")
    if doc["status"] != "approved":
        raise HTTPException(
            status_code=400, detail="Only approved requests can be assigned"
        )

    collector = await users_collection.find_one(
        {"_id": ObjectId(payload.collector_id), "role": "collector"}
    )
    if not collector:
        raise HTTPException(status_code=404, detail="Collector not found")

    await requests_collection.update_one(
        {"_id": ObjectId(request_id)},
        {
            "$set": {
                "status": "assigned",
                "collector_id": str(collector["_id"]),
                "collector_name": collector["name"],
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    updated = await requests_collection.find_one({"_id": ObjectId(request_id)})
    return request_doc_to_out(updated)


@router.get("/collectors")
async def list_collectors(current_user: dict = Depends(require_role("admin"))):
    """Helper endpoint so the admin UI can populate the 'assign collector' dropdown."""
    cursor = users_collection.find({"role": "collector"})
    return [
        {"id": str(c["_id"]), "name": c["name"], "email": c["email"]}
        async for c in cursor
    ]


@router.get("/analytics")
async def analytics(current_user: dict = Depends(require_role("admin"))):
    """Phase 7: Analytics summary for the admin dashboard."""
    total_requests = await requests_collection.count_documents({})
    pending = await requests_collection.count_documents({"status": "pending"})
    completed = await requests_collection.count_documents({"status": "completed"})

    pipeline = [
        {"$match": {"status": "completed"}},
        {"$group": {"_id": None, "total_kg": {"$sum": "$quantity_kg"}}},
    ]
    agg = await requests_collection.aggregate(pipeline).to_list(length=1)
    total_kg_recycled = agg[0]["total_kg"] if agg else 0

    total_users = await users_collection.count_documents({"role": "user"})
    total_collectors = await users_collection.count_documents({"role": "collector"})
    total_orders = await orders_collection.count_documents({})

    return {
        "total_requests": total_requests,
        "pending_requests": pending,
        "completed_requests": completed,
        "total_kg_recycled": total_kg_recycled,
        "total_users": total_users,
        "total_collectors": total_collectors,
        "total_orders": total_orders,
    }
