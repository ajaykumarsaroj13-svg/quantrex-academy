import os
import json
import pymongo
import certifi
import subprocess

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"

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
                    if ans is not None and ans != -1:
                        answers[qid] = ans
        except Exception as e:
            print(f"Error reading {f} from git: {e}")
    return answers

def main():
    git_answers = get_git_answers()
    print(f"Loaded {len(git_answers)} answers from git.")
    
    print("Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
    db = client['quantrex']
    
    bbc_coll = db['blackbookchapters']
    bbq_coll = db['blackbookquestions']
    
    chapters = sorted(list(bbc_coll.find({})), key=lambda x: str(x['_id']))
    questions = sorted(list(bbq_coll.find({})), key=lambda x: str(x['_id']))
    
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
                ans = q.get('correctOption', -1)
                # Override if we have it in git answers
                if qid in git_answers:
                    ans = git_answers[qid]
                
                q_dict = {
                    'id': qid,
                    'correctOption': ans
                }
                ch_questions.append(q_dict)
            q_index += ex_qcount
            
        mapped_chapters[ch_id] = ch_questions
        
    target_chapters = [
        'quadratic-equations',
        'sequence-and-series',
        'determinants',
        'adv-area-under-curves',
        'adv-differential-equations'
    ]
    
    print("\nTarget Chapters Answer Coverage:")
    for tc in target_chapters:
        qs = mapped_chapters.get(tc, [])
        valid_ans = sum(1 for q in qs if q['correctOption'] != -1)
        print(f"Chapter: {tc} | Total Questions: {len(qs)} | Valid Answers: {valid_ans}")
        
    client.close()

if __name__ == '__main__':
    main()
