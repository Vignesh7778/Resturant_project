from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import engine, Base, SessionLocal
from routes import booking_routes
from models.models import Table
from contextlib import asynccontextmanager

app = FastAPI(
    title="Restaurant Table Booking Copilot"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(booking_routes.router, tags=["Bookings"])

@app.get("/")
def root():
    return {"message": "Restaurant Booking API is running."}
