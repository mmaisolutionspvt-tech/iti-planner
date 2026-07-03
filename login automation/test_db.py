from database import SessionLocal
from model import User

db = SessionLocal()

try:
    deleted = db.query(User).delete()
    db.commit()

    print(f"{deleted} users deleted successfully.")

finally:
    db.close()