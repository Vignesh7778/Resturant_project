from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from schemas.schemas import BookingDetailResponse, DashboardStats
from services.booking_service import BookingService
from middleware.auth import require_admin
from models.models import User, Table, Booking, Waitlist

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/dashboard", response_model=DashboardStats)
def get_dashboard(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get admin dashboard statistics."""
    total_bookings = db.query(Booking).count()
    active_bookings = db.query(Booking).filter(Booking.status == "confirmed").count()
    cancelled_bookings = db.query(Booking).filter(Booking.status == "cancelled").count()
    total_tables = db.query(Table).count()
    total_waitlist = db.query(Waitlist).count()

    return {
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "cancelled_bookings": cancelled_bookings,
        "total_tables": total_tables,
        "total_waitlist": total_waitlist,
    }


@router.get("/bookings", response_model=List[BookingDetailResponse])
def get_all_bookings(
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db),
):
    """Get all bookings (admin view)."""
    return BookingService.get_all_bookings(db)
