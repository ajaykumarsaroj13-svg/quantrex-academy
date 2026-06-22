import json
with open('E:/quantrexacademy/public/blackbook-script.js', 'r', encoding='utf-8') as f:
    text = f.read()
start = text.find('[')
d = json.loads(text[start:text.rfind(']')+1])
ch = next(c for c in d if 'Sequence' in c['title'])
print(f"Total questions: {len(ch['questions'])}")
ans = [q['answer'] for q in ch['questions'][:10]]
print("First 10 answers:", ans)
ans2 = [q.get('answer') for q in ch['questions'][-5:]]
print("Last 5 answers:", ans2)
