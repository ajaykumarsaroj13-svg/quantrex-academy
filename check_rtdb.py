import firebase_admin
from firebase_admin import credentials, db
import json

cred_path = r'C:\Users\Admin\.gemini\antigravity\scratch\examgoal_scraper\firebase_credentials.json'
if not firebase_admin._apps:
    # Need to specify databaseURL for Realtime Database
    # Since I don't know it, I will guess the default for the project
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://quantrex-9c898-default-rtdb.firebaseio.com/'
    })

print("Checking Firebase Realtime Database...")
try:
    ref = db.reference('/')
    data = ref.get()
    
    if data:
        print("Found data at root level. Keys:")
        print(list(data.keys()))
        
        # Check specifically for homeData, booksData
        for key in ['homeData', 'booksData', 'testsData']:
            if key in data:
                print(f"--- {key} ---")
                print(str(data[key])[:200] + "...")
                
                with open(f"C:/Users/Admin/.gemini/antigravity/scratch/{key}_rtdb_backup.json", "w", encoding="utf-8") as f:
                    json.dump(data[key], f, indent=2)
                print(f"Saved {key} to {key}_rtdb_backup.json")
    else:
        print("Root is empty.")
except Exception as e:
    print(f"Error accessing Realtime DB: {e}")
