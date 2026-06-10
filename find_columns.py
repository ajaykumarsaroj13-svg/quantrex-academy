import json
with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for chap in data:
    for q in chap.get('questions', []):
        if 'column' in str(q).lower() or 'match' in str(q).lower():
            print(f"Chapter {chap.get('chapterNumber')}: Q{q.get('questionNumber')}")
            print(json.dumps(q, indent=2))
