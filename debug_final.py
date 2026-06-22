import json

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])

for ch in d:
    if ch['title'] == 'Determinants':
        for q in ch['questions']:
            if 'Exercise-4' in q.get('exerciseName','') and q['questionNumber'] == 1:
                # Print last 100 chars
                print("LAST 200 CHARS:")
                print(repr(q['text'][-200:]))
                break
