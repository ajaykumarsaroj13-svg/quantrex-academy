import json
import re

with open(r'C:\Users\Admin\.gemini\antigravity\scratch\project_2\quantrex-academy\questionse5.txt', 'r', encoding='utf-8') as f:
    text = f.read()

parts = text.split('### **Answer Key for Exercise-5**')
q_section = parts[0]
ans_section = parts[1] if len(parts) > 1 else ""

answer_map = {}
ans_matches = re.finditer(r'\*\*\s*(\d+)\.\s*\*\*\s*(.+)', ans_section)
for match in ans_matches:
    q_num = int(match.group(1))
    answer_map[q_num] = match.group(2).strip()

q_parts = re.split(r'\*\*(\d+)\.\*\*', q_section)

questions = []
for i in range(1, len(q_parts), 2):
    q_num = int(q_parts[i])
    q_raw = q_parts[i+1].strip()
    
    correct_ans = answer_map.get(q_num, "")
    
    q_obj = {
        "questionNumber": q_num,
        "questionType": "SUBJECTIVE TYPE",
        "text": q_raw,
        "options": [],
        "exerciseName": "Exercise-5 : Subjective Type Problems",
        "has_graph": False,
        "chapter": "Indefinite and Definite Integration",
        "correctOption": -1, # or 0, Subjective Type usually doesn't have A/B/C/D
        "answerKeyStr": correct_ans,
        "typeLabel": "[SUBJECTIVE TYPE]",
        "correctAnswer": correct_ans,
        "chapterId": "black_book_ch5_integration"
    }
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
        chapter['questions'] = [q for q in chapter['questions'] if q['exerciseName'] != "Exercise-5 : Subjective Type Problems"]
        chapter['questions'].extend(questions)
        
        def sort_key(q):
            ex_order = {
                "Exercise 1": 1,
                "Exercise-2 : One or More than One Correct": 2,
                "Exercise-3 : Comprehension Type Problems": 3,
                "Exercise-4 : Matching Type Problems": 4,
                "Exercise-5 : Subjective Type Problems": 5
            }
            return (ex_order.get(q.get('exerciseName', ''), 99), q['questionNumber'])
            
        chapter['questions'].sort(key=sort_key)
        
        with open(js_file, 'w', encoding='utf-8') as f:
            f.write(prefix + json.dumps(data, indent=2) + ";")
        print(f"Success! Added {len(questions)} Exercise 5 questions.")
    else:
        print("Could not find Chapter 5")
else:
    print("Could not parse JS file.")
