from utils.hash_password import hash_password, verify_password

password = "Password@123"

hashed = hash_password(password)

print("Original Password :", password)
print("Hashed Password   :", hashed)

print("Verification (Correct):")
print(verify_password("Password@123", hashed))

print("Verification (Wrong):")
print(verify_password("Hello123", hashed))