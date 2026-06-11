import json
data = json.load(open('src/utils/blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    for q in ch['questions']:
        print(f"{ch['id']}: {q.get('exercise')}")
        break
