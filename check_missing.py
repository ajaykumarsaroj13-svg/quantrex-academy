import json

with open('missing_ch3.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for q in data:
    qnum = q.get('questionNumber', 0)
    if isinstance(qnum, str) and qnum.isdigit():
        qnum = int(qnum)
    if qnum >= 80:
        print(f"Q{qnum}: {q.get('questionType')}")
        if 'array' in q.get('text', ''):
            print("  -> uses array!")
        if 'table' in q.get('text', ''):
            print("  -> uses HTML table!")
