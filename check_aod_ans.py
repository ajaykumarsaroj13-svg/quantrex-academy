import json
data = json.load(open('src/utils/blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'black_book_ch_aod':
        print(f"Chapter: {ch['id']}")
        print(f"Questions: {len(ch['questions'])}")
        for i, q in enumerate(ch['questions']):
             if i < 5 or i > len(ch['questions']) - 5:
                 print(f"Q{i}: correctOption={q.get('correctOption', 'none')} correctOptionsArray={q.get('correctOptionsArray', 'none')} correctAnswer={q.get('correctAnswer', 'none')}")
