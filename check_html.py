import json
import re

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

count = 0
for chap in data:
    for q in chap.get('questions', []):
        text = q.get('questionText', '') + q.get('text', '')
        if '<table' in text or '<div' in text:
            print(f"Chapter {chap.get('chapterNumber')}: Q{q.get('questionNumber')}")
            count += 1
            
print('Total:', count)
