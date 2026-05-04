from sqlalchemy.orm import Session
from datetime import date, time
from models.models import User, Table, Booking
from schemas.schemas import BookingCreate
from fastapi import HTTPException

class BookingService:
    @staticmethod
    def check_availability(db: Session, booking_date: date, booking_time: time, guest_count: int):
        # 1. Find tables that can accommodate the guests and are active
        capable_tables = db.query(Table).filter(
            Table.capacity >= guest_count,
            Table.is_active == True
        ).all()
        
        if not capable_tables:
            return []

        capable_table_ids = [t.id for t in capable_tables]

        # 2. Find conflicting bookings (same date, time, and table)
        conflicting_bookings = db.query(Booking).filter(
            Booking.booking_date == booking_date,
            Booking.booking_time == booking_time,
            Booking.table_id.in_(capable_table_ids),
            Booking.status == 'confirmed'
        ).all()

        booked_table_ids = [b.table_id for b in conflicting_bookings]

        # 3. Available tables
        available_tables = [t for t in capable_tables if t.id not in booked_table_ids]
        
        # Sort by capacity to optimize seating (smallest fit logic for Step 2 readiness)
        available_tables.sort(key=lambda x: x.capacity)
        
        return available_tables

    @staticmethod
    def create_booking(db: Session, booking_data: BookingCreate):
        if booking_data.booking_date < date.today():
            raise HTTPException(status_code=400, detail="Cannot book in the past")

        # Get or create user
        user = db.query(User).filter(User.email == booking_data.user.email).first()
        if not user:
            user = User(
                name=booking_data.user.name,
                email=booking_data.user.email,
                phone=booking_data.user.phone
            )
            db.add(user)
            db.flush() # Flush to get user.id

        if booking_data.table_id:
            # User selected a specific table
            requested_table = db.query(Table).filter(Table.id == booking_data.table_id).first()
            if not requested_table:
                raise HTTPException(status_code=404, detail="Table not found")
            if requested_table.capacity < booking_data.guest_count:
                raise HTTPException(status_code=400, detail="Table capacity is less than guest count")
            if not requested_table.is_active:
                raise HTTPException(status_code=400, detail="Table is not active")

            conflicting_booking = db.query(Booking).filter(
                Booking.booking_date == booking_data.booking_date,
                Booking.booking_time == booking_data.booking_time,
                Booking.table_id == booking_data.table_id,
                Booking.status == 'confirmed'
            ).first()

            if conflicting_booking:
                raise HTTPException(status_code=400, detail="Already Occupied")
            
            allocated_table = requested_table
        else:
            # Check availability (fallback to auto-allocate)
            available_tables = BookingService.check_availability(
                db, booking_data.booking_date, booking_data.booking_time, booking_data.guest_count
            )

            if not available_tables:
                raise HTTPException(status_code=400, detail="No tables available for the selected date, time, and guest count")

            # Allocate smallest fitting table
            allocated_table = available_tables[0]

        # Create booking
        new_booking = Booking(
            user_id=user.id,
            table_id=allocated_table.id,
            booking_date=booking_data.booking_date,
            booking_time=booking_data.booking_time,
            guest_count=booking_data.guest_count
        )
        
        print(f"DEBUG: Booking insert started for user {user.email}")
        try:
            db.add(new_booking)
            db.commit()
            db.refresh(new_booking)
            print("DEBUG: Booking committed successfully to database")
            return {
                "booking_id": new_booking.id,
                "table_name": allocated_table.table_name,
                "guest_count": new_booking.guest_count,
                "message": "Booking Confirmed"
            }
        except Exception as e:
            db.rollback()
            print(f"DEBUG: Booking insert failed: {e}")
            raise HTTPException(status_code=500, detail="Failed to save booking to database")

    @staticmethod
    def get_all_bookings(db: Session):
        return db.query(Booking).all()

    @staticmethod
    def get_booking(db: Session, booking_id: str):
        booking = db.query(Booking).filter(Booking.id == booking_id).first()
        if not booking:
            raise HTTPException(status_code=404, detail="Booking not found")
        return booking
