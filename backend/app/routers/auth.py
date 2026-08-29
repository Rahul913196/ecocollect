# from fastapi import APIRouter, HTTPException, status, Depends
# from bson import ObjectId

# from app.database import users_collection
# from app.models import RegisterIn, LoginIn, TokenOut, UserOut
# from app.security import hash_password, verify_password, create_access_token
# from app.deps import get_current_user

# router = APIRouter(prefix="/api/auth", tags=["auth"])


# def user_doc_to_out(doc: dict) -> UserOut:
#     return UserOut(
#         id=str(doc["_id"]),
#         name=doc["name"],
#         email=doc["email"],
#         role=doc["role"],
#         phone=doc.get("phone"),
#         reward_points=doc.get("reward_points", 0),
#     )


# @router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
# async def register(payload: RegisterIn):
#     existing = await users_collection.find_one({"email": payload.email})
#     if existing:
#         raise HTTPException(status_code=400, detail="Email is already registered")

#     # Only allow self-registration as "user" or "collector".
#     # Admin accounts should be created directly in the DB / by another admin.
#     role = payload.role if payload.role in ("user", "collector") else "user"

#     doc = {
#         "name": payload.name,
#         "email": payload.email,
#         "password": hash_password(payload.password),
#         "phone": payload.phone,
#         "role": role,
#         "reward_points": 0,
#     }
#     result = await users_collection.insert_one(doc)
#     doc["_id"] = result.inserted_id

#     token = create_access_token({"sub": str(doc["_id"]), "role": role})
#     return TokenOut(access_token=token, user=user_doc_to_out(doc))


# @router.post("/login", response_model=TokenOut)
# async def login(payload: LoginIn):
#     user = await users_collection.find_one({"email": payload.email})
#     if not user or not verify_password(payload.password, user["password"]):
#         raise HTTPException(status_code=401, detail="Invalid email or password")

#     token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
#     return TokenOut(access_token=token, user=user_doc_to_out(user))


# @router.get("/me", response_model=UserOut)
# async def get_me(current_user: dict = Depends(get_current_user)):
#     return user_doc_to_out(current_user)



from fastapi import APIRouter, HTTPException, status, Depends
from bson import ObjectId

from app.database import users_collection
from app.models import RegisterIn, LoginIn, TokenOut, UserOut, WalletConnectIn
from app.security import hash_password, verify_password, create_access_token, verify_wallet_signature
from app.deps import get_current_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


def user_doc_to_out(doc: dict) -> UserOut:
    return UserOut(
        id=str(doc["_id"]),
        name=doc["name"],
        email=doc["email"],
        role=doc["role"],
        phone=doc.get("phone"),
        reward_points=doc.get("reward_points", 0),
        wallet_address=doc.get("wallet_address"),
    )


@router.post("/register", response_model=TokenOut, status_code=status.HTTP_201_CREATED)
async def register(payload: RegisterIn):
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email is already registered")

    # Only allow self-registration as "user" or "collector".
    # Admin accounts should be created directly in the DB / by another admin.
    role = payload.role if payload.role in ("user", "collector") else "user"

    doc = {
        "name": payload.name,
        "email": payload.email,
        "password": hash_password(payload.password),
        "phone": payload.phone,
        "role": role,
        "reward_points": 0,
    }
    result = await users_collection.insert_one(doc)
    doc["_id"] = result.inserted_id

    token = create_access_token({"sub": str(doc["_id"]), "role": role})
    return TokenOut(access_token=token, user=user_doc_to_out(doc))


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginIn):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "role": user["role"]})
    return TokenOut(access_token=token, user=user_doc_to_out(user))


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return user_doc_to_out(current_user)


@router.post("/wallet", response_model=UserOut)
async def connect_wallet(payload: WalletConnectIn, current_user: dict = Depends(get_current_user)):
    if not verify_wallet_signature(payload.address, payload.message, payload.signature):
        raise HTTPException(status_code=400, detail="Signature verification failed")

    existing = await users_collection.find_one({
        "wallet_address": payload.address.lower(),
        "_id": {"$ne": current_user["_id"]},
    })
    if existing:
        raise HTTPException(status_code=400, detail="This wallet is already linked to another account")

    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$set": {"wallet_address": payload.address.lower()}},
    )
    current_user["wallet_address"] = payload.address.lower()
    return user_doc_to_out(current_user)


@router.delete("/wallet", response_model=UserOut)
async def disconnect_wallet(current_user: dict = Depends(get_current_user)):
    await users_collection.update_one(
        {"_id": current_user["_id"]},
        {"$unset": {"wallet_address": ""}},
    )
    current_user["wallet_address"] = None
    return user_doc_to_out(current_user)