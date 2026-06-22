import json

for fname in ['indefinite-integrals.json', 'area-under-the-curves.json', 'differential-equations.json']:
    with open(f'E:/quantrexacademy/public/data/questions/{fname}', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    numerical = [q for q in data if q.get('type') in ['NUMERICAL', 'FIB', 'Integer', 'Numerical Value', 'integer-value']]
    if numerical:
        has_ans = sum(1 for q in numerical if q.get('correctAnswer') and str(q['correctAnswer']).strip())
        no_ans = sum(1 for q in numerical if not q.get('correctAnswer') or not str(q['correctAnswer']).strip())
        print(f"{fname} NUMERICAL/FIB: total={len(numerical)}, has_correctAnswer={has_ans}, MISSING_correctAnswer={no_ans}")
        
        # Show a few missing ones
        missing = [q for q in numerical if not q.get('correctAnswer') or not str(q['correctAnswer']).strip()]
        for q in missing[:3]:
            print(f"  Q: type={q['type']}, correctOptionIndex={repr(q.get('correctOptionIndex'))}, correctAnswer={repr(q.get('correctAnswer'))}, has_solution={bool(q.get('solution'))}")
    
    # Also check SCQ questions
    scq = [q for q in data if q.get('type') == 'SCQ']
    scq_no_idx = [q for q in scq if q.get('correctOptionIndex') is None]
    print(f"{fname} SCQ: total={len(scq)}, missing_correctOptionIndex={len(scq_no_idx)}")
    print()
