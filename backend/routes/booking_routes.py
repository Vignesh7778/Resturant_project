from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from datetime import date, time
from db.database import get_db
from schemas.schemas import BookingCreate, BookingResponse, BookingDetailResponse, TableResponse
from services.booking_service import BookingService

router = APIRouter()

@router.get("/availability", response_model=List[TableResponse])
def check_availability(
    booking_date: date = Query(..., description="Date of the booking"),
    booking_time: time = Query(..., description="Time of the booking"),
    guest_count: int = Query(..., gt=0, description="Number of guests"),
    db: Session = Depends(get_db)
):
    return BookingService.check_availability(db, booking_date, booking_time, guest_count)

@router.post("/bookings", response_model=BookingResponse)
def create_booking(booking: BookingCreate, db: Session = Depends(get_db)):
    return BookingService.create_booking(db, booking)

@router.get("/bookings", response_model=List[BookingResponse])
def get_bookings(db: Session = Depends(get_db)):
    return BookingService.get_all_bookings(db)

@router.get("/bookings/{booking_id}", response_model=BookingDetailResponse)
def get_booking_details(booking_id: str, db: Session = Depends(get_db)):
    return BookingService.get_booking(db, booking_id)
