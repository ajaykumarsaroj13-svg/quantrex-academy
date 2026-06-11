import json
data = json.load(open('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    for q in ch['questions']:
        if 'begin{array}' in q.get('text', ''):
            print("Found array in", ch['id'])
            print(repr(q['text']))
            import sys; sys.exit(0)
