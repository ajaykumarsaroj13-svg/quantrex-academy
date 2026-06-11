import json
data = json.load(open('C:\\Users\\Admin\\.gemini\\antigravity\\scratch\\quantrexacadmy\\src\\utils\\blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    if ch['id'] != 'black_book_ch_aod':
        for q in ch['questions']:
            if q['questionType'] == 'MATCH THE COLUMN':
                print("Chapter:", ch['id'])
                print("Has Graph:", q.get('has_graph'))
                print("Image URL:", q.get('imageUrl'))
                break
        else:
            continue
        break
