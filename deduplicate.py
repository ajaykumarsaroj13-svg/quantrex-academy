import json

def deduplicate():
    main_file = 'C:/Users/Admin/.gemini/antigravity/scratch/quantrexacadmy/src/utils/blackBookDataFull.json'
    with open(main_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    questions = data[0]['questions']
    dedup = {}
    
    for q in questions:
        ex = q.get('exerciseName', '')
        num = q.get('questionNumber', 0)
        
        # Convert to int if possible
        try:
            num = int(num)
        except:
            pass
            
        key = (ex, num)
        
        if key not in dedup:
            dedup[key] = q
        else:
            # If there's a conflict, keep the one that looks like the existing one (e.g. has string questionNumber, or was seen first)
            pass
            
    dedup_list = list(dedup.values())
    print(f"Deduplicated count: {len(dedup_list)}")
    
    # Sort them
    ex_order = {'Exercise 1': 1, 'Exercise 2': 2, 'Exercise 3': 3, 'Exercise 4': 4, 'Exercise 5': 5}
    dedup_list.sort(key=lambda q: (ex_order.get(q.get('exerciseName', ''), 99), int(q.get('questionNumber', 0))))
    
    data[0]['questions'] = dedup_list
    
    with open(main_file, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)

if __name__ == '__main__':
    deduplicate()
