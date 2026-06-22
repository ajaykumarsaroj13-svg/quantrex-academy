import json

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])
det = next(ch for ch in d if ch['title'] == 'Determinants')
match_ex = [q for q in det['questions'] if 'Exercise-4' in q['exerciseName']]

with open('E:/quantrexacademy/det_match.txt', 'w', encoding='utf-8') as f:
    for q in match_ex:
        f.write(f"Q: {q['text']}\nOptions: {q['options']}\nAnswer: {q['answerKeyStr']}\n\n")
