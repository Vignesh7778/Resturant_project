from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import booking_routes
from db.database import test_connection, Base, engine, SessionLocal
from models.models import Table  # noqa: F401 — needed for Base.metadata

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


@app.on_event("startup")
def on_startup():
    """
    1. Verify DB connection.
    2. Create all tables if they don't exist (safe — skips existing).
    3. Seed default restaurant tables if the tables table is empty.
    """
    test_connection()

    # Create schema (idempotent)
    Base.metadata.create_all(bind=engine)

    # Seed tables data if empty
    db = SessionLocal()
    try:
        if db.query(Table).count() == 0:
            seed_tables = [
                Table(table_name="Table 1", capacity=2,  is_active=True),
                Table(table_name="Table 2", capacity=2,  is_active=True),
                Table(table_name="Table 3", capacity=4,  is_active=True),
                Table(table_name="Table 4", capacity=4,  is_active=True),
                Table(table_name="Table 5", capacity=6,  is_active=True),
                Table(table_name="Table 6", capacity=6,  is_active=True),
                Table(table_name="Table 7", capacity=8,  is_active=True),
                Table(table_name="Table 8", capacity=10, is_active=True),
            ]
            db.add_all(seed_tables)
            db.commit()
            print(f"[OK] Seeded {len(seed_tables)} restaurant tables")
        else:
            print(f"[OK] Tables already seeded ({db.query(Table).count()} found)")
    finally:
        db.close()


@app.get("/")
def root():
    return {"message": "Restaurant Booking API is running."}
