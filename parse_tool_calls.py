import os
import json
import re

brain_dir = r'C:\Users\Admin\.gemini\antigravity\brain'
all_qs = []
for folder in ['44dd8834-6bcd-4286-a948-24f67a44ca51', '1355282e-6e18-4e71-820d-deef1065b8ef', 'abbed89e-5c05-4a28-88ca-c3b7d1938af5']:
    log_path = os.path.join(brain_dir, folder, '.system_generated', 'logs', 'transcript.jsonl')
    if os.path.exists(log_path):
        with open(log_path, 'r', encoding='utf-8') as f:
            for line in f:
                if '"type":"TOOL_CALL"' in line and 'send_message' in line:
                    try:
                        data = json.loads(line)
                        calls = data.get('tool_calls', [])
                        for call in calls:
                            func = call.get('function', {})
                            if func.get('name') == 'send_message':
                                args_str = func.get('arguments', '{}')
                                try:
                                    args = json.loads(args_str)
                                    msg = args.get('Message', '')
                                    
                                    start = msg.find('[')
                                    end = msg.rfind(']')
                                    if start != -1 and end != -1 and start < end:
                                        b = msg[start:end+1]
                                        
                                        # Let's try parsing directly first
                                        try:
                                            parsed = json.loads(b)
                                            if isinstance(parsed, list):
                                                all_qs.extend(parsed)
                                                print('Extracted', len(parsed), 'from', folder)
                                                continue
                                        except:
                                            pass
                                            
                                        # Fix backslashes
                                        try:
                                            fixed = re.sub(r'\\([^"\\/bfnrt])', r'\\\\\1', b)
                                            parsed = json.loads(fixed)
                                            if isinstance(parsed, list):
                                                all_qs.extend(parsed)
                                                print('Extracted', len(parsed), 'from', folder)
                                        except Exception as e2:
                                            print('Failed to fix backslashes', e2)
                                except Exception as e:
                                    print('Failed to parse args', e)
                    except Exception as e:
                        print('Failed to parse line', e)

print('Total extracted from subagents:', len(all_qs))

if all_qs:
    try:
        with open('extracted_ch3_raw.json', 'r', encoding='utf-8') as f:
            existing = json.load(f)
    except:
        existing = []
    existing.extend(all_qs)
    
    seen = set()
    dedup = []
    for q in existing:
        qnum = q.get('questionNumber')
        if qnum not in seen:
            seen.add(qnum)
            dedup.append(q)
            
    dedup.sort(key=lambda x: int(x.get('questionNumber', 0)) if str(x.get('questionNumber', 0)).isdigit() else 0)
    with open('extracted_ch3_raw.json', 'w', encoding='utf-8') as f:
        json.dump(dedup, f, indent=2)
    print('Saved to extracted_ch3_raw.json. Total unique:', len(dedup))
