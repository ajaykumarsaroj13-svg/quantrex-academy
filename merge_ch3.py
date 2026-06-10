import json
import os

ch3_raw = 'extracted_ch3_raw.json'
ch3_missing = 'missing_ch3.json'

qs = []
if os.path.exists(ch3_raw):
    with open(ch3_raw, 'r', encoding='utf-8') as f:
        qs.extend(json.load(f))
        
if os.path.exists(ch3_missing):
    try:
        with open(ch3_missing, 'r', encoding='utf-8') as f:
            qs.extend(json.load(f))
    except:
        pass

# Deduplicate
seen = set()
dedup = []
for q in qs:
    qnum = q.get('questionNumber')
    if qnum not in seen:
        seen.add(qnum)
        dedup.append(q)

dedup.sort(key=lambda x: int(x.get('questionNumber', 0)) if str(x.get('questionNumber', 0)).isdigit() else 0)

# Build chapter object
new_chapter = {
    "id": "jee-mathematics-continuity",
    "title": "Continuity and Differentiability",
    "chapterNumber": 3,
    "questions": dedup
}

# Append to blackBookDataFull.json
target_file = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json'

with open(target_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# check if already there
exists = False
for i, c in enumerate(data):
    if c.get('id') == new_chapter['id']:
        data[i] = new_chapter
        exists = True
        break

if not exists:
    data.append(new_chapter)

with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print('Successfully added chapter 3 to blackBookDataFull.json')
