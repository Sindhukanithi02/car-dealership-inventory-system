from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Vehicle
from ..schemas import VehicleCreate
from ..auth import get_current_user, get_current_admin


router = APIRouter(
    prefix="/api/vehicles",
    tags=["Vehicles"]
)


def vehicle_response(vehicle: Vehicle):
    return {
        "id": vehicle.id,
        "make": vehicle.make,
        "model": vehicle.model,
        "category": vehicle.category,
        "price": vehicle.price,
        "quantity": vehicle.quantity,
        "image_url": vehicle.image_url,
    }


# =========================================================
# ADD VEHICLE
# =========================================================

@router.post("", status_code=201)
def add_vehicle(
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    new_vehicle = Vehicle(
        make=vehicle.make,
        model=vehicle.model,
        category=vehicle.category,
        price=vehicle.price,
        quantity=vehicle.quantity,
        image_url=str(vehicle.image_url)
    )

    db.add(new_vehicle)
    db.commit()
    db.refresh(new_vehicle)

    return vehicle_response(new_vehicle)


# =========================================================
# GET ALL VEHICLES
# =========================================================

@router.get("")
def get_vehicles(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    vehicles = db.query(Vehicle).all()

    return [
        {
            "id": vehicle.id,
            "make": vehicle.make,
            "model": vehicle.model,
            "category": vehicle.category,
            "price": vehicle.price,
            "quantity": vehicle.quantity,
            "image_url": vehicle.image_url
        }
        for vehicle in vehicles
    ]


# =========================================================
# SEARCH VEHICLES
# =========================================================

@router.get("/search")
def search_vehicles(
    make: Optional[str] = None,
    model: Optional[str] = None,
    category: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    query = db.query(Vehicle)

    if make:
        query = query.filter(
            Vehicle.make.ilike(f"%{make}%")
        )

    if model:
        query = query.filter(
            Vehicle.model.ilike(f"%{model}%")
        )

    if category:
        query = query.filter(
            Vehicle.category.ilike(f"%{category}%")
        )

    if min_price is not None:
        query = query.filter(
            Vehicle.price >= min_price
        )

    if max_price is not None:
        query = query.filter(
            Vehicle.price <= max_price
        )

    vehicles = query.all()

    return [
        {
            "id": vehicle.id,
            "make": vehicle.make,
            "model": vehicle.model,
            "category": vehicle.category,
            "price": vehicle.price,
            "quantity": vehicle.quantity,
            "image_url": vehicle.image_url
        }
        for vehicle in vehicles
    ]


# =========================================================
# GET SINGLE VEHICLE
# =========================================================

@router.get("/{vehicle_id}")
def get_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    return vehicle_response(vehicle)


# =========================================================
# UPDATE VEHICLE
# =========================================================

@router.put("/{vehicle_id}")
def update_vehicle(
    vehicle_id: int,
    vehicle: VehicleCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    existing_vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if existing_vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    existing_vehicle.make = vehicle.make
    existing_vehicle.model = vehicle.model
    existing_vehicle.category = vehicle.category
    existing_vehicle.price = vehicle.price
    existing_vehicle.quantity = vehicle.quantity
    existing_vehicle.image_url = str(vehicle.image_url)

    db.commit()
    db.refresh(existing_vehicle)

    return vehicle_response(existing_vehicle)


# =========================================================
# DELETE VEHICLE - ADMIN ONLY
# =========================================================

@router.delete("/{vehicle_id}")
def delete_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    db.delete(vehicle)
    db.commit()

    return {
        "message": "Vehicle deleted successfully"
    }


# =========================================================
# PURCHASE VEHICLE
# =========================================================

@router.post("/{vehicle_id}/purchase")
def purchase_vehicle(
    vehicle_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    if vehicle.quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Vehicle is out of stock"
        )

    vehicle.quantity -= 1

    db.commit()
    db.refresh(vehicle)

    return {
        "message": "Vehicle purchased successfully",
        "vehicle": vehicle_response(vehicle)
    }


# =========================================================
# RESTOCK VEHICLE - ADMIN ONLY
# =========================================================

@router.post("/{vehicle_id}/restock")
def restock_vehicle(
    vehicle_id: int,
    quantity: int,
    db: Session = Depends(get_db),
    current_admin=Depends(get_current_admin)
):
    vehicle = db.query(Vehicle).filter(
        Vehicle.id == vehicle_id
    ).first()

    if vehicle is None:
        raise HTTPException(
            status_code=404,
            detail="Vehicle not found"
        )

    if quantity <= 0:
        raise HTTPException(
            status_code=400,
            detail="Restock quantity must be greater than 0"
        )

    vehicle.quantity += quantity

    db.commit()
    db.refresh(vehicle)

    return {
        "message": "Vehicle restocked successfully",
        "vehicle": vehicle_response(vehicle)
    }