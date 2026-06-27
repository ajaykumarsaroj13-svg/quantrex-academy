import firebase_admin
from firebase_admin import credentials, db
import json
import sys
sys.stdout.reconfigure(encoding='utf-8')

cred_path = r'C:\Users\Admin\.gemini\antigravity\scratch\examgoal_scraper\firebase_credentials.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred, {
        'databaseURL': 'https://quantrex-9c898-default-rtdb.firebaseio.com/'
    })

try:
    ref = db.reference('/appData')
    data = ref.get()
    
    if data:
        print(f"appData keys: {list(data.keys())}")
        for k in data.keys():
            if isinstance(data[k], dict):
                print(f"  {k} keys: {list(data[k].keys())}")
            elif isinstance(data[k], list):
                print(f"  {k} (list of {len(data[k])})")
        
        with open("C:/Users/Admin/.gemini/antigravity/scratch/rtdb_appData.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
        print("Saved appData to rtdb_appData.json")
    else:
        print("appData is empty.")
except Exception as e:
    print(f"Error: {e}")
