import uuid
from sqlalchemy import Column, Integer, Boolean, Date, Time, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


# ─────────────────────────────────────────────────────────────────
# NOTE: UUIDs stored as String(36) — works with BOTH SQLite and
# PostgreSQL. Switch DATABASE_URL in .env to toggle between them.
# ─────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)

    bookings = relationship("Booking", back_populates="user")


class Table(Base):
    __tablename__ = "tables"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    table_name = Column(String, nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="table")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    table_id = Column(String(36), ForeignKey("tables.id"), nullable=False)
    booking_date = Column(Date, nullable=False)
    booking_time = Column(Time, nullable=False)
    guest_count = Column(Integer, nullable=False)
    status = Column(String, default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    table = relationship("Table", back_populates="bookings")
