import json

try:
    with open('src/utils/testsData2.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    print(f"Type: {type(data)}")
    if isinstance(data, list) and len(data) > 0:
        print(f"First item keys: {list(data[0].keys())}")
        if 'questions' in data[0] and len(data[0]['questions']) > 0:
             print(f"First question keys: {list(data[0]['questions'][0].keys())}")
             print(f"First question: {json.dumps(data[0]['questions'][0], indent=2)}")
except Exception as e:
    print(f"Error: {e}")
