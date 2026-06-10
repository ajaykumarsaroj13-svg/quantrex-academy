import json
import os

subagent_ids = [
    "c3dd2074-c548-4442-b8c2-76e01e8d74c4", "9785bb6e-d110-4ee7-adb2-bc0af67f3188", "c3f8a4d8-13ac-4399-8478-0495ac012be0",
    "cfb0a7bc-9a92-4959-ac79-7f95b43bc651", "c8ee1fca-7982-40d6-b35b-6df748419a94", "52f204e6-6450-4ec1-909d-e2afdd829e9f",
    "582f3e07-e0f5-4114-b972-08c635079923", "eed3e8b3-e7ea-4a19-89af-c50225b945b6", "f19c5d0a-2b0c-489b-8bd9-e77373fecfbc",
    "24ac35a1-6858-4df0-a841-d794e1ea76b1", "c0e1e5c8-2863-458d-a0e9-dc6809b1fcc9", "68c8b027-5f39-4ee9-a6fc-dad300617608",
    "bff9d3de-de45-4e19-b124-c3d43d868ad1", "e5e8b99b-d7e7-4935-813a-b49b07abbcb2", "d4a612bf-bede-4484-b11d-57c07cf58981"
]

all_json_strs = []
missing = []

for i, sub_id in enumerate(subagent_ids):
    log_path = f"C:/Users/Admin/.gemini/antigravity/brain/{sub_id}/.system_generated/logs/transcript.jsonl"
    if not os.path.exists(log_path):
        missing.append(i+1)
        continue
    
    with open(log_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        found = False
        for line in reversed(lines):
            try:
                data = json.loads(line)
                if data.get('source') == 'MODEL' and 'tool_calls' in data:
                    for call in data['tool_calls']:
                        if call.get('name') == 'send_message':
                            # Handle both string and dict args just in case
                            args = call.get('args', {})
                            if isinstance(args, str):
                                args = json.loads(args)
                            msg = args.get('Message', '')
                            
                            msg = msg.strip()
                            if msg.startswith('```json'):
                                msg = msg[7:]
                            if msg.endswith('```'):
                                msg = msg[:-3]
                            msg = msg.strip()
                            
                            if msg.startswith('['):
                                inner = msg[1:-1].strip()
                                if inner:
                                    all_json_strs.append(inner)
                                found = True
                                break
                    if found:
                        break
                elif data.get('source') == 'MODEL' and data.get('type') == 'PLANNER_RESPONSE':
                    content = data.get('content', '')
                    start = content.find('[')
                    end = content.rfind(']')
                    if start != -1 and end != -1:
                        json_str = content[start:end+1]
                        inner = json_str[1:-1].strip()
                        if inner:
                            all_json_strs.append(inner)
                        found = True
                        break
            except Exception as e:
                pass
        
        if not found:
            missing.append(i+1)

if not missing:
    final_json = '[\n' + ',\n'.join(all_json_strs) + '\n]'
    with open('limits_extracted.json', 'w', encoding='utf-8') as f:
        f.write(final_json)
    print(f"\nSuccessfully extracted all questions! Wrote to limits_extracted.json")
else:
    print(f"\nStill waiting for pages: {missing}")
