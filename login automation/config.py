import os
from dotenv import load_dotenv

# Load values from .env
load_dotenv()

# Email Configuration
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")

# Secret Key
SECRET_KEY = os.getenv("SECRET_KEY")

# Database
DATABASE_URL = os.getenv("DATABASE_URL")

# OTP Expiry
OTP_EXPIRY_MINUTES = int(os.getenv("OTP_EXPIRY_MINUTES", 5))

if __name__ == "__main__":
    print("Email:", EMAIL_ADDRESS)
    print("Database:", DATABASE_URL)
    print("OTP Expiry:", OTP_EXPIRY_MINUTES)