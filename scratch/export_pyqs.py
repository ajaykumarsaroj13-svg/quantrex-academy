import pymongo
import certifi
import json
import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"

def main():
    print("Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
    db = client['quantrex']
    
    pyqs_coll = db['pyqs']
    
    print("Fetching questions...")
    all_questions = list(pyqs_coll.find({}))
    print(f"Found {len(all_questions)} total questions in MongoDB")
    
    # Group by chapterId
    chapters = {}
    for q in all_questions:
        chapter_id = q.get('chapterId')
        if not chapter_id:
            continue
            
        if chapter_id not in chapters:
            chapters[chapter_id] = []
            
        # Clean up Mongo ID
        q['_id'] = str(q['_id'])
        
        # Populate title from rawData.paperTitle for Examgoal formatting
        raw_data = q.get('rawData', {})
        if isinstance(raw_data, dict):
            paper_title = raw_data.get('paperTitle')
            if paper_title:
                q['title'] = paper_title
        
        chapters[chapter_id].append(q)
        
    print(f"Grouped into {len(chapters)} chapters.")
    
    os.makedirs('public/data/questions', exist_ok=True)
    
    for chapter_id, questions in chapters.items():
        out_path = f'public/data/questions/{chapter_id}.json'
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(questions, f, ensure_ascii=False, indent=2)
            
    print("Finished exporting questions.")

if __name__ == '__main__':
    main()
