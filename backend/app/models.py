from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Literal
from datetime import datetime

Role = Literal["user", "admin", "collector"]
RequestStatus = Literal[
    "pending", "approved", "rejected", "assigned", "picked_up", "completed"
]


# ---------- Auth ----------
class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=80)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)
    phone: Optional[str] = None
    role: Role = "user"  # collectors/admins are normally promoted by an admin,
    # but allowing role at signup keeps the demo simple


class LoginIn(BaseModel):
    email: EmailStr
    password: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: "UserOut"


class UserOut(BaseModel):
    id: str
    name: str
    email: EmailStr
    role: Role
    phone: Optional[str] = None
    reward_points: int = 0


# ---------- Plastic Pickup Requests ----------
class RequestCreateIn(BaseModel):
    plastic_type: str
    quantity_kg: float = Field(gt=0)
    address: str
    pickup_date: Optional[str] = None
    notes: Optional[str] = None


class RequestOut(BaseModel):
    id: str
    user_id: str
    user_name: str
    plastic_type: str
    quantity_kg: float
    address: str
    pickup_date: Optional[str] = None
    notes: Optional[str] = None
    status: RequestStatus
    collector_id: Optional[str] = None
    collector_name: Optional[str] = None
    reward_points_awarded: Optional[int] = None
    created_at: datetime
    updated_at: datetime


class AssignCollectorIn(BaseModel):
    collector_id: str


# ---------- Rewards / Products / Orders ----------
class ProductIn(BaseModel):
    name: str
    description: str
    points_cost: int = Field(gt=0)
    stock: int = Field(ge=0)
    image_url: Optional[str] = None


class ProductOut(ProductIn):
    id: str


class OrderCreateIn(BaseModel):
    product_id: str


class OrderOut(BaseModel):
    id: str
    user_id: str
    product_id: str
    product_name: str
    points_spent: int
    status: Literal["placed", "shipped", "delivered"]
    created_at: datetime
