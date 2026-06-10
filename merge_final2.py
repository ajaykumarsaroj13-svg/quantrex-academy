import json
import os

files = [
    'extracted_ch3_raw.json',
    'missing_ch3.json',
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
                    for q in content:
                        # Convert to int if string
                        if isinstance(q.get('questionNumber'), str) and q['questionNumber'].isdigit():
                            q['questionNumber'] = int(q['questionNumber'])
                    qs.extend(content)
        except Exception as e:
            print(f'Error reading {file}: {e}')

# Append to blackBookDataFull.json
target_file = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json'

with open(target_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

for c in data:
    if c.get('id') == 'jee-mathematics-continuity':
        # Deduplicate using both questionNumber AND exerciseName or questionType
        seen = set()
        dedup = []
        for q in qs:
            qnum = q.get('questionNumber')
            qtype = q.get('questionType')
            exercise = q.get('exerciseName')
            # Fallback: some agents might extract with slightly different names
            key = (qnum, qtype)
            if key not in seen:
                seen.add(key)
                dedup.append(q)
        
        # Sort by exercise type, then question number
        def sort_key(q):
            t = str(q.get('questionType', ''))
            n = int(q.get('questionNumber', 0)) if str(q.get('questionNumber', 0)).isdigit() else 0
            
            # Custom sorting order based on typical Black Book
            order = 0
            if 'SINGLE' in t: order = 1
            elif 'MULTIPLE' in t: order = 2
            elif 'COMPREHENSION' in t: order = 3
            elif 'MATCH' in t: order = 4
            elif 'SUBJECTIVE' in t: order = 5
            return (order, n)
            
        dedup.sort(key=sort_key)
        
        c['questions'] = dedup
        print(f"Merged {len(dedup)} unique questions across different exercises/types!")
        
        # Count types
        types = set(q.get('questionType') for q in dedup)
        print("Types:", types)
        break

with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

