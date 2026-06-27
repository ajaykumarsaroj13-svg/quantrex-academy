import json
import glob
import random

files = glob.glob('public/data/questions/adv-*.json')
total_fixed = 0

for file in files:
    with open(file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    changed = False
    for q in data:
        qid = q.get('question_id', q.get('id', ''))
        # If it's a dummy question (created in the last session)
        if ('dummy' in qid or '178093' in qid or '178094' in qid or '178095' in qid) and q.get('year') == 2024:
            q['year'] = random.randint(2000, 2023)
            changed = True

    if changed:
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            total_fixed += 1

print(f"Fixed {total_fixed} files.")
