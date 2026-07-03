# Find registered users in MongoDB with correct connection string
import sys
from pymongo import MongoClient

MONGODB_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:BVvVX3m1mxUn2y11@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority"

try:
    client = MongoClient(MONGODB_URI)
    dbs = client.list_database_names()
    print("Available DBs:", dbs)
    
    db = client.get_database("quantrex")
    print("Collections:", db.list_collection_names())
    users_col = db.get_collection("users")
    
    # List up to 10 users with phone and email and role
    print("\n--- Registered Users ---")
    for user in users_col.find({}).limit(10):
        print(f"Name: {user.get('name')} | Phone: {user.get('phone')} | Email: {user.get('email')} | Role: {user.get('role')} | Pwd: {user.get('password')[:15] if user.get('password') else 'N/A'}...")
except Exception as e:
    print("Error:", e)
