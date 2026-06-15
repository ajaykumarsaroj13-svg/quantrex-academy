import json
import glob

for path in glob.glob('public/data/questions/adv-*.json'):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            for q in data:
                if q.get('type') in ['MCQM', 'mcqm', 'MCQ (Multiple Correct)', 'Multiple Correct', 'MULTI_CORRECT']:
                    correct = q.get('correctOptionsArray') or q.get('correctAnswer') or q.get('correctOptionIndex')
                    if q.get('question') and isinstance(q['question'], dict) and q['question'].get('en'):
                        correct = correct or q['question']['en'].get('correct_options')
                    print(f"Question ID {q.get('id')} has correct properties: correctOptionsArray={q.get('correctOptionsArray')}, correctAnswer={q.get('correctAnswer')}, correctOptionIndex={q.get('correctOptionIndex')}, en.correct_options={q.get('question', {}).get('en', {}).get('correct_options')}")
    except Exception as e:
        pass
