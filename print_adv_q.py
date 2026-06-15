import json
try:
    with open('src/utils/advancedTestsData.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        q = data[0]['questions'][0]
        print(f"Sample Question from advancedTestsData: {json.dumps(q, indent=2)}")
except Exception as e:
    print(f"Error: {e}")
