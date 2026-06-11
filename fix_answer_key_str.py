import json

file_path = 'src/utils/blackBookDataFull.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for ch in data:
    for q in ch['questions']:
        if 'correctAnswer' in q and q['correctAnswer']:
            if not q.get('answerKeyStr'):
                q['answerKeyStr'] = q['correctAnswer']

with open(file_path, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("answerKeyStr updated")
