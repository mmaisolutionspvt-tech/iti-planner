from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from model import User, OTP
from schemas import VerifyOTP, MessageResponse

router = APIRouter(
    prefix="/verify",
    tags=["Verify OTP"]
)


@router.post(
    "/",
    response_model=MessageResponse
)
def verify_otp(
    data: VerifyOTP,
    db: Session = Depends(get_db)
):
    """
    Verify login OTP.
    """

    # -------------------------
    # Find User
    # -------------------------

    user = (
        db.query(User)
        .filter(User.email == data.email)
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    # -------------------------
    # Find Latest OTP
    # -------------------------

    otp_record = (
        db.query(OTP)
        .filter(
            OTP.user_id == user.id,
            OTP.verified == False
        )
        .order_by(OTP.id.desc())
        .first()
    )

    if not otp_record:
        raise HTTPException(
            status_code=404,
            detail="OTP not found."
        )

    # -------------------------
    # Check OTP
    # -------------------------

    if otp_record.otp != data.otp:
        raise HTTPException(
            status_code=400,
            detail="Invalid OTP."
        )

    # -------------------------
    # Check Expiry
    # -------------------------

    if datetime.utcnow() > otp_record.expiry_time:
        raise HTTPException(
            status_code=400,
            detail="OTP expired."
        )

    # -------------------------
    # Mark OTP as Verified
    # -------------------------

    otp_record.verified = True

    db.commit()

    return MessageResponse(
        message="Login Successful."
    )