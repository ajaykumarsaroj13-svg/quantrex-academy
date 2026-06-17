import json

try:
    with open('src/utils/advancedTestsData.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    types = set()
    multi_correct_count = 0
    for topic in data:
        for q in topic.get('questions', []):
            types.add(q.get('type'))
            if q.get('type') in ['MCQ (Multiple Correct)', 'Multiple Correct', 'MULTI_CORRECT']:
                 multi_correct_count += 1
            if q.get('correctOptionsArray'):
                 multi_correct_count += 1
    print(f"Types found: {types}")
    print(f"Multi-correct count: {multi_correct_count}")
except Exception as e:
    print(f"Error: {e}")
