from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


# =========================================================
# HELPER: LOGIN
# =========================================================

def login(email, password):
    response = client.post(
        "/api/auth/login",
        data={
            "username": email,
            "password": password
        }
    )

    return response.json()["access_token"]


# =========================================================
# HELPER: CREATE ADMIN
# =========================================================

def create_admin():
    email = "vehicle_admin_test@example.com"

    response = client.post(
        "/api/auth/register",
        json={
            "name": "Vehicle Admin",
            "email": email,
            "password": "password123"
        }
    )

    # If already exists, that's okay
    if response.status_code not in [201, 400]:
        assert response.status_code == 201

    # IMPORTANT:
    # Registration creates a normal user.
    # We will use the existing admin account for admin tests.
    return login("admin@gmail.com", "admin123")


# =========================================================
# TEST ADD VEHICLE
# =========================================================

def test_add_vehicle():
    token = login(
        "admin@gmail.com",
        "admin123"
    )

    response = client.post(
        "/api/vehicles",
        json={
            "make": "TestMake",
            "model": "TestModel",
            "category": "SUV",
            "price": 30000,
            "quantity": 5
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 201
    assert response.json()["make"] == "TestMake"


# =========================================================
# TEST GET VEHICLES
# =========================================================

def test_get_vehicles():
    token = login(
        "admin@gmail.com",
        "admin123"
    )

    response = client.get(
        "/api/vehicles",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    assert isinstance(response.json(), list)


# =========================================================
# TEST SEARCH VEHICLES
# =========================================================

def test_search_vehicles():
    token = login(
        "admin@gmail.com",
        "admin123"
    )

    response = client.get(
        "/api/vehicles/search",
        params={
            "make": "Toyota",
            "model": "Camry",
            "category": "Sedan"
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    for vehicle in response.json():
        assert vehicle["make"] == "Toyota"
        assert vehicle["model"] == "Camry"
        assert vehicle["category"] == "Sedan"


# =========================================================
# TEST UPDATE VEHICLE
# =========================================================

def test_update_vehicle():
    token = login(
        "admin@gmail.com",
        "admin123"
    )

    response = client.put(
        "/api/vehicles/20",
        json={
            "make": "Toyota",
            "model": "Camry",
            "category": "Sedan",
            "price": 2500000,
            "quantity": 5
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200
    assert response.json()["id"] == 20


# =========================================================
# TEST PURCHASE VEHICLE
# =========================================================

def test_purchase_vehicle():
    token = login(
        "admin@gmail.com",
        "admin123"
    )

    # First check current vehicle
    get_response = client.get(
        "/api/vehicles/20",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    # If your API doesn't have GET /{vehicle_id},
    # we'll adjust this test after running.
    assert get_response.status_code == 200

    old_quantity = get_response.json()["quantity"]

    response = client.post(
        "/api/vehicles/20/purchase",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    new_quantity = response.json()["vehicle"]["quantity"]

    assert new_quantity == old_quantity - 1


# =========================================================
# TEST RESTOCK VEHICLE
# =========================================================

def test_restock_vehicle():
    token = login(
        "admin@gmail.com",
        "admin123"
    )

    get_response = client.get(
        "/api/vehicles/20",
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert get_response.status_code == 200

    old_quantity = get_response.json()["quantity"]

    response = client.post(
        "/api/vehicles/20/restock",
        params={
            "quantity": 3
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 200

    new_quantity = response.json()["vehicle"]["quantity"]

    assert new_quantity == old_quantity + 3


# =========================================================
# TEST PURCHASE WITHOUT AUTHENTICATION
# =========================================================

def test_purchase_requires_authentication():

    response = client.post(
        "/api/vehicles/20/purchase"
    )

    assert response.status_code == 401


# =========================================================
# TEST RESTOCK REQUIRES ADMIN
# =========================================================

def test_restock_requires_admin():

    email = "normal_user_restock_test@example.com"

    register_response = client.post(
        "/api/auth/register",
        json={
            "name": "Normal User",
            "email": email,
            "password": "password123"
        }
    )

    if register_response.status_code not in [201, 400]:
        assert register_response.status_code == 201

    token = login(
        email,
        "password123"
    )

    response = client.post(
        "/api/vehicles/20/restock",
        params={
            "quantity": 3
        },
        headers={
            "Authorization": f"Bearer {token}"
        }
    )

    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"