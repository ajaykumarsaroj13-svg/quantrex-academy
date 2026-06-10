import json, glob
files = glob.glob('api_*.json')
for f in files:
    try:
        with open(f, 'r', encoding='utf-8') as file:
            data = json.load(file)
            if isinstance(data, dict) and 'data' in data:
                d = data['data']
                if isinstance(d, list):
                    for x in d:
                        if 'name' in x and 'Mathematics' in x['name']:
                            print(f"File: {f}")
                            print(f"Mathematics data: {json.dumps(x, indent=2)}")
                            if 'chapters' in x:
                                for c in x['chapters']:
                                    if 'Sequence' in c.get('name', ''):
                                        print(f"FOUND CHAPTER: {c}")
    except Exception as e:
        pass
