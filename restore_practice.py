import json
import os

with open('C:/Users/Admin/.gemini/antigravity/scratch/rtdb_root_practice_questions.json', 'r', encoding='utf-8') as f:
    rtdb_data = json.load(f)

os.makedirs('public/data/questions', exist_ok=True)

for chapter_id, questions in rtdb_data.items():
    out_path = f'public/data/questions/{chapter_id}.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(questions, f, ensure_ascii=False, indent=2)
    print(f"Restored {chapter_id} with {len(questions)} questions")
