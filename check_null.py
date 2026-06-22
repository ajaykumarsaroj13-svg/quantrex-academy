import json

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])

for ch in d:
    null_count = sum(1 for q in ch['questions'] if q.get('correctOption') is None and not q.get('correctOptions') and not q.get('answerKeyStr'))
    total = len(ch['questions'])
    if null_count > 0:
        print(ch['title'] + ": " + str(null_count) + "/" + str(total) + " have NULL correctOption")
