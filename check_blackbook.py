import json
with open('src/utils/blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
for c in data:
    print(f"ID: {c.get('id', 'N/A')}, Title: {c.get('title', 'N/A')}")
