import json
import os

files = [
    'ch3_11_15.json',
    'ch3_16_20.json',
    'ch3_21_25.json',
    'ch3_26_29.json'
]

qs = []
for file in files:
    if os.path.exists(file):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = json.load(f)
                if isinstance(content, list):
                    qs.extend(content)
        except Exception as e:
            print(f'Error reading {file}: {e}')

# Append to blackBookDataFull.json
target_file = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json'

with open(target_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

for c in data:
    if c.get('id') == 'jee-mathematics-continuity':
        c['questions'].extend(qs)
        
        # Deduplicate
        seen = set()
        dedup = []
        for q in c['questions']:
            qnum = q.get('questionNumber')
            if qnum not in seen:
                seen.add(qnum)
                dedup.append(q)
        
        dedup.sort(key=lambda x: int(x.get('questionNumber', 0)) if str(x.get('questionNumber', 0)).isdigit() else 0)
        c['questions'] = dedup
        break

with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print(f'Successfully added new questions to chapter 3. Total: {len(dedup)}')
