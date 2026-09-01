from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from model import User, OTP
from schemas import UserLogin, MessageResponse

from utils.hash_password import verify_password
from utils.generate_otp import generate_otp

from email_service import send_otp_email


router = APIRouter(
    prefix="/login",
    tags=["Login"]
)


@router.post(
    "/",
    response_model=MessageResponse
)
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):
    """
    Login user and send OTP.
    """

    # -----------------------------
    # Check if email exists
    # -----------------------------
    db_user = (
        db.query(User)
        .filter(User.email == user.email)
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # -----------------------------
    # Verify password
    # -----------------------------
    if not verify_password(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Incorrect password."
        )

    # -----------------------------
    # Generate OTP
    # -----------------------------
    otp_code, expiry_time = generate_otp()

    # -----------------------------
    # Save OTP in Database
    # -----------------------------
    otp_record = OTP(
        user_id=db_user.id,
        otp=otp_code,
        expiry_time=expiry_time,
        verified=False
    )

    db.add(otp_record)
    db.commit()

    # -----------------------------
    # Send OTP Email
    # -----------------------------
    try:

        send_otp_email(
            receiver_email=db_user.email,
            user_name=db_user.name,
            otp=otp_code
        )

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=f"Failed to send OTP email : {str(e)}"
        )

    # -----------------------------
    # Success Response
    # -----------------------------
    return MessageResponse(
        message="OTP sent successfully to your email."
    )