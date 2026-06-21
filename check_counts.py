import json
data = json.load(open('blackBookDataFull.json', 'r', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'adv-differential-equations':
        ex_counts = {}
        for q in ch.get('questions', []):
            ex_title = q.get('exerciseName')
            ex_counts[ex_title] = ex_counts.get(ex_title, 0) + 1
        print("Differential Equations Exercises:")
        for ex, c in ex_counts.items():
            print(f"  {ex}: {c} questions")
    if ch['id'] == 'adv-area-under-curves':
        ex_counts = {}
        for q in ch.get('questions', []):
            ex_title = q.get('exerciseName')
            ex_counts[ex_title] = ex_counts.get(ex_title, 0) + 1
        print("Area Under Curves Exercises:")
        for ex, c in ex_counts.items():
            print(f"  {ex}: {c} questions")
