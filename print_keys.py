import json
content = open('public/data-script.js', 'r', encoding='utf-8').read()
json_str = content.split('window.DEFAULT_SYLLABUS = ')[1].split(';\nwindow.DEFAULT_TOPPERS')[0]
data = json.loads(json_str)

questions_seen = 0
for ch in data.get('jee-advanced', {}).get('subjects', {}).get('mathematics', {}).get('chapters', []):
    for ex in ch.get('exercises', []):
        for q in ex.get('questions', []):
            questions_seen += 1
            if questions_seen == 1:
                print(f"Question keys: {list(q.keys())}")
            if 'type' in q:
                print(f"Found a question with type {q['type']}")
                break
        else:
            continue
        break
    else:
        continue
    break

if questions_seen == 0:
    print("No exercises or questions found inside window.DEFAULT_SYLLABUS for jee-advanced -> mathematics.")
