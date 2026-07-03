from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime

from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    email = Column(String, unique=True, index=True, nullable=False)

    password = Column(String, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)

    # One user can have multiple OTP records
    otp_records = relationship("OTP", back_populates="user")


class OTP(Base):
    __tablename__ = "otp"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    otp = Column(String, nullable=False)

    expiry_time = Column(DateTime, nullable=False)

    verified = Column(Boolean, default=False)

    user = relationship("User", back_populates="otp_records")