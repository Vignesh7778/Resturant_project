from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import booking_routes

app = FastAPI(
    title="Restaurant Table Booking Copilot",
    description="Week 1 — Booking, Availability & Conflict Prevention",
    version="1.0.0"
)

# Enable CORS for React frontend
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
