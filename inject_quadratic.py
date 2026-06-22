import json
import os

chapter_file = r'E:\quantrexacademy\quadratic_temp.json'
with open(chapter_file, 'r', encoding='utf-8') as f:
    new_chapter = json.load(f)

files_to_update = [
    r'E:\quantrexacademy\blackBookDataFull.json',
    r'E:\quantrexacademy\src\utils\blackBookDataFull.json',
    r'E:\quantrexacademy\public\blackbook-script.js'
]

# Read the current data
with open(files_to_update[0], 'r', encoding='utf-8') as f:
    data = json.load(f)

# Check if it already exists, if so, replace it
idx_to_replace = -1
for i, ch in enumerate(data):
    if ch['id'] == 'adv-quadratic-equations':
        idx_to_replace = i
        break

if idx_to_replace >= 0:
    data[idx_to_replace] = new_chapter
else:
    data.append(new_chapter)

# Save to all locations
for fpath in files_to_update:
    if fpath.endswith('.js'):
        with open(fpath, 'w', encoding='utf-8') as f:
            f.write('window.DEFAULT_BLACKBOOK = ' + json.dumps(data, separators=(',', ':')) + ';\n')
    else:
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print("Quadratic Equations chapter injected successfully!")
