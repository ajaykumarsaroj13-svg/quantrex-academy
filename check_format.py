import json

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for chap in data:
    if chap.get('id') == 'jee-mathematics-continuity':
        for q in chap.get('questions', []):
            if 'MATCH THE COLUMN' in q.get('questionType', ''):
                print(f"Q{q.get('questionNumber')}:")
                text = q.get('text', '')
                if 'array' in text:
                    print('Has array')
                if 'table' in text:
                    print('Has table')
                if 'div' in text:
                    print('Has div')
                # Just print the first 100 chars to be sure
                print(text[:100].replace('\n', ' '))
