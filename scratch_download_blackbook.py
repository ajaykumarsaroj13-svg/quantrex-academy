import os
import json
import pymongo
import certifi

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
BLACKBOOK_DIR = 'public/data/blackbook'

def main():
    if not os.path.exists(BLACKBOOK_DIR):
        os.makedirs(BLACKBOOK_DIR, exist_ok=True)
        
    print("Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
    db = client['quantrex']
    
    questions_coll = db['blackbookquestions']
    chapters_coll = db['blackbookchapters']
    
    chapters = list(chapters_coll.find({}))
    print(f"Found {len(chapters)} chapters")
    
    for ch in chapters:
        ch_id = ch.get('id')
        if not ch_id:
            continue
            
        print(f"Fetching questions for chapter {ch_id}...")
        # Sort questions correctly
        questions = list(questions_coll.find({'chapterId': ch_id}).sort([('exerciseName', 1), ('questionNo', 1)]))
        
        # Format the questions as frontend expects
        formatted_qs = []
        for q in questions:
            q_dict = {
                'id': str(q.get('_id')),
                'chapterId': q.get('chapterId'),
                'exerciseName': q.get('exerciseName'),
                'questionNo': q.get('questionNo'),
                'questionText': q.get('questionText'),
                'options': q.get('options', []),
                'correctOptionIndex': q.get('correctOptionIndex'),
                'solutionText': q.get('solutionText'),
                'isMultipleCorrect': q.get('isMultipleCorrect', False)
            }
            formatted_qs.append(q_dict)
            
        fpath = os.path.join(BLACKBOOK_DIR, f"{ch_id}.json")
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(formatted_qs, f, default=str)
            
        print(f"Saved {len(formatted_qs)} questions to {fpath}")

if __name__ == "__main__":
    main()
