import json
import glob
for file in glob.glob('public/data/questions/extracted_chunk_*.json'):
    data = json.load(open(file, encoding='utf-8'))
    print(f'File: {file}')
    for q in data[:2] + data[-2:]:
        print(f"  {q.get('type')}: idx={q.get('correctOptionIndex', 'N/A')}, arr={q.get('correctOptionsArray', 'N/A')}, ans={q.get('correctAnswer', 'N/A')}")
