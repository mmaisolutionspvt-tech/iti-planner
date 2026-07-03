from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from model import User
from schemas import UserSignup, MessageResponse

from utils.hash_password import hash_password
from email_service import send_welcome_email

router = APIRouter(
    prefix="/signup",
    tags=["Signup"]
)


@router.post(
    "/",
    response_model=MessageResponse
)
def signup(
    user: UserSignup,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    """

    # Check if email already exists
    existing_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered."
        )

    # Hash password
    hashed_password = hash_password(user.password)

    # Create user
    new_user = User(
        name=user.name,
        email=user.email,
        password=hashed_password
    )

    # Save to database
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Send Welcome Email
    try:
        print("========== Sending Welcome Email ==========")

        send_welcome_email(
            receiver_email=new_user.email,
            user_name=new_user.name
        )

        print("========== Email Sent Successfully ==========")

    except Exception as e:
        print("========== EMAIL ERROR ==========")
        print(e)

        raise HTTPException(
            status_code=500,
            detail=f"User created but email sending failed: {str(e)}"
        )

    return MessageResponse(
        message="User registered successfully. Welcome email sent."
    )