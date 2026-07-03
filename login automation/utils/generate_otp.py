import secrets
from datetime import datetime, timedelta

from config import OTP_EXPIRY_MINUTES


def generate_otp():
    """
    Generate a secure 6-digit OTP.
    """
    otp = str(secrets.randbelow(900000) + 100000)

    expiry_time = datetime.utcnow() + timedelta(
        minutes=OTP_EXPIRY_MINUTES
    )

    return otp, expiry_time