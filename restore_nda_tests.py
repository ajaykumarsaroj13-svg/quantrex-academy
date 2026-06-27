import json
import os

with open('C:/Users/Admin/.gemini/antigravity/scratch/rtdb_root_nda_tests.json', 'r', encoding='utf-8') as f:
    rtdb_data = json.load(f)

os.makedirs('public/data/tests', exist_ok=True)

for test_id, test_content in rtdb_data.items():
    out_path = f'public/data/tests/{test_id}.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(test_content, f, ensure_ascii=False, indent=2)
    print(f"Restored NDA test {test_id}")
