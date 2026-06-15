import json
try:
    with open('src/utils/advancedTestsData.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        if isinstance(data, dict):
            print(f"Keys: {list(data.keys())[:5]}")
            first_key = list(data.keys())[0]
            print(f"First item: {json.dumps(data[first_key][:1], indent=2)}")
        elif isinstance(data, list):
            print(f"List length: {len(data)}")
except Exception as e:
    print(f"Error: {e}")
