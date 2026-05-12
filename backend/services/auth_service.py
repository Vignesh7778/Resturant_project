from sqlalchemy.orm import Session
from models.models import User
from schemas.schemas import UserRegister
from utils.security import hash_password, verify_password, create_access_token
from fastapi import HTTPException


class AuthService:
    @staticmethod
    def register(db: Session, data: UserRegister) -> User:
        """Register a new user."""
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already registered")

        user = User(
            name=data.name,
            email=data.email,
            phone=data.phone,
            password_hash=hash_password(data.password),
            role="user",
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def login(db: Session, email: str, password: str) -> dict:
        """Authenticate user and return JWT token."""
        user = db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.password_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        access_token = create_access_token(data={"sub": str(user.id)})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": user,
        }
