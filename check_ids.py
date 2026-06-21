import json
data = json.load(open('blackBookDataFull.json', 'r', encoding='utf-8'))
for ch in data:
    title = ch.get('title', '')
    if any(n in title.lower() for n in ['indefinite', 'area', 'differential']):
        print(f"Chapter: {title}, ID: {ch['id']}")
