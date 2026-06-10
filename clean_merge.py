import json
import glob

def clean_merge():
    main_file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'
    with open(main_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    old_questions = data[0]['questions']
    
    # Map of correct options
    correct_options = {}
    for q in old_questions:
        if q.get('correctOption', -1) != -1:
            ex = q.get('exerciseName', '')
            num = int(q.get('questionNumber', 0))
            correct_options[(ex, num)] = q['correctOption']
            
    print(f"Found {len(correct_options)} saved correct options.")
    
    batch_files = glob.glob('C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/pdf_pages/batch*.json')
    new_questions = []
    
    seen = set()
    
    for bf in batch_files:
        with open(bf, 'r', encoding='utf-8') as f:
            batch_data = json.load(f)
            
        for q in batch_data:
            ex = q.get('exerciseName', '').strip()
            num = int(q.get('questionNumber', 0))
            key = (ex, num)
            
            if key not in seen:
                # Add default properties
                q['correctOption'] = correct_options.get(key, -1)
                
                # Type label mapping
                qt = q.get('questionType', '')
                if qt == 'SINGLE CORRECT': q['typeLabel'] = '[SINGLE CORRECT]'
                elif qt == 'MULTIPLE CORRECT': q['typeLabel'] = '[MULTIPLE CORRECT]'
                elif qt == 'COMPREHENSION': q['typeLabel'] = '[COMPREHENSION]'
                elif qt == 'MATCH THE COLUMN': q['typeLabel'] = '[MATCH THE COLUMN]'
                elif qt == 'SUBJECTIVE TYPE': q['typeLabel'] = '[SUBJECTIVE TYPE]'
                else: q['typeLabel'] = '[SINGLE CORRECT]'
                
                if 'has_graph' not in q:
                    q['has_graph'] = False
                q['graph_bbox'] = []
                q['chapter'] = 'Functions'
                q['exerciseName'] = ex
                
                new_questions.append(q)
                seen.add(key)
                
    # Sort them
    ex_order = {'Exercise 1': 1, 'Exercise 2': 2, 'Exercise 3': 3, 'Exercise 4': 4, 'Exercise 5': 5}
    new_questions.sort(key=lambda q: (ex_order.get(q.get('exerciseName', ''), 99), int(q.get('questionNumber', 0))))
    
    data[0]['questions'] = new_questions
    
    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
        
    print(f"Successfully saved {len(new_questions)} clean merged questions.")
    
if __name__ == '__main__':
    clean_merge()
