from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from db.database import get_db
from schemas.schemas import WaitlistCreate, WaitlistResponse
from services.waitlist_service import WaitlistService

router = APIRouter(prefix="/waitlist", tags=["Waitlist"])


@router.post("", response_model=WaitlistResponse)
def join_waitlist(data: WaitlistCreate, db: Session = Depends(get_db)):
    """Join the waitlist for a time slot."""
    return WaitlistService.join_waitlist(db, data)


@router.get("", response_model=List[WaitlistResponse])
def get_waitlist(db: Session = Depends(get_db)):
    """Get all waitlist entries."""
    return WaitlistService.get_waitlist(db)
