import json

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])

for ch in d:
    if ch['title'] in ['Determinants', 'Sequence and Series']:
        for q in ch['questions']:
            if 'Exercise-2' in q.get('exerciseName', ''):
                print(ch['title'] + " Ex2 Q" + str(q['questionNumber']) + 
                      " correctOption=" + str(q.get('correctOption')) + 
                      " correctOptions=" + str(q.get('correctOptions')))
