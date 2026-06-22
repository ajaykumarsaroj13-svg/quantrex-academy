import json
with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()
start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])
det_ch = next(c for c in d if c['title'] == 'Determinants')
ex3_qs = [q for q in det_ch['questions'] if 'Exercise-3' in q['exerciseName']]
for q in ex3_qs:
    print("Q" + str(q["questionNumber"]) + ": " + repr(q["text"]))
    print("Options: " + str(q["options"]))
