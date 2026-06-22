import json, os

base = r'E:\quantrexacademy\public\data\questions'

# Check definite-integrals (should work)
for fname in ['definite-integrals.json', 'sets-and-relations.json', 'limits.json']:
    fpath = os.path.join(base, fname)
    if not os.path.exists(fpath):
        print(f"{fname}: NOT FOUND")
        continue
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if isinstance(data, list):
        q = data[0] if data else {}
        has_idx = sum(1 for q2 in data if q2.get('correctOptionIndex') is not None)
        print(f"{fname}: list, total={len(data)}, has_correctOptionIndex={has_idx}, first_val={repr(q.get('correctOptionIndex'))}")
    elif isinstance(data, dict):
        all_qs = []
        for topic_qs in data.get('questions', {}).values():
            all_qs.extend(topic_qs)
        has_idx = sum(1 for q2 in all_qs if q2.get('correctOptionIndex') is not None)
        q = all_qs[0] if all_qs else {}
        print(f"{fname}: dict, total={len(all_qs)}, has_correctOptionIndex={has_idx}, first_val={repr(q.get('correctOptionIndex'))}")

print("\n--- Broken chapters ---")
for fname in ['indefinite-integrals.json', 'area-under-the-curves.json', 'differential-equations.json']:
    fpath = os.path.join(base, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if isinstance(data, list):
        q = data[0] if data else {}
        has_idx = sum(1 for q2 in data if q2.get('correctOptionIndex') is not None)
        print(f"{fname}: list, total={len(data)}, has_correctOptionIndex={has_idx}, first_val={repr(q.get('correctOptionIndex'))}")
    elif isinstance(data, dict):
        all_qs = []
        for topic_qs in data.get('questions', {}).values():
            all_qs.extend(topic_qs)
        has_idx = sum(1 for q2 in all_qs if q2.get('correctOptionIndex') is not None)
        q = all_qs[0] if all_qs else {}
        print(f"{fname}: dict, total={len(all_qs)}, has_correctOptionIndex={has_idx}, first_val={repr(q.get('correctOptionIndex'))}")

# Also check: do they have options?
print("\n--- Options check ---")
for fname in ['indefinite-integrals.json', 'area-under-the-curves.json', 'differential-equations.json']:
    fpath = os.path.join(base, fname)
    with open(fpath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    qs = data if isinstance(data, list) else []
    has_options = sum(1 for q in qs if q.get('options') and len(q.get('options', [])) > 0)
    no_options = sum(1 for q in qs if not q.get('options') or len(q.get('options', [])) == 0)
    types = {}
    for q in qs:
        t = q.get('type', 'unknown')
        types[t] = types.get(t, 0) + 1
    print(f"{fname}: has_options={has_options}, no_options={no_options}, types={types}")
