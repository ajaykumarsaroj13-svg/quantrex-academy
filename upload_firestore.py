import firebase_admin
from firebase_admin import credentials, firestore
import json
import sys

cred_path = r'C:\Users\Admin\.gemini\antigravity\scratch\examgoal_scraper\firebase_credentials.json'
try:
    if not firebase_admin._apps:
        cred = credentials.Certificate(cred_path)
        firebase_admin.initialize_app(cred)
    db = firestore.client()
except Exception as e:
    print("Failed to initialize Firebase:", e)
    sys.exit(1)

print("Connected to Firestore. Updating database...")

try:
    with open('temp_export_for_firebase.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Update Home Data
    db.collection('homeData').document('default').set(data.get('homeData', {}))
    
    # 2. Update Books Data
    # Books is an array, let's just store it in a single doc or loop through it
    db.collection('booksData').document('default').set({'books': data.get('booksData', [])})
    
    # 3. Update Syllabus Data
    db.collection('syllabusData').document('default').set(data.get('syllabusData', {}))

    # 4. Update Toppers Data
    db.collection('toppersData').document('default').set({'toppers': data.get('toppersData', [])})

    # 5. Update Tests Data
    tests_data = data.get('testsData', {})
    mains_tests = tests_data.get('mains', [])
    advanced_tests = tests_data.get('advanced', [])
    
    # For tests, since they might be large, we can store each as a doc, or just a single doc if it fits.
    # Firestore has 1MB limit per document.
    # Let's save individual tests
    for t in mains_tests:
        test_id = t.get('id', 'unknown')
        t['_category'] = 'mains'
        db.collection('testsData').document(test_id).set(t)
        
    for t in advanced_tests:
        test_id = t.get('id', 'unknown')
        t['_category'] = 'advanced'
        db.collection('testsData').document(test_id).set(t)

    print("Successfully updated Firestore!")
    
except Exception as e:
    print("Failed to upload data:", e)
