import json
with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()
start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])
seq_ch = next(c for c in d if 'Sequence' in c['title'])
ex3_qs = [q for q in seq_ch['questions'] if 'Exercise-3' in q['exerciseName']]
for q in ex3_qs[:5]:
    print("Q" + str(q["questionNumber"]) + ": " + q["text"][:200])
