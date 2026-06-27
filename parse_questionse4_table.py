import json
import re

def to_katex_cell(text_str):
    if not text_str.strip():
        return ""
    # Remove markdown bold and italic to prevent KaTeX parsing errors across math boundaries
    text_str = text_str.replace('**', '').replace('*', '')
    
    parts = text_str.split('$')
    out = ""
    for i, part in enumerate(parts):
        if i % 2 == 0:
            if part:
                # Escape { and } if they are not part of LaTeX commands?
                # Actually \textbf{...} uses { }, so we can't escape them blindly.
                # Just wrap in \text{...}
                out += r"\text{" + part + "}"
        else:
            out += r" \displaystyle " + part + r" "
    
    # KaTeX requires that we do not have unescaped \n inside array cells
    out = out.replace('\n', ' ')
    return out

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\project_2\quantrex-academy\questionse4.txt', 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split('### **Answer Key for Exercise-4**')
q_section = parts[0]
ans_section = parts[1] if len(parts) > 1 else ""

answer_map = {}
ans_matches = re.finditer(r'\*\*(\d+)\.\*\*\s*(.+)', ans_section)
for match in ans_matches:
    q_num = int(match.group(1))
    answer_map[q_num] = match.group(2).strip()

q_parts = re.split(r'\*\*(\d+)\.(.*?)\*\*', q_section)

questions = []
for i in range(1, len(q_parts), 3):
    q_num = int(q_parts[i])
    extra_text = q_parts[i+1].strip()
    q_raw = q_parts[i+2].strip()
    
    # Split into Column I and Column II
    col_split = re.split(r'\*\*Column-II\*\*', q_raw)
    col1_raw = col_split[0]
    col2_raw = col_split[1] if len(col_split) > 1 else ""
    
    # remove **Column-I** from col1_raw
    col1_raw = col1_raw.replace('**Column-I**', '').strip()
    
    # Extract items using regex: **(A)**, **(B)**
    col1_items = re.split(r'(\*\*\([A-D]\)\*\*)', col1_raw)
    col1_parsed = []
    # col1_items[0] is garbage before A
    for j in range(1, len(col1_items), 2):
        label = col1_items[j]
        content = col1_items[j+1].strip()
        col1_parsed.append(label + " " + content)
        
    col2_items = re.split(r'(\*\*\([P-T]\)\*\*)', col2_raw)
    col2_parsed = []
    for j in range(1, len(col2_items), 2):
        label = col2_items[j]
        content = col2_items[j+1].strip()
        col2_parsed.append(label + " " + content)
        
    # Zip them into table rows
    max_len = max(len(col1_parsed), len(col2_parsed))
    
    table_str = "\n$$\n\\begin{array}{|l|l|}\n\\hline\n\\text{\\textbf{Column-I}} & \\text{\\textbf{Column-II}} \\\\\n\\hline\n"
    
    for j in range(max_len):
        c1 = col1_parsed[j] if j < len(col1_parsed) else ""
        c2 = col2_parsed[j] if j < len(col2_parsed) else ""
        
        c1_latex = to_katex_cell(c1)
        c2_latex = to_katex_cell(c2)
        
        table_str += c1_latex + " & " + c2_latex + " \\\\\n"
        
    table_str += "\\hline\n\\end{array}\n$$\n"
    
    full_text = ""
    if extra_text:
        full_text += extra_text + "\n"
    else:
        full_text += "Match the following columns:\n"
    full_text += table_str
    
    correct_ans = answer_map.get(q_num, "")
    
    q_obj = {
        "questionNumber": q_num,
        "questionType": "MATCH THE COLUMN",
        "text": full_text,
        "options": [],
        "exerciseName": "Exercise-4 : Matching Type Problems",
        "has_graph": False,
        "chapter": "Indefinite and Definite Integration",
        "answerKeyStr": correct_ans,
        "typeLabel": "[MATCHING TYPE]",
        "correctAnswer": correct_ans,
        "chapterId": "black_book_ch5_integration"
    }
    print(f"Q{q_num}: col1_len={len(col1_parsed)}, col2_len={len(col2_parsed)}")
    questions.append(q_obj)

# Update JS file
js_file = r'C:\Users\Admin\.gemini\antigravity\scratch\project_2\quantrex-academy\public\blackbook-data-v4.js'
with open(js_file, 'r', encoding='utf-8') as f:
    js_content = f.read()

prefix = "window.DEFAULT_BLACKBOOK = "
if js_content.startswith(prefix):
    json_str = js_content[len(prefix):].strip()
    if json_str.endswith(';'):
        json_str = json_str[:-1]
    
    data = json.loads(json_str)
    chapter = next((ch for ch in data if ch['id'] == "black_book_ch5_integration"), None)
    
    if chapter:
        chapter['questions'] = [q for q in chapter['questions'] if q['exerciseName'] != "Exercise-4 : Matching Type Problems"]
        chapter['questions'].extend(questions)
        
        def sort_key(q):
            ex_order = {
                "Exercise 1": 1,
                "Exercise-2 : One or More than One Correct": 2,
                "Exercise-3 : Comprehension Type Problems": 3,
                "Exercise-4 : Matching Type Problems": 4
            }
            return (ex_order.get(q.get('exerciseName', ''), 99), q['questionNumber'])
            
        chapter['questions'].sort(key=sort_key)
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(prefix + json.dumps(data, indent=2) + ";")
        print(f"Success! Replaced 5 Exercise 4 questions with TABLE FORMAT.")
    else:
        print("Could not find Chapter 5")
