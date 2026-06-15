import json
import glob

for path in glob.glob('public/data/questions/adv-*.json'):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data:
                if q.get('type') in ['MCQM', 'mcqm']:
                    print(f"File: {path}")
                    print(json.dumps(q, indent=2))
                    exit()
    except Exception as e:
        pass
