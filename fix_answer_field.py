import json

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
end = text.rfind(']')+1
d = json.loads(text[start:end])

fixed = 0
for ch in d:
    if ch['title'] in ['Determinants', 'Sequence and Series']:
        for q in ch['questions']:
            # Fix subjective: copy answer -> answerKeyStr and correctAnswer
            if q.get('answer') and not q.get('answerKeyStr'):
                q['answerKeyStr'] = q['answer']
                q['correctAnswer'] = q['answer']
                fixed += 1

            # Also remove "Final Answer: X" from question text if present
            if 'Final Answer:' in q.get('text', ''):
                import re
                q['text'] = re.sub(r'\n*Final Answer:\s*\S+\s*$', '', q['text']).strip()
                fixed += 1

new_script = text[:start] + json.dumps(d, ensure_ascii=False, indent=2) + text[end:]

with open('E:/quantrexacademy/public/blackbook-script.js', 'w', encoding='utf-8') as f:
    f.write(new_script)

print("Fixed " + str(fixed) + " fields!")
