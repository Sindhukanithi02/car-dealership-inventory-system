from pydantic import BaseModel, EmailStr, field_validator


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
    image_url: str

    @field_validator("image_url")
    @classmethod
    def validate_image_url(cls, value: str) -> str:
        value = value.strip()
        if not (
            value.startswith("https://")
            or value.startswith("http://")
            or value.startswith("data:image/")
        ):
            raise ValueError("Image must be an HTTP(S) URL or an image file")
        return value