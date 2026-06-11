import json
data = json.load(open('src/utils/blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'black_book_ch_aod':
        for q in ch['questions']:
            if q['questionType'] == 'ONE OR MORE THAN ONE CORRECT':
                print(f"{ch['id']}: {q.get('exerciseName')}")
                break
