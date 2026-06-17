import json
try:
    with open('public/data/questions/adv-3d-geometry.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
        for q in data:
            if q.get('type') in ['MCQ (Multiple Correct)', 'Multiple Correct', 'MULTI_CORRECT', 'multi_correct'] or q.get('correctOptionsArray') or isinstance(q.get('correctAnswer'), list) or q.get('type', '').lower().startswith('mcq (multiple'):
                print(f"Multi-correct question found: {json.dumps(q, indent=2)}")
                break
        else:
            print("No multi-correct question found, printing first question.")
            print(json.dumps(data[0], indent=2))
except Exception as e:
    print(f"Error: {e}")
