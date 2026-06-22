import json
data = json.load(open(r'E:\quantrexacademy\blackBookDataFull.json', 'r', encoding='utf-8'))
for ch in data:
    if ch['id'] in ['indefinite-and-definite-integration', 'adv-area-under-curves', 'adv-differential-equations']:
        print(f"{ch['id']}:")
        for q in ch.get('questions', [])[:5]:
            print(f"  Q{q.get('questionNumber')}: typeLabel={repr(q.get('typeLabel'))}, correctOption={repr(q.get('correctOption'))}, answerKeyStr={repr(q.get('answerKeyStr'))}")
