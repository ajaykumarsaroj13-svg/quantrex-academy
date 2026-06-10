import json
import re

log_path = r"C:\Users\Admin\.gemini\antigravity\brain\e7bc6a83-9938-4faf-83cf-a74a33c2ded5\.system_generated\logs\transcript.jsonl"
subagent_ids = set()
with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'conversationId' in line:
            ids = re.findall(r'"conversationId"\s*:\s*"([a-f0-9\-]+)"', line)
            for cid in ids:
                subagent_ids.add(cid)

print(list(subagent_ids))

with open('subagent_ids.json', 'w') as out_f:
    json.dump(list(subagent_ids), out_f)
