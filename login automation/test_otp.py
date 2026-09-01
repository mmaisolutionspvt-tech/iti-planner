from utils.generate_otp import generate_otp

otp, expiry = generate_otp()

print("Generated OTP :", otp)
print("Expiry Time   :", expiry)