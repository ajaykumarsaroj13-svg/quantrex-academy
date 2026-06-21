import json

with open('blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for ch in data:
    title = ch.get('title', '')
    if any(n in title.lower() for n in ['indefinite', 'area', 'differential']):
        print(f"Chapter: {title}")
        no_ans = 0
        total = 0
        for q in ch.get('questions', []):
            total += 1
            if 'answer' not in q or not q['answer']:
                no_ans += 1
        print(f"  Total: {total}, Missing Answer: {no_ans}")
        
        # Look for exercises inside chapter if any
        if 'exercises' in ch:
            for ex in ch['exercises']:
                ex_total = 0
                ex_no_ans = 0
                for q in ex.get('questions', []):
                    ex_total += 1
                    if 'answer' not in q or not q['answer']:
                        ex_no_ans += 1
                print(f"  Exercise {ex.get('name', 'Unknown')}: Total: {ex_total}, Missing Answer: {ex_no_ans}")

