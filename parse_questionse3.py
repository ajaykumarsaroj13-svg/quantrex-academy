import json
import re

opt_to_idx = {'a': 0, 'b': 1, 'c': 2, 'd': 3}

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\project_2\quantrex-academy\questionse3.txt', 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split('### **Answer Key for Exercise-3**')
if len(parts) == 2:
    q_section = parts[0]
    ans_section = parts[1]
else:
    q_section = text
    ans_section = ""

# Parse answer key
answer_map = {}
ans_matches = re.finditer(r'\*\*(\d+)\.\*\*\s*\(([a-d])\)', ans_section)
for match in ans_matches:
    q_num = int(match.group(1))
    ans = match.group(2)
    answer_map[q_num] = ans

# Parse paragraphs
# We will split the text by "**Paragraph for Question Nos."
# Then extract the paragraph text and the questions within it.

paragraphs = re.split(r'\*\*Paragraph for Question Nos\.\s*(.*?)\*\*', q_section)
# paragraphs[0] is everything before the first paragraph
# Then it's alternating: paragraph range, paragraph content

questions = []

for i in range(1, len(paragraphs), 2):
    p_range_str = paragraphs[i].strip() # e.g. "1 to 2"
    p_content = paragraphs[i+1]
    
    # Extract the paragraph text which is before the first question "**N.**"
    first_q_match = re.search(r'\*\*(\d+)\.\*\*', p_content)
    if first_q_match:
        para_text = p_content[:first_q_match.start()].strip()
        q_parts = re.split(r'\*\*(\d+)\.\*\*', p_content)
        # q_parts[0] is the para_text
        for j in range(1, len(q_parts), 2):
            q_num = int(q_parts[j])
            q_raw = q_parts[j+1]
            
            idx_a = q_raw.find('\n(a)')
            if idx_a == -1: idx_a = q_raw.find('(a)')
            idx_b = q_raw.find('\n(b)')
            if idx_b == -1: idx_b = q_raw.find('(b)')
            idx_c = q_raw.find('\n(c)')
            if idx_c == -1: idx_c = q_raw.find('(c)')
            idx_d = q_raw.find('\n(d)')
            if idx_d == -1: idx_d = q_raw.find('(d)')
            
            q_text = q_raw[:idx_a].strip()
            
            opt_a = q_raw[idx_a+4:idx_b].strip()
            opt_b = q_raw[idx_b+4:idx_c].strip()
            opt_c = q_raw[idx_c+4:idx_d].strip()
            
            opt_d_raw = q_raw[idx_d+4:].strip()
            opt_d = opt_d_raw
            
            extra_text_match = re.search(r'\n\s*(\*\(where.*|\(where.*|\(Note:.*)', opt_d_raw, re.IGNORECASE)
            if extra_text_match:
                opt_d = opt_d_raw[:extra_text_match.start()].strip()
                q_text += '\n\n' + extra_text_match.group(1).strip()
            
            # Combine para_text and q_text
            full_q_text = "**Paragraph for Question Nos. " + p_range_str + "**\n\n" + para_text + "\n\n" + q_text
            
            correct_opt_char = answer_map.get(q_num, 'a')
            correct_opt = opt_to_idx.get(correct_opt_char, 0)
            
            q_obj = {
                "questionNumber": q_num,
                "questionType": "COMPREHENSION TYPE",
                "text": full_q_text,
                "options": [opt_a, opt_b, opt_c, opt_d],
                "exerciseName": "Exercise-3 : Comprehension Type Problems",
                "has_graph": False,
                "chapter": "Indefinite and Definite Integration",
                "correctOption": correct_opt,
                "typeLabel": "[COMPREHENSION TYPE]",
                "graph_bbox": [],
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
    
    # Find the chapter
    chapter = None
    for ch in data:
        if ch['id'] == "black_book_ch5_integration":
            chapter = ch
            break
            
    if chapter:
        # Remove any existing Exercise 3 questions
        chapter['questions'] = [q for q in chapter['questions'] if q['exerciseName'] != "Exercise-3 : Comprehension Type Problems"]
        # Append new ones
        chapter['questions'].extend(questions)
        # Sort questions
        def sort_key(q):
            ex_order = {
                "Exercise 1": 1,
                "Exercise-2 : One or More than One Correct": 2,
                "Exercise-3 : Comprehension Type Problems": 3
            }
            # Fallback to a high number if it doesn't match
            ex = q.get('exerciseName', '')
            order = ex_order.get(ex, 99)
            return (order, q['questionNumber'])
            
        chapter['questions'].sort(key=sort_key)
        
        new_js = prefix + json.dumps(data, indent=2) + ";"
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(new_js)
        print("Success! Added", len(questions), "Exercise 3 questions to Chapter 5.")
    else:
        print("Could not find Chapter 5 in the JS file.")
else:
    print("Could not parse JS file.")
