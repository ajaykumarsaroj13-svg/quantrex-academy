import json
import re

log_path = r"C:\Users\Admin\.gemini\antigravity\brain\e7bc6a83-9938-4faf-83cf-a74a33c2ded5\.system_generated\logs\transcript.jsonl"
all_qs = []

with open(log_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'questionNumber' not in line:
            continue
            
        try:
            data = json.loads(line)
        except:
            continue
            
        content = data.get('content', '')
        
        # We know content contains an array with questionNumber
        # Let's extract anything that looks like a JSON array
        # It could be the whole content, or inside a markdown block, or inside a SYSTEM_MESSAGE wrapper
        
        # 1. Try markdown blocks
        blocks = re.findall(r'```(?:json)?(.*?)```', content, re.DOTALL)
        
        # 2. Try to find the outermost array
        start = content.find('[')
        end = content.rfind(']')
        if start != -1 and end != -1 and start < end:
            blocks.append(content[start:end+1])
            
        for b in blocks:
            if 'questionNumber' not in b:
                continue
            try:
                # fix unescaped backslashes
                fixed = re.sub(r'\\([^"\\/bfnrt])', r'\\\\\1', b)
                parsed = json.loads(fixed)
                if isinstance(parsed, list):
                    for item in parsed:
                        if isinstance(item, dict) and 'questionNumber' in item:
                            all_qs.append(item)
            except:
                pass

all_qs.sort(key=lambda x: int(x.get('questionNumber', 0)) if str(x.get('questionNumber', 0)).isdigit() else 0)

# deduplicate
deduped = []
seen = set()
for q in all_qs:
    q_num = q.get('questionNumber')
    if q_num not in seen:
        seen.add(q_num)
        deduped.append(q)

with open('extracted_ch3_raw.json', 'w', encoding='utf-8') as out_f:
    json.dump(deduped, out_f, indent=2)

print(f"Extracted {len(deduped)} questions.")
