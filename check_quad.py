import json

# Check public/data/chapters/jee-advanced-mathematics.json
file_path = 'C:/Users/Admin/.gemini/antigravity/scratch/project_2/quantrex-academy/public/data/chapters/jee-advanced-mathematics.json'
with open(file_path, 'r', encoding='utf-8') as f:
    data = json.load(f)

for idx, ch in enumerate(data['chapters']):
    if 'quadratic' in ch['name'].lower():
        print(f"Found {ch['name']} at index {idx}, ID: {ch['id']}")
