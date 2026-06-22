import re
import json
import os

def parse_txt(filename, chapter_id, title, chapter_number):
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    questions = []
    
    # split by exercise first
    exercises = re.split(r'\*\*(Exercise-\d+.*)\*\*', content)
    
    for i in range(1, len(exercises), 2):
        ex_name = exercises[i].strip()
        ex_content = exercises[i+1]
        
        q_type = 'SINGLE CORRECT'
        if 'One or More' in ex_name: q_type = 'MULTIPLE CORRECT'
        elif 'Comprehension' in ex_name: q_type = 'COMPREHENSION'
        elif 'Subjective' in ex_name: q_type = 'SUBJECTIVE'
        elif 'Matching' in ex_name: q_type = 'MATCHING'
        
        q_splits = re.split(r'\*\*(\d+)\.\*\*', ex_content)
        
        for j in range(1, len(q_splits), 2):
            q_num = int(q_splits[j])
            q_text = q_splits[j+1].strip()
            
            options = []
            opt_match = re.search(r'\(a\)\s*(.*?)\s*\(b\)\s*(.*?)\s*\(c\)\s*(.*?)\s*\(d\)\s*(.*)', q_text, re.DOTALL)
            if opt_match:
                options = [f"({chr(97+k)}) {opt_match.group(k+1)}" for k in range(4)]
                q_text = q_text[:opt_match.start()].strip()
                
            questions.append({
                "questionNumber": q_num,
                "questionType": q_type,
                "text": q_text,
                "options": options,
                "exerciseName": ex_name,
                "has_graph": False,
                "chapter": title,
                "correctOption": -1,
                "correctAnswer": "",
                "typeLabel": f"[{q_type}]"
            })
            
    return {
        "id": chapter_id,
        "chapterNumber": chapter_number,
        "title": title,
        "questions": questions
    }

print("Parser ready")
