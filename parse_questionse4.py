import json
import re

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\project_2\quantrex-academy\questionse4.txt', 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split('### **Answer Key for Exercise-4**')
q_section = parts[0]
ans_section = parts[1] if len(parts) > 1 else ""

# Parse answer key
answer_map = {}
ans_matches = re.finditer(r'\*\*(\d+)\.\*\*\s*(.+)', ans_section)
for match in ans_matches:
    q_num = int(match.group(1))
    ans = match.group(2).strip()
    # e.g., "A \rightarrow S ; B \rightarrow P ; C \rightarrow P ; D \rightarrow S"
    answer_map[q_num] = ans

# Split questions
# We'll split by **N. optional text**
q_parts = re.split(r'\*\*(\d+)\.(.*?)\*\*', q_section)

questions = []
for i in range(1, len(q_parts), 3):
    q_num = int(q_parts[i])
    extra_text = q_parts[i+1].strip()
    q_raw = q_parts[i+2].strip()
    if extra_text:
        q_raw = extra_text + "\n\n" + q_raw
    
    # We don't have options A/B/C/D to click, it's matching type.
    # The answer is a string.
    
    # Clean up q_raw slightly if needed, but it's fine as is.
    # We might want to remove trailing "Column-II" extra spaces, etc., but strip() is enough.
    
    correct_ans = answer_map.get(q_num, "")
    
    q_obj = {
        "questionNumber": q_num,
        "questionType": "MATCH THE COLUMN",
        "text": q_raw,
        "options": [],
        "exerciseName": "Exercise-4 : Matching Type Problems",
        "has_graph": False,
        "chapter": "Indefinite and Definite Integration",
        "answerKeyStr": correct_ans,
        "typeLabel": "[MATCHING TYPE]",
        "correctAnswer": correct_ans,
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
    
    chapter = None
    for ch in data:
        if ch['id'] == "black_book_ch5_integration":
            chapter = ch
            break
            
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
            ex = q.get('exerciseName', '')
            order = ex_order.get(ex, 99)
            return (order, q['questionNumber'])
            
        chapter['questions'].sort(key=sort_key)
        
        new_js = prefix + json.dumps(data, indent=2) + ";"
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(new_js)
        print(f"Success! Added {len(questions)} Exercise 4 questions to Chapter 5.")
    else:
        print("Could not find Chapter 5 in the JS file.")
else:
    print("Could not parse JS file.")
