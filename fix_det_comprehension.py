import json

with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()

start = text.find('[')
end = text.rfind(']')+1
d = json.loads(text[start:end])

paragraph = """Paragraph for Question Nos. 1 to 3
Consider the system of equations
$2x + \lambda y + 6z = 8$
$x + 2y + \mu z = 5$
$x + y + 3z = 4$
The system of equations has:

"""

for ch in d:
    if ch['title'] == 'Determinants':
        for q in ch['questions']:
            if 'Exercise-3' in q['exerciseName'] and q['questionNumber'] in [1, 2, 3]:
                if not q['text'].startswith('Paragraph'):
                    q['text'] = paragraph + q['text']

new_script = text[:start] + json.dumps(d, ensure_ascii=False, indent=2) + text[end:]

with open('E:/quantrexacademy/public/blackbook-script.js', 'w', encoding='utf-8') as f:
    f.write(new_script)

print("Fixed Determinants Comprehension!")
