# Reset Admin Password to QuantrexAdmin2025 in MongoDB
import sys
import hashlib
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:BVvVX3m1mxUn2y11@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority"

new_password_plain = "QuantrexAdmin2025"
new_password_hash = hashlib.sha256(new_password_plain.encode('utf-8')).hexdigest()

try:
    client = MongoClient(MONGODB_URI)
    db = client.get_database("quantrex")
    users_col = db.get_collection("users")
    
    # Reset password for phone 9999999999 (admin)
    res_admin = users_col.update_one(
        {"phone": "9999999999"},
        {"$set": {"password": new_password_hash}}
    )
    print("Admin update result:", res_admin.modified_count, "matched:", res_admin.matched_count)

    # Reset password for phone 9876543210 (student) to student123
    student_pwd_hash = hashlib.sha256("student123".encode('utf-8')).hexdigest()
    res_student = users_col.update_one(
        {"phone": "9876543210"},
        {"$set": {"password": student_pwd_hash}}
    )
    print("Student update result:", res_student.modified_count, "matched:", res_student.matched_count)

except Exception as e:
    print("Error:", e)
