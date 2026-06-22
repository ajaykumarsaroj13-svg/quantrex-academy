import json

for fname in ['indefinite-integrals.json', 'area-under-the-curves.json', 'differential-equations.json']:
    with open(f'E:/quantrexacademy/public/data/questions/{fname}', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    has_solution = sum(1 for q in data if q.get('solution') and str(q['solution']).strip())
    no_solution = sum(1 for q in data if not q.get('solution') or not str(q['solution']).strip())
    
    # Check options
    has_options = sum(1 for q in data if q.get('options') and len(q['options']) > 0)
    
    # Check if options are strings or dicts
    opt_types = set()
    for q in data:
        if q.get('options'):
            for opt in q['options']:
                opt_types.add(type(opt).__name__)
    
    print(f"{fname}:")
    print(f"  Total: {len(data)}")
    print(f"  Has solution: {has_solution}, No solution: {no_solution}")
    print(f"  Has options: {has_options}")
    print(f"  Option types: {opt_types}")
    
    # Show sample question with all fields
    q = data[0]
    print(f"  Sample Q type: {q.get('type')}")
    print(f"  correctOptionIndex: {repr(q.get('correctOptionIndex'))}")
    print(f"  correctAnswer: {repr(q.get('correctAnswer'))}")
    print(f"  solution exists: {bool(q.get('solution'))}")
    print(f"  solution length: {len(str(q.get('solution', '')))}")
    if q.get('options'):
        print(f"  First option type: {type(q['options'][0])}")
        print(f"  Options count: {len(q['options'])}")
    print()

# Now check a WORKING chapter for comparison
print("=== COMPARISON: WORKING CHAPTER ===")
for fname in ['sets-and-relations.json', 'matrices.json', 'permutations-and-combinations.json']:
    fpath = f'E:/quantrexacademy/public/data/questions/{fname}'
    try:
        with open(fpath, 'r', encoding='utf-8') as f:
            data = json.load(f)
        if isinstance(data, list) and len(data) > 0:
            q = data[0]
            has_solution = sum(1 for q2 in data if q2.get('solution') and str(q2['solution']).strip())
            print(f"{fname}: total={len(data)}, has_solution={has_solution}, correctOptionIndex={repr(q.get('correctOptionIndex'))}")
            break
    except FileNotFoundError:
        pass
