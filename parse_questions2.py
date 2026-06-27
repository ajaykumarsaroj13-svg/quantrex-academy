import json
import re

opt_to_idx = {'a': 0, 'b': 1, 'c': 2, 'd': 3}

with open(r'C:\Users\Admin\Documents\questions2.txt', 'r', encoding='utf-8') as f:
    text = f.read()

# Separate questions and answer key
parts = text.split('### **Answer Key for Exercise-2**')
if len(parts) == 2:
    q_section = parts[0]
    ans_section = parts[1]
else:
    q_section = text
    ans_section = ""

# Parse answers
answer_map = {}
for line in ans_section.split('\n'):
    line = line.strip()
    if line.startswith('**') and ')' in line:
        match = re.match(r'\*\*(\d+)\.\*\*\s*\((.*?)\)', line)
        if match:
            q_num = int(match.group(1))
            ans_str = match.group(2) # e.g. "b, c"
            opts = [o.strip() for o in ans_str.split(',')]
            answer_map[q_num] = opts

questions = []
# split by "**N.**"
q_parts = re.split(r'\*\*(\d+)\.\*\*', q_section)

for i in range(1, len(q_parts), 2):
    q_num = int(q_parts[i])
    q_content = q_parts[i+1]
    
    idx_a = q_content.find('\n(a)')
    if idx_a == -1: idx_a = q_content.find('(a)')
    idx_b = q_content.find('\n(b)')
    if idx_b == -1: idx_b = q_content.find('(b)')
    idx_c = q_content.find('\n(c)')
    if idx_c == -1: idx_c = q_content.find('(c)')
    idx_d = q_content.find('\n(d)')
    if idx_d == -1: idx_d = q_content.find('(d)')
    
    q_text = q_content[:idx_a].strip()
    
    opt_a = q_content[idx_a+4:idx_b].strip()
    opt_b = q_content[idx_b+4:idx_c].strip()
    opt_c = q_content[idx_c+4:idx_d].strip()
    
    opt_d_raw = q_content[idx_d+4:].strip()
    opt_d = opt_d_raw
    extra_text_match = re.search(r'\n\s*(\*\(where.*|\(where.*|\(Note:.*)', opt_d_raw, re.IGNORECASE)
    if extra_text_match:
        opt_d = opt_d_raw[:extra_text_match.start()].strip()
        q_text += '\n\n' + extra_text_match.group(1).strip()
    
    correct_opts = answer_map.get(q_num, ['a'])
    correct_indices = [opt_to_idx[o] for o in correct_opts]
    
    q_obj = {
        "questionNumber": q_num,
        "questionType": "ONE OR MORE THAN ONE CORRECT",
        "text": q_text,
        "options": [opt_a, opt_b, opt_c, opt_d],
        "exerciseName": "Exercise-2 : One or More than One Correct",
        "has_graph": False,
        "chapter": "Indefinite and Definite Integration",
        "correctOption": -1,
        "answerKeyStr": f"({', '.join(correct_opts)})",
        "typeLabel": "[ONE OR MORE THAN ONE CORRECT]",
        "correctOptionsArray": correct_indices,
        "chapterId": "black_book_ch5_integration"
    }
    questions.append(q_obj)

# Update the JS file safely
js_file = r'C:\Users\Admin\.gemini\antigravity\scratch\project_2\quantrex-academy\public\blackbook-script.js'
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

prefix = "window.DEFAULT_BLACKBOOK = "
if js_content.startswith(prefix):
    json_str = js_content[len(prefix):].strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
    
    data = json.loads(json_str)
    
    ch5 = next((ch for ch in data if ch['id'] == "black_book_ch5_integration"), None)
    if ch5:
        # Remove any existing Exercise 2 questions from ch5 to prevent duplicates
        ch5['questions'] = [q for q in ch5['questions'] if "Exercise-2" not in q.get('exerciseName', '')]
        ch5['questions'].extend(questions)
        print("Success! Appended", len(questions), "Exercise 2 questions.")
    else:
        print("Chapter 5 not found!")

    new_js = prefix + json.dumps(data, indent=2) + ";"
    with open(js_file, 'w', encoding='utf-8') as f:
        f.write(new_js)
else:
    print("Could not parse JS file.")
