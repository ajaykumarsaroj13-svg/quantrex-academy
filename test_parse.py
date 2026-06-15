import json
import glob

for path in glob.glob('public/data/questions/adv-*.json'):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data:
                if q.get('type') in ['MCQM', 'mcqm', 'MCQ (Multiple Correct)', 'Multiple Correct', 'MULTI_CORRECT']:
                    if q.get('correctAnswer'):
                        print(f"correctAnswer: {q.get('correctAnswer')} (type: {type(q.get('correctAnswer'))})")
    except Exception as e:
        pass
