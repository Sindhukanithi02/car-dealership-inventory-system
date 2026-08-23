from pydantic import BaseModel, EmailStr


# -------------------------
# USER SCHEMA
# -------------------------

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str


# -------------------------
# VEHICLE SCHEMA
# -------------------------

class VehicleCreate(BaseModel):
    make: str
    model: str
    category: str
    price: float
    quantity: int