import json
import re

all_qs = []
with open('dump.txt', 'r', encoding='utf-8') as f:
    for line in f:
        try:
            data = json.loads(line)
        except:
            continue
            
        content = data.get('content', '')
        
        # Strip EPHEMERAL_MESSAGE
        eph_idx = content.find('<EPHEMERAL_MESSAGE>')
        if eph_idx != -1:
            content = content[:eph_idx]
            
        if '[Message]' in content and 'content=' in content:
            parts = content.split('content=', 1)
            if len(parts) > 1:
                json_str = parts[1].strip()
                
                # Check for markdown code blocks
                if '```json' in json_str:
                    blocks = re.findall(r'```json(.*?)```', json_str, re.DOTALL)
                elif '```' in json_str:
                    blocks = re.findall(r'```(.*?)```', json_str, re.DOTALL)
                else:
                    # just find the outermost array
                    start = json_str.find('[')
                    end = json_str.rfind(']')
                    if start != -1 and end != -1 and start < end:
                        blocks = [json_str[start:end+1]]
                    else:
                        blocks = []
                
                for b in blocks:
                    if 'questionNumber' not in b:
                        continue
                    try:
                        parsed = json.loads(b)
                        if isinstance(parsed, list):
                            all_qs.extend(parsed)
                    except Exception as e:
                        try:
                            # Bruteforce backslash fixing for latex
                            # Double all backslashes
                            fixed = b.replace('\\', '\\\\')
                            # Restore properly escaped quotes
                            fixed = fixed.replace('\\\\"', '\\"')
                            # Restore properly escaped newlines
                            fixed = fixed.replace('\\\\n', '\\n')
                            # Restore properly escaped r
                            fixed = fixed.replace('\\\\r', '\\r')
                            # Restore properly escaped t
                            fixed = fixed.replace('\\\\t', '\\t')
                            
                            parsed = json.loads(fixed)
                            if isinstance(parsed, list):
                                all_qs.extend(parsed)
                        except Exception as e2:
                            print('Failed to parse a block:', e2)

print('Extracted:', len(all_qs))

# Deduplicate by questionNumber
deduped = []
seen = set()
for q in all_qs:
    q_num = q.get('questionNumber')
    if q_num not in seen:
        seen.add(q_num)
        deduped.append(q)

print('Unique:', len(deduped))

# Sort
deduped.sort(key=lambda x: int(x.get('questionNumber', 0)) if str(x.get('questionNumber', 0)).isdigit() else 0)

with open('extracted_ch3_raw.json', 'w', encoding='utf-8') as out_f:
    json.dump(deduped, out_f, indent=2)

