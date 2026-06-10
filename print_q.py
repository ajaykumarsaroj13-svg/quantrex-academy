import json
with open('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(json.dumps(data[0]['questions'][0], indent=2))
