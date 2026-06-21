import json
data = json.load(open('blackBookDataFull.json', 'r', encoding='utf-8'))
for ch in data:
  for q in ch['questions']:
    name = q.get('exerciseName', '')
    if 'Exercise-1' in name or 'Exercise 1' in name:
        q['exerciseName'] = 'Exercise 1'
    elif 'Exercise-2' in name or 'Exercise 2' in name:
        q['exerciseName'] = 'Exercise 2'
    elif 'Exercise-3' in name or 'Exercise 3' in name:
        q['exerciseName'] = 'Exercise 3'
    elif 'Exercise-4' in name or 'Exercise 4' in name:
        q['exerciseName'] = 'Exercise 4'
    elif 'Exercise-5' in name or 'Exercise 5' in name:
        q['exerciseName'] = 'Exercise 5'

with open('blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
with open('src/utils/blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)
