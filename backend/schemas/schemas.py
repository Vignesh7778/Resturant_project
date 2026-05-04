from pydantic import BaseModel, EmailStr, Field
from datetime import date, time, datetime
from typing import Optional, List
from uuid import UUID

class TableBase(BaseModel):
    table_name: str
    capacity: int

class TableResponse(TableBase):
    id: UUID
    is_active: bool

    class Config:
        from_attributes = True

class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: str

class BookingCreate(BaseModel):
    user: UserBase
    booking_date: date
    booking_time: time
    guest_count: int = Field(gt=0, description="Guest count must be greater than 0")
    table_id: Optional[UUID] = None

class BookingConfirmationResponse(BaseModel):
    booking_id: UUID
    table_name: str
    guest_count: int
    message: str

class BookingResponse(BaseModel):
    id: UUID
    booking_date: date
    booking_time: time
    guest_count: int
    status: str
    table_id: UUID
    user_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True

class BookingDetailResponse(BookingResponse):
    user: UserBase
    table: TableResponse
