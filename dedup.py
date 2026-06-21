import json

data = json.load(open('E:\\quantrexacademy\\blackBookDataFull.json', 'r', encoding='utf-8'))

for ch in data:
    if ch['id'] in ['adv-differential-equations', 'adv-area-under-curves']:
        new_qs = []
        seen = set()
        for q in ch.get('questions', []):
            text = q.get('text', '')
            if text not in seen:
                seen.add(text)
                new_qs.append(q)
        ch['questions'] = new_qs

with open('E:\\quantrexacademy\\blackBookDataFull.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=2)

print("Deduplication complete!")
