import pymongo
import certifi

URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"

try:
    print("Connecting to MongoDB Atlas...")
    client = pymongo.MongoClient(URI, tlsCAFile=certifi.where())
    db = client['quantrex']
    
    # Fetch and sort chapters by _id
    bbc_coll = db['blackbookchapters']
    chapters = sorted(list(bbc_coll.find({})), key=lambda x: str(x['_id']))
    
    # Fetch and sort all questions by _id
    bbq_coll = db['blackbookquestions']
    questions = sorted(list(bbq_coll.find({})), key=lambda x: str(x['_id']))
    
    q_index = 0
    mapped_chapters = []
    
    for ch in chapters:
        ch_id = ch.get('id')
        title = ch.get('title')
        exercises = ch.get('exercises', [])
        
        ch_questions = []
        for ex in exercises:
            ex_no = ex.get('exerciseNo')
            ex_name = ex.get('exerciseName')
            ex_qcount = ex.get('totalQuestions', 0)
            
            slice_qs = questions[q_index : q_index + ex_qcount]
            # Add exercise name to question dictionary
            for q in slice_qs:
                q_dict = {
                    'id': str(q.get('_id')),
                    'exerciseName': ex_name,
                    'questionNo': len(ch_questions) + 1,
                    'questionText': q.get('text'),
                    'options': q.get('options', []),
                    'correctOptionIndex': q.get('correctOption', 0),
                    'solutionText': q.get('solution'),
                    'isMultipleCorrect': len(q.get('correctOptionsArray', [])) > 1 or q.get('typeLabel') == '[MULTIPLE CORRECT]',
                    'typeLabel': q.get('typeLabel')
                }
                ch_questions.append(q_dict)
            q_index += ex_qcount
            
        mapped_chapters.append({
            'id': ch_id,
            'title': title,
            'questions': ch_questions
        })
        
    print("\nMapped Chapters Summary:")
    for mc in mapped_chapters:
        qs = mc['questions']
        print(f"Chapter: {mc['title']} ({mc['id']}) | Total Questions: {len(qs)}")
        if qs:
            first_txt = qs[0]['questionText'].replace('\n', ' ')[:80]
            last_txt = qs[-1]['questionText'].replace('\n', ' ')[:80]
            print(f"  First Q: {first_txt}")
            print(f"  Last Q: {last_txt}")
            
except Exception as e:
    print(f"Error: {e}")
