"""
Fix JEE Advanced questions in MongoDB - re-process raw files and re-insert with correct years.
The original insert used q.past_year (doesn't exist) instead of q.year.
"""
import pymongo
import json
import os

uri = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = pymongo.MongoClient(uri)
db = client.quantrex

# Load the adv_math_chapters.json
chapters_list = json.loads(open('adv_math_chapters.json', 'r', encoding='utf-8').read())

# Load the adv_math_map.cjs to get chapter ID mapping
# Read the JS module manually
map_content = open('adv_math_map.cjs', 'r', encoding='utf-8').read()
# Extract the key-value pairs from the module.exports = {...} object
import re
map_pattern = re.findall(r'"([^"]+)"\s*:\s*"([^"]+)"', map_content)
CHAPTER_MAP = dict(map_pattern)
print(f"Chapter map loaded: {len(CHAPTER_MAP)} entries")

def to_title_case(s):
    if not s:
        return 'General'
    return ' '.join(word.capitalize() for word in s.split('-'))

all_questions = []
raw_dir = os.path.join('public', 'data', 'questions', 'raw_adv_math')

for ch in chapters_list:
    ch_title = ch.get('title') or ch.get('name')
    quantrex_id = CHAPTER_MAP.get(ch_title)
    if not quantrex_id:
        continue
    
    meta_id = ch.get('metaId') or ch.get('id')
    file_path = os.path.join(raw_dir, f'raw_adv_math_{meta_id}.json')
    if not os.path.exists(file_path):
        continue
    
    try:
        raw_data = json.loads(open(file_path, 'r', encoding='utf-8').read())
    except Exception as e:
        print(f"Error reading {file_path}: {e}")
        continue
    
    if not raw_data.get('results') or not raw_data['results'][0].get('questions'):
        continue
    
    questions = raw_data['results'][0]['questions']
    
    for q in questions:
        en = q['question']['en']
        
        # Determine question type
        q_type = q.get('type', 'mcq')
        if q_type == 'mcq':
            fmt_type = 'SCQ'
        elif q_type == 'integer':
            fmt_type = 'NUMERICAL'
        elif q_type in ('msq', 'multi_correct'):
            fmt_type = 'MCQ'
        elif q_type == 'subjective':
            fmt_type = 'SUBJECTIVE'
        else:
            fmt_type = 'SCQ'
        
        # Process options
        options = []
        correct_option_index = -1
        correct_answer = ''
        
        en_options = en.get('options', [])
        if en_options:
            options = [opt.get('content', '').strip() for opt in en_options]
            correct_opts = en.get('correct_options', [])
            if correct_opts:
                correct_id = correct_opts[0]
                for idx, opt in enumerate(en_options):
                    if opt.get('identifier') == correct_id:
                        correct_option_index = idx
                        break
        elif fmt_type == 'NUMERICAL' and en.get('answer'):
            correct_answer = en['answer'].strip()
            options = []
        
        # FIXED: use q.get('year') not q.get('past_year')
        exam_year = q.get('year') or 2024
        
        # FIXED: use q.get('question_id') not q.get('id')
        q_id = q.get('question_id') or q.get('id') or f"adv_{hash(en.get('content',''))}"
        
        all_questions.append({
            'question_id': q_id,
            'exam': 'jee-advanced',
            'chapterId': quantrex_id,
            'title': 'JEE Advanced Math PYQ',
            'year': int(exam_year),
            'paperTitle': q.get('paperTitle', ''),
            'difficulty': (q.get('difficulty') or 'medium').capitalize(),
            'type': fmt_type,
            'question': (en.get('content') or '').strip(),
            'options': options,
            'correctOptionIndex': correct_option_index,
            'correctAnswer': correct_answer,
            'solution': (en.get('explanation') or en.get('solution') or '').strip(),
            'marks': q.get('marks', 4),
            'negativeMarks': q.get('negMarks', -1),
            'topic': to_title_case(q.get('topic', 'General'))
        })

print(f"Total questions processed: {len(all_questions)}")

# Check year distribution
from collections import Counter
years = Counter(q['year'] for q in all_questions)
print(f"Year distribution (first 10): {sorted(years.items())[:10]}")
print(f"Types: {Counter(q['type'] for q in all_questions)}")

# Delete existing and re-insert
chapter_ids = list(set(q['chapterId'] for q in all_questions))
print(f"\nDeleting existing JEE Advanced questions for {len(chapter_ids)} chapters...")
del_result = db.pyqs.delete_many({'chapterId': {'$in': chapter_ids}, 'exam': 'jee-advanced'})
print(f"Deleted: {del_result.deleted_count}")

# Insert in batches
BATCH_SIZE = 500
inserted = 0
for i in range(0, len(all_questions), BATCH_SIZE):
    batch = all_questions[i:i+BATCH_SIZE]
    result = db.pyqs.insert_many(batch)
    inserted += len(result.inserted_ids)
    print(f"Inserted batch {i//BATCH_SIZE + 1}: {inserted}/{len(all_questions)}")

print(f"\nDone! Total inserted: {inserted}")

# Verify
sample = list(db.pyqs.find({'exam': 'jee-advanced'}).limit(5))
for s in sample:
    print(f"  id={s.get('question_id')}, year={s.get('year')}, topic={s.get('topic')}, type={s.get('type')}")
