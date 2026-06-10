import json
import os
import re

log_path = 'C:/Users/Admin/.gemini/antigravity/brain/e7bc6a83-9938-4faf-83cf-a74a33c2ded5/.system_generated/logs/transcript.jsonl'

all_questions = []

try:
    with open(log_path, 'r', encoding='utf-8') as f:
        for line in f:
            obj = json.loads(line)
            content = obj.get('content', '')
            if 'questionNumber' in content and 'questionType' in content:
                # Use regex to find [ { ... } ]
                match = re.search(r'(\[\s*\{\s*\"questionNumber\".*?\}\s*\])', content, re.DOTALL)
                if match:
                    json_str = match.group(1)
                    try:
                        q_arr = json.loads(json_str)
                        if isinstance(q_arr, list):
                            all_questions.extend(q_arr)
                    except Exception as e:
                        pass
except Exception as e:
    print(e)

# Deduplicate by questionNumber and text
unique_q = {}
for q in all_questions:
    key = str(q.get('questionNumber')) + q.get('text', '')[:20]
    unique_q[key] = q

final_questions = list(unique_q.values())
final_questions.sort(key=lambda x: x.get('questionNumber', 0))

with open('pdf_pages/batch1.json', 'w', encoding='utf-8') as f:
    json.dump(final_questions, f, indent=2)

print(f'Total unique questions collected: {len(final_questions)}')
