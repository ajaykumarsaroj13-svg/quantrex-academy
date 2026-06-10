"""
Fix JEE Advanced question years in MongoDB.
The current data has all years as 2024 (incorrect).
We need to match question_ids from MongoDB to the raw JSON files and update the years.
"""
import pymongo
import json
import os

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(uri)
db = client.quantrex

# Load the all_adv_math_pyqs.json which has correct question_ids but wrong years
adv_pyqs = json.loads(open('all_adv_math_pyqs.json', 'r', encoding='utf-8').read())

# Build a map of question_id -> correct year from the raw files
print(f"Total questions in all_adv_math_pyqs.json: {len(adv_pyqs)}")
print(f"Year sample: {set([q['year'] for q in adv_pyqs[:10]])}")

# Load years from raw files
raw_dir = os.path.join('public', 'data', 'questions', 'raw_adv_math')
year_map = {}  # question_id -> year

for fname in os.listdir(raw_dir):
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(raw_dir, fname)
    try:
        data = json.loads(open(fpath, 'r', encoding='utf-8').read())
        if not data.get('results') or not data['results'][0].get('questions'):
            continue
        questions = data['results'][0]['questions']
        for q in questions:
            qid = q.get('question_id') or q.get('id')
            year = q.get('year')
            if qid and year:
                year_map[qid] = int(year)
    except Exception as e:
        print(f"Error processing {fname}: {e}")

print(f"Year map loaded: {len(year_map)} entries")
print(f"Year distribution: {sorted(set(year_map.values()))[:10]}")

# Now update MongoDB
updated = 0
not_found = 0
wrong_year = 0

# Find all JEE Advanced questions
adv_qs = list(db.pyqs.find({'exam': 'jee-advanced'}))
print(f"JEE Advanced questions in MongoDB: {len(adv_qs)}")

for q in adv_qs:
    qid = q.get('question_id')
    correct_year = year_map.get(qid)
    if correct_year:
        current_year = q.get('year')
        if current_year != correct_year:
            db.pyqs.update_one({'_id': q['_id']}, {'$set': {'year': correct_year}})
            updated += 1
    else:
        not_found += 1

print(f"Updated: {updated}")
print(f"Not found in year_map: {not_found}")

# Verify
sample = list(db.pyqs.find({'exam': 'jee-advanced'}).limit(5))
for s in sample:
    print(f"  id={s.get('question_id')}, year={s.get('year')}, topic={s.get('topic')}")

print("Done!")
