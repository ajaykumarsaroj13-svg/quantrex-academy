import json

data = json.load(open('src/utils/blackBookDataFull.json', 'r', encoding='utf-8'))

# Check chapter 0 (Functions) which is known to work
ch = data[0]
print(f"=== Chapter 0: {ch['title']} ===")
print(f"  Keys: {list(ch.keys())}")
print(f"  Top-level questions: {len(ch.get('questions', []))}")
print(f"  Exercises: {len(ch.get('exercises', []))}")

for ex in ch.get('exercises', []):
    ename = ex.get('exerciseName', '?')
    qs = ex.get('questions', [])
    print(f"    Exercise '{ename}': {len(qs)} questions")
    if len(qs) > 0:
        q0 = qs[0]
        print(f"      Keys: {list(q0.keys())[:8]}")
        print(f"      questionType: {q0.get('questionType')}")
        has_coi = q0.get('correctOptionIndex') is not None
        has_co = q0.get('correctOption') is not None
        has_ca = bool(q0.get('correctAnswer'))
        print(f"      correctOptionIndex={has_coi}, correctOption={has_co}, correctAnswer={has_ca}")

# Check top-level questions for chapter 0
top_qs = ch.get('questions', [])
if top_qs:
    q0 = top_qs[0]
    print(f"\n  Top-level Q[0] keys: {list(q0.keys())[:10]}")
    print(f"  Top-level Q[0] exerciseName: {q0.get('exerciseName', 'NONE')}")

# Now check how chapter 4 (new) questions look
print(f"\n=== Chapter 4: {data[4]['title']} ===")
ch4 = data[4]
top_qs4 = ch4.get('questions', [])
if top_qs4:
    q0 = top_qs4[0]
    print(f"  Q[0] keys: {list(q0.keys())}")
    print(f"  Q[0] text (first 100 chars): {str(q0.get('text',''))[:100]}")
    print(f"  Q[0] options: {q0.get('options')}")
    print(f"  Q[0] correctOption: {q0.get('correctOption')}")
    print(f"  Q[0] correctOptionIndex: {q0.get('correctOptionIndex')}")
    print(f"  Q[0] correctAnswer: {q0.get('correctAnswer')}")

# Check a matching type question
print(f"\n=== Matching Type Questions ===")
for ci in [4, 5, 6]:
    ch = data[ci]
    for q in ch.get('questions', []):
        if q.get('exerciseName') == 'Exercise 4':
            print(f"  Ch {ci} ({ch['title']}) Q{q.get('questionNumber')}: type={q.get('questionType')}")
            print(f"    text (first 200 chars): {str(q.get('text',''))[:200]}")
            print(f"    options: {q.get('options')}")
            print(f"    correctOption: {q.get('correctOption')}")
            print()
