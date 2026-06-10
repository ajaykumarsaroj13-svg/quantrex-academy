import json

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for chap in data:
    if chap.get('id') == 'jee-mathematics-continuity':
        for q in chap.get('questions', []):
            qType = str(q.get('questionType', '')).upper()
            if 'MATCH' in qType:
                print(f"Q{q.get('questionNumber')}: {qType}")
                if 'array' in q.get('text', ''):
                    print("  -> uses array!")
                if 'table' in q.get('text', ''):
                    print("  -> uses HTML table!")
