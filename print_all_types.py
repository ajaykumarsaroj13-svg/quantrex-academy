import json
import glob

types = set()
for path in glob.glob('public/data/questions/adv-*.json'):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data:
                types.add(q.get('type'))
    except Exception as e:
        pass
print(f"All types in adv files: {types}")
