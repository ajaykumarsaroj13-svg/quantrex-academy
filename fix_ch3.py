import json
import re

target_file = r'C:\Users\Admin\.gemini\antigravity\scratch\quantrexacadmy\src\utils\blackBookDataFull.json'

with open(target_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

for chap in data:
    if chap.get('id') == 'jee-mathematics-continuity':
        for q in chap.get('questions', []):
            # 1. Standardize Exercise Name
            ex = str(q.get('exerciseName', '')).upper()
            qtype = str(q.get('questionType', '')).upper()
            text = q.get('text', '')
            
            # Determine correct exercise based on type or old name
            if 'SINGLE' in qtype or 'SINGLE' in ex or 'EXERCISE 1' in ex or 'EXERCISE-1' in ex:
                q['exerciseName'] = 'Exercise-1 : Single Choice Problems'
                q['questionType'] = 'SINGLE CORRECT'
            elif 'MULTIPLE' in qtype or 'MORE THAN ONE' in ex or 'EXERCISE 2' in ex or 'EXERCISE-2' in ex:
                q['exerciseName'] = 'Exercise-2 : One or More than One Answer Is/are Correct'
                q['questionType'] = 'MULTIPLE CORRECT'
            elif 'COMPREHENSION' in qtype or 'EXERCISE 3' in ex or 'EXERCISE-3' in ex:
                q['exerciseName'] = 'Exercise-3 : Comprehension Type Problems'
                q['questionType'] = 'COMPREHENSION'
            elif 'MATCH' in qtype or 'EXERCISE 4' in ex or 'EXERCISE-4' in ex:
                q['exerciseName'] = 'Exercise-4 : Matching Type Problems'
                q['questionType'] = 'MATCH THE COLUMN'
            elif 'SUBJECTIVE' in qtype or 'EXERCISE 5' in ex or 'EXERCISE-5' in ex:
                q['exerciseName'] = 'Exercise-5 : Subjective Type Problems'
                q['questionType'] = 'SUBJECTIVE'
            else:
                # Default fallback based on options length
                if len(q.get('options', [])) == 4:
                    q['exerciseName'] = 'Exercise-1 : Single Choice Problems'
                    q['questionType'] = 'SINGLE CORRECT'
                else:
                    q['exerciseName'] = 'Exercise-5 : Subjective Type Problems'
                    q['questionType'] = 'SUBJECTIVE'

            # 2. Fix Match The Column formatting
            if q['questionType'] == 'MATCH THE COLUMN':
                # Check if it lacks an array
                if 'array' not in text:
                    # Very basic parser: assume format is (A)... (B)... Column-II (P)...
                    # We will reconstruct it into \begin{array}{|l|l|}
                    
                    # Split into Column 1 and Column 2 if possible
                    if 'Column-II' in text or 'Column II' in text:
                        part1, part2 = re.split(r'Column-?II', text, 1, flags=re.IGNORECASE)
                        
                        # Find A, B, C, D
                        col1 = re.findall(r'\([A-E]\)(.*?)(?=\([A-E]\)|$)', part1, re.DOTALL)
                        col2 = re.findall(r'\([P-T]\)(.*?)(?=\([P-T]\)|$)', part2, re.DOTALL)
                        
                        labels1 = ['(A)', '(B)', '(C)', '(D)', '(E)']
                        labels2 = ['(P)', '(Q)', '(R)', '(S)', '(T)']
                        
                        new_text = "$$\n\\begin{array}{|l|l|}\n\\hline\n\\text{\\textbf{Column-I}} & \\text{\\textbf{Column-II}} \\\\\n\\hline\n"
                        
                        max_len = max(len(col1), len(col2))
                        for i in range(max_len):
                            c1 = col1[i].strip() if i < len(col1) else ""
                            c2 = col2[i].strip() if i < len(col2) else ""
                            
                            c1 = c1.replace('\\n', ' ')
                            c2 = c2.replace('\\n', ' ')
                            
                            row = f"\\text{{\\textbf{{{labels1[i]}}}}} {c1} & \\text{{\\textbf{{{labels2[i]}}}}} {c2} \\\\\n"
                            new_text += row
                        
                        new_text += "\\hline\n\\end{array}\n$$"
                        q['text'] = new_text

with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(data, f, indent=2)

print("Data normalized and Match The Column fixed.")
