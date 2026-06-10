import json
import os

files = [
    'ch3_0_3.json',
    'ch3_4_7.json',
    'missing_ch3.json',
    'ch3_11_15.json',
    'ch3_16_20.json',
    'ch3_21_25.json',
    'ch3_26_29.json'
]

raw_qs = []
for file in files:
    if os.path.exists(file):
        try:
            with open(file, 'r', encoding='utf-8') as f:
                content = json.load(f)
                if isinstance(content, list):
                    raw_qs.extend(content)
                    print(f"Read {len(content)} questions from {file}")
        except Exception as e:
            print(f"Error reading {file}: {e}")

normalized_qs = []
for q in raw_qs:
    # Get and normalize questionType
    qtype = str(q.get('questionType', '')).upper().strip()
    
    if 'SINGLE' in qtype or 'CHOICE' in qtype:
        exercise = 'Exercise-1 : Single Choice Problems'
        qtype_norm = 'SINGLE CORRECT'
        label = '[SINGLE CORRECT]'
    elif 'MULTIPLE' in qtype or 'MORE' in qtype or 'ONE OR MORE' in qtype:
        exercise = 'Exercise-2 : One or More than One Answer Is/are Correct'
        qtype_norm = 'MULTIPLE CORRECT'
        label = '[MULTIPLE CORRECT]'
    elif 'COMPREHENSION' in qtype or 'PARAGRAPH' in qtype:
        exercise = 'Exercise-3 : Comprehension Type Problems'
        qtype_norm = 'COMPREHENSION'
        label = '[COMPREHENSION]'
    elif 'MATCH' in qtype or 'COLUMN' in qtype:
        exercise = 'Exercise-4 : Matching Type Problems'
        qtype_norm = 'MATCH THE COLUMN'
        label = '[MATCH THE COLUMN]'
    elif 'SUBJECTIVE' in qtype:
        exercise = 'Exercise-5 : Subjective Type Problems'
        qtype_norm = 'SUBJECTIVE TYPE'
        label = '[SUBJECTIVE TYPE]'
    else:
        # Fallback based on exercise name if present
        ex_name = str(q.get('exerciseName', '')).lower()
        if 'exercise-1' in ex_name or 'exercise 1' in ex_name:
            exercise = 'Exercise-1 : Single Choice Problems'
            qtype_norm = 'SINGLE CORRECT'
            label = '[SINGLE CORRECT]'
        elif 'exercise-2' in ex_name or 'exercise 2' in ex_name:
            exercise = 'Exercise-2 : One or More than One Answer Is/are Correct'
            qtype_norm = 'MULTIPLE CORRECT'
            label = '[MULTIPLE CORRECT]'
        elif 'exercise-3' in ex_name or 'exercise 3' in ex_name:
            exercise = 'Exercise-3 : Comprehension Type Problems'
            qtype_norm = 'COMPREHENSION'
            label = '[COMPREHENSION]'
        elif 'exercise-4' in ex_name or 'exercise 4' in ex_name or 'match' in ex_name:
            exercise = 'Exercise-4 : Matching Type Problems'
            qtype_norm = 'MATCH THE COLUMN'
            label = '[MATCH THE COLUMN]'
        elif 'exercise-5' in ex_name or 'exercise 5' in ex_name or 'subjective' in ex_name:
            exercise = 'Exercise-5 : Subjective Type Problems'
            qtype_norm = 'SUBJECTIVE TYPE'
            label = '[SUBJECTIVE TYPE]'
        else:
            print(f"Skipping unknown question type: {qtype} (ex: {q.get('exerciseName')})")
            continue

    qnum = q.get('questionNumber')
    if isinstance(qnum, str) and qnum.isdigit():
        qnum = int(qnum)
    elif not isinstance(qnum, int):
        qnum = 0

    norm_q = {
        "questionNumber": qnum,
        "questionType": qtype_norm,
        "text": q.get('text', ''),
        "options": q.get('options', []),
        "exerciseName": exercise,
        "has_graph": q.get('has_graph', False),
        "chapter": "Continuity, Differentiability and Differentiation",
        "typeLabel": label
    }
    
    # Preserve answer keys or custom attributes if any
    if q.get('correctOption') is not None:
        norm_q['correctOption'] = q['correctOption']
    if q.get('correctOptionsArray') is not None:
        norm_q['correctOptionsArray'] = q['correctOptionsArray']
    if q.get('answerKeyStr') is not None:
        norm_q['answerKeyStr'] = q['answerKeyStr']
    if q.get('solution') is not None:
        norm_q['solution'] = q['solution']
        
    normalized_qs.append(norm_q)

# Deduplicate by (exerciseName, questionNumber)
seen = set()
dedup = []
for q in normalized_qs:
    key = (q['exerciseName'], q['questionNumber'])
    if key not in seen:
        seen.add(key)
        dedup.append(q)
    else:
        print(f"Duplicate found and skipped: {key}")

# Sort by exercise, then by questionNumber
def sort_key(q):
    ex = q['exerciseName']
    num = q['questionNumber']
    
    order = 0
    if 'Exercise-1' in ex: order = 1
    elif 'Exercise-2' in ex: order = 2
    elif 'Exercise-3' in ex: order = 3
    elif 'Exercise-4' in ex: order = 4
    elif 'Exercise-5' in ex: order = 5
    return (order, num)

dedup.sort(key=sort_key)

# Update blackBookDataFull.json
target_file = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json'

with open(target_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

for c in data:
    if c.get('id') == 'jee-mathematics-continuity':
        c['questions'] = dedup
        print(f"\nMerged {len(dedup)} correct questions into Chapter 3!")
        
        # Print counts
        for ex in sorted(list(set(q['exerciseName'] for q in dedup))):
            cnt = len([q for q in dedup if q['exerciseName'] == ex])
            print(f"  {ex}: {cnt} questions")
        break

with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("\nSaved successfully!")
