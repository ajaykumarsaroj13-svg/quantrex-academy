import json, re

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])

for ch in d:
    if ch['title'] in ['Determinants', 'Sequence and Series']:
        for q in ch['questions']:
            if 'Final Answer' in q.get('text', ''):
                print(ch['title'] + " " + q['exerciseName'] + " Q" + str(q['questionNumber']) + " STILL HAS Final Answer in text")
            # Check options too
            for opt in q.get('options', []):
                if 'Final Answer' in opt:
                    print(ch['title'] + " " + q['exerciseName'] + " Q" + str(q['questionNumber']) + " HAS Final Answer in option")

print("Done checking")
