import json
import glob
import re

def normalize_ex_name(name):
    name = name.lower()
    if 'exercise' in name and '1' in name: return 'Exercise 1'
    if 'exercise' in name and '2' in name: return 'Exercise 2'
    if 'exercise' in name and '3' in name: return 'Exercise 3'
    if 'exercise' in name and '4' in name: return 'Exercise 4'
    if 'exercise' in name and '5' in name: return 'Exercise 5'
    return name

def get_type_label(qt):
    if qt == 'SINGLE CORRECT': return '[SINGLE CORRECT]'
    if qt == 'MULTIPLE CORRECT': return '[MULTIPLE CORRECT]'
    if qt == 'COMPREHENSION': return '[COMPREHENSION]'
    if qt == 'MATCH THE COLUMN': return '[MATCH THE COLUMN]'
    if qt == 'SUBJECTIVE TYPE': return '[SUBJECTIVE TYPE]'
    return '[SINGLE CORRECT]'

def merge():
    main_file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'
    with open(main_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    existing_questions = data[0]['questions']
    existing_keys = set()
    for q in existing_questions:
        ex = normalize_ex_name(q.get('exerciseName', ''))
        num = q.get('questionNumber', 0)
        existing_keys.add((ex, num))
        
    print(f"Loaded {len(existing_questions)} existing questions.")
    
    batch_files = glob.glob('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/pdf_pages/batch*.json')
    new_questions = []
    
    added_count = 0
    for bf in batch_files:
        try:
            with open(bf, 'r', encoding='utf-8') as f:
                batch_data = json.load(f)
                
            for q in batch_data:
                ex = normalize_ex_name(q.get('exerciseName', ''))
                num = q.get('questionNumber', 0)
                
                # Exclude if it already exists
                if (ex, num) not in existing_keys:
                    q['exerciseName'] = ex
                    q['typeLabel'] = get_type_label(q.get('questionType', ''))
                    q['correctOption'] = -1
                    if 'has_graph' not in q:
                        q['has_graph'] = False
                    q['graph_bbox'] = []
                    if 'chapter' not in q:
                        q['chapter'] = 'Functions'
                    
                    new_questions.append(q)
                    existing_keys.add((ex, num))
                    added_count += 1
        except Exception as e:
            print(f"Error processing {bf}: {e}")
            
    print(f"Added {added_count} missing questions.")
    
    # Sort new_questions by Exercise, then by Number
    ex_order = {'Exercise 1': 1, 'Exercise 2': 2, 'Exercise 3': 3, 'Exercise 4': 4, 'Exercise 5': 5}
    
    data[0]['questions'].extend(new_questions)
    data[0]['questions'].sort(key=lambda q: (ex_order.get(q.get('exerciseName', ''), 99), int(q.get('questionNumber', 0))))
    
    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print("Successfully saved merged data.")

if __name__ == '__main__':
    merge()
