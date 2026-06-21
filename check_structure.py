import json
data = json.load(open('blackBookDataFull.json', 'r', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'indefinite-and-definite-integration':
        for i, q in enumerate(ch['questions'][:5]):
            print(f"Q{i+1}: {q}")
