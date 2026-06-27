import json
from pymongo import MongoClient
import os

MONGO_URI = "mongodb+srv://ajaykumarsaroj13_db_usar:quantrex2026@cluster0.jde6gri.mongodb.net/quantrex?retryWrites=true&w=majority&appName=Cluster0"
client = MongoClient(MONGO_URI)
db = client["quantrex"]
pyq_col = db["pyqs"]
chap_col = db["pyqchapters"]

def find_questions(obj):
    questions = []
    if isinstance(obj, dict):
        if "questionId" in obj and "question" in obj and "options" in obj:
            questions.append(obj)
        else:
            for k, v in obj.items():
                questions.extend(find_questions(v))
    elif isinstance(obj, list):
        for item in obj:
            questions.extend(find_questions(item))
    return questions

def find_topics(obj):
    topics = []
    if isinstance(obj, dict):
        if "metaId" in obj and "title" in obj and "examId" in obj:
            topics.append(obj)
        else:
            for k, v in obj.items():
                topics.extend(find_topics(v))
    elif isinstance(obj, list):
        for item in obj:
            topics.extend(find_topics(item))
    return topics

state_file = "state.json"
if not os.path.exists(state_file):
    print("state.json not found")
    exit()

with open(state_file, "r", encoding="utf-8") as f:
    data = json.load(f)

raw_questions = find_questions(data)
# Filter duplicates
seen = set()
questions = []
for q in raw_questions:
    qid = q.get("questionId") or q.get("id")
    if qid and qid not in seen:
        seen.add(qid)
        questions.append(q)

print(f"Found {len(questions)} unique questions.")

# Same for topics
raw_topics = find_topics(data)
topic_map = {}
for t in raw_topics:
    tid = t.get("metaId")
    if tid:
        topic_map[tid] = t.get("title")

if not questions:
    print("No questions found in state.json")
    exit()

saved_count = 0
new_chapter_title = "Progression & Series"
chapter_id = "jee_main_math_progression_series"

topics_list = list(set([t_name for t_name in topic_map.values() if t_name]))
if not topics_list:
    topics_list = ["General"]

chap_col.update_one(
    {"chapterId": chapter_id},
    {"$set": {
        "chapterId": chapter_id,
        "title": new_chapter_title,
        "subject": "mathematics",
        "exam": "jee-main",
        "topics": topics_list,
        "totalQuestions": len(questions)
    }},
    upsert=True
)

for q in questions:
    qid = q.get("questionId", q.get("id", ""))
    
    # Extract topics from the question. ExamGoal sometimes has `topics` as array of topic metaIds
    t_ids = q.get("topics", [])
    topic_name = "General"
    if isinstance(t_ids, list) and len(t_ids) > 0:
        topic_name = topic_map.get(t_ids[0], "General")
        
    q_type = q.get("type", "SCQ")
    if "NUMERICAL" in q_type.upper() or q_type == "int":
        q_type = "NUMERICAL"
    else:
        q_type = "SCQ"
        
    ans = q.get("answer", "")
    correct_idx = -1
    if q_type == "SCQ" and ans:
        try:
            correct_idx = int(ans)
        except:
            pass
            
    pyq_doc = {
        "examGoalId": qid,
        "chapterId": chapter_id,
        "title": f"JEE Main {q.get('year', '')}",
        "year": str(q.get("year", "")),
        "difficulty": "Medium",
        "type": q_type,
        "question": q.get("question", q.get("excerpt", "")),
        "options": q.get("options", []),
        "correctOptionIndex": correct_idx,
        "solution": q.get("solution", q.get("explanation", "")),
        "marks": 4,
        "negativeMarks": -1 if q_type == "SCQ" else 0,
        "topic": topic_name,
        "rawData": q
    }
    
    if q_type == "NUMERICAL":
        pyq_doc["numericalAnswer"] = str(ans)
        
    pyq_col.update_one(
        {"examGoalId": qid},
        {"$set": pyq_doc},
        upsert=True
    )
    saved_count += 1
    
print(f"Successfully saved {saved_count} questions for chapter '{new_chapter_title}' to MongoDB!")
