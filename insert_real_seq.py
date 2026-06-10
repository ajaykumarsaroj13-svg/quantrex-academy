import json
from pymongo import MongoClient

MONGO_URI = 'mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0'
client = MongoClient(MONGO_URI)
db = client['quantrex']

# Remove any existing sequence-and-series questions
db.pyqs.delete_many({'chapterId': 'sequences-and-series'})
db.pyqs.delete_many({'chapterId': 'ch_mathematics_algebra_3'}) # Just in case it was inserted with this ID

# Read the local json backup
with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\public\data\questions\sequences-and-series.json', 'r', encoding='utf-8') as f:
    all_data = json.load(f)

jee_main_qs = [q for q in all_data if 'jee' in q.get('exam', '').lower() and 'main' in q.get('exam', '').lower()]

inserted = 0
for q in jee_main_qs:
    # Make sure it uses the proper chapter ID and exact structure
    q['chapterId'] = 'ch_mathematics_algebra_3' # the sequence and series chapter ID if it's 3, wait, what is the ID?
    if '_id' in q:
        del q['_id']
    
    db.pyqs.insert_one(q)
    inserted += 1

print(f"Successfully inserted {inserted} JEE Main sequences and series questions into MongoDB.")
