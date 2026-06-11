import json
data = json.load(open('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'black_book_ch_aod':
        continue
    for q in ch['questions']:
        if 'COMPREHENSION' in q.get('questionType', ''):
            print("COMPREHENSION found in", ch['id'], ":")
            print(repr(q['text']))
            import sys; sys.exit(0)
