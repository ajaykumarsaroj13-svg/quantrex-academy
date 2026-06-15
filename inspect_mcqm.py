import json
import glob

mcq_questions = []
for path in glob.glob('public/data/questions/adv-*.json'):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data:
                if q.get('type') in ['MCQM', 'mcqm', 'MCQ (Multiple Correct)', 'Multiple Correct', 'MULTI_CORRECT']:
                    mcq_questions.append((path, q))
                    if len(mcq_questions) >= 2: break
    except Exception as e:
        pass
    if len(mcq_questions) >= 2: break

for p, q in mcq_questions:
    print(f"File: {p}")
    print(json.dumps(q, indent=2))
