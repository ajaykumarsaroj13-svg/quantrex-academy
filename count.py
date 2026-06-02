import json
try:
    with open('frontend/src/utils/blackBookDataFull.json', encoding='utf-8') as f:
        data = json.load(f)
    print(f'Chapters: {len(data)}')
    print(f'Total questions: {sum(len(c["questions"]) for c in data)}')
except Exception as e:
    print(f"Error: {e}")
