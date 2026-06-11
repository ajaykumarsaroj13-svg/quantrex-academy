import json
data = json.load(open('src/utils/blackBookDataFull.json', encoding='utf-8'))
for ch in data:
    for q in ch['questions']:
        if 'correctOptionsArray' in q:
            print(f"Chapter: {ch['id']}, Found correctOptionsArray: {q['correctOptionsArray']}")
            break
