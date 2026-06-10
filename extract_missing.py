import os
import json
import re

brain_dir = r"C:\Users\Admin\.gemini\antigravity\brain"

subagent_folders = [
    "44dd8834-6bcd-4286-a948-24f67a44ca51",
    "1355282e-6e18-4e71-820d-deef1065b8ef",
    "abbed89e-5c05-4a28-88ca-c3b7d1938af5",
]

all_qs = []

for folder in subagent_folders:
    log_path = os.path.join(brain_dir, folder, ".system_generated", "logs", "transcript.jsonl")
    if not os.path.exists(log_path):
        continue
        
    print(f"Reading {folder}...")
    with open(log_path, 'r', encoding='utf-8') as f:
        # read the whole thing
        text = f.read()
        
    # We want to find the JSON that was sent in `send_message`
    # send_message has "Message": "..."
    # the simplest way is to extract any large json array from the transcript.
    blocks = re.findall(r'\[\s*\{\s*"questionNumber".*?\}\s*\]', text, re.DOTALL)
    if not blocks:
        # maybe unescaped or something
        blocks = re.findall(r'\\\[.*?\\\]', text, re.DOTALL)
        
    for b in blocks:
        # It's stringified JSON inside a stringified JSON.
        # We can try to unescape it if it's double-escaped:
        b_unescaped = b.replace('\\n', '\n').replace('\\"', '"').replace('\\\\', '\\')
        
        try:
            # fix backslashes for latex
            fixed = re.sub(r'\\([^"\\/bfnrt])', r'\\\\\1', b_unescaped)
            parsed = json.loads(fixed)
            if isinstance(parsed, list):
                all_qs.extend(parsed)
                print(f"Extracted {len(parsed)} from {folder}")
        except Exception as e:
            try:
                # try parsing raw block
                parsed = json.loads(b)
                if isinstance(parsed, list):
                    all_qs.extend(parsed)
                    print(f"Extracted {len(parsed)} from {folder}")
            except Exception as e2:
                print(f"Failed parsing in {folder}")

print(f"Total extracted: {len(all_qs)}")

# Merge with our existing 72
try:
    with open('extracted_ch3_raw.json', 'r', encoding='utf-8') as f:
        existing_qs = json.load(f)
except:
    existing_qs = []

existing_qs.extend(all_qs)

# deduplicate
deduped = []
seen = set()
for q in existing_qs:
    q_num = q.get('questionNumber')
    if q_num not in seen:
        seen.add(q_num)
        deduped.append(q)

deduped.sort(key=lambda x: int(x.get('questionNumber', 0)) if str(x.get('questionNumber', 0)).isdigit() else 0)

with open('extracted_ch3_raw.json', 'w', encoding='utf-8') as f:
    json.dump(deduped, f, indent=2)

print(f"Total unique now: {len(deduped)}")
