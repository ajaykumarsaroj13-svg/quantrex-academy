import json
from pymongo import MongoClient
import os

# 1. Update chapters.json
chapters_path = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\public\data\chapters.json'
with open(chapters_path, 'r', encoding='utf-8') as f:
    chapters_data = json.load(f)

# Keep only sequences-and-series
if 'mathematics' in chapters_data:
    new_math = []
    for c in chapters_data['mathematics']:
        if c['id'] == 'sequence-and-series':
            print("Removing duplicate chapter:", c)
        else:
            new_math.append(c)
    chapters_data['mathematics'] = new_math

with open(chapters_path, 'w', encoding='utf-8') as f:
    json.dump(chapters_data, f, indent=2)

# 2. Update MongoDB
MONGO_URI = 'mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0'
client = MongoClient(MONGO_URI)
db = client['quantrex']

print("Deleting old Sequence questions from DB...")
# Delete questions for both IDs
db.pyqs.delete_many({'chapterId': 'sequence-and-series'})
db.pyqs.delete_many({'chapterId': 'sequences-and-series'})

# Check if there are other variations and delete them just in case
db.pyqs.delete_many({'chapterId': 'ch_mathematics_algebra_3'})
db.pyqs.delete_many({'chapterId': 'ch_mathematics_algebra_2', 'question': {'$regex': 'sequence|series', '$options': 'i'}})

# Clean up pyqchapters and syllabuschapters
db.pyqchapters.delete_many({'id': 'sequence-and-series'})
db.syllabuschapters.delete_many({'id': 'sequence-and-series'})

# 3. Load from JSON and insert
json_path = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\public\data\questions\sequences-and-series.json'
with open(json_path, 'r', encoding='utf-8') as f:
    all_qs = json.load(f)

jee_main_qs = [q for q in all_qs if 'jee' in q.get('exam', '').lower() and 'main' in q.get('exam', '').lower()]

inserted = 0
for q in jee_main_qs:
    q['chapterId'] = 'sequences-and-series'
    if 'id' in q:
        q['question_id'] = q['id'] # mapping id to question_id to prevent DuplicateKeyError
    if '_id' in q:
        del q['_id']
    db.pyqs.insert_one(q)
    inserted += 1

print(f"Successfully inserted {inserted} JEE Main sequences-and-series questions into MongoDB!")
