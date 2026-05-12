from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from db.database import get_db
from schemas.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from services.auth_service import AuthService
from middleware.auth import get_current_user
from models.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new user and return JWT token."""
    user = AuthService.register(db, data)
    login_result = AuthService.login(db, data.email, data.password)
    return login_result


@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login and return JWT token."""
    return AuthService.login(db, data.email, data.password)


@router.get("/me", response_model=UserResponse)
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current logged-in user profile."""
    return current_user
