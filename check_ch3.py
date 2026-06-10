import json
with open('extracted_ch3_raw.json', 'r', encoding='utf-8') as f:
    qs = json.load(f)
for q in qs:
    if 'column' in str(q).lower() or 'match' in str(q).lower():
        print(f"Q{q.get('questionNumber')}:")
        print(q.get('text', '')[:500])
