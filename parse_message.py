import os
import re
import json

brain_dir = r'C:\Users\Admin\.gemini\antigravity\brain'
folders = [
    '44dd8834-6bcd-4286-a948-24f67a44ca51', # Page 8
    '1355282e-6e18-4e71-820d-deef1065b8ef', # Page 9
    'abbed89e-5c05-4a28-88ca-c3b7d1938af5', # Page 10
]

all_qs = []
for folder in folders:
    log_path = os.path.join(brain_dir, folder, '.system_generated', 'logs', 'transcript.jsonl')
    if not os.path.exists(log_path):
        continue
    
    with open(log_path, 'r', encoding='utf-8') as f:
        text = f.read()
    
    matches = re.findall(r'"Message"\s*:\s*"((?:\\.|[^"\\])*)"', text)
    for m in matches:
        try:
            m_unescaped = bytes(m, "utf-8").decode("unicode_escape")
            start = m_unescaped.find('[')
            end = m_unescaped.rfind(']')
            if start != -1 and end != -1 and start < end:
                b = m_unescaped[start:end+1]
                
                try:
                    parsed = json.loads(b)
                    if isinstance(parsed, list):
                        all_qs.extend(parsed)
                        print(f'Extracted {len(parsed)} from {folder}')
                        continue
                except Exception as e1:
                    try:
                        # Brute force fix
                        fixed = b.replace('\\', '\\\\')
                        fixed = fixed.replace('\\\\"', '\\"')
                        fixed = fixed.replace('\\\\n', '\\n')
                        fixed = fixed.replace('\\\\t', '\\t')
                        fixed = fixed.replace('\\\\r', '\\r')
                        
                        parsed = json.loads(fixed)
                        if isinstance(parsed, list):
                            all_qs.extend(parsed)
                            print(f'Extracted {len(parsed)} from {folder}')
                            continue
                    except Exception as e2:
                        print(f'Failed parsing in {folder}. e1: {e1}, e2: {e2}')
                        
                        # Save the failed block to see what's wrong
                        with open(f'failed_{folder[:8]}.txt', 'w', encoding='utf-8') as out:
                            out.write(b)
        except Exception as e:
            print('Failed unescaping', e)

print('Total:', len(all_qs))

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
        if q.get('questionNumber') not in seen:
            seen.add(q.get('questionNumber'))
            dedup.append(q)
            
    dedup.sort(key=lambda x: int(x.get('questionNumber', 0)) if str(x.get('questionNumber', 0)).isdigit() else 0)
    with open('extracted_ch3_raw.json', 'w', encoding='utf-8') as f:
        json.dump(dedup, f, indent=2)
    print('Total unique:', len(dedup))
