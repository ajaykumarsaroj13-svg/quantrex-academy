import json
data = json.load(open(r'E:\quantrexacademy\blackBookDataFull.json', 'r', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'adv-area-under-curves':
        for q in ch.get('questions', [])[:5]:
            print(f"options={q.get('options')}")
