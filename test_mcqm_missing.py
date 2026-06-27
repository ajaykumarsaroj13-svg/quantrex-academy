import json
import glob

missing_correct = 0
for path in glob.glob('public/data/questions/adv-*.json'):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data:
                if q.get('type') in ['MCQM', 'mcqm', 'MCQ (Multiple Correct)', 'Multiple Correct', 'MULTI_CORRECT']:
                    correct = q.get('correctOptionsArray')
                    if q.get('question') and isinstance(q['question'], dict) and q['question'].get('en'):
                        correct = correct or q['question']['en'].get('correct_options')
                    if not correct:
                        if not q.get('correctAnswer'):
                             missing_correct += 1
    except Exception as e:
        pass

print(f"MCQM missing correct options: {missing_correct}")
