import os
import json
import pymongo
import certifi
import subprocess

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
BLACKBOOK_DIR = 'public/data/blackbook'

def get_git_answers():
    files = [
        'public/data/blackbook/indefinite-and-definite-integration.json',
        'public/data/blackbook/quadratic-equations.json',
        'public/data/blackbook/sequence-and-series.json',
        'public/data/blackbook/determinants.json',
        'public/data/blackbook/adv-area-under-curves.json',
        'public/data/blackbook/adv-differential-equations.json'
    ]
    answers = {}
    for f in files:
        try:
            cmd = f"git show HEAD:{f}"
            res = subprocess.check_output(cmd, shell=True, encoding='utf-8')
            data = json.loads(res)
            for q in data:
                qid = q.get('id')
                if qid:
                    ans = q.get('correctOptionIndex')
                    if ans is None:
                        ans = q.get('correctOption')
                    ans_arr = q.get('correctOptionsArray')
                    
                    answers[qid] = {
                        'correctOption': ans if ans is not None else -1,
                        'correctOptionsArray': ans_arr if ans_arr is not None else None
                    }
        except Exception as e:
            print(f"Error reading {f} from git: {e}")
    return answers

def main():
    git_answers = get_git_answers()
    print(f"Loaded {len(git_answers)} answers from git.")
    
    if not os.path.exists(BLACKBOOK_DIR):
        os.makedirs(BLACKBOOK_DIR, exist_ok=True)
        
    print("Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
    db = client['quantrex']
    
    bbc_coll = db['blackbookchapters']
    bbq_coll = db['blackbookquestions']
    
    # 1. Fetch and sort chapters by _id
    chapters = sorted(list(bbc_coll.find({})), key=lambda x: str(x['_id']))
    
    # 2. Fetch and sort all questions by _id
    questions = sorted(list(bbq_coll.find({})), key=lambda x: str(x['_id']))
    
    print(f"Loaded {len(chapters)} chapters and {len(questions)} questions.")
    
    # 3. Map questions sequentially by chapter
    q_index = 0
    mapped_chapters = {}
    
    for ch in chapters:
        ch_id = ch.get('id')
        title = ch.get('title')
        exercises = ch.get('exercises', [])
        
        ch_questions = []
        for ex in exercises:
            ex_name = ex.get('exerciseName')
            ex_qcount = ex.get('totalQuestions', 0)
            
            slice_qs = questions[q_index : q_index + ex_qcount]
            for idx, q in enumerate(slice_qs):
                qid = str(q.get('_id'))
                # Default answer from DB (which is -1)
                correct_opt = q.get('correctOption', -1)
                correct_opt_arr = q.get('correctOptionsArray', [])
                
                # Override if we have it in git answers
                if qid in git_answers:
                    override = git_answers[qid]
                    if override['correctOption'] is not None and override['correctOption'] != -1:
                        correct_opt = override['correctOption']
                    if override['correctOptionsArray'] is not None:
                        correct_opt_arr = override['correctOptionsArray']
                
                # Fallback correctOptionsArray
                if not correct_opt_arr and correct_opt is not None and correct_opt != -1:
                    correct_opt_arr = [correct_opt]
                    
                # Determine questionType
                q_type = "SINGLE CORRECT"
                if len(correct_opt_arr) > 1 or q.get('typeLabel') == '[MULTIPLE CORRECT]':
                    q_type = "MULTIPLE CORRECT"
                
                q_dict = {
                    'questionNumber': len(ch_questions) + 1,
                    'questionType': q_type,
                    'text': q.get('text'),
                    'options': q.get('options', []),
                    'exerciseName': ex_name,
                    'has_graph': q.get('has_graph', False),
                    'chapter': title,
                    'correctOption': correct_opt,
                    'correctOptionsArray': correct_opt_arr,
                    'typeLabel': q.get('typeLabel', f"[{q_type}]"),
                    'chapterId': ch_id,
                    'id': qid
                }
                ch_questions.append(q_dict)
            q_index += ex_qcount
            
        mapped_chapters[ch_id] = ch_questions
        print(f"Mapped {len(ch_questions)} questions for chapter {ch_id}")
        
    # Write files for the 5 target chapters
    target_chapters = [
        'quadratic-equations',
        'sequence-and-series',
        'determinants',
        'adv-area-under-curves',
        'adv-differential-equations'
    ]
    
    for tc in target_chapters:
        qs = mapped_chapters.get(tc, [])
        fpath = os.path.join(BLACKBOOK_DIR, f"{tc}.json")
        with open(fpath, 'w', encoding='utf-8') as f:
            json.dump(qs, f, indent=2, default=str)
        print(f"Wrote {len(qs)} questions to {fpath}")
        
    client.close()
    print("Done!")

if __name__ == '__main__':
    main()
