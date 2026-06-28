import firebase_admin
from firebase_admin import credentials, db
import json

cred = credentials.Certificate('./quantrex-6de71-firebase-adminsdk-hms23-793540c79e.json')
firebase_admin.initialize_app(cred, {'databaseURL': 'https://quantrex-6de71-default-rtdb.firebaseio.com'})

ref = db.reference('blobs/testsData')
data = ref.get()
if not data:
    print("No data in Firebase")
else:
    parsed = json.loads(data['data']) if isinstance(data['data'], str) else data['data']
    if isinstance(parsed, list):
        print(f"Array format. Total tests: {len(parsed)}")
        adv = [t for t in parsed if 'advanced' in str(t.get('examType', '')).lower() or 'advanced' in str(t.get('title', '')).lower()]
        for t in adv:
            print(f"- {t.get('title')} ({t.get('examType')})")
    else:
        print("Object format")
        if 'advanced' in parsed:
            print(f"Total advanced: {len(parsed['advanced'])}")
            for t in parsed['advanced']:
                print(f"- {t.get('title')} ({t.get('examType')})")
