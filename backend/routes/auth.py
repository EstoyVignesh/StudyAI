from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from database import get_db
from models import User
from auth_utils import hash_password, verify_password, create_access_token, get_current_user

router = APIRouter()


class RegisterRequest(BaseModel):
    email: str
    username: str
    password: str
    selected_exam: Optional[str] = None
    language_preference: str = "english"
    state: Optional[str] = None


class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    selected_exam: Optional[str] = None
    language_preference: str = "english"
    state: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


class UpdateProfileRequest(BaseModel):
    selected_exam: Optional[str] = None
    language_preference: Optional[str] = None
    state: Optional[str] = None


@router.post("/register", response_model=TokenResponse)
def register(req: RegisterRequest, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    if db.query(User).filter(User.username == req.username).first():
        raise HTTPException(status_code=400, detail="Username already taken")

    user = User(
        email=req.email,
        username=req.username,
        hashed_password=hash_password(req.password),
        selected_exam=req.selected_exam,
        language_preference=req.language_preference,
        state=req.state,
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.post("/login", response_model=TokenResponse)
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form.username).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    token = create_access_token({"sub": str(user.id)})
    return TokenResponse(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user),
    )


@router.get("/me", response_model=UserResponse)
def get_me(user_id: int = Depends(get_current_user), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserResponse.model_validate(user)


@router.patch("/me/profile", response_model=UserResponse)
def update_profile(
    req: UpdateProfileRequest,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if req.selected_exam is not None:
        user.selected_exam = req.selected_exam
    if req.language_preference is not None:
        user.language_preference = req.language_preference
    if req.state is not None:
        user.state = req.state
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)


# Keep old endpoint for compatibility
@router.patch("/me/exam", response_model=UserResponse)
def update_exam(
    exam_data: dict,
    user_id: int = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.selected_exam = exam_data.get("selected_exam")
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
