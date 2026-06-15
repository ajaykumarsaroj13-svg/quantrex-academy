import json

try:
    with open('src/utils/testsData2.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    types = set()
    multi_correct_count = 0
    for topic in data:
        for q in topic.get('questions', []):
            t = q.get('type')
            types.add(t)
            if t in ['MCQ (Multiple Correct)', 'Multiple Correct', 'MULTI_CORRECT', 'multi_correct']:
                 multi_correct_count += 1
            elif q.get('correctOptionsArray'):
                 multi_correct_count += 1
            elif isinstance(q.get('correctAnswer'), list):
                 multi_correct_count += 1
    print(f"Types found: {types}")
    print(f"Multi-correct count: {multi_correct_count}")
except Exception as e:
    print(f"Error: {e}")
