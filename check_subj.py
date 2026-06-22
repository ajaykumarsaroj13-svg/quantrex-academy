import json
with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()
start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])
for ch in d:
    for q in ch['questions']:
        if 'Exercise-4' in q.get('exerciseName','') or 'Exercise-5' in q.get('exerciseName','') or 'Subjective' in q.get('exerciseName',''):
            print(ch['title'], q['exerciseName'], "Q" + str(q['questionNumber']),
                  "answer=" + str(q.get('answer')),
                  "answerKeyStr=" + str(q.get('answerKeyStr')),
                  "correctAnswer=" + str(q.get('correctAnswer')))
            if q['questionNumber'] > 3:
                break
