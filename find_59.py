import json

log_path = r"C:\Users\Admin\.gemini\antigravity\brain\e7bc6a83-9938-4faf-83cf-a74a33c2ded5\.system_generated\logs\transcript.jsonl"
lines_with_59 = []

with open(log_path, 'r', encoding='utf-8') as f:
    for i, line in enumerate(f):
        if '"questionNumber": 59' in line:
            lines_with_59.append((i, line))

print(f"Found {len(lines_with_59)} lines with 59")
for i, line in lines_with_59:
    print(f"Line {i}: {line[:300]}...")
