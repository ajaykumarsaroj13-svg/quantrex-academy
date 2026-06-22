import json

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])

print("Total chapters:", len(d))
for ch in d:
    total_q = len(ch['questions'])
    has_correct = sum(1 for q in ch['questions'] if q.get('correctOption') is not None and q.get('correctOption') != -1)
    has_multi = sum(1 for q in ch['questions'] if q.get('correctOptions'))
    has_answer = sum(1 for q in ch['questions'] if q.get('answerKeyStr'))
    print(ch['title'] + ": " + str(total_q) + " total, " + str(has_correct) + " single, " + str(has_multi) + " multi, " + str(has_answer) + " subjective")
