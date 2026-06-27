import json
import glob

with open('C:/Users/Admin/.gemini/antigravity/scratch/rtdb_root_practice_questions.json', 'r', encoding='utf-8') as f:
    old_rtdb = json.load(f)

title_map = {}
for chapter_id, data in old_rtdb.items():
    questions_list = []
    if isinstance(data, list):
        questions_list = data
    elif isinstance(data, dict):
        q_data = data.get('questions', {})
        if isinstance(q_data, dict):
            questions_list = list(q_data.values())
        elif isinstance(q_data, list):
            questions_list = q_data

    for q in questions_list:
        if not isinstance(q, dict): continue
        q_id = str(q.get('question_id') or q.get('_id') or q.get('id'))
        title = q.get('title')
        if q_id and title:
            title_map[q_id] = title

print(f"Loaded {len(title_map)} titles from RTDB backup.")

updated_count = 0
for filepath in glob.glob('public/data/questions/*.json'):
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    changed = False
    
    # data is either a list of questions, or a dict with 'questions'
    questions_to_check = []
    if isinstance(data, list):
        questions_to_check = data
    elif isinstance(data, dict):
        q_data = data.get('questions', {})
        if isinstance(q_data, dict):
            questions_to_check = list(q_data.values())
        elif isinstance(q_data, list):
            questions_to_check = q_data

    for q in questions_to_check:
        if not isinstance(q, dict): continue
        q_id = str(q.get('question_id') or q.get('_id') or q.get('id'))
        if q_id in title_map:
            # Always overwrite title to ensure exact Examgoal format
            q['title'] = title_map[q_id]
            changed = True
            updated_count += 1
    
    if changed:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

print(f"Updated {updated_count} questions with missing titles.")
