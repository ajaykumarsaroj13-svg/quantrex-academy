import json
import re
import uuid

def parse_determinants(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    exercises_raw = re.split(r'(?m)^\d+\.\s+(Exercise-\d+.*)$', content)
    
    chapter = {
        "title": "Determinants",
        "description": "Comprehensive Practice Test on Determinants",
        "questions": []
    }
    
    if len(exercises_raw) < 2:
        return chapter

    for i in range(1, len(exercises_raw), 2):
        ex_name = exercises_raw[i].strip()
        ex_content = exercises_raw[i+1]

        questions_raw = re.split(r'(?m)^Question\s+(\d+)\s+', ex_content)
        
        for j in range(1, len(questions_raw), 2):
            q_num = int(questions_raw[j])
            q_body = questions_raw[j+1]
            
            ans_match = re.search(r'(?m)^Correct\s+(?:Option|Options|Answer)s?:\s+(.*)$', q_body, re.IGNORECASE)
            
            answer_key_str = ""
            if ans_match:
                answer_key_str = ans_match.group(1).replace('(', '').replace(')', '').strip()
                q_body = q_body[:ans_match.start()].strip()
            
            options = []
            opt_match = re.search(r'\(a\)\s+(.*?)\s*\(b\)\s+(.*?)\s*\(c\)\s+(.*?)\s*\(d\)\s+(.*)', q_body, re.IGNORECASE | re.DOTALL)
            if opt_match:
                options = [f"$ {opt_match.group(i).strip()} $" for i in range(1, 5)]
                q_body = q_body[:opt_match.start()].strip()
            
            question_text = q_body.strip()

            q_obj = {
                "id": str(uuid.uuid4()),
                "questionNumber": q_num,
                "exerciseName": ex_name,
                "text": question_text,
                "options": options,
                "answerKeyStr": answer_key_str
            }
            
            ex_lower = ex_name.lower()
            if 'more than one' in ex_lower or 'exercise-2' in ex_lower:
                q_obj['type'] = 'MULTI_CORRECT'
                q_obj['questionType'] = 'MULTI_CORRECT'
                mapping = {'a': 0, 'b': 1, 'c': 2, 'd': 3}
                indices = [mapping[c.strip().lower()] for c in answer_key_str.split(',') if c.strip().lower() in mapping]
                q_obj['correctOptionsArray'] = sorted(indices)
                q_obj['correctAnswer'] = answer_key_str.upper()
                q_obj['correctOption'] = -1
            elif 'subjective' in ex_lower or 'exercise-5' in ex_lower:
                q_obj['type'] = 'NUMERICAL'
                q_obj['questionType'] = 'NUMERICAL'
                q_obj['correctAnswer'] = answer_key_str
                q_obj['correctOption'] = -1
            else:
                q_obj['type'] = 'SINGLE_CORRECT'
                q_obj['questionType'] = 'SINGLE_CORRECT'
                mapping = {'a': 0, 'b': 1, 'c': 2, 'd': 3}
                if answer_key_str.lower() in mapping:
                    q_obj['correctOption'] = mapping[answer_key_str.lower()]
                else:
                    q_obj['correctOption'] = -1

            chapter['questions'].append(q_obj)

    return chapter

def main():
    import os
    chapter = parse_determinants('E:/black book maths/determinants_fixed.txt')
    
    script_path = 'E:/quantrexacademy/public/blackbook-script.js'
    with open(script_path, 'r', encoding='utf-8') as f:
        text = f.read()

    start = text.find('[')
    end = text.rfind(']') + 1
    d = json.loads(text[start:end])
    
    exists = False
    for i, ch in enumerate(d):
        if ch['title'] == 'Determinants':
            d[i] = chapter
            exists = True
            break
    
    if not exists:
        d.append(chapter)
        
    new_json = json.dumps(d, indent=2, ensure_ascii=False)
    new_content = 'window.testsData2 = ' + new_json + ';'

    with open(script_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

if __name__ == '__main__':
    main()
