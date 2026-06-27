import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys

cred_path = r'C:\Users\Admin\.gemini\antigravity\scratch\examgoal_scraper\firebase_credentials.json'
if not firebase_admin._apps:
    cred = credentials.Certificate(cred_path)
    firebase_admin.initialize_app(cred)
db = firestore.client()

print("Checking Firebase collections...")

collections = ['homeData', 'booksData', 'testsData', 'app_data']

for col in collections:
    docs = db.collection(col).stream()
    data = []
    for doc in docs:
        d = doc.to_dict()
        d['id'] = doc.id
        data.append(d)
    
    print(f"Collection '{col}': {len(data)} documents")
    if len(data) > 0:
        with open(f"C:/Users/Admin/.gemini/antigravity/scratch/{col}_backup.json", "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Saved {col} to {col}_backup.json")
