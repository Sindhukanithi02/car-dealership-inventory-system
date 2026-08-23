from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


# =========================================================
# REGISTER TEST
# =========================================================

def test_register_user():
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Test User",
            "email": "fresh_test_user_999@example.com",
            "password": "password123"
        }
    )

    assert response.status_code == 201
    assert response.json()["email"] == "fresh_test_user_999@example.com"


# =========================================================
# DUPLICATE EMAIL TEST
# =========================================================

def test_register_duplicate_email():
    email = "fresh_duplicate_999@example.com"

    # First registration
    first_response = client.post(
        "/api/auth/register",
        json={
            "name": "First User",
            "email": email,
            "password": "password123"
        }
    )

    assert first_response.status_code == 201

    # Second registration with same email
    response = client.post(
        "/api/auth/register",
        json={
            "name": "Another User",
            "email": email,
            "password": "password123"
        }
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"


# =========================================================
# LOGIN TEST
# =========================================================

def test_login_user():
    email = "fresh_login_999@example.com"

    # Register user first
    register_response = client.post(
        "/api/auth/register",
        json={
            "name": "Login User",
            "email": email,
            "password": "password123"
        }
    )

    assert register_response.status_code == 201

    # Login
    response = client.post(
        "/api/auth/login",
        data={
            "username": email,
            "password": "password123"
        }
    )

    assert response.status_code == 200
    assert "access_token" in response.json()
    assert response.json()["token_type"] == "bearer"