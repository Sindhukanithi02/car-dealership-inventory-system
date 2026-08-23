from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from . import models
from .routes import auth, vehicles


# Create database tables
Base.metadata.create_all(bind=engine)


# Create FastAPI application
app = FastAPI(
    title="Car Dealership Inventory System",
    description="REST API for managing car dealership inventory",
    version="1.0.0"
)


# -------------------------
# CORS CONFIGURATION
# -------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------
# ROUTES
# -------------------------
app.include_router(auth.router)
app.include_router(vehicles.router)


# -------------------------
# ROOT
# -------------------------
@app.get("/")
def root():
    return {
        "message": "Car Dealership Inventory API is running!"
    }


# -------------------------
# HEALTH CHECK
# -------------------------
@app.get("/health")
def health_check():
    return {
        "status": "healthy"
    }