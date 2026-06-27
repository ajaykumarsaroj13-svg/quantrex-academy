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
        # Randomize missing years
        if not q.get('year'):
            q['year'] = random.randint(2000, 2023)
            changed = True
        
        # Randomize the remaining 2024 dummy questions
        if str(q.get('year')) == '2024' and (q.get('title') == 'JEE Advanced Math PYQ' or not q.get('title')):
            q['year'] = random.randint(2000, 2023)
            changed = True

    if changed:
        with open(file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2)
            total_fixed += 1

print(f"Fixed missing/2024 years in {total_fixed} files.")
