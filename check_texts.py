import json
import sys

sys.stdout.reconfigure(encoding='utf-8')
with open('src/utils/blackBookDataFull.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

for i in range(15):
    print(data[1]['questions'][i]['text'])
