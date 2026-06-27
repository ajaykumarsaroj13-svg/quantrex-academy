import os
import json
import pymongo
import certifi

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
BLACKBOOK_DIR = 'public/data/blackbook'

def main():
    if not os.path.exists(BLACKBOOK_DIR):
        os.makedirs(BLACKBOOK_DIR, exist_ok=True)
        
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
    db = client['quantrex']
    
    questions_coll = db['blackbookquestions']
    chapters_coll = db['blackbookchapters']
    
    chapters = list(chapters_coll.find({}))
    all_qs = list(questions_coll.find({}))
    
    # group by exerciseNo
    q_by_ex = {}
    for q in all_qs:
        ex = q.get('exerciseNo')
        if ex not in q_by_ex:
            q_by_ex[ex] = []
        q_by_ex[ex].append(q)
        
    for ch in chapters:
        ch_id = ch.get('id')
        exs = ch.get('exercises', [])
        ex_nos = [e.get('exerciseNo') for e in exs]
        
        ch_qs = []
        for ex_no in ex_nos:
            qs = q_by_ex.get(ex_no, [])
            for q in qs:
                # Add chapter info to question
                q_dict = {
                    'id': str(q.get('_id')),
                    'chapterId': ch_id,
                    'exerciseName': q.get('exerciseName'),
                    'questionNo': q.get('questionIndex'),
                    'questionText': q.get('text'),
                    'options': q.get('options', []),
                    'correctOptionIndex': q.get('correctOption'),
                    'solutionText': q.get('solution'),
                    'isMultipleCorrect': len(q.get('correctOptionsArray', [])) > 1 if q.get('correctOptionsArray') else False,
                    'typeLabel': q.get('typeLabel')
                }
                ch_qs.append(q_dict)
                
        # sort by exerciseName and questionNo
        ch_qs.sort(key=lambda x: (x['exerciseName'], x['questionNo']))
        
        fpath = os.path.join(BLACKBOOK_DIR, f"{ch_id}.json")
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(ch_qs, f, default=str)
        print(f"Saved {len(ch_qs)} questions to {fpath}")

if __name__ == "__main__":
    main()
