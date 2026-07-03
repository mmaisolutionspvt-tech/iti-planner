from pydantic import BaseModel, EmailStr


# -------------------------
# Signup Schema
# -------------------------

class UserSignup(BaseModel):
    name: str
    email: EmailStr
    password: str


# -------------------------
# Login Schema
# -------------------------

class UserLogin(BaseModel):
    email: EmailStr
    password: str




# -------------------------
# Verify OTP Schema
# -------------------------

class VerifyOTP(BaseModel):
    email: EmailStr
    otp: str


# -------------------------
# Response Schema
# -------------------------

class MessageResponse(BaseModel):
    message: str