import uuid
from sqlalchemy import Column, Integer, Boolean, Date, Time, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
from db.database import Base


# ─────────────────────────────────────────────────────────────────
# NOTE: Using native PostgreSQL UUID since SQLite has been removed.
# ─────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    phone = Column(String, nullable=False)

    bookings = relationship("Booking", back_populates="user")


class Table(Base):
    __tablename__ = "tables"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    table_name = Column(String, nullable=False, unique=True)
    capacity = Column(Integer, nullable=False)
    is_active = Column(Boolean, default=True)

    bookings = relationship("Booking", back_populates="table")


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    table_id = Column(UUID(as_uuid=True), ForeignKey("tables.id"), nullable=False)
    booking_date = Column(Date, nullable=False)
    booking_time = Column(Time, nullable=False)
    guest_count = Column(Integer, nullable=False)
    status = Column(String, default="confirmed")
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="bookings")
    table = relationship("Table", back_populates="bookings")
