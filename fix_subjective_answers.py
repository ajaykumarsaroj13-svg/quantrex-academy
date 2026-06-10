"""
Update subjective question answers in MongoDB.
The original insert didn't store the answer for SUBJECTIVE type questions.
"""
import pymongo
import json
import os

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(uri)
db = client.quantrex

raw_dir = os.path.join('public', 'data', 'questions', 'raw_adv_math')

# Build a map of question_id -> answer for subjective questions
answer_map = {}

for fname in os.listdir(raw_dir):
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(raw_dir, fname)
    try:
        data = json.loads(open(fpath, 'r', encoding='utf-8').read())
    except Exception as e:
        continue
    
    if not data.get('results') or not data['results'][0].get('questions'):
        continue
    
    for q in data['results'][0]['questions']:
        if q.get('type') != 'subjective':
            continue
        qid = q.get('question_id')
        en = q['question']['en']
        answer = en.get('answer', '')
        if qid and answer:
            answer_map[qid] = answer.strip()

print(f"Found {len(answer_map)} subjective questions with answers")

# Update MongoDB
updated = 0
for qid, answer in answer_map.items():
    result = db.pyqs.update_one(
        {'question_id': qid, 'type': 'SUBJECTIVE'},
        {'$set': {'correctAnswer': answer}}
    )
    if result.modified_count > 0:
        updated += 1

print(f"Updated {updated} subjective questions with answers")

# Also update subjective questions that have solutions
sol_updated = 0
for fname in os.listdir(raw_dir):
    if not fname.endswith('.json'):
        continue
    fpath = os.path.join(raw_dir, fname)
    try:
        data = json.loads(open(fpath, 'r', encoding='utf-8').read())
    except:
        continue
    
    if not data.get('results') or not data['results'][0].get('questions'):
        continue
    
    for q in data['results'][0]['questions']:
        if q.get('type') != 'subjective':
            continue
        qid = q.get('question_id')
        en = q['question']['en']
        solution = en.get('explanation') or en.get('solution') or ''
        if qid and solution:
            result = db.pyqs.update_one(
                {'question_id': qid},
                {'$set': {'solution': solution.strip()}}
            )
            if result.modified_count > 0:
                sol_updated += 1

print(f"Updated {sol_updated} questions with solutions")
print("Done!")
