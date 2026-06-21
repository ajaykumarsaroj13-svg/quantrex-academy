import json
data = json.load(open('blackBookDataFull.json', 'r', encoding='utf-8'))
for ch in data:
    if ch['id'] == 'adv-area-under-curves':
        print("First 3 questions:")
        for q in ch['questions'][:3]:
            print(q['text'][:100])
        print("Last 3 questions of Ex 1:")
        for q in ch['questions'][53:56]:
            print(q['text'][:100])
