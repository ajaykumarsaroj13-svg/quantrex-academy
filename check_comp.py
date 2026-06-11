import json
data = json.load(open('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'black_book_ch1_functions':
        for q in ch['questions']:
            if q.get('questionType') == 'COMPREHENSION TYPE':
                print("COMPREHENSION:", repr(q['text']))
                break
        break
