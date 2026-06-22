import json, os

files = ['indefinite-integrals.json', 'area-under-the-curves.json', 'differential-equations.json']
base = r'E:\quantrexacademy\public\data\questions'

for fname in files:
    path = os.path.join(base, fname)
    with open(path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    total = len(data)
    has_idx = sum(1 for q in data if q.get('correctOptionIndex') is not None)
    has_ans = sum(1 for q in data if q.get('correctAnswer') not in [None, ''])
    has_opts = sum(1 for q in data if isinstance(q.get('question'), dict) and isinstance(q['question'].get('en'), dict) and q['question']['en'].get('correct_options'))
    
    print(f"\n=== {fname} ===")
    print(f"  Total: {total}")
    print(f"  Has correctOptionIndex: {has_idx}")
    print(f"  Has correctAnswer (non-empty): {has_ans}")
    print(f"  Has question.en.correct_options: {has_opts}")
    
    q = data[0]
    print(f"  First Q keys: {list(q.keys())}")
    print(f"  correctOptionIndex = {repr(q.get('correctOptionIndex'))}")
    print(f"  correctAnswer = {repr(q.get('correctAnswer'))}")
    print(f"  type = {repr(q.get('type'))}")
    
    # Check if answers exist in raw_math files
    raw_dir = os.path.join(base, 'raw_math')
    if os.path.exists(raw_dir):
        for rf in os.listdir(raw_dir):
            rpath = os.path.join(raw_dir, rf)
            with open(rpath, 'r', encoding='utf-8') as f2:
                rdata = json.load(f2)
            # Check if any question matches by ID
            if isinstance(rdata, list) and len(rdata) > 0:
                first_q = rdata[0]
                chapter_slug = first_q.get('chapter', '')
                if chapter_slug in fname.replace('.json', ''):
                    has_raw_ans = sum(1 for rq in rdata if rq.get('correctOptionIndex') is not None or rq.get('correctAnswer'))
                    print(f"  RAW file: {rf}, total={len(rdata)}, with_answers={has_raw_ans}")
                    if len(rdata) > 0:
                        rq0 = rdata[0]
                        print(f"    Raw Q keys: {list(rq0.keys())}")
                        print(f"    Raw correctOptionIndex = {repr(rq0.get('correctOptionIndex'))}")
                        print(f"    Raw correctAnswer = {repr(rq0.get('correctAnswer'))}")
